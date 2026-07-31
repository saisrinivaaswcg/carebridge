import os
import base64
import requests
import numpy as np
from dotenv import load_dotenv

load_dotenv()

HF_API_KEY = os.getenv("HF_API_KEY")
WAVLM_URL = "https://api-inference.huggingface.co/models/microsoft/wavlm-base-plus"

def get_wavlm_embedding(wav_bytes):
    """
    Get WavLM embedding from HuggingFace Inference API.
    Returns a 768-dimensional numpy array or None if it fails.
    """
    try:
        headers = {"Authorization": f"Bearer {HF_API_KEY}"}
        response = requests.post(
            WAVLM_URL,
            headers=headers,
            data=wav_bytes,
            timeout=60
        )
        response.raise_for_status()
        embedding = response.json()
        # HF returns list of lists - mean pool to get single vector
        embedding_array = np.array(embedding)
        if embedding_array.ndim == 3:
            embedding_array = embedding_array.mean(axis=1)
        if embedding_array.ndim == 2:
            embedding_array = embedding_array.mean(axis=0)
        return embedding_array.tolist()
    except Exception as e:
        print(f"WavLM embedding failed: {e}")
        return None
