# GAME_SPEC.md — Exact Mechanics

Source of truth = Chromium `components/neterror/resources/offline.js` (`Runner`, `Trex`, `Obstacle`, `Horizon`, `DistanceMeter`). Values below are from that source. If the agent has network access, **verify every constant against the source first** and fix this file if different. Do not invent values.

Coordinates: origin top-left, Y grows downward. Units: logical px. Time: frames at 60 FPS (`framesElapsed = 1` per fixed step).

## 1. Runner config
| Const | Value |
|---|---|
| WIDTH x HEIGHT | 600 x 150 |
| FPS | 60 |
| SPEED (start) | 6 |
| MAX_SPEED | 13 |
| ACCELERATION | 0.001 per frame |
| BOTTOM_PAD | 10 |
| CLEAR_TIME | 3000 ms (no obstacles before this) |
| GAP_COEFFICIENT | 0.6 |
| MAX_GAP_COEFFICIENT | 1.5 |
| MAX_OBSTACLE_LENGTH | 3 |
| MAX_OBSTACLE_DUPLICATION | 2 |
| GAMEOVER_CLEAR_TIME | 750 ms |
| GRAVITY (runner/trex) | 0.6 |
| INVERT_DISTANCE | 700 (score) |
| MAX_CLOUDS | 6 |
| CLOUD_FREQUENCY | 0.5 |
| BG_CLOUD_SPEED | 0.2 |

## 2. Trex
| Const | Value |
|---|---|
| WIDTH / HEIGHT | 44 / 47 |
| WIDTH_DUCK / HEIGHT_DUCK | 59 / 25 |
| START_X_POS | 50 |
| groundYPos | 150 − 47 − 10 = 93 |
| INITIAL_JUMP_VELOCITY | −10 |
| DROP_VELOCITY | −5 |
| MIN_JUMP_HEIGHT | 30 |
| MAX_JUMP_HEIGHT | 30 |
| SPEED_DROP_COEFFICIENT | 3 |
| INTRO_DURATION | 1500 ms |

### Jump
```
startJump(speed):
  jumpVelocity = INITIAL_JUMP_VELOCITY - speed/10
  jumping = true; reachedMinHeight = false; speedDrop = false

updateJump(frames):
  if speedDrop: yPos += round(jumpVelocity * SPEED_DROP_COEFFICIENT * frames)
  else:         yPos += round(jumpVelocity * frames)
  jumpVelocity += GRAVITY * frames
  minJumpHeight = groundYPos - MIN_JUMP_HEIGHT
  if yPos < minJumpHeight || speedDrop: reachedMinHeight = true
  if yPos < MAX_JUMP_HEIGHT || speedDrop: endJump()
  if yPos > groundYPos: yPos = groundYPos; jumping = false; (reset)

endJump():  // also called on key release
  if reachedMinHeight && jumpVelocity < DROP_VELOCITY: jumpVelocity = DROP_VELOCITY
```
- Jump only when not already jumping and not ducking-in-air.
- Down pressed while jumping → `speedDrop = true`. Release → `speedDrop = false`.
- Down pressed on ground → ducking = true (use duck size/boxes).

### Run animation
- 2 frames, ~12 fps (`msPerFrame = 1000/12`). Idle blink: random interval 3000 ms, max 3 blinks.

## 3. Speed and score
```
each running frame:
  if currentSpeed < MAX_SPEED: currentSpeed += ACCELERATION
  distanceRan += currentSpeed * frames          // msPerFrame-normalised
score = round(distanceRan * 0.025)              // DistanceMeter COEFFICIENT
max displayed = 99999 (5 digits)
```
- Achievement: every 100 score → flash score 3 times (250 ms each) + sound. Score value freezes during flash.
- On crash: `highScore = max(highScore, score)`; display `HI 00000 00000`.
- Reset on restart: speed = 6, distance = 0.

## 4. Day / night
- Toggle when `score % 700 == 0` (score increased past a multiple of 700).
- Night: inverted palette, moon (7 phases, advances each night), stars drift slowly.
- Fade duration: per source `INVERT_FADE_DURATION` (verify). Visual only, no gameplay effect.

## 5. Obstacles
| Type | W | H | yPos | minGap | minSpeed | multipleSpeed | frames |
|---|---|---|---|---|---|---|---|
| CACTUS_SMALL | 17 | 35 | 105 | 120 | 0 | 4 | 1 |
| CACTUS_LARGE | 25 | 50 | 90 | 120 | 0 | 7 | 1 |
| PTERODACTYL | 46 | 40 | [100, 75, 50] random | 150 | 8.5 | 999 | 2 (6 fps) |

### Creation
```
addNewObstacle(speed):
  pick random type; reject if type.minSpeed > speed
  reject if same type already last MAX_OBSTACLE_DUPLICATION times in a row
  size = rand(1..MAX_OBSTACLE_LENGTH); if size > 1 && type.multipleSpeed > speed: size = 1
  width = type.width * size
  xPos = 600 - width
  gap = getGap(GAP_COEFFICIENT, speed)
  pterodactyl: yPos = random from list; speedOffset = ±0.8 (random sign)

getGap(coef, speed):
  minGap = round(width * speed + type.minGap * coef)
  maxGap = round(minGap * MAX_GAP_COEFFICIENT)
  return randInt(minGap, maxGap)
```
### Spawn trigger
```
if obstacles empty: addNewObstacle()
else:
  last = obstacles[last]
  if !last.followingObstacleCreated && last.isVisible() &&
     last.xPos + last.width + last.gap < 600:
       addNewObstacle(); last.followingObstacleCreated = true
```
- No obstacle logic until elapsed running time > CLEAR_TIME.
### Movement
```
obstacleSpeed = currentSpeed (+ speedOffset for pterodactyl)
xPos -= floor(obstacleSpeed * frames)
remove when xPos + width < 0
```

## 6. Ground and clouds
- Ground: horizon line at y = 127, two scrolling 600-wide segments, bumps random, scroll `xPos -= floor(currentSpeed * frames)`.
- Cloud: 46 x 14, y random 30..71, gap random 100..400, speed 0.2, spawn with prob CLOUD_FREQUENCY, max 6.

## 7. Collision
Two-phase AABB, same as original:
1. Outer box test: trex box (x+1, y+1, w−2, h−2) vs obstacle box (x+1, y+1, w−2, h−2).
2. If overlap: test each trex sub-box vs each obstacle sub-box (offset by entity position). Any overlap = crash.
For multi-unit cacti: sub-boxes of first unit stretched to full width (original `cloneCollisionBoxes` + width adjust on last box).

Sub-boxes (relative x, y, w, h):
- Trex running: (22,0,17,16) (1,18,30,9) (10,35,14,8) (1,24,29,5) (5,30,21,4) (9,34,15,4)
- Trex ducking: (1,18,55,25)
- Cactus small: (0,7,5,27) (4,0,6,34) (10,4,7,14)
- Cactus large: (0,12,7,38) (8,0,7,49) (13,10,10,38)
- Pterodactyl: (15,15,16,5) (18,21,24,6) (2,14,4,3) (6,10,4,7) (10,8,6,9)

Verify against source. Hitboxes are **invisible and fixed**; art never changes them.

## 8. Game flow
- READY: waits for first jump input. First jump starts intro: dino slides to x=50 over 1500 ms, world width reveals, then RUNNING.
- RUNNING: update order per step = input → trex → horizon (ground, clouds, obstacles) → collision → speed/score → day/night.
- CRASHED: stop updates (except dead sprite). Show game over. Accept restart only after 750 ms.
- Tab hidden → pause. Tab visible → resume without time jump (clamp delta).

## 9. RNG
Seeded PRNG (mulberry32). Seed = `Date.now()` in prod, fixed in tests. All randomness goes through it.
