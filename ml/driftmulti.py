from baseline import calculate_baseline, calculate_zscore

def calculate_risk(current_features, history):
    if len(history) < 3:
        return {
            "risk_score": 0,
            "alert_tier": "none",
            "confidence": "low",
            "reason": "Not enough history to detect drift yet"
        }

    # extract history lists for each feature
    word_counts = [h["word_count"] for h in history]
    lexical_diversities = [h["lexical_diversity"] for h in history]
    sentiments = [h["sentiment_score"] for h in history]

    # calculate baselines for each feature
    word_baseline = calculate_baseline(word_counts)
    lexical_baseline = calculate_baseline(lexical_diversities)
    sentiment_baseline = calculate_baseline(sentiments)

    # calculate z-scores — how far is today from normal?
    word_z = calculate_zscore(current_features["word_count"], word_baseline)
    lexical_z = calculate_zscore(current_features["lexical_diversity"], lexical_baseline)
    sentiment_z = calculate_zscore(current_features["sentiment_score"], sentiment_baseline)

    # combine into one risk score
    z_scores = [z for z in [word_z, lexical_z, sentiment_z] if z is not None]
    if not z_scores:
        risk_score = 0
    else:
        risk_score = round(sum(abs(z) for z in z_scores), 2)

    # determine alert tier
    if risk_score > 6:
        alert_tier = "high"
    elif risk_score > 3:
        alert_tier = "medium"
    else:
        alert_tier = "low"

    # confidence based on how much history we have
    sample_count = len(history)
    if sample_count >= 30:
        confidence = "high"
    elif sample_count >= 10:
        confidence = "medium"
    else:
        confidence = "low"

    return {
        "risk_score": risk_score,
        "alert_tier": alert_tier,
        "confidence": confidence,
        "z_scores": {
            "word_count": word_z,
            "lexical_diversity": lexical_z,
            "sentiment": sentiment_z
        }
    }