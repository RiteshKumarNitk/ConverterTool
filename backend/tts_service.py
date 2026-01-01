import os
import uuid
import asyncio
import edge_tts
from gtts import gTTS

async def generate_speech(
    text: str,
    language: str = "en",
    voice: str = None,
    speed: float = 1.0,
    pitch: float = 1.0
) -> str:
    """
    Generates speech audio from text.
    Returns the path to the generated audio file.
    """
    
    # 1. Determine Voice
    # Default voices mapping
    VOICE_MAPPING = {
        "en": "en-US-AriaNeural",
        "hi": "hi-IN-SwaraNeural",
        # Add more logic or voices as needed
    }
    
    if not voice:
        voice = VOICE_MAPPING.get(language, "en-US-AriaNeural")

    # 2. Format Speed/Pitch for edge-tts
    # edge-tts expects strings like "+10%", "-50%"
    # Base is 0% (speed=1.0). 
    # speed=1.5 -> +50%. speed=0.5 -> -50%.
    
    rate_str = "+0%"
    if speed != 1.0:
        val = int((speed - 1.0) * 100)
        sign = "+" if val >= 0 else "" # negative numbers have sign built-in
        rate_str = f"{sign}{val}%"
        
    pitch_str = "+0Hz"
    if pitch != 1.0:
        # Heuristic: 1.0 = 0Hz. 1.2 = +20Hz (rough approximation for simple control)
        # Actually edge-tts pitch takes Hz or st (semitones). 
        # Let's use Hz for relative change.
        # pitch=1.5 is high, pitch=0.5 is low. 
        # Let's say range is +/- 50Hz for typical usage? 
        val = int((pitch - 1.0) * 50) 
        sign = "+" if val >= 0 else ""
        pitch_str = f"{sign}{val}Hz"

    output_file = f"speech_{uuid.uuid4()}.mp3"
    
    try:
        # Use edge-tts (async)
        communicate = edge_tts.Communicate(text, voice, rate=rate_str, pitch=pitch_str)
        await communicate.save(output_file)
        return output_file
        
    except Exception as e:
        print(f"Edge TTS failed: {e}. Falling back to gTTS.")
        # Fallback to gTTS (sync, basic)
        try:
            # gTTS doesn't support fine-grained speed/pitch easily without other tools
            tts = gTTS(text=text, lang=language, slow=(speed < 0.8))
            tts.save(output_file)
            return output_file
        except Exception as e2:
            raise ValueError(f"TTS Generation failed: {str(e2)}")
