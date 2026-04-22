"""
lora_train.py
=============
Fine-tune Stable Diffusion using LoRA (Low-Rank Adaptation).

LoRA is the RECOMMENDED fine-tuning approach because:
  ✅ Only updates a small % of parameters (~1% of full model)
  ✅ Trains in 15-30 minutes on a single GPU
  ✅ Produces tiny adapter files (~3-5MB vs 5GB full model)
  ✅ Can be merged into the base model or used as plug-ins

Use case: Train on 20-50 images of a specific style, person, or object.

Requirements:
  pip install diffusers peft accelerate

Usage:
  python model/fine_tune/lora_train.py \
    --dataset_path ./my_images \
    --instance_prompt "a photo of sks dog" \
    --output_dir ./lora_output
"""

import argparse
import torch
from pathlib import Path
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
from diffusers import StableDiffusionPipeline, DDPMScheduler
from diffusers.loaders import AttnProcsLayers
from diffusers.models.attention_processor import LoRAAttnProcessor
from transformers import CLIPTokenizer
from tqdm import tqdm


# ─────────────────────────────────────────────
# CUSTOM DATASET
# ─────────────────────────────────────────────

class ArtDataset(Dataset):
    """
    Simple dataset that loads images from a folder.
    All images are paired with the same instance prompt.

    Expected folder structure:
        ./my_images/
            image1.jpg
            image2.jpg
            ...

    Tip: 15-30 high quality, consistent images work great.
    """

    def __init__(self, image_dir: str, prompt: str, tokenizer, size: int = 512):
        self.image_paths = list(Path(image_dir).glob("*.jpg")) + \
                           list(Path(image_dir).glob("*.png")) + \
                           list(Path(image_dir).glob("*.jpeg"))

        self.prompt = prompt
        self.tokenizer = tokenizer
        self.size = size

        # Standard image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((size, size)),
            transforms.ToTensor(),
            transforms.Normalize([0.5], [0.5]),  # Normalize to [-1, 1]
        ])

        print(f"[DATASET] Found {len(self.image_paths)} images in '{image_dir}'")

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        # Load and transform image
        image = Image.open(self.image_paths[idx]).convert("RGB")
        pixel_values = self.transform(image)

        # Tokenize prompt
        text_inputs = self.tokenizer(
            self.prompt,
            padding="max_length",
            max_length=self.tokenizer.model_max_length,
            truncation=True,
            return_tensors="pt",
        )

        return {
            "pixel_values": pixel_values,
            "input_ids": text_inputs.input_ids.squeeze(),
        }


# ─────────────────────────────────────────────
# LORA SETUP
# ─────────────────────────────────────────────

def inject_lora_layers(unet, rank: int = 4):
    """
    Inject LoRA adapter layers into the UNet attention modules.

    rank: The bottleneck dimension of LoRA matrices.
          Lower rank = fewer parameters, less expressive
          Higher rank = more parameters, more expressive
          4-16 works well for most use cases.
    """
    lora_attn_procs = {}

    for name in unet.attn_processors.keys():
        # Get the dimension of cross-attention blocks
        cross_attention_dim = None
        if name.endswith("attn1.processor"):
            attn_processor_name = name
            cross_attention_dim = None
        elif name.endswith("attn2.processor"):
            attn_processor_name = name
            cross_attention_dim = unet.config.cross_attention_dim

        lora_attn_procs[name] = LoRAAttnProcessor(
            hidden_size=unet.config.attention_head_dim * 8,
            cross_attention_dim=cross_attention_dim,
            rank=rank,
        )

    unet.set_attn_processor(lora_attn_procs)
    return unet


# ─────────────────────────────────────────────
# TRAINING LOOP
# ─────────────────────────────────────────────

