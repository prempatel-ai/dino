"""
Precision weights with guaranteed logical gating for the 7->8->3 Dino MLP.
"""

import json
import numpy as np
from dino_env import DinoEnv

def build_precision_weights():
    w1 = np.zeros((7, 8))
    b1 = np.zeros(8)
    w2 = np.zeros((8, 3))
    b2 = np.zeros(3)

    # Base bias: RUN is +5.0 default! JUMP and DUCK are -5.0 default!
    b2[0] = 5.0
    b2[1] = -5.0
    b2[2] = -5.0

    # -------------------------------------------------------------
    # NEURON 0: Jump Distance Detector
    # Fires when ground obstacle is within jump window:
    # dist < 15.3 * speed - 10.0 + (w - 17) * 0.25
    # normDist < 0.510 * normSpeed + 0.042 * normWidth - 0.024
    scale_j = 25.0
    w1[0, 0] = -1.0 * scale_j        # -25.0 (close distance)
    w1[6, 0] = 0.510 * scale_j       # +12.75 (faster = earlier)
    w1[1, 0] = 0.042 * scale_j       # +1.05 (wider = earlier)
    w1[4, 0] = -25.0                 # in air suppresses
    w1[5, 0] = -25.0                 # jumping suppresses
    b1[0] = -0.024 * scale_j         # -0.60

    # NEURON 1: Cactus / Ground Obstacle Detector (normElev >= 0.58)
    # y=90 or 105 in env -> normElev in [0.60, 0.70]
    w1[3, 1] = 20.0
    b1[1] = -11.6   # Fires when normElev >= 0.58

    # When Neuron 0 (Jump Distance) is active:
    w2[0, 1] = +12.0  # Stimulate JUMP
    w2[0, 0] = -8.0   # Suppress RUN
    w2[0, 2] = -15.0  # Suppress DUCK

    # -------------------------------------------------------------
    # NEURON 2: Duck Distance Detector (dist < 15.0 * speed)
    scale_d = 25.0
    w1[0, 2] = -1.0 * scale_d
    w1[6, 2] = 0.450 * scale_d
    b1[2] = 0.0

    # NEURON 3: Cactus Duck Inhibitor (y >= 85, normElev >= 0.56)
    # When obstacle is ground cactus, KILL DUCK completely!
    w1[3, 3] = 30.0
    b1[3] = -16.8  # Fires when normElev > 0.56
    w2[3, 2] = -30.0  # HARD INHIBITOR: DUCK CANNOT FIRE FOR CACTUS!

    # NEURON 4: High Bird Inhibitor (y <= 55, normElev <= 0.38)
    # High bird needs RUN (no jump, no duck)
    w1[3, 4] = -30.0
    b1[4] = 11.4  # Fires when normElev < 0.38
    w2[4, 1] = -25.0  # Kill JUMP for high bird!
    w2[4, 2] = -25.0  # Kill DUCK for high bird!

    # NEURON 5: Mid-Bird Duck Activator (y around 75 -> normElev ~ 0.50)
    # When obstacle is mid-bird AND distance is close, DUCK fires!
    w2[2, 2] = +10.0  # Duck distance stimulates duck
    w2[2, 0] = -6.0   # Suppress run while ducking
    w2[2, 1] = -15.0  # Suppress jump while ducking

    # NEURON 6: Safe Distance Inhibitor (when dist > 150px / normDist > 0.25)
    w1[0, 6] = 20.0
    b1[6] = -5.0
    w2[6, 0] = +5.0   # Boost RUN
    w2[6, 1] = -10.0  # Zero jumping on empty track
    w2[6, 2] = -10.0  # Zero ducking on empty track

    # NEURON 7: Airborne status inhibitor
    w1[4, 7] = 25.0
    b1[7] = -2.5
    w2[7, 1] = -25.0  # Never jump in air

    return w1, b1, w2, b2

def normalize_obs(obs):
    dist, width, height, elev, dino_y, dino_vy, speed = obs
    return np.array([
        min(1.0, max(0.0, dist / 600.0)),
        width / 100.0,
        height / 100.0,
        elev / 150.0,
        dino_y / 100.0,
        1.0 if dino_y > 1.0 or dino_vy != 0 else 0.0,
        speed / 20.0,
    ], dtype=np.float64)

def test_model(w1, b1, w2, b2, num_levels=100, max_steps=1500, start_speed=12.0):
    passed = 0
    scores = []

    for seed in range(1, num_levels + 1):
        env = DinoEnv(start_speed=start_speed, max_steps=max_steps)
        obs, _ = env.reset(seed=seed)
        crashed = False

        for _ in range(max_steps):
            norm_in = normalize_obs(obs)
            h = np.maximum(0, np.dot(norm_in, w1) + b1)
            logits = np.dot(h, w2) + b2
            act = int(np.argmax(logits))
            obs, _, term, _, _ = env.step(act)
            if term:
                crashed = True
                break

        scores.append(env.steps)
        if not crashed:
            passed += 1

    rate = (passed / num_levels) * 100.0
    avg_score = sum(scores) / len(scores)
    return passed, rate, avg_score

if __name__ == "__main__":
    w1, b1, w2, b2 = build_precision_weights()

    print("--- 1. Testing Empty Track (dist = 500px) ---")
    for spd in [6.0, 8.0, 10.0, 12.0]:
        x = np.array([500/600, 0, 0, 0, 0, 0, spd/20.0])
        h = np.maximum(0, np.dot(x, w1) + b1)
        logits = np.dot(h, w2) + b2
        act = np.argmax(logits)
        print(f"Speed {spd:4.1f}: Logits={logits.round(2)}, Action={act} ({['RUN', 'JUMP', 'DUCK'][act]})")

    print("\n--- 2. Testing Cactus Approaching (dist = 120px, w = 25px, y = 90) ---")
    x = np.array([120/600, 25/100, 45/100, 90/150, 0, 0, 10.0/20.0])
    h = np.maximum(0, np.dot(x, w1) + b1)
    logits = np.dot(h, w2) + b2
    act = np.argmax(logits)
    print(f"Logits={logits.round(2)}, Action={act} ({['RUN', 'JUMP', 'DUCK'][act]})")

    print("\n--- 3. Testing Mid Bird Approaching (dist = 120px, w = 46px, y = 75) ---")
    x = np.array([120/600, 46/100, 40/100, 75/150, 0, 0, 10.0/20.0])
    h = np.maximum(0, np.dot(x, w1) + b1)
    logits = np.dot(h, w2) + b2
    act = np.argmax(logits)
    print(f"Logits={logits.round(2)}, Action={act} ({['RUN', 'JUMP', 'DUCK'][act]})")

    print("\n--- 4. Testing High Bird Approaching (dist = 120px, w = 46px, y = 50) ---")
    x = np.array([120/600, 46/100, 40/100, 50/150, 0, 0, 10.0/20.0])
    h = np.maximum(0, np.dot(x, w1) + b1)
    logits = np.dot(h, w2) + b2
    act = np.argmax(logits)
    print(f"Logits={logits.round(2)}, Action={act} ({['RUN', 'JUMP', 'DUCK'][act]})")

    print("\n--- 5. Benchmarking on 100 Levels at High Speed (12.0 px/f) ---")
    passed, rate, avg_score = test_model(w1, b1, w2, b2, num_levels=100, max_steps=1500)
    print(f"Result: {passed}/100 passed ({rate:.1f}%), Avg Score: {avg_score:.1f}")
