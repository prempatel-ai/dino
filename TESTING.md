# TESTING.md

## Layers
| Layer | Tool | Scope |
|---|---|---|
| Unit | Vitest | `src/core/*` |
| Golden | Vitest snapshots | full `Game` with seed |
| E2E | Playwright | boot, play, crash, restart, mobile |
| Manual | checklist below | feel vs original |

## Unit tests (core)
- trex: jump apex/air frames at speed 6 and 13, short hop, speed drop, duck sizes.
- obstacle: gap formula, size rule, ptero min speed, duplication cap.
- horizon: spawn trigger, 3000 ms clear time, removal off-screen.
- collision: each sprite pair, duck vs ptero heights, miss case.
- score: `round(distance*0.025)`, cap 99999, milestone at 100.
- daynight: toggle at 700 multiples.
- game: phases, restart delay 750 ms, determinism.

## Golden test
Fixed seed `12345`, scripted inputs. Snapshot `state` at steps 100, 1000, 5000. Failing snapshot = gameplay changed. Update only with a logged reason in PROGRESS.md.

## Bot test
Simple bot: jump when next obstacle `xPos - trex.x < speed * 18`, duck for low ptero. Must survive > 3000 steps on 5 different seeds. Proves every generated pattern is clearable.

## Effects-off equivalence
Run game with renderer effects on vs off (core only). Core state identical.

## E2E (Playwright)
1. Load page, canvas visible, 4:1 ratio.
2. Press Space → game starts (score increases).
3. Wait for crash → game over visible.
4. Wait 750 ms+, press Space → restarts, score 0.
5. Reload → HI score kept.
6. Mobile (iPhone 12, Pixel 5): tap start, tap jump, tap restart.
7. Mute toggle persists.

## Fidelity checklist (tick all)
- [x] Canvas logical size 600x150, aspect 4:1
- [x] Dino 44x47 standing, 59x25 ducking, x=50
- [x] Start speed 6, max 13, accel 0.001/frame
- [x] Jump velocity = −10 − speed/10, gravity 0.6
- [x] Release jump early → short hop
- [x] Down in air → fast drop (×3)
- [x] No obstacles first 3000 ms
- [x] Small/large cactus groups of 1–3 (groups only when speed allows)
- [x] Ptero only at speed ≥ 8.5, heights 100/75/50
- [x] Gap formula matches spec
- [x] Score = round(distance × 0.025), 5 digits, cap 99999
- [x] Score flashes 3× every 100
- [x] Night toggles every 700
- [x] Game over text + restart icon; restart blocked < 750 ms
- [x] HI score persisted
- [x] Tab hidden pauses
- [x] Constants verified against Chromium offline.js (or logged as unverified)
- [x] 60 FPS on desktop Chrome
- [x] Bundle < 300 KB gzip
- [x] Works on mobile touch
- [x] Retro mode available and persisted
- [x] 7 biomes cycle every 700 score, skins fit hitboxes (H overlay)
- [x] Reduced effects mode works and persists
- [x] Physics identical with effects/biomes on vs off

## Performance
- Frame budget 16 ms. No allocations in hot loop (pool particles, reuse arrays).
- Rasterize SVG only on resize, not per frame.
