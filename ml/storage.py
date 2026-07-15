import json
import os
from datetime import datetime

STORAGE_FILE = "observations.json"

def load_all_observations():
    if not os.path.exists(STORAGE_FILE):
        return {}
    with open(STORAGE_FILE, "r") as f:
        return json.load(f)

def save_observation(user_id, features):
    all_data = load_all_observations()

    if user_id not in all_data:
        all_data[user_id] = []

    observation = {
        "timestamp": datetime.utcnow().isoformat(),
        "word_count": features["word_count"],
        "lexical_diversity": features["lexical_diversity"],
        "sentiment_score": features["sentiment_score"]
    }

    all_data[user_id].append(observation)

    with open(STORAGE_FILE, "w") as f:
        json.dump(all_data, f, indent=2)

    return observation

def get_user_history(user_id):
    all_data = load_all_observations()
    return all_data.get(user_id, [])

def get_observation_count(user_id):
    return len(get_user_history(user_id))