def train_lora(
    dataset_path: str,
    instance_prompt: str,
    output_dir: str,
    model_id: str = "runwayml/stable-diffusion-v1-5",
    num_epochs: int = 100,
    batch_size: int = 1,
    learning_rate: float = 1e-4,
    lora_rank: int = 4,
    save_every: int = 25,
):
    """
    Main LoRA fine-tuning function.

    Args:
        dataset_path    → Folder with training images
        instance_prompt → Trigger phrase (e.g., "a painting of sks cat")
                          Use 'sks' as the unique identifier token
        output_dir      → Where to save LoRA weights
        num_epochs      → Training iterations (100-200 usually enough)
        learning_rate   → Adam optimizer LR (1e-4 works well for LoRA)
        lora_rank       → LoRA bottleneck rank (4-16 recommended)
    """

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"[TRAIN] Using device: {device}")
    print(f"[TRAIN] Training for {num_epochs} epochs")
    print(f"[TRAIN] Prompt: '{instance_prompt}'")

    Path(output_dir).mkdir(parents=True, exist_ok=True)

    # ── Load components ──
    print("[TRAIN] Loading model components...")
    pipe = StableDiffusionPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float32,
    )

    tokenizer = pipe.tokenizer
    text_encoder = pipe.text_encoder.to(device)
    vae = pipe.vae.to(device)
    unet = pipe.unet.to(device)
    noise_scheduler = DDPMScheduler.from_config(pipe.scheduler.config)

    # ── Freeze base model, only train LoRA ──
    vae.requires_grad_(False)
    text_encoder.requires_grad_(False)
    unet.requires_grad_(False)

    # ── Inject LoRA layers ──
    unet = inject_lora_layers(unet, rank=lora_rank)
    lora_layers = AttnProcsLayers(unet.attn_processors)

    # ── Optimizer (only update LoRA parameters) ──
    optimizer = torch.optim.AdamW(lora_layers.parameters(), lr=learning_rate)

    # ── Dataset ──
    dataset = ArtDataset(dataset_path, instance_prompt, tokenizer)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    # ── Training loop ──
    print("\n[TRAIN] Starting training...\n")
    unet.train()

    for epoch in tqdm(range(num_epochs), desc="Training LoRA"):
        for batch in dataloader:
            pixel_values = batch["pixel_values"].to(device)
            input_ids = batch["input_ids"].to(device)

            # Encode images to latent space using VAE
            with torch.no_grad():
                latents = vae.encode(pixel_values).latent_dist.sample()
                latents = latents * vae.config.scaling_factor

            # Add random noise to latents (forward diffusion)
            noise = torch.randn_like(latents)
            timesteps = torch.randint(
                0, noise_scheduler.config.num_train_timesteps,
                (latents.shape[0],), device=device
            ).long()
            noisy_latents = noise_scheduler.add_noise(latents, noise, timesteps)

            # Get text embeddings
            with torch.no_grad():
                encoder_hidden_states = text_encoder(input_ids)[0]

            # Predict noise (the model's job during training)
            noise_pred = unet(
                noisy_latents,
                timesteps,
                encoder_hidden_states
            ).sample

            # Loss: how different is predicted noise from actual noise?
            loss = torch.nn.functional.mse_loss(noise_pred, noise)

            loss.backward()
            optimizer.step()
            optimizer.zero_grad()

        # Save checkpoint
        if (epoch + 1) % save_every == 0:
            ckpt_path = f"{output_dir}/lora_epoch_{epoch+1}.safetensors"
            unet.save_attn_procs(output_dir)
            print(f"\n[SAVE] Checkpoint saved at epoch {epoch+1}")

    # ── Save final LoRA weights ──
    unet.save_attn_procs(output_dir)
    print(f"\n✅ LoRA training complete! Weights saved to: {output_dir}")
    print("Use these weights with: pipe.load_lora_weights(output_dir)")


# ─────────────────────────────────────────────
# HOW TO USE THE TRAINED LORA
# ─────────────────────────────────────────────

def use_trained_lora(lora_path: str, prompt: str):
    """
    Load and use your trained LoRA adapter for inference.
    """
    from diffusers import StableDiffusionPipeline

    pipe = StableDiffusionPipeline.from_pretrained(
        "runwayml/stable-diffusion-v1-5",
        torch_dtype=torch.float16,
    ).to("cuda")

    # Load LoRA weights on top of base model
    pipe.load_lora_weights(lora_path)

    # Generate with your custom style
    # Use the same trigger word ('sks') you used in training
    image = pipe(prompt, num_inference_steps=30).images[0]
    return image


# ─────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LoRA Fine-tuning for Stable Diffusion")
    parser.add_argument("--dataset_path", type=str, required=True, help="Path to training images")
    parser.add_argument("--instance_prompt", type=str, required=True, help="Training prompt with trigger word")
    parser.add_argument("--output_dir", type=str, default="./lora_output", help="Where to save LoRA weights")
    parser.add_argument("--num_epochs", type=int, default=100)
    parser.add_argument("--learning_rate", type=float, default=1e-4)
    parser.add_argument("--lora_rank", type=int, default=4)
    args = parser.parse_args()

    train_lora(
        dataset_path=args.dataset_path,
        instance_prompt=args.instance_prompt,
        output_dir=args.output_dir,
        num_epochs=args.num_epochs,
        learning_rate=args.learning_rate,
        lora_rank=args.lora_rank,
    )
