import numpy as np

# Historical behaviour
speech_rates = [100,105,98,102,107]
message_counts = [10,12,11,9,13]
sentiments = [0.2,0.1,0.3,0.2,0.1]

# Today's values
current_speech = 80
current_messages = 5
current_sentiment = -0.4

speech_z = (current_speech - np.mean(speech_rates)) / np.std(speech_rates)
message_z = (current_messages - np.mean(message_counts)) / np.std(message_counts)
sentiment_z = (current_sentiment - np.mean(sentiments)) / np.std(sentiments)

print("Speech Z:", speech_z)
print("Message Z:", message_z)
print("Sentiment Z:", sentiment_z)

risk_score = (
    abs(speech_z)
    + abs(message_z)
    + abs(sentiment_z)
)

print("Risk Score:", round(risk_score, 2))

if risk_score > 8:
    print("🔴 HIGH ALERT")
elif risk_score > 4:
    print("🟡 MODERATE ALERT")
else:
    print("🟢 NORMAL")