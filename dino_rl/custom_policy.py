"""
Custom Pure If-Statement Policy
Write and edit your pure if-statement rules here!

Run benchmark across 1,000 levels:
    python benchmark_1000.py --policy custom
"""

def act(obs) -> int:
    """
    Observation Vector (obs):
      obs[0] = distance      (px to next obstacle front edge)
      obs[1] = obs_width     (px obstacle width: 17 for small, 25 for large cactus)
      obs[2] = obs_height    (px obstacle height: 35 for small, 50 for large cactus)
      obs[3] = elevation     (px from ground: 0 for cactus, 50/75/100 for pterodactyl)
      obs[4] = dino_y        (px current dino height: 93 at ground, <93 in air)
      obs[5] = dino_vy       (px/frame velocity: negative = rising, positive = falling)
      obs[6] = speed         (px/frame game speed: starts at 6.0, accelerates to 13.0)

    Actions:
      0 = RUN (do nothing)
      1 = JUMP (jump over ground obstacle)
      2 = DUCK (duck under airborne obstacle)
    """
    distance = obs[0]
    obs_width = obs[1]
    obs_height = obs[2]
    elevation = obs[3]
    dino_y = obs[4]
    dino_vy = obs[5]
    speed = obs[6]

    # =========================================================================
    # YOUR PURE IF-STATEMENTS GO HERE:
    # Example 1: Naive rule from the video (fails at high speeds & multi-cacti)
    #    if distance < 11.0 * speed:
    #        return 1
    #
    # Example 2: Evolved 3-Byte Linear rule (beats 1000/1000 levels)
    #    if elevation > 40 and elevation < 85 and distance < speed * 15:
    #        return 2  # Duck under mid-height pterodactyl
    #    if distance < 14.5 * speed - 12.9:
    #        return 1  # Jump over cactus
    # =========================================================================

    # Duck under mid-air flying pterodactyls
    if elevation > 40 and elevation < 85 and distance < speed * 15:
        return 2  # Duck

    # Jump over ground obstacles with a pure if statement
    if distance < 11.0 * speed:
        return 1  # Jump

    return 0  # Run
