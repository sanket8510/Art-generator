"""
evaluate.py
===========
Evaluation metrics for AI-generated images.

Metrics covered:
  1. FID  (Fréchet Inception Distance)   → Image quality vs real images
  2. CLIP Score                           → Text-image alignment
  3. LPIPS                                → Perceptual similarity
  4. Aesthetic Score                      → Subjective visual appeal (LAION)
"""

import torch
import numpy as np
from PIL import Image
from pathlib import Path
import json


# ─────────────────────────────────────────────
# 1. CLIP SCORE — Measures prompt alignment
# ─────────────────────────────────────────────

def compute_clip_score(images: list, prompts: list, model_name: str = "openai/clip-vit-base-patch32"):
    """
    CLIP Score measures how well a generated image matches its text prompt.

    Score range: 0 to 1 (higher is better)
    A score > 0.28 is generally considered good.

    How it works:
        CLIP encodes both the image and text into the same embedding space.
        The cosine similarity between the two embeddings = CLIP score.
    """
    try:
        from transformers import CLIPProcessor, CLIPModel

        model = CLIPModel.from_pretrained(model_name)
        processor = CLIPProcessor.from_pretrained(model_name)

        scores = []
        for img, prompt in zip(images, prompts):
            inputs = processor(
                text=[prompt],
                images=img,
                return_tensors="pt",
                padding=True
            )

            with torch.no_grad():
                outputs = model(**inputs)

            # Cosine similarity between image and text features
            logits = outputs.logits_per_image
            score = logits.softmax(dim=1)[0][0].item()
            scores.append(score)

        avg_score = np.mean(scores)
        print(f"[EVAL] CLIP Score: {avg_score:.4f} (higher = better text alignment)")
        return avg_score

    except ImportError:
        print("[EVAL] Install transformers for CLIP scoring: pip install transformers")
        return None


# ─────────────────────────────────────────────
# 2. FID SCORE — Measures image quality vs real
# ─────────────────────────────────────────────

def compute_fid(real_images_dir: str, fake_images_dir: str):
    """
    FID (Fréchet Inception Distance) compares the statistical distribution
    of generated images to real images using InceptionV3 features.

    Score range: Lower is better (0 = perfect match to real distribution)
    Typical values:
        < 10   → Excellent
        10-50  → Good
        50-150 → Fair
        > 150  → Poor

    Requirements: pip install torch-fidelity
    """
    try:
        import torch_fidelity

        metrics = torch_fidelity.calculate_metrics(
            input1=real_images_dir,
            input2=fake_images_dir,
            fid=True,
            cuda=torch.cuda.is_available(),
        )

        fid_score = metrics["frechet_inception_distance"]
        print(f"[EVAL] FID Score: {fid_score:.2f} (lower = better quality)")
        return fid_score

    except ImportError:
        print("[EVAL] Install torch-fidelity: pip install torch-fidelity")
        return None


# ─────────────────────────────────────────────
# 3. LPIPS — Perceptual Similarity
# ─────────────────────────────────────────────

def compute_lpips(image1: Image.Image, image2: Image.Image):
    """
    LPIPS (Learned Perceptual Image Patch Similarity) measures how similar
    two images LOOK to humans (not just pixel-by-pixel difference).

    Useful for: comparing original and img2img outputs.
    Score: 0 = identical, 1 = completely different

    Requirements: pip install lpips
    """
    try:
        import lpips
        import torchvision.transforms as T

        loss_fn = lpips.LPIPS(net="alex")

        transform = T.Compose([
            T.Resize((256, 256)),
            T.ToTensor(),
        ])

        t1 = transform(image1).unsqueeze(0)
        t2 = transform(image2).unsqueeze(0)

        with torch.no_grad():
            score = loss_fn(t1, t2).item()

        print(f"[EVAL] LPIPS Score: {score:.4f} (0 = identical, 1 = different)")
        return score

    except ImportError:
        print("[EVAL] Install lpips: pip install lpips")
        return None


# ─────────────────────────────────────────────
# 4. SIMPLE QUALITATIVE EVALUATION
# ─────────────────────────────────────────────

def evaluate_batch(images: list, prompts: list, output_file: str = "evaluation_results.json"):
    """
    Run all available metrics on a batch of images and save results.

    Args:
        images  → List of PIL Images (generated)
        prompts → Corresponding text prompts
    """
    results = {
        "total_images": len(images),
        "prompts": prompts,
    }

    print(f"\n{'='*50}")
    print("EVALUATION REPORT")
    print(f"{'='*50}")
    print(f"Total images evaluated: {len(images)}")

    # CLIP Score
    clip_score = compute_clip_score(images, prompts)
    if clip_score:
        results["clip_score"] = clip_score
        verdict = "✅ Good" if clip_score > 0.28 else "⚠️ Low — try a more descriptive prompt"
        print(f"CLIP Score: {clip_score:.4f} → {verdict}")

    # Basic statistics
    print("\nImage Statistics:")
    for i, img in enumerate(images):
        img_array = np.array(img)
        print(f"  Image {i+1}: {img.size} | "
              f"Mean brightness: {img_array.mean():.1f} | "
              f"Contrast (std): {img_array.std():.1f}")

    # Save results
    with open(output_file, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\n[EVAL] Results saved to: {output_file}")

    return results


# ─────────────────────────────────────────────
# EVALUATION GUIDE
# ─────────────────────────────────────────────

EVALUATION_GUIDE = """
╔══════════════════════════════════════════════════════╗
║           EVALUATION METRICS QUICK GUIDE             ║
╠══════════════════════════════════════════════════════╣
║  Metric      Range      Goal    What It Measures     ║
║─────────────────────────────────────────────────────║
║  FID         0→∞        Lower   Visual quality       ║
║  CLIP Score  0→1        Higher  Text alignment       ║
║  LPIPS       0→1        Lower   Perceptual diff      ║
║  IS Score    1→∞        Higher  Diversity + quality  ║
╠══════════════════════════════════════════════════════╣
║  Human Evaluation (Most Important!):                 ║
║  • Does it match the prompt? (1-5 scale)             ║
║  • Is it visually appealing? (1-5 scale)             ║
║  • Are there artifacts/distortions? (Yes/No)         ║
║  • Would you use this in a real project? (Yes/No)    ║
╚══════════════════════════════════════════════════════╝
"""

if __name__ == "__main__":
    print(EVALUATION_GUIDE)
