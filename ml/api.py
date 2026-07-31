from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import tempfile
import subprocess
import os
from transcribe import transcribe_audio
from features import extract_features
from sentiment import analyse_sentiment
from driftmulti import calculate_risk
from storage import save_observation, get_user_history, get_observation_count
from acoustic import extract_acoustic_features
from embeddings import get_wavlm_embedding

app = FastAPI()

@app.get("/")
def home():
    return {
        "service": "CareBridge ML",
        "status": "running"
    }

class UserInput(BaseModel):
    user_id: str
    transcript: str

class VoiceInput(BaseModel):
    user_id: str
    audio_url: str

@app.post("/analyse_user")
def analyse_user(data: UserInput):
    features = extract_features(data.transcript)
    sentiment = analyse_sentiment(data.transcript)
    combined_features = {
        "word_count": features["word_count"],
        "lexical_diversity": features["lexical_diversity"],
        "sentiment_score": sentiment["sentiment_score"]
    }
    save_observation(data.user_id, combined_features)
    history = get_user_history(data.user_id)
    observation_count = get_observation_count(data.user_id)
    risk_result = calculate_risk(combined_features, history)
    return {
        "user_id": data.user_id,
        "observation_count": observation_count,
        "features": combined_features,
        "sentiment_label": sentiment["sentiment_label"],
        "risk_score": risk_result["risk_score"],
        "alert_tier": risk_result["alert_tier"],
        "confidence": risk_result["confidence"],
        "z_scores": risk_result.get("z_scores", {}),
        "reason": risk_result.get("reason", "")
    }

@app.post("/analyse_voice")
def analyse_voice(data: VoiceInput):
    # Step 1 - download audio
    try:
        audio_response = requests.get(data.audio_url, timeout=60)
        audio_response.raise_for_status()
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to download audio: {e}"
        )

    # Step 2 - save OGG to temp file, convert to WAV
    wav_path = None
    wav_bytes = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".ogg", delete=False) as ogg_file:
            ogg_file.write(audio_response.content)
            ogg_path = ogg_file.name

        wav_path = ogg_path.replace(".ogg", ".wav")
        subprocess.run(
            ["ffmpeg", "-i", ogg_path, "-ar", "16000", "-ac", "1", wav_path, "-y"],
            check=True, capture_output=True
        )
        os.unlink(ogg_path)

        with open(wav_path, "rb") as f:
            wav_bytes = f.read()

    except Exception as e:
        print(f"Audio conversion failed: {e}")
        wav_path = None
        wav_bytes = None

    # Step 3 - transcribe with MERaLiON
    transcript, engine = transcribe_audio(audio_response.content)

    # Step 4 - extract text features
    features = extract_features(transcript)
    sentiment = analyse_sentiment(transcript)

    # Step 5 - extract acoustic features
    acoustic = {}
    if wav_path and os.path.exists(wav_path):
        try:
            acoustic = extract_acoustic_features(wav_path)
        except Exception as e:
            print(f"Acoustic feature extraction failed: {e}")
        finally:
            try:
                os.unlink(wav_path)
            except:
                pass

    # Step 6 - get WavLM embedding
    embedding = None
    if wav_bytes:
        try:
            embedding = get_wavlm_embedding(wav_bytes)
            if embedding:
                print(f"WavLM embedding generated: {len(embedding)} dimensions")
        except Exception as e:
            print(f"WavLM embedding failed: {e}")

    # Step 7 - combine all features
    combined_features = {
        "word_count": features["word_count"],
        "lexical_diversity": features["lexical_diversity"],
        "sentiment_score": sentiment["sentiment_score"],
    }

    if acoustic:
        combined_features["pause_ratio"] = acoustic.get("pause_ratio", 0)
        combined_features["speech_rate"] = acoustic.get("speech_rate", 0)
        combined_features["pitch_variance"] = acoustic.get("pitch_variance", 0)

    # Step 8 - save and calculate drift
    save_observation(data.user_id, combined_features)
    history = get_user_history(data.user_id)
    observation_count = get_observation_count(data.user_id)
    risk_result = calculate_risk(combined_features, history)

    return {
        "user_id": data.user_id,
        "observation_count": observation_count,
        "transcript": transcript,
        "transcription_engine": engine,
        "features": combined_features,
        "acoustic_features": acoustic,
        "embedding_dimensions": len(embedding) if embedding else 0,
        "sentiment_label": sentiment["sentiment_label"],
        "risk_score": risk_result["risk_score"],
        "alert_tier": risk_result["alert_tier"],
        "confidence": risk_result["confidence"],
        "z_scores": risk_result.get("z_scores", {}),
        "reason": risk_result.get("reason", "")
    }