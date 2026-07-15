from textblob import TextBlob

def analyse_sentiment(text):
    if not text or len(text.strip()) == 0:
        return {"sentiment_score": 0, "sentiment_label": "neutral"}

    blob = TextBlob(text)
    score = round(blob.sentiment.polarity, 3)

    if score > 0.1:
        label = "positive"
    elif score < -0.1:
        label = "negative"
    else:
        label = "neutral"

    return {
        "sentiment_score": score,
        "sentiment_label": label
    }