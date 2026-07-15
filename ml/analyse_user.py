import numpy as np

# Historical baseline
speech_rates = [100, 105, 98, 102, 107]
message_counts = [10, 12, 11, 9, 13]
sentiments = [0.2, 0.1, 0.3, 0.2, 0.1]

# Today's observation
current_speech = 80
current_messages = 5
current_sentiment = -0.4

# Calculate drift
speech_z = (
    current_speech - np.mean(speech_rates)
) / np.std(speech_rates)

message_z = (
    current_messages - np.mean(message_counts)
) / np.std(message_counts)

sentiment_z = (
    current_sentiment - np.mean(sentiments)
) / np.std(sentiments)

risk_score = (
    abs(speech_z)
    + abs(message_z)
    + abs(sentiment_z)
)

# Alert tier
if risk_score > 8:
    tier = "HIGH"
elif risk_score > 4:
    tier = "MODERATE"
else:
    tier = "LOW"

# Human-readable reasons
reasons = []

if abs(speech_z) > 2:
    reasons.append(
        "Speech rate significantly different from baseline"
    )

if abs(message_z) > 2:
    reasons.append(
        "Message frequency significantly different from baseline"
    )

if abs(sentiment_z) > 2:
    reasons.append(
        "Sentiment significantly different from baseline"
    )

result = {
    "risk_score": float(round(risk_score, 2)),
    "alert_tier": tier,
    "reasons": reasons
}

print(result)