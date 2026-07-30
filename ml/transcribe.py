import os
import base64
import tempfile

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

    encoded_audio = base64.b64encode(audio_bytes).decode("utf-8")
    data_uri = f"data:audio/wav;base64,{encoded_audio}"

    try:
        headers = {
            "Authorization": f"Bearer {MERALION_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "audio_url": data_uri
        }

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

        with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as temp_audio:
            temp_audio.write(audio_bytes)
            temp_audio.flush()

            result = whisper_model.transcribe(temp_audio.name)

        return result["text"], "whisper_fallback"