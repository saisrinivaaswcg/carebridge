import os
import base64
import tempfile
import subprocess
import requests
import whisper
from dotenv import load_dotenv

load_dotenv()

MERALION_API_KEY = os.getenv("MERALION_API_KEY")
MERALION_API_URL = os.getenv("MERALION_API_URL")
TRANSCRIBE_ENDPOINT = f"{MERALION_API_URL}/v1/audio/transcriptions"
whisper_model = whisper.load_model("tiny")


def transcribe_audio(audio_bytes):
    """
    Transcribe audio using MERaLiON.
    Falls back to Whisper if MERaLiON fails.
    Returns:
        (transcript, engine)
    """
    try:
        # convert OGG to WAV using ffmpeg
        with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as ogg_file:
            ogg_file.write(audio_bytes)
            ogg_path = ogg_file.name

        wav_path = ogg_path.replace(".ogg", ".wav")
        subprocess.run(
            ["ffmpeg", "-i", ogg_path, "-ar", "16000", "-ac", "1", wav_path],
            check=True, capture_output=True
        )

        with open(wav_path, "rb") as wav_file:
            wav_bytes = wav_file.read()

        os.unlink(ogg_path)
        os.unlink(wav_path)

        encoded_audio = base64.b64encode(wav_bytes).decode("utf-8")
        data_uri = f"data:audio/wav;base64,{encoded_audio}"

        headers = {
            "Authorization": f"Bearer {MERALION_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {"audio_url": data_uri}

        response = requests.post(
            TRANSCRIBE_ENDPOINT,
            headers=headers,
            json=payload,
            timeout=60
        )
        response.raise_for_status()
        result = response.json()
        transcript = result["choices"][0]["message"]["content"]
        return transcript, "meralion"

    except Exception as e:
        print(f"MERaLiON transcription failed: {e}")
        print("Falling back to Whisper...")
        with tempfile.NamedTemporaryFile(suffix=".ogg", delete=True) as temp_audio:
            temp_audio.write(audio_bytes)
            temp_audio.flush()
            result = whisper_model.transcribe(temp_audio.name)
        return result["text"], "whisper_fallback"