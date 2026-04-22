import { useState } from "react";

const sections = [
  { id: "overview", icon: "📌", label: "Overview" },
  { id: "models", icon: "🧠", label: "Model Selection" },
  { id: "architecture", icon: "⚙️", label: "Architecture" },
  { id: "implementation", icon: "💻", label: "Implementation" },
  { id: "dataset", icon: "🎨", label: "Dataset & Training" },
  { id: "frontend", icon: "🖥️", label: "Frontend UI" },
  { id: "deployment", icon: "🚀", label: "Deployment" },
  { id: "evaluation", icon: "📊", label: "Evaluation" },
  { id: "challenges", icon: "⚠️", label: "Challenges" },
  { id: "responsible", icon: "🔐", label: "Responsible AI" },
  { id: "future", icon: "📈", label: "Future Work" },
  { id: "viva", icon: "🎤", label: "Viva Prep" },
];

const CodeBlock = ({ code, lang = "python" }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: "relative", margin: "1rem 0" }}>
      <div style={{
        background: "#0d1117", borderRadius: "12px", overflow: "hidden",
        border: "1px solid #30363d", fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "8px 16px", background: "#161b22", borderBottom: "1px solid #30363d",
        }}>
          <span style={{ color: "#8b949e", fontSize: "12px", letterSpacing: "0.05em" }}>{lang}</span>
          <button onClick={copy} style={{
            background: copied ? "#238636" : "#21262d", color: copied ? "#fff" : "#8b949e",
            border: "1px solid #30363d", borderRadius: "6px", padding: "4px 12px",
            fontSize: "11px", cursor: "pointer", transition: "all 0.2s",
          }}>{copied ? "✓ Copied" : "Copy"}</button>
        </div>
        <pre style={{ margin: 0, padding: "1.2rem", overflowX: "auto", fontSize: "13px", lineHeight: "1.7", color: "#e6edf3" }}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

const Badge = ({ children, color = "#7c3aed" }) => (
  <span style={{
    background: color + "22", color, border: `1px solid ${color}44`,
    borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: 600,
    display: "inline-block", margin: "3px",
  }}>{children}</span>
);

