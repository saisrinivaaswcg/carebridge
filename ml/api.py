from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

import requests

from transcribe import transcribe_audio
from summary import generate_caregiver_summary
from features import extract_features
from sentiment import analyse_sentiment
from driftmulti import calculate_risk
from storage import save_observation, get_user_history, get_observation_count

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

    # Feature extraction
    features = extract_features(data.transcript)
    sentiment = analyse_sentiment(data.transcript)

    combined_features = {
        "word_count": features["word_count"],
        "lexical_diversity": features["lexical_diversity"],
        "sentiment_score": sentiment["sentiment_score"]
    }

    # Save observation
    save_observation(data.user_id, combined_features)

    history = get_user_history(data.user_id)
    observation_count = get_observation_count(data.user_id)

    # Drift detection
    risk_result = calculate_risk(combined_features, history)

    # NEW: Generate caregiver summary
    caregiver_summary = generate_caregiver_summary(
        word_count=combined_features["word_count"],
        lexical_diversity=combined_features["lexical_diversity"],
        sentiment_label=sentiment["sentiment_label"],
        risk_score=risk_result["risk_score"],
        alert_tier=risk_result["alert_tier"],
        confidence=risk_result["confidence"]
    )

    return {
        "user_id": data.user_id,
        "observation_count": observation_count,
        "features": combined_features,
        "sentiment_label": sentiment["sentiment_label"],
        "risk_score": risk_result["risk_score"],
        "alert_tier": risk_result["alert_tier"],
        "confidence": risk_result["confidence"],
        "z_scores": risk_result.get("z_scores", {}),
        "reason": risk_result.get("reason", ""),

        # NEW
        "caregiver_summary": caregiver_summary["summary"],
        "caregiver_recommendation": caregiver_summary["recommendation"]
    }


@app.post("/analyse_voice")
def analyse_voice(data: VoiceInput):

    # Download audio
    try:
        audio_response = requests.get(data.audio_url, timeout=60)
        audio_response.raise_for_status()

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Unable to download audio: {e}"
        )

    # Speech-to-text
    transcript, engine = transcribe_audio(audio_response.content)

    # Feature extraction
    features = extract_features(transcript)
    sentiment = analyse_sentiment(transcript)

    combined_features = {
        "word_count": features["word_count"],
        "lexical_diversity": features["lexical_diversity"],
        "sentiment_score": sentiment["sentiment_score"]
    }

    # Save observation
    save_observation(data.user_id, combined_features)

    history = get_user_history(data.user_id)
    observation_count = get_observation_count(data.user_id)

    # Drift detection
    risk_result = calculate_risk(combined_features, history)

    # NEW: Generate caregiver summary
    caregiver_summary = generate_caregiver_summary(
        word_count=combined_features["word_count"],
        lexical_diversity=combined_features["lexical_diversity"],
        sentiment_label=sentiment["sentiment_label"],
        risk_score=risk_result["risk_score"],
        alert_tier=risk_result["alert_tier"],
        confidence=risk_result["confidence"]
    )

    return {
        "user_id": data.user_id,
        "observation_count": observation_count,
        "transcript": transcript,
        "transcription_engine": engine,
        "features": combined_features,
        "sentiment_label": sentiment["sentiment_label"],
        "risk_score": risk_result["risk_score"],
        "alert_tier": risk_result["alert_tier"],
        "confidence": risk_result["confidence"],
        "z_scores": risk_result.get("z_scores", {}),
        "reason": risk_result.get("reason", ""),

        # NEW
        "caregiver_summary": caregiver_summary["summary"],
        "caregiver_recommendation": caregiver_summary["recommendation"]
    }