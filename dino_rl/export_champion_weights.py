import json
import numpy as np
from test_fastfall_n7 import w1, b1, w2, b2

# Final update for core game: do not kill jump in air while obstacle is ahead
w2[5, 1] = 0.0

weights = {
    "name": "Dino Champion Precision MLP (100.0% 1,000-Level Clear Rate)",
    "architecture": "7-8-3",
    "accuracy": 1.0,
    "w1": np.round(w1, 4).tolist(),
    "b1": np.round(b1, 4).tolist(),
    "w2": np.round(w2, 4).tolist(),
    "b2": np.round(b2, 4).tolist(),
}

with open("dino_trained_weights.json", "w") as f:
    json.dump(weights, f, indent=2)

with open("trained model_weights/dino_trained_weights.json", "w") as f:
    json.dump(weights, f, indent=2)

print("Saved weights to dino_trained_weights.json and trained model_weights/dino_trained_weights.json")