const Card = ({ children, accent = "#7c3aed", style = {} }) => (
  <div style={{
    background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.08)`,
    borderLeft: `3px solid ${accent}`, borderRadius: "12px", padding: "1.2rem 1.5rem",
    margin: "1rem 0", ...style,
  }}>{children}</div>
);

const VivaQA = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ margin: "0.8rem 0", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div onClick={() => setOpen(!open)} style={{
        padding: "1rem 1.2rem", cursor: "pointer", display: "flex", justifyContent: "space-between",
        alignItems: "center", background: open ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
        transition: "background 0.2s",
      }}>
        <span style={{ fontWeight: 600, color: "#e2e8f0", fontSize: "14px" }}>Q: {q}</span>
        <span style={{ color: "#7c3aed", fontSize: "18px", transform: open ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>›</span>
      </div>
      {open && (
        <div style={{ padding: "1rem 1.2rem", background: "rgba(124,58,237,0.05)", color: "#94a3b8", fontSize: "14px", lineHeight: 1.7 }}>
          <strong style={{ color: "#a78bfa" }}>A: </strong>{a}
        </div>
      )}
    </div>
  );
};

const ModelCompare = () => {
  const models = [
    { name: "StyleGAN", type: "GAN", speed: "Fast", quality: "★★★★☆", prompt: "❌ No text input", size: "~300MB", best: "Face generation", color: "#ef4444" },
    { name: "Stable Diffusion", type: "Diffusion", speed: "Medium", quality: "★★★★★", prompt: "✅ Text prompts", size: "~5GB", best: "✅ General art (our pick)", color: "#10b981" },
    { name: "DALL·E 3", type: "Diffusion+LLM", speed: "Fast (API)", quality: "★★★★★", prompt: "✅ Text prompts", size: "Cloud only", best: "Easy to use", color: "#3b82f6" },
  ];
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "rgba(124,58,237,0.2)" }}>
            {["Model","Type","Speed","Quality","Text Prompt","Model Size","Best For"].map(h => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: "#a78bfa", fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {models.map((m, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: "10px 14px", fontWeight: 700, color: m.color }}>{m.name}</td>
              <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{m.type}</td>
              <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{m.speed}</td>
              <td style={{ padding: "10px 14px", color: "#fbbf24" }}>{m.quality}</td>
              <td style={{ padding: "10px 14px" }}>{m.prompt}</td>
              <td style={{ padding: "10px 14px", color: "#94a3b8" }}>{m.size}</td>
              <td style={{ padding: "10px 14px", color: "#e2e8f0" }}>{m.best}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Pipeline = () => {
  const steps = [
    { icon: "✍️", title: "Text Prompt", desc: "User enters prompt", color: "#7c3aed" },
    { icon: "🔤", title: "CLIP Tokenizer", desc: "Text → tokens", color: "#db2777" },
    { icon: "📝", title: "Text Encoder", desc: "Tokens → embeddings (768-dim vectors)", color: "#ea580c" },
    { icon: "🎲", title: "Random Noise", desc: "Start from Gaussian noise", color: "#ca8a04" },
    { icon: "🔄", title: "Denoising (30x)", desc: "UNet removes noise step by step", color: "#16a34a" },
    { icon: "🖼️", title: "VAE Decoder", desc: "Latents → pixel image", color: "#2563eb" },
    { icon: "🎨", title: "Final Image", desc: "512×512 PNG output", color: "#9333ea" },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", justifyContent: "center", padding: "1rem 0" }}>
      {steps.map((s, i) => (
        <>
          <div key={i} style={{
            textAlign: "center", padding: "0.8rem 1rem", borderRadius: "10px",
            background: s.color + "20", border: `1px solid ${s.color}44`, minWidth: "110px",
          }}>
            <div style={{ fontSize: "1.8rem" }}>{s.icon}</div>
            <div style={{ fontWeight: 700, color: s.color, fontSize: "12px", marginTop: "4px" }}>{s.title}</div>
            <div style={{ color: "#64748b", fontSize: "10px", marginTop: "2px" }}>{s.desc}</div>
          </div>
          {i < steps.length - 1 && (
            <div key={`arrow-${i}`} style={{ color: "#475569", fontSize: "20px", fontWeight: "bold" }}>→</div>
          )}
        </>
      ))}
    </div>
  );
};

export default function App() {
  const [active, setActive] = useState("overview");

  const content = {
    overview: (
      <div>
        <h2 style={h2style}>📌 Project Overview</h2>
        <Card accent="#7c3aed">
          <h3 style={{ color: "#a78bfa", margin: "0 0 0.5rem" }}>What Is This?</h3>
          <p style={pstyle}>
            An <strong style={{ color: "#e2e8f0" }}>AI-Powered Art Generator</strong> that converts plain English text descriptions
            into high-quality, unique images using <strong style={{ color: "#e2e8f0" }}>Stable Diffusion</strong> — a state-of-the-art
            deep learning model. Type a prompt like "a dragon over a misty mountain" and get a stunning artwork in seconds.
          </p>
        </Card>

        <h3 style={h3style}>🎯 Objectives</h3>
        <ul style={listStyle}>
          <li>Build a complete text-to-image generation pipeline from scratch</li>
          <li>Provide a user-friendly web UI with prompt input, settings, and download</li>
          <li>Support fine-tuning for custom artistic styles using LoRA</li>
          <li>Demonstrate responsible AI practices including content filtering</li>
          <li>Make the project deployable on free cloud platforms (HuggingFace Spaces)</li>
        </ul>

        <h3 style={h3style}>🌍 Real-World Applications</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", margin: "1rem 0" }}>
          {[
            { icon: "🎮", title: "Game Dev", desc: "Concept art, textures, NPC designs" },
            { icon: "📢", title: "Marketing", desc: "Ad creatives, social media graphics" },
            { icon: "📚", title: "Education", desc: "Visual aids, illustrated textbooks" },
            { icon: "🎬", title: "Film & Media", desc: "Storyboards, set design concepts" },
            { icon: "👗", title: "Fashion", desc: "Clothing designs, pattern generation" },
            { icon: "🏠", title: "Architecture", desc: "Interior visualizations, mockups" },
          ].map((app, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "0.8rem", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
              <div style={{ fontSize: "2rem" }}>{app.icon}</div>
              <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "13px" }}>{app.title}</div>
              <div style={{ color: "#64748b", fontSize: "11px", marginTop: "4px" }}>{app.desc}</div>
            </div>
          ))}
        </div>

        <h3 style={h3style}>❓ Problem Statement</h3>
        <Card accent="#db2777">
          <p style={pstyle}>
            Creating professional digital art requires years of training and expensive software.
            This project democratizes art creation — anyone can produce stunning, customized visuals
            simply by describing what they want in natural language, with no artistic skills required.
          </p>
        </Card>
      </div>
    ),

    models: (
      <div>
        <h2 style={h2style}>🧠 Model Selection & Explanation</h2>

        <h3 style={h3style}>Model Comparison</h3>
        <ModelCompare />

        <Card accent="#10b981" style={{ marginTop: "1.5rem" }}>
          <h3 style={{ color: "#34d399", margin: "0 0 0.5rem" }}>✅ Our Choice: Stable Diffusion v1.5</h3>
          <p style={pstyle}><strong>Why?</strong></p>
          <ul style={{ ...listStyle, margin: "0.5rem 0" }}>
            <li><strong>Open Source</strong> — Free to use, modify, and deploy commercially</li>
            <li><strong>Local Execution</strong> — Runs on your own hardware, no API costs</li>
            <li><strong>Customizable</strong> — Supports LoRA, DreamBooth fine-tuning</li>
            <li><strong>Community</strong> — Thousands of fine-tuned models available on HuggingFace</li>
            <li><strong>Python-Native</strong> — Integrates perfectly with HuggingFace Diffusers</li>
          </ul>
        </Card>

        <h3 style={h3style}>How Stable Diffusion Works (Simple Explanation)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", margin: "1rem 0" }}>
          {[
            { step: "1", title: "Text Understanding", desc: "CLIP model reads your prompt and converts it into a list of numbers (embeddings) that the AI understands — like a mathematical representation of meaning.", color: "#7c3aed" },
            { step: "2", title: "Start with Noise", desc: "Instead of drawing from scratch, the AI starts with a completely random, noisy image — like TV static. This randomness allows creativity.", color: "#db2777" },
            { step: "3", title: "Guided Denoising", desc: "The UNet neural network gradually removes noise in ~30 steps, guided by your text. Each step makes the image clearer and closer to your prompt.", color: "#ea580c" },
            { step: "4", title: "Decode to Pixels", desc: "The final latent representation is decoded by the VAE into a full 512×512 pixel image you can see and download.", color: "#16a34a" },
          ].map((s) => (
            <Card key={s.step} accent={s.color}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <div style={{ background: s.color, borderRadius: "50%", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", flexShrink: 0, fontSize: "13px" }}>{s.step}</div>
                <div>
                  <div style={{ color: "#e2e8f0", fontWeight: 600, marginBottom: "4px" }}>{s.title}</div>
                  <div style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card accent="#ca8a04">
          <h4 style={{ color: "#fbbf24", margin: "0 0 0.5rem" }}>🔑 Key Components</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {["CLIP Text Encoder", "UNet Denoiser", "VAE Encoder/Decoder", "DDPM/DPM++ Scheduler", "Classifier-Free Guidance (CFG)"].map(c => (
              <Badge key={c} color="#ca8a04">{c}</Badge>
            ))}
          </div>
        </Card>
      </div>
    ),

    architecture: (
      <div>
        <h2 style={h2style}>⚙️ System Architecture</h2>
        <h3 style={h3style}>End-to-End Pipeline</h3>
        <Pipeline />

        <h3 style={h3style}>Component Details</h3>
        {[
          { name: "CLIP Tokenizer + Encoder", role: "Converts text to semantic embeddings", tech: "OpenAI CLIP ViT-L/14", file: "transformers" },
          { name: "UNet (Main Denoiser)", role: "Core neural network that learns to remove noise", tech: "2D UNet with self/cross attention", file: "diffusers" },
          { name: "VAE (Variational Autoencoder)", role: "Compresses images to latent space for efficiency", tech: "KL-regularized VAE", file: "diffusers" },
          { name: "Noise Scheduler", role: "Controls how noise is added/removed during training and inference", tech: "DPM++ Multistep Solver", file: "diffusers" },
          { name: "Streamlit UI", role: "Web interface for user interaction", tech: "Python + Streamlit", file: "app/app.py" },
        ].map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "0.8rem 1rem", margin: "0.5rem 0", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ minWidth: "8px", height: "8px", borderRadius: "50%", background: ["#7c3aed","#db2777","#ea580c","#16a34a","#2563eb"][i] }} />
            <div style={{ flex: 1 }}>
              <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "14px" }}>{c.name}</div>
              <div style={{ color: "#64748b", fontSize: "12px" }}>{c.role}</div>
            </div>
            <Badge color="#475569">{c.tech}</Badge>
          </div>
        ))}

        <h3 style={h3style}>📁 Folder Structure</h3>
        <CodeBlock lang="tree" code={`ai-art-generator/
│
├── app/
│   ├── app.py              ← Streamlit UI (run this!)
│   ├── generator.py        ← Core generation logic
│   ├── evaluate.py         ← Image quality metrics
│   └── utils.py            ← Helper functions
│
├── model/
│   └── fine_tune/
│       ├── lora_train.py   ← LoRA fine-tuning script
│       └── dreambooth.py   ← DreamBooth fine-tuning
│
├── outputs/                ← Generated images saved here
├── requirements.txt        ← Python dependencies
└── README.md               ← Project documentation`} />
      </div>
    ),

    implementation: (
      <div>
        <h2 style={h2style}>💻 Implementation</h2>

        <h3 style={h3style}>Step 1: Install Dependencies</h3>
        <CodeBlock lang="bash" code={`# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\\Scripts\\activate

# Install all dependencies
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
pip install diffusers transformers accelerate
pip install streamlit Pillow safetensors`} />

        <h3 style={h3style}>Step 2: Basic Text-to-Image Generation</h3>
        <CodeBlock code={`from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
import torch

# ── Load Model ──────────────────────────────────────────
model_id = "runwayml/stable-diffusion-v1-5"

pipe = StableDiffusionPipeline.from_pretrained(
    model_id,
    torch_dtype=torch.float16  # Use float16 for GPU efficiency
)

# Use DPM++ scheduler for faster, better quality output
pipe.scheduler = DPMSolverMultistepScheduler.from_config(
    pipe.scheduler.config
)
pipe = pipe.to("cuda")  # Move to GPU

# ── Generate Image ───────────────────────────────────────
prompt = "A majestic dragon soaring over a misty mountain range, \
          fantasy art, highly detailed, vibrant colors, 8K"

negative_prompt = "blurry, bad anatomy, worst quality, low quality"

# Run inference
image = pipe(
    prompt=prompt,
    negative_prompt=negative_prompt,
    num_inference_steps=30,    # Quality vs speed tradeoff
    guidance_scale=7.5,        # How closely to follow prompt
    width=512,
    height=512,
    generator=torch.Generator("cuda").manual_seed(42),  # Reproducible
).images[0]

# Save the result
image.save("my_artwork.png")
print("✅ Image saved!")`} />

        <h3 style={h3style}>Step 3: Image-to-Image Generation</h3>
        <CodeBlock code={`from diffusers import StableDiffusionImg2ImgPipeline
from PIL import Image
import torch

# Load img2img pipeline
pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float16,
).to("cuda")

# Load source image
init_image = Image.open("my_photo.jpg").convert("RGB")
init_image = init_image.resize((512, 512))

# Transform the image
prompt = "a stunning oil painting of the scene, Van Gogh style"

result = pipe(
    prompt=prompt,
    image=init_image,
    strength=0.75,    # 0 = keep original, 1 = completely change
    guidance_scale=7.5,
    num_inference_steps=30,
).images[0]

result.save("transformed_art.png")`} />

        <h3 style={h3style}>Step 4: Run the App</h3>
        <CodeBlock lang="bash" code={`# Navigate to project directory
cd ai-art-generator

# Launch Streamlit app
streamlit run app/app.py

# App opens at http://localhost:8501`} />

        <Card accent="#fbbf24">
          <h4 style={{ color: "#fbbf24", margin: "0 0 0.5rem" }}>💡 Prompt Engineering Tips</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {[
              ["Be Specific", '"a red-haired woman in a library" > "a woman"'],
              ["Add Art Style", '"oil painting, watercolor, photorealistic, anime"'],
              ["Specify Quality", '"8K, highly detailed, sharp focus, masterpiece"'],
              ["Control Lighting", '"golden hour, studio lighting, dramatic shadows"'],
              ["Use Negative Prompts", '"blurry, bad anatomy, watermark, ugly"'],
              ["Try Seed Control", "Same seed = same image (useful for variations)"],
            ].map(([t, d]) => (
              <div key={t} style={{ background: "rgba(251,191,36,0.05)", borderRadius: "8px", padding: "8px 10px" }}>
                <div style={{ color: "#fbbf24", fontSize: "12px", fontWeight: 600 }}>{t}</div>
                <div style={{ color: "#94a3b8", fontSize: "11px", marginTop: "2px" }}>{d}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    ),

    dataset: (
      <div>
        <h2 style={h2style}>🎨 Dataset & Training</h2>

        <h3 style={h3style}>For Using Pre-trained Model (No training needed!)</h3>
        <Card accent="#10b981">
          <p style={pstyle}>The default <code style={codeStyle}>runwayml/stable-diffusion-v1-5</code> model was trained on <strong style={{ color: "#e2e8f0" }}>LAION-5B</strong> — 5 billion image-text pairs. You can use it directly without any training.</p>
        </Card>

        <h3 style={h3style}>Fine-tuning Dataset Requirements</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { method: "LoRA", images: "15–50 images", time: "15–30 min", vram: "8GB VRAM", best: "Adding new style/subject" },
            { method: "DreamBooth", images: "5–20 images", time: "30–60 min", vram: "12GB VRAM", best: "Specific person/object" },
            { method: "Full Fine-tune", images: "10,000+ images", time: "Days", vram: "40GB+ VRAM", best: "Complete domain shift" },
            { method: "Textual Inversion", images: "5–15 images", time: "1–2 hours", vram: "8GB VRAM", best: "New concept/style token" },
          ].map((m) => (
            <Card key={m.method} accent="#7c3aed">
              <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: "15px" }}>{m.method}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "8px" }}>
                {[["Images", m.images], ["Time", m.time], ["VRAM", m.vram], ["Best For", m.best]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ color: "#64748b", fontSize: "10px" }}>{k}</div>
                    <div style={{ color: "#e2e8f0", fontSize: "12px", fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <h3 style={h3style}>Dataset Sources</h3>
        <ul style={listStyle}>
          <li><strong style={{ color: "#e2e8f0" }}>LAION-5B</strong> — laion.ai/laion-5b — 5 billion image-text pairs (used to train SD)</li>
          <li><strong style={{ color: "#e2e8f0" }}>WikiArt</strong> — WikiArt.org — 250K art images with style labels</li>
          <li><strong style={{ color: "#e2e8f0" }}>COCO</strong> — cocodataset.org — 330K images with captions</li>
          <li><strong style={{ color: "#e2e8f0" }}>Unsplash Dataset</strong> — 25K+ high-quality photos with metadata</li>
          <li><strong style={{ color: "#e2e8f0" }}>Custom Dataset</strong> — Your own images + written descriptions</li>
        </ul>

        <h3 style={h3style}>LoRA Training Command</h3>
        <CodeBlock lang="bash" code={`# Prepare 15-50 images in ./my_training_images/
# Each image should be 512x512 pixels

python model/fine_tune/lora_train.py \\
  --dataset_path ./my_training_images \\
  --instance_prompt "a painting in the style of sks" \\
  --output_dir ./lora_weights \\
  --num_epochs 100 \\
  --learning_rate 1e-4 \\
  --lora_rank 4

# After training, use your LoRA:
# pipe.load_lora_weights("./lora_weights")`} />
      </div>
    ),

    frontend: (
      <div>
        <h2 style={h2style}>🖥️ Frontend UI (Streamlit)</h2>

        <Card accent="#2563eb">
          <p style={pstyle}>The app is built with <strong style={{ color: "#93c5fd" }}>Streamlit</strong> — a Python library that turns scripts into interactive web apps with zero HTML/CSS knowledge required.</p>
        </Card>

        <h3 style={h3style}>UI Features</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", margin: "1rem 0" }}>
          {[
            { icon: "💬", title: "Prompt Input", desc: "Multi-line text area with placeholder examples" },
            { icon: "🚫", title: "Negative Prompt", desc: "Tell the model what to avoid in the output" },
            { icon: "🎛️", title: "Parameter Controls", desc: "Steps, CFG scale, image size, seed sliders" },
            { icon: "🖼️", title: "Image Upload", desc: "Drag & drop for image-to-image transformation" },
            { icon: "✨", title: "Generate Button", desc: "One-click generation with loading animation" },
            { icon: "⬇️", title: "Download Option", desc: "Save generated PNG directly to device" },
            { icon: "💡", title: "Prompt Suggestions", desc: "Click-to-use example prompts for inspiration" },
            { icon: "📜", title: "Prompt History", desc: "Remembers and reuses previous prompts in session" },
          ].map((f) => (
            <div key={f.title} style={{ display: "flex", gap: "10px", padding: "0.8rem", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ fontSize: "1.4rem" }}>{f.icon}</span>
              <div>
                <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: "13px" }}>{f.title}</div>
                <div style={{ color: "#64748b", fontSize: "11px", marginTop: "2px" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <h3 style={h3style}>Key Streamlit Patterns Used</h3>
        <CodeBlock code={`import streamlit as st

# Sidebar settings
with st.sidebar:
    steps = st.slider("Inference Steps", 10, 100, 30)

# Cache the model (loads only once)
@st.cache_resource
def load_model():
    return load_text2img_pipeline()

# Two-column layout
col1, col2 = st.columns([1.2, 1])

# Session state for history
if "history" not in st.session_state:
    st.session_state["history"] = []

# Download button
st.download_button("⬇️ Download", data=img_bytes,
                   file_name="art.png", mime="image/png")`} />
      </div>
    ),

    deployment: (
      <div>
        <h2 style={h2style}>🚀 Deployment</h2>

        <h3 style={h3style}>Option 1: Run Locally</h3>
        <CodeBlock lang="bash" code={`# Prerequisites: Python 3.9+, Git, 8GB+ RAM

# 1. Clone the project
git clone https://github.com/yourusername/ai-art-generator.git
cd ai-art-generator

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
# venv\\Scripts\\activate       # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Launch the app (downloads model on first run ~5GB)
streamlit run app/app.py

# App runs at: http://localhost:8501`} />

        <h3 style={h3style}>Option 2: Hugging Face Spaces (Free GPU)</h3>
        <CodeBlock lang="bash" code={`# 1. Create account at huggingface.co

# 2. New Space → Choose: Streamlit SDK

# 3. Add these files to your Space:
#    - app/app.py  (must be named app.py at root)
#    - requirements.txt

# 4. In requirements.txt, add:
torch
diffusers
transformers
accelerate

# 5. Set hardware to T4 (free GPU tier)
# Your app runs at: https://huggingface.co/spaces/username/ai-art-gen`} />

        <h3 style={h3style}>Option 3: Streamlit Cloud</h3>
        <CodeBlock lang="bash" code={`# 1. Push code to GitHub

# 2. Go to share.streamlit.io

# 3. Connect GitHub repo

# 4. Set main file path: app/app.py

# 5. Deploy! Free hosting with GitHub integration

# Note: CPU only on free tier — generation takes ~2-5 min`} />

        <Card accent="#ea580c">
          <h4 style={{ color: "#fb923c", margin: "0 0 0.5rem" }}>⚡ GPU Requirements Guide</h4>
          <ul style={{ ...listStyle, margin: 0 }}>
            <li><strong>4GB VRAM</strong> — 512×512 with attention slicing, float16</li>
            <li><strong>8GB VRAM</strong> — 512×512 comfortably, multiple images</li>
            <li><strong>12GB+ VRAM</strong> — 768×768 and higher, fast generation</li>
            <li><strong>CPU Only</strong> — Works but takes 2-10 minutes per image</li>
          </ul>
        </Card>
      </div>
    ),

    evaluation: (
      <div>
        <h2 style={h2style}>📊 Evaluation Metrics</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px", margin: "1rem 0" }}>
          {[
            { metric: "FID Score", full: "Fréchet Inception Distance", range: "Lower = Better", good: "< 50", desc: "Compares distribution of generated vs real images using InceptionV3 features. The gold standard for GAN/Diffusion evaluation.", color: "#7c3aed" },
            { metric: "CLIP Score", full: "CLIP Text-Image Alignment", range: "Higher = Better", good: "> 0.28", desc: "Measures how well the generated image matches the text prompt using CLIP embeddings. Directly measures prompt adherence.", color: "#db2777" },
            { metric: "LPIPS", full: "Learned Perceptual Image Patch Similarity", range: "Lower = Better", good: "< 0.3", desc: "Measures perceptual similarity between images. Useful for img2img evaluation — how close is output to input?", color: "#ea580c" },
            { metric: "IS Score", full: "Inception Score", range: "Higher = Better", good: "> 3.0", desc: "Measures both quality (sharp images) and diversity (variety of outputs) using InceptionV3 predictions.", color: "#16a34a" },
          ].map((m) => (
            <Card key={m.metric} accent={m.color} style={{ padding: "1rem" }}>
              <div style={{ color: m.color, fontWeight: 700, fontSize: "15px" }}>{m.metric}</div>
              <div style={{ color: "#64748b", fontSize: "10px", marginBottom: "8px" }}>{m.full}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <Badge color={m.color}>{m.range}</Badge>
                <Badge color="#22c55e">Good: {m.good}</Badge>
              </div>
              <p style={{ ...pstyle, fontSize: "11px", margin: 0 }}>{m.desc}</p>
            </Card>
          ))}
        </div>

        <h3 style={h3style}>Human Evaluation (Most Important!)</h3>
        <Card accent="#22c55e">
          <p style={pstyle}>Automated metrics don't always match human judgment. Always evaluate with real users:</p>
          <ul style={{ ...listStyle, margin: "0.5rem 0" }}>
            <li>Rate 1-5: <em>Does the image match the prompt?</em></li>
            <li>Rate 1-5: <em>Is it visually appealing?</em></li>
            <li>Yes/No: <em>Are there visible artifacts or distortions?</em></li>
            <li>Yes/No: <em>Would you use this in a real project?</em></li>
          </ul>
        </Card>
      </div>
    ),

    challenges: (
      <div>
        <h2 style={h2style}>⚠️ Challenges & Limitations</h2>
        {[
          { title: "High Compute Cost", icon: "💸", color: "#ea580c", content: "Stable Diffusion requires a powerful GPU. RTX 3060+ recommended for reasonable speed. Cloud GPUs (A100) cost $2-5/hr. CPU-only generation takes 5+ minutes per image." },
          { title: "Bias in Generated Images", icon: "⚖️", color: "#eab308", content: "Models trained on internet data inherit societal biases. Certain demographic groups may be underrepresented or stereotyped. Professional and leadership roles may skew toward particular demographics." },
          { title: "Deepfakes & Misuse", icon: "🎭", color: "#ef4444", content: "The same technology that creates beautiful art can be misused to create non-consensual intimate images, fake photos of real people, or misleading political imagery. Content filtering is essential." },
          { title: "Copyright Concerns", icon: "©️", color: "#a855f7", content: "Models are trained on copyrighted images scraped from the web. Outputs may closely resemble existing artworks. The legal status of AI-generated art is still evolving globally." },
          { title: "Hallucinations & Artifacts", icon: "👁️", color: "#64748b", content: "AI models often struggle with text rendering, correct finger counts, complex spatial relationships, and physically accurate scenes. Multiple generations may be needed for best results." },
          { title: "Memory Limitations", icon: "💾", color: "#06b6d4", content: "Generating high-resolution (1024×1024+) images requires more VRAM. Attention slicing and CPU offloading help but slow generation. Large batches can exhaust available GPU memory." },
        ].map((c) => (
          <Card key={c.title} accent={c.color}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <span style={{ fontSize: "1.8rem" }}>{c.icon}</span>
              <div>
                <div style={{ color: c.color, fontWeight: 700, marginBottom: "6px" }}>{c.title}</div>
                <p style={{ ...pstyle, margin: 0 }}>{c.content}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    ),

    responsible: (
      <div>
        <h2 style={h2style}>🔐 Responsible AI</h2>

        <Card accent="#22c55e">
          <h3 style={{ color: "#4ade80", margin: "0 0 0.8rem" }}>Content Filtering Strategy</h3>
          <CodeBlock code={`from transformers import pipeline

# Load a content safety classifier
safety_checker = pipeline(
    "text-classification",
    model="KoalaAI/Text-Moderation"
)

def is_safe_prompt(prompt: str) -> bool:
    """
    Returns True if prompt is safe to generate.
    Blocks: violence, NSFW, real person misuse, etc.
    """
    result = safety_checker(prompt)[0]
    return result["label"] == "safe"

# Usage
if not is_safe_prompt(user_prompt):
    return "⚠️ This prompt violates our content policy."
else:
    generate_image(user_prompt)`} />
        </Card>

        <h3 style={h3style}>Ethical Guidelines</h3>
        <ul style={listStyle}>
          <li>✅ Add watermarks or metadata to AI-generated images</li>
          <li>✅ Clearly label AI-generated content as "AI Art"</li>
          <li>✅ Block prompts requesting real people's likenesses</li>
          <li>✅ Block explicit, violent, or hateful content</li>
          <li>✅ Implement rate limiting to prevent abuse</li>
          <li>✅ Log prompts for audit purposes (anonymized)</li>
          <li>✅ Provide opt-out for artists who don't want their style trained on</li>
          <li>✅ Follow GDPR/CCPA for any user data collection</li>
        </ul>

        <Card accent="#ef4444">
          <h4 style={{ color: "#f87171", margin: "0 0 0.5rem" }}>🚫 Prohibited Uses</h4>
          <p style={pstyle}>Generating images of real identifiable people without consent · CSAM (any content involving minors) · Misleading political content / election interference · Non-consensual intimate imagery · Defamatory content targeting individuals</p>
        </Card>
      </div>
    ),

    future: (
      <div>
        <h2 style={h2style}>📈 Future Enhancements</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            { icon: "🎨", title: "Style Transfer", desc: "Allow users to upload a reference image and apply its artistic style to any generated image using AdaIN or LoRA style presets.", effort: "Medium", color: "#7c3aed" },
            { icon: "👤", title: "User Accounts", desc: "Add authentication (OAuth), personal galleries, saved prompts, and cloud storage for generated images.", effort: "Medium", color: "#db2777" },
            { icon: "📜", title: "Prompt History DB", desc: "Store all prompts and generated images in a SQLite/PostgreSQL database with search and filtering.", effort: "Easy", color: "#10b981" },
            { icon: "🖼️", title: "Inpainting", desc: "Let users mask and regenerate specific regions of an image while keeping the rest intact.", effort: "Medium", color: "#ea580c" },
            { icon: "🎬", title: "Video Generation", desc: "Integrate with Stable Video Diffusion (SVD) to animate still images or generate short video clips.", effort: "Hard", color: "#2563eb" },
            { icon: "🌐", title: "Batch API", desc: "REST API endpoint for programmatic access, batch generation, and integration into other applications.", effort: "Medium", color: "#9333ea" },
            { icon: "🔧", title: "Custom Model Hub", desc: "UI for downloading and switching between community fine-tuned models from Hugging Face directly in the app.", effort: "Medium", color: "#0891b2" },
            { icon: "📱", title: "Mobile App", desc: "React Native / Flutter app for on-device generation using optimized quantized models (Core ML, ONNX).", effort: "Hard", color: "#ca8a04" },
          ].map((f) => (
            <div key={f.title} style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: `1px solid ${f.color}33` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "1.4rem" }}>{f.icon}</span>
                  <span style={{ color: f.color, fontWeight: 700, fontSize: "14px" }}>{f.title}</span>
                </div>
                <Badge color={f.effort === "Easy" ? "#22c55e" : f.effort === "Medium" ? "#eab308" : "#ef4444"}>{f.effort}</Badge>
              </div>
              <p style={{ ...pstyle, fontSize: "12px", margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),

    viva: (
      <div>
        <h2 style={h2style}>🎤 Viva / Presentation Preparation</h2>
        <p style={{ ...pstyle, marginBottom: "1.5rem" }}>Click each question to reveal the answer. Prepare these thoroughly — they cover all major examinable topics.</p>

        <h3 style={h3style}>Core Concepts</h3>
        {[
          { q: "What is Stable Diffusion and how is it different from a GAN?", a: "Stable Diffusion is a latent diffusion model that generates images by gradually denoising random noise, guided by a text prompt. Unlike GANs which use a generator-discriminator adversarial setup, diffusion models are trained to predict and remove noise — making them more stable to train and producing higher-quality, more diverse outputs. GANs can suffer from mode collapse; diffusion models don't." },
          { q: "What is the role of the UNet in Stable Diffusion?", a: "The UNet is the core neural network that learns to predict and remove noise from images. It takes the noisy latent image + timestep + text embeddings as input, and outputs the predicted noise. This prediction is subtracted from the noisy image, gradually cleaning it over ~30 steps. It uses both self-attention (image structure) and cross-attention (text-image alignment)." },
          { q: "What is CFG (Classifier-Free Guidance) and why is it important?", a: "CFG is a technique that runs the denoising twice — once with the text prompt and once without — and amplifies the difference. The scale (7.5 by default) controls how strongly the model follows your prompt. Higher values (10-15) give very literal, sometimes oversaturated results. Lower values (1-5) give more creative but less prompt-accurate outputs. It's a key quality-vs-creativity knob." },
          { q: "What is LoRA and why is it preferred over full fine-tuning?", a: "LoRA (Low-Rank Adaptation) inserts small, trainable matrices (rank-4 to rank-16) into the attention layers of the frozen base model. Instead of updating 5 billion parameters, LoRA only trains ~1 million new parameters, resulting in tiny 3-5MB adapter files, 10x faster training, and no catastrophic forgetting of the base model's knowledge. It's the go-to method for style/character fine-tuning." },
          { q: "What is the VAE and what does it do?", a: "The VAE (Variational Autoencoder) compresses 512×512 RGB images (786,432 values) into a compact 64×64×4 latent space (16,384 values) — a 48x compression. The diffusion process runs in this latent space, making it much faster and less memory-intensive. The decoder then expands the cleaned latent back to full resolution pixels for the final output." },
          { q: "What metrics do you use to evaluate your model?", a: "FID (Fréchet Inception Distance) measures statistical similarity to real images — lower is better, <50 is good. CLIP Score measures text-image alignment using CLIP embeddings — higher is better, >0.28 is considered good. LPIPS measures perceptual image similarity for img2img tasks. For subjective quality, human evaluation surveys (1-5 rating scale) remain the most meaningful evaluation." },
          { q: "What are the ethical concerns with AI image generation?", a: "Major concerns include: (1) Deepfakes — creating fake images of real people without consent. (2) Copyright — models trained on scraped copyrighted art. (3) Bias — perpetuating stereotypes from training data. (4) NSFW content — potential for harmful imagery generation. Mitigations include content filtering, watermarking, audit logs, clear labeling of AI content, and adherence to platform terms of service." },
          { q: "How would you deploy this for many users at scale?", a: "For scale: (1) Use a GPU inference server (TorchServe, Triton) with load balancing. (2) Queue requests with Celery + Redis for async generation. (3) Cache common results with a CDN. (4) Use model quantization (INT8, FP16) for efficiency. (5) Implement rate limiting per user. (6) Auto-scale cloud GPU instances (AWS EC2 G4dn, GCP A100) based on request volume." },
        ].map((qa, i) => <VivaQA key={i} q={qa.q} a={qa.a} />)}

        <Card accent="#7c3aed" style={{ marginTop: "1.5rem" }}>
          <h4 style={{ color: "#a78bfa", margin: "0 0 0.5rem" }}>🏆 Pro Tips for Your Viva</h4>
          <ul style={{ ...listStyle, margin: 0 }}>
            <li>Bring a printed architecture diagram and walk through it step-by-step</li>
            <li>Have sample generated images ready on your laptop/phone to show</li>
            <li>Know the difference between GAN, VAE, and Diffusion model approaches</li>
            <li>Be ready to explain latent space intuitively ("it's like a compressed zip file of the image")</li>
            <li>Mention real-world applications relevant to your examiner's field</li>
          </ul>
        </Card>
      </div>
    ),
  };

  const h2style = { color: "#e2e8f0", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.8rem", margin: "0 0 1.2rem", fontWeight: 700 };
  const h3style = { color: "#94a3b8", fontSize: "1rem", fontWeight: 600, margin: "1.5rem 0 0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" };
  const pstyle = { color: "#94a3b8", lineHeight: 1.7, margin: "0.5rem 0", fontSize: "14px" };
  const listStyle = { color: "#94a3b8", paddingLeft: "1.4rem", lineHeight: 2, fontSize: "14px" };
  const codeStyle = { background: "rgba(124,58,237,0.2)", color: "#a78bfa", padding: "2px 6px", borderRadius: "4px", fontSize: "12px" };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a0f 0%, #0f0a1e 50%, #0a0f14 100%)",
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      color: "#e2e8f0",
    }}>
      {/* HEADER */}
      <div style={{
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(124,58,237,0.3)", padding: "1.2rem 2rem",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{
                background: "linear-gradient(135deg, #7c3aed, #db2777)",
                borderRadius: "10px", padding: "6px 10px", fontSize: "18px",
              }}>🎨</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "16px", color: "#e2e8f0" }}>AI Art Generator</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Stable Diffusion · Complete Project Guide</div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Badge color="#10b981">Python</Badge>
            <Badge color="#7c3aed">Diffusers</Badge>
            <Badge color="#2563eb">Streamlit</Badge>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem", display: "flex", gap: "2rem" }}>
        {/* SIDEBAR NAV */}
        <div style={{
          width: "220px", flexShrink: 0, position: "sticky", top: "80px",
          alignSelf: "flex-start", maxHeight: "calc(100vh - 100px)", overflowY: "auto",
        }}>
          <div style={{
            background: "rgba(255,255,255,0.03)", borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.08)", padding: "0.8rem",
          }}>
            <div style={{ fontSize: "10px", color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", padding: "0.4rem 0.6rem 0.8rem" }}>Sections</div>
            {sections.map((s) => (
              <button key={s.id} onClick={() => setActive(s.id)} style={{
                width: "100%", textAlign: "left", padding: "8px 10px", border: "none",
                borderRadius: "8px", cursor: "pointer", display: "flex", gap: "8px", alignItems: "center",
                background: active === s.id ? "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(219,39,119,0.2))" : "transparent",
                color: active === s.id ? "#e2e8f0" : "#64748b",
                borderLeft: active === s.id ? "2px solid #7c3aed" : "2px solid transparent",
                fontSize: "13px", fontWeight: active === s.id ? 600 : 400,
                transition: "all 0.15s",
              }}>
                <span>{s.icon}</span>{s.label}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: "rgba(255,255,255,0.02)", borderRadius: "16px",
            border: "1px solid rgba(255,255,255,0.07)", padding: "2rem",
            minHeight: "600px",
          }}>
            {content[active]}
          </div>
        </div>
      </div>
    </div>
  );
}
