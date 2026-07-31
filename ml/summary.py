def generate_caregiver_summary(
    word_count,
    lexical_diversity,
    sentiment_label,
    risk_score,
    alert_tier,
    confidence
):
    """
    Generate a human-readable explanation of the ML results.
    This does NOT diagnose medical conditions.
    """

    summary = []

    # Overall risk
    if alert_tier.lower() == "high":
        summary.append(
            "Significant changes were detected compared with the user's usual communication pattern."
        )

    elif alert_tier.lower() == "medium":
        summary.append(
            "Some noticeable changes were detected compared with the user's usual communication pattern."
        )

    else:
        summary.append(
            "The user's communication appears generally consistent with their usual behaviour."
        )

    # Word count
    if word_count < 80:
        summary.append(
            "Today's speech was shorter than expected."
        )
    elif word_count > 250:
        summary.append(
            "Today's speech was longer than usual."
        )

    # Lexical diversity
    if lexical_diversity < 0.45:
        summary.append(
            "Vocabulary diversity was relatively low."
        )
    elif lexical_diversity > 0.70:
        summary.append(
            "Vocabulary diversity remained high."
        )

    # Sentiment
    if sentiment_label.lower() == "negative":
        summary.append(
            "The emotional tone appeared more negative."
        )
    elif sentiment_label.lower() == "positive":
        summary.append(
            "The emotional tone appeared positive."
        )

    # Recommendation
    if alert_tier.lower() == "high":
        recommendation = (
            "A prompt caregiver check-in is recommended."
        )

    elif alert_tier.lower() == "medium":
        recommendation = (
            "Consider checking in with the user within the next day or two."
        )

    else:
        recommendation = (
            "Continue routine monitoring."
        )

    return {
        "summary": " ".join(summary),
        "recommendation": recommendation
    }