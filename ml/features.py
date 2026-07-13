def extract_features(text):
    words = text.split()

    word_count = len(words)

    unique_words = len(set(words))

    lexical_diversity = unique_words / word_count

    return {
        "word_count": word_count,
        "lexical_diversity": lexical_diversity
    }


sample = "hello today i went to the market"

print(extract_features(sample))