"""
app.py
======
Streamlit UI for the AI Art Generator.

Run with:
    streamlit run app/app.py
"""

import streamlit as st
from PIL import Image
import io
import os
import sys

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from generator import (
    load_text2img_pipeline,
    load_img2img_pipeline,
    generate_from_text,
    generate_from_image,
    save_image,
    get_prompt_suggestions,
    get_default_negative_prompt,
)

# ─────────────────────────────────────────────
# PAGE CONFIGURATION
# ─────────────────────────────────────────────

st.set_page_config(
    page_title="✨ AI Art Generator",
    page_icon="🎨",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─────────────────────────────────────────────
# CUSTOM CSS STYLING
# ─────────────────────────────────────────────

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@300;400;500&display=swap');

    .main-title {
        font-family: 'Playfair Display', serif;
        font-size: 3rem;
        background: linear-gradient(135deg, #a78bfa, #ec4899, #f59e0b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        margin-bottom: 0.2rem;
    }

    .subtitle {
        text-align: center;
        color: #94a3b8;
        font-family: 'Inter', sans-serif;
        font-weight: 300;
        margin-bottom: 2rem;
    }

    .stButton > button {
        background: linear-gradient(135deg, #7c3aed, #db2777);
        color: white;
        border: none;
        border-radius: 12px;
        padding: 0.6rem 2rem;
        font-size: 1.1rem;
        font-weight: 500;
        width: 100%;
        transition: all 0.3s ease;
    }

    .stButton > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
    }

    .prompt-card {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        border-radius: 12px;
        padding: 1rem;
        margin: 0.5rem 0;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .result-image {
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────
# HEADER
# ─────────────────────────────────────────────

st.markdown('<h1 class="main-title">✨ AI Art Generator</h1>', unsafe_allow_html=True)
st.markdown('<p class="subtitle">Transform your imagination into stunning visuals using Stable Diffusion</p>', unsafe_allow_html=True)

# ─────────────────────────────────────────────
# SIDEBAR — SETTINGS
# ─────────────────────────────────────────────

with st.sidebar:
    st.markdown("## ⚙️ Generation Settings")

    mode = st.radio(
        "Generation Mode",
        ["🖊️ Text to Image", "🖼️ Image to Image"],
        help="Text-to-Image: Create from scratch. Image-to-Image: Transform an existing image."
    )

    st.markdown("---")
    st.markdown("### 🎛️ Parameters")

    num_steps = st.slider(
        "Inference Steps",
        min_value=10, max_value=100, value=30, step=5,
        help="More steps = better quality but slower. 20-30 is a good balance."
    )

    guidance_scale = st.slider(
        "Guidance Scale (CFG)",
        min_value=1.0, max_value=20.0, value=7.5, step=0.5,
        help="How closely to follow the prompt. 7-12 works best for most prompts."
    )

    width = st.select_slider("Width", options=[256, 512, 768], value=512)
    height = st.select_slider("Height", options=[256, 512, 768], value=512)

    seed_enabled = st.checkbox("Set Seed (for reproducibility)")
    seed = None
    if seed_enabled:
        seed = st.number_input("Seed", min_value=0, max_value=999999, value=42)

    num_images = st.slider("Number of Images", 1, 4, 1)

    st.markdown("---")
    st.markdown("### 📖 About")
    st.info(
        "Built with **Stable Diffusion v1.5** + HuggingFace Diffusers. "
        "Runs on GPU (fast) or CPU (slow). "
        "First run downloads ~5GB of model weights."
    )

# ─────────────────────────────────────────────
# MODEL LOADING (cached)
# ─────────────────────────────────────────────

@st.cache_resource(show_spinner="🔄 Loading AI model (first time may take a few minutes)...")
def get_pipeline(mode_key):
    if mode_key == "txt2img":
        return load_text2img_pipeline()
    else:
        return load_img2img_pipeline()

# ─────────────────────────────────────────────
# MAIN UI
# ─────────────────────────────────────────────

col1, col2 = st.columns([1.2, 1], gap="large")

with col1:
    st.markdown("### 💬 Your Prompt")

    # Prompt input
    prompt = st.text_area(
        "Describe the image you want to generate",
        placeholder="e.g. A majestic dragon flying over a medieval castle at sunset, epic fantasy art, highly detailed, 8K",
        height=120,
        label_visibility="collapsed",
    )

    # Negative prompt
    with st.expander("🚫 Negative Prompt (optional — describe what to avoid)"):
        negative_prompt = st.text_area(
            "Negative Prompt",
            value=get_default_negative_prompt(),
            height=80,
            label_visibility="collapsed",
        )

    # Image upload for img2img mode
    init_image = None
    if "Image to Image" in mode:
        st.markdown("### 📤 Upload Source Image")
        uploaded = st.file_uploader(
            "Upload the image to transform",
            type=["png", "jpg", "jpeg", "webp"],
            label_visibility="collapsed"
        )
        if uploaded:
            init_image = Image.open(uploaded)
            st.image(init_image, caption="Source image", use_column_width=True)

        strength = st.slider(
            "Transformation Strength",
            0.1, 1.0, 0.75, 0.05,
            help="0 = keep original, 1 = completely new image"
        )

    st.markdown("---")

    # 💡 Prompt Suggestions
    st.markdown("### 💡 Need inspiration?")
    suggestions = get_prompt_suggestions()

    for i in range(0, min(4, len(suggestions)), 2):
        c1, c2 = st.columns(2)
        with c1:
            if st.button(f"📝 {suggestions[i][:45]}...", key=f"sug_{i}"):
                st.session_state["selected_prompt"] = suggestions[i]
                st.rerun()
        with c2:
            if i+1 < len(suggestions):
                if st.button(f"📝 {suggestions[i+1][:45]}...", key=f"sug_{i+1}"):
                    st.session_state["selected_prompt"] = suggestions[i+1]
                    st.rerun()

    # If a suggestion was selected, update the prompt
    if "selected_prompt" in st.session_state:
        prompt = st.session_state["selected_prompt"]

with col2:
    st.markdown("### 🎨 Generated Art")

    # Generate button
    generate_clicked = st.button("✨ Generate Art", use_container_width=True)

    if generate_clicked:
        if not prompt.strip():
            st.warning("⚠️ Please enter a prompt first!")
        elif "Image to Image" in mode and init_image is None:
            st.warning("⚠️ Please upload a source image for Image-to-Image mode!")
        else:
            # Load model
            mode_key = "txt2img" if "Text" in mode else "img2img"
            pipe = get_pipeline(mode_key)

            with st.spinner("🎨 Creating your masterpiece..."):
                try:
                    if "Text" in mode:
                        images = generate_from_text(
                            pipe=pipe,
                            prompt=prompt,
                            negative_prompt=negative_prompt,
                            width=width,
                            height=height,
                            num_inference_steps=num_steps,
                            guidance_scale=guidance_scale,
                            seed=seed,
                            num_images=num_images,
                        )
                    else:
                        images = generate_from_image(
                            pipe=pipe,
                            init_image=init_image,
                            prompt=prompt,
                            negative_prompt=negative_prompt,
                            strength=strength,
                            num_inference_steps=num_steps,
                            guidance_scale=guidance_scale,
                            seed=seed,
                        )

                    # Save & display
                    st.session_state["generated_images"] = images
                    st.success(f"✅ Generated {len(images)} image(s)!")

                except Exception as e:
                    st.error(f"❌ Generation failed: {str(e)}")
                    st.info("Tip: If you're out of VRAM, try reducing image size or steps.")

    # Display generated images
    if "generated_images" in st.session_state:
        images = st.session_state["generated_images"]

        if len(images) == 1:
            img = images[0]
            st.image(img, use_column_width=True, caption="🎨 Your AI Artwork")

            # Download button
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            st.download_button(
                label="⬇️ Download Image",
                data=buf.getvalue(),
                file_name="ai_artwork.png",
                mime="image/png",
                use_container_width=True,
            )

            # Save locally too
            save_path = save_image(img)
            st.caption(f"📁 Saved to: `{save_path}`")

        else:
            # Display grid for multiple images
            cols = st.columns(2)
            for idx, img in enumerate(images):
                with cols[idx % 2]:
                    st.image(img, use_column_width=True, caption=f"Variant {idx+1}")
                    buf = io.BytesIO()
                    img.save(buf, format="PNG")
                    st.download_button(
                        f"⬇️ Download {idx+1}",
                        data=buf.getvalue(),
                        file_name=f"ai_artwork_{idx+1}.png",
                        mime="image/png",
                        key=f"dl_{idx}",
                    )
    else:
        # Placeholder when no image generated yet
        st.markdown("""
        <div style="
            border: 2px dashed rgba(167,139,250,0.4);
            border-radius: 16px;
            padding: 3rem;
            text-align: center;
            color: #64748b;
            background: rgba(167,139,250,0.05);
        ">
            <div style="font-size: 4rem;">🖼️</div>
            <p style="margin-top: 1rem; font-size: 1.1rem;">
                Your generated artwork will appear here.<br>
                <small>Enter a prompt and click "Generate Art"</small>
            </p>
        </div>
        """, unsafe_allow_html=True)

# ─────────────────────────────────────────────
# PROMPT HISTORY (session state)
# ─────────────────────────────────────────────

if generate_clicked and prompt.strip():
    if "history" not in st.session_state:
        st.session_state["history"] = []
    st.session_state["history"].insert(0, prompt)
    st.session_state["history"] = st.session_state["history"][:10]  # Keep last 10

if "history" in st.session_state and st.session_state["history"]:
    with st.expander("📜 Prompt History (last 10)"):
        for i, past_prompt in enumerate(st.session_state["history"]):
            col_a, col_b = st.columns([5, 1])
            with col_a:
                st.text(f"{i+1}. {past_prompt[:90]}")
            with col_b:
                if st.button("Reuse", key=f"reuse_{i}"):
                    st.session_state["selected_prompt"] = past_prompt
                    st.rerun()

# ─────────────────────────────────────────────
# FOOTER
# ─────────────────────────────────────────────

st.markdown("---")
st.markdown(
    "<p style='text-align:center; color:#475569; font-size:0.85rem;'>"
    "Built with ❤️ using Stable Diffusion + HuggingFace Diffusers + Streamlit | "
    "⚠️ Use responsibly — do not generate harmful or misleading content"
    "</p>",
    unsafe_allow_html=True
)
