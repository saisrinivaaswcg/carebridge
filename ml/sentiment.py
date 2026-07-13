from textblob import TextBlob

text = "I feel very sad today"

blob = TextBlob(text)

print("Sentiment Score:", blob.sentiment.polarity)

if blob.sentiment.polarity > 0:
    print("Positive")
elif blob.sentiment.polarity < 0:
    print("Negative")
else:
    print("Neutral")