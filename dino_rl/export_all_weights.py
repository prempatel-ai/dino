"""
Combines trained Linear, MLP, and Neuroevolution weights into a single master JSON file
'dino_trained_weights.json' that can be loaded into the Dino Game Neural Chamber.
"""

import os
import json
from datetime import datetime


def export_bundle():
    bundle = {
        "version": "1.0",
        "description": "Dino Game Trained Policy & Network Weights",
        "generatedAt": datetime.now().isoformat(),
        "linear": {
            "a": 14.5,
            "c": -12.9,
            "duckElev": 75,
            "duckDist": 16.0,
        },
        "mlp": None,
        "neuroevo": None,
    }

    if os.path.exists("linear_weights.json"):
        with open("linear_weights.json", "r") as f:
            lin = json.load(f)
            bundle["linear"]["a"] = lin.get("a", 14.5)
            bundle["linear"]["c"] = lin.get("c", -12.9)
            bundle["linear"]["duckElev"] = lin.get("duckElev", 75)
            bundle["linear"]["duckDist"] = lin.get("duckDist", 16.0)

    if os.path.exists("mlp_weights.json"):
        with open("mlp_weights.json", "r") as f:
            bundle["mlp"] = json.load(f)

    if os.path.exists("neuroevo_weights.json"):
        with open("neuroevo_weights.json", "r") as f:
            bundle["neuroevo"] = json.load(f)

    output_path = "dino_trained_weights.json"
    with open(output_path, "w") as f:
        json.dump(bundle, f, indent=2)

    print(f"[*] Successfully bundled trained weights into '{output_path}'.")
    return bundle


if __name__ == "__main__":
    export_bundle()
