def extract_features(text):
    words = text.split()
    word_count = len(words)

    if word_count == 0:
        return {"word_count": 0, "lexical_diversity": 0}

    unique_words = len(set(words))
    lexical_diversity = round(unique_words / word_count, 3)

    return {
        "word_count": word_count,
        "lexical_diversity": lexical_diversity
    }