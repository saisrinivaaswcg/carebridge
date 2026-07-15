import numpy as np

def calculate_baseline(history):
    if len(history) < 3:
        return None

    mean = round(float(np.mean(history)), 3)
    std = round(float(np.std(history)), 3)

    if std == 0:
        std = 0.001

    return {
        "mean": mean,
        "std": std,
        "sample_count": len(history)
    }

def calculate_zscore(current_value, baseline):
    if baseline is None:
        return None
    return round((current_value - baseline["mean"]) / baseline["std"], 3)