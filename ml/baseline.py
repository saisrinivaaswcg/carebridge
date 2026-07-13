import numpy as np

history = [100, 105, 98, 102, 107]

mean = np.mean(history)
std = np.std(history)

print("Mean:", mean)
print("Std:", std)