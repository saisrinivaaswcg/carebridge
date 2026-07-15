import numpy as np

speech_rates = [100,105,98,102,107]
message_counts = [10,12,11,9,13]
sentiments = [0.2,0.1,0.3,0.2,0.1]

mean = np.mean(speech_rates)
std = np.std(speech_rates)

current_value = 80

z_score = (current_value - mean) / std

print("Current:", current_value)
print("Mean:", mean)
print("Z-score:", z_score)

if abs(z_score) > 2:
    print("⚠️ Anomaly Detected")
else:
    print("✅ Normal")