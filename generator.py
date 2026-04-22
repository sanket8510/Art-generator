"""
generator.py
============
Core image generation logic using Stable Diffusion via HuggingFace Diffusers.

Supports:
  - Text-to-Image generation
  - Image-to-Image generation (img2img)
  - Negative prompts for quality control
  - Seed control for reproducibility
"""

import torch
from diffusers import (
    StableDiffusionPipeline,
    StableDiffusionImg2ImgPipeline,
    DPMSolverMultistepScheduler,
)
from PIL import Image
import numpy as np
import os
from datetime import datetime


# ─────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────

# Default model — you can swap this with any HuggingFace model ID
DEFAULT_MODEL_ID = "runwayml/stable-diffusion-v1-5"

# Where generated images are saved
OUTPUT_DIR = "outputs"
os.makedirs(OUTPUT_DIR, exist_ok=True)


# ─────────────────────────────────────────────
# DEVICE DETECTION
# ─────────────────────────────────────────────

def get_device():
    """
    Automatically pick the best device:
    - CUDA (NVIDIA GPU) → fastest
    - MPS (Apple Silicon) → fast on Mac
    - CPU → slowest but always available
    """
    if torch.cuda.is_available():
        return "cuda"
    elif torch.backends.mps.is_available():
        return "mps"
    else:
        return "cpu"


# ─────────────────────────────────────────────
# MODEL LOADING
# ─────────────────────────────────────────────

def load_text2img_pipeline(model_id: str = DEFAULT_MODEL_ID):
    """
    Load the Stable Diffusion Text-to-Image pipeline.

    Uses DPM++ scheduler for faster, high-quality inference.
    Model weights are cached after first download (~5GB).
    """
    device = get_device()
    print(f"[INFO] Loading model on: {device.upper()}")

    # Load pipeline from HuggingFace Hub
    pipe = StableDiffusionPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        safety_checker=None,  # Disable for faster generation (add back for production)
        requires_safety_checker=False,
    )

    # Swap scheduler to DPM++ for better quality in fewer steps
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(
        pipe.scheduler.config
    )

    pipe = pipe.to(device)

    # Memory optimization for low-VRAM GPUs
    if device == "cuda":
        pipe.enable_attention_slicing()     # Reduces VRAM usage
        pipe.enable_xformers_memory_efficient_attention()  # If xformers installed

    print("[INFO] Model loaded successfully!")
    return pipe


def load_img2img_pipeline(model_id: str = DEFAULT_MODEL_ID):
    """
    Load the Image-to-Image pipeline.
    Takes an existing image + text prompt and transforms it.
    """
    device = get_device()

    pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float16 if device == "cuda" else torch.float32,
        safety_checker=None,
        requires_safety_checker=False,
    )

    pipe.scheduler = DPMSolverMultistepScheduler.from_config(
        pipe.scheduler.config
    )

    pipe = pipe.to(device)

    if device == "cuda":
        pipe.enable_attention_slicing()

    return pipe


# ─────────────────────────────────────────────
# TEXT-TO-IMAGE GENERATION
# ─────────────────────────────────────────────

def generate_from_text(
    pipe,                                       # Loaded pipeline
    prompt: str,                                # What to generate
    negative_prompt: str = "",                  # What to avoid
    width: int = 512,                           # Image width (multiples of 64)
    height: int = 512,                          # Image height
    num_inference_steps: int = 30,              # More steps = better quality but slower
    guidance_scale: float = 7.5,               # How strictly to follow prompt (7-12 is good)
    seed: int = None,                           # Set for reproducible results
    num_images: int = 1,                        # How many images to generate
):
    """
    Generate an image from a text prompt.

    Parameters:
        prompt           → Describe what you want (be specific!)
        negative_prompt  → Describe what you DON'T want
        guidance_scale   → Higher = more literal, Lower = more creative
        seed             → Same seed + same prompt = same image

    Returns:
        List of PIL Image objects
    """

    # Set random seed for reproducibility
    generator = None
    if seed is not None:
        generator = torch.Generator(device=get_device()).manual_seed(seed)

    print(f"[GEN] Prompt: {prompt[:80]}...")
    print(f"[GEN] Steps: {num_inference_steps} | CFG Scale: {guidance_scale}")

    # Run the diffusion pipeline
    result = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt or get_default_negative_prompt(),
        width=width,
        height=height,
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale,
        generator=generator,
        num_images_per_prompt=num_images,
    )

    images = result.images
    print(f"[GEN] Generated {len(images)} image(s) successfully.")
    return images


# ─────────────────────────────────────────────
# IMAGE-TO-IMAGE GENERATION
# ─────────────────────────────────────────────

def generate_from_image(
    pipe,                               # img2img pipeline
    init_image: Image.Image,            # Starting image
    prompt: str,                        # How to transform it
    negative_prompt: str = "",
    strength: float = 0.75,             # 0=keep original, 1=ignore original
    num_inference_steps: int = 30,
    guidance_scale: float = 7.5,
    seed: int = None,
):
    """
    Transform an existing image based on a text prompt.

    'strength' controls how much the image changes:
        0.3 → subtle changes (keep most of original)
        0.75 → moderate transformation (recommended)
        1.0 → almost completely new image
    """

    # Resize image to multiple of 8 (required by the model)
    init_image = init_image.convert("RGB")
    init_image = init_image.resize((512, 512))

    generator = None
    if seed is not None:
        generator = torch.Generator(device=get_device()).manual_seed(seed)

    result = pipe(
        prompt=prompt,
        image=init_image,
        strength=strength,
        negative_prompt=negative_prompt or get_default_negative_prompt(),
        num_inference_steps=num_inference_steps,
        guidance_scale=guidance_scale,
        generator=generator,
    )

    return result.images


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────

def get_default_negative_prompt():
    """
    A well-crafted negative prompt dramatically improves quality.
    These terms tell the model what artifacts to avoid.
    """
    return (
        "blurry, bad anatomy, bad hands, cropped, worst quality, "
        "low quality, jpeg artifacts, ugly, duplicate, morbid, "
        "out of frame, extra fingers, mutilated, deformed, "
        "watermark, text, signature, username"
    )


def save_image(image: Image.Image, filename: str = None) -> str:
    """Save a PIL image to the outputs folder and return the path."""
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"generated_{timestamp}.png"

    path = os.path.join(OUTPUT_DIR, filename)
    image.save(path, format="PNG")
    print(f"[SAVE] Image saved to: {path}")
    return path


def get_prompt_suggestions():
    """
    Sample prompts to inspire users.
    Great for beginners learning prompt engineering.
    """
    return [
        "A futuristic cyberpunk cityscape at night, neon lights reflecting on wet streets, ultra-detailed, 8K",
        "A serene Japanese garden in autumn, cherry blossom petals falling, watercolor painting style",
        "Portrait of an astronaut in a flower field, golden hour lighting, photorealistic",
        "Ancient dragon perched on a crystal mountain, fantasy art, epic composition",
        "A cozy coffee shop interior on a rainy day, soft warm lighting, impressionist style",
        "Deep ocean scene with bioluminescent creatures, teal and blue palette, dreamlike",
        "Medieval castle at sunset, surrounded by misty forests, oil painting style",
        "A steampunk hot air balloon festival, vintage sepia tones, intricate details",
    ]
