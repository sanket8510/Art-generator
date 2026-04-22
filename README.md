# 🎨 AI-Powered Art Generator using Stable Diffusion

> A complete, beginner-friendly yet professional project for generating stunning AI art from text prompts using Stable Diffusion — ready for college submission, demo, or deployment.

---

## 📁 Folder Structure

```
ai-art-generator/
│
├── app/
│   ├── app.py                  # Streamlit frontend UI
│   ├── generator.py            # Core image generation logic
│   └── utils.py                # Helper functions (save, resize, etc.)
│
├── model/
│   ├── load_model.py           # Model loading & caching
│   └── fine_tune/
│       ├── lora_train.py       # LoRA fine-tuning script
│       └── dreambooth_train.py # DreamBooth fine-tuning script
│
├── outputs/                    # Generated images saved here
│
├── assets/
│   └── sample_outputs/         # Sample generated images for README
│
├── tests/
│   └── test_generator.py       # Unit tests
│
├── requirements.txt
├── README.md
└── .env.example                # Environment variable template
```

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ai-art-generator.git
cd ai-art-generator

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
streamlit run app/app.py
```

---

## 🔧 Requirements

- Python 3.9+
- CUDA-compatible GPU (recommended) OR CPU (slow)
- ~5GB disk space for model weights
- 8GB+ RAM (16GB recommended)

---

## 🌐 Deployment

### Hugging Face Spaces
1. Create account at huggingface.co
2. New Space → SDK: Streamlit
3. Upload all files
4. Set hardware: T4 GPU (free tier available)

### Streamlit Cloud
1. Push code to GitHub
2. Go to share.streamlit.io
3. Connect repo → Deploy

---

## 📄 License

MIT License — free to use, modify, and distribute with attribution.
