import whisper
import os
import torch

# FFmpeg Path Configuration
# Add potential FFmpeg paths for Windows users who might have it installed via other apps
# but not added to system PATH.
POTENTIAL_FFMPEG_PATHS = [
    r"C:\Program Files (x86)\MiniTool uTube Downloader",
    r"C:\Program Files (x86)\DearMob\5KPlayer\ytb", 
    r"C:\ffmpeg\bin",
    r"C:\Program Files\ffmpeg\bin"
]

for p in POTENTIAL_FFMPEG_PATHS:
    if os.path.exists(os.path.join(p, 'ffmpeg.exe')):
        path_sep = os.pathsep
        if p not in os.environ['PATH']:
            os.environ['PATH'] += path_sep + p
            print(f"[AUDIO] Found and added FFmpeg to PATH: {p}")
        break

# Lazy load model to save memory/startup time
MODEL_CACHE = {}

def get_model(model_size="base"):
    if model_size not in MODEL_CACHE:
        # Check for CUDA
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"[WHISPER] Loading {model_size} model on {device}...")
        MODEL_CACHE[model_size] = whisper.load_model(model_size, device=device)
    return MODEL_CACHE[model_size]

def transcribe_audio(file_path: str, model_size: str = "base", language: str = None):
    """
    Transcribes audio using OpenAI Whisper.
    file_path: Path to the audio file.
    model_size: 'tiny', 'base', 'small', 'medium', 'large'
    language: Optional ISO code (e.g. 'en', 'hi'). If None, auto-detects.
    """
    try:
        model = get_model(model_size)
        
        # Options
        options = {}
        if language and language != "auto":
            options["language"] = language
            # Improve Hindi accuracy by prompting with Devanagari
            if language == "hi":
                options["initial_prompt"] = "नमस्ते, यह हिंदी ट्रांसक्रिप्शन है।"

        # Transcribe
        # fp16=False is safer for CPU to avoid warnings
        result = model.transcribe(file_path, fp16=False, **options)
        
        return {
            "text": result["text"].strip(),
            "language": result.get("language", "unknown"),
            "segments": result.get("segments", []) # For timestamps
        }
        
    except Exception as e:
        print(f"Transcription Error: {e}")
        raise ValueError(f"Transcription failed: {str(e)}")
