# TASKS.md

Status values: TODO | IN_PROGRESS | DONE.
BACKEND = headless game core (`src/core`). The product has no server.
Do tasks in order. Each task lists dependencies.

---

## T01 — Project scaffold
Status: DONE | Depends: none

**CONTEXT**
Empty repo. Stack: Vite + TypeScript + Vitest + Playwright. See ARCHITECTURE.md.

**GOAL**
Runnable project with all npm scripts and folder tree.

**BACKEND REQUIREMENTS**
1. Create `src/core/` with empty module files per ARCHITECTURE.md.
2. `constants.ts` filled with every number from GAME_SPEC.md sections 1, 2, 5, 6.
3. `rng.ts`: mulberry32, `next()`, `int(min,max)`.

**FRONTEND REQUIREMENTS**
1. `index.html` with one `<canvas id="game">` and `<div id="overlay">`.
2. `src/client/main.ts` logs "boot".
3. Scripts: dev, build, typecheck, test, test:e2e, lint.

**FILES**
`package.json`, `tsconfig.json` (strict), `vite.config.ts`, `index.html`, `src/**` stubs, `.gitignore`, `README.md`

**ACCEPTANCE CRITERIA**
- `npm run dev` serves page.
- `npm run typecheck`, `npm test` (even 1 dummy test), `npm run build` pass.

**CONSTRAINTS**
No runtime deps. TS strict. No `any`.

---

## T02 — Core: Trex physics
Status: DONE | Depends: T01

**CONTEXT**
GAME_SPEC.md section 2.

**GOAL**
Deterministic dino jump, short hop, duck, speed drop.

**BACKEND REQUIREMENTS**
1. `trex.ts`: state {x,y,w,h,ducking,jumping,jumpVelocity,reachedMinHeight,speedDrop,frame}.
2. `startJump(speed)`, `updateJump(frames)`, `endJump()`, `setDuck(bool)`, `setSpeedDrop(bool)` exactly per spec.
3. Jump allowed only when grounded.
4. Landing resets y to groundYPos (93).
5. Use `Math.round` as in spec.

**FRONTEND REQUIREMENTS**
None.

**FILES**
`src/core/trex.ts`, `tests/core/trex.test.ts`

**ACCEPTANCE CRITERIA**
- Hold jump at speed 6: records apex y and air frames; test snapshots values and they stay stable.
- Early release gives lower apex than full hold.
- Speed drop lands faster than normal jump.
- Duck on ground changes size to 59 x 25; ignored in air.

**CONSTRAINTS**
No DOM. No `Math.random`. Frames not ms.

---

## T03 — Core: Obstacles and horizon
Status: DONE | Depends: T01

**CONTEXT**
GAME_SPEC.md sections 5, 6, 9.

**GOAL**
Spawn, gap, movement, removal identical to original.

**BACKEND REQUIREMENTS**
1. `obstacle.ts`: types table, `create(type, size, speed, rng)`, `getGap`, `update(speed, frames)`, `isVisible`.
2. Size rule: size>1 only if `multipleSpeed <= speed`.
3. Ptero: random yPos from [100,75,50], speedOffset ±0.8, only if speed >= 8.5.
4. `horizon.ts`: duplication limit 2, spawn trigger rule, removal when off-screen.
5. Ground scroll offset and clouds (gap 100..400, y 30..71, speed 0.2, max 6).
6. No obstacles until 3000 ms of running.

**FRONTEND REQUIREMENTS**
None.

**FILES**
`src/core/obstacle.ts`, `src/core/horizon.ts`, `tests/core/obstacle.test.ts`, `tests/core/horizon.test.ts`

**ACCEPTANCE CRITERIA**
- Seeded run: first obstacle spawns only after 3000 ms.
- Gap formula test matches spec for 3 speeds.
- Never 3 same-type obstacles in a row.
- Ptero never appears below speed 8.5.

**CONSTRAINTS**
Randomness only via injected RNG.

---

## T04 — Core: Collision
Status: DONE | Depends: T02, T03

**CONTEXT**
GAME_SPEC.md section 7.

**GOAL**
Two-phase AABB with per-sprite sub-boxes.

**BACKEND REQUIREMENTS**
1. `collision.ts`: `check(trex, obstacle): boolean`.
2. Outer box (inset by 1) then sub-box pairs.
3. Multi-unit cactus box width scaling.
4. Duck boxes used when ducking.

**FRONTEND REQUIREMENTS**
None.

**FILES**
`src/core/collision.ts`, `tests/core/collision.test.ts`

**ACCEPTANCE CRITERIA**
- Standing dino hits small cactus at same x.
- Jumping dino at apex clears small and large cactus at speed 6.
- Ducking dino passes under ptero at y=50, standing dino hits it.
- Outer-overlap-but-sub-box-miss case returns false.

**CONSTRAINTS**
Pure functions.

---

## T05 — Core: Score, speed, day/night, game state machine
Status: TODO | Depends: T02, T03, T04

**CONTEXT**
GAME_SPEC.md sections 3, 4, 8.

**GOAL**
Complete headless game: `Game.step(input)`.

**BACKEND REQUIREMENTS**
1. `score.ts`: distance, `score = round(distance*0.025)`, cap 99999, achievement every 100, high score.
2. Speed accel 0.001/frame to 13.
3. `daynight.ts`: toggle at multiples of 700, moon phase advance.
4. `game.ts`: phases BOOT/READY/INTRO/RUNNING/CRASHED. Intro 1500 ms. Restart only after 750 ms in CRASHED.
5. Update order per GAME_SPEC.md section 8.
6. Event list per step: jump, land, crash, milestone.
7. `reset(seed)`.

**FRONTEND REQUIREMENTS**
None.

**FILES**
`src/core/score.ts`, `src/core/daynight.ts`, `src/core/game.ts`, `src/core/index.ts`, `tests/core/game.test.ts`

**ACCEPTANCE CRITERIA**
- Bot that never jumps crashes at the first obstacle.
- Same seed + same inputs → identical state after 5000 steps.
- Speed reaches 13 and stays.
- Milestone event fires at 100, 200.
- Restart ignored before 750 ms, accepted after.

**CONSTRAINTS**
No DOM. Deterministic.

---

## T06 — Client: loop, input, canvas scaling
Status: TODO | Depends: T05

**CONTEXT**
ARCHITECTURE.md Loop and Rendering.

**GOAL**
Playable game with placeholder rectangles.

**BACKEND REQUIREMENTS**
None.

**FRONTEND REQUIREMENTS**
1. `loop.ts`: fixed 60 Hz accumulator, dt clamp 100 ms, pause on `visibilitychange`.
2. `input.ts`: Space/Up jump (press + hold), Down duck, Enter/Space restart, M mute; touch tap jump, swipe/hold-lower-half duck.
3. `camera.ts`: 600x150 logical, 4:1 aspect, DPR-aware, resize handler.
4. Placeholder renderer: colored rects for dino, obstacles, ground.

**FILES**
`src/client/loop.ts`, `input.ts`, `main.ts`, `renderer/camera.ts`, `renderer/renderer.ts`

**ACCEPTANCE CRITERIA**
- Game is playable start to game over with rectangles.
- Resize keeps 4:1 and sharp edges.
- Tab hide pauses, show resumes with no jump in speed or position.

**CONSTRAINTS**
Rendering must not mutate core state.

---

## T07 — Sprites (SVG)
Status: TODO | Depends: T06

**CONTEXT**
ASSETS.md sprite rules and animation set.

**GOAL**
All SVG sprites authored and loaded as an atlas.

**BACKEND REQUIREMENTS**
None.

**FRONTEND REQUIREMENTS**
1. Author all SVGs listed in ARCHITECTURE.md tree. viewBox = original size.
2. `sprites.ts`: load SVG → `ImageBitmap` at current scale × DPR; re-rasterize on resize.
3. Draw dino frames (idle/run/duck/dead), cactus groups (compose 1–3 units), ptero 2 frames, cloud.
4. Animation timers: run 2 frames @ 12 fps, ptero @ 6 fps, idle blink.

**FILES**
`src/assets/svg/*.svg`, `src/client/renderer/sprites.ts`, update `renderer.ts`

**ACCEPTANCE CRITERIA**
- Silhouettes match original proportions (compare against known 44x47 dino footprint).
- Hitbox debug overlay (press H) shows boxes aligned with art.
- No blurry edges at DPR 1, 2, 3.

**CONSTRAINTS**
Each SVG < 3 KB. No external images.

---

## T08 — Modern visuals
Status: TODO | Depends: T07

**CONTEXT**
ASSETS.md palette, parallax, night, retro mode. DESIGN.md sections 2, 4, 5, 8 (dino expressions, ambient life, juice, readability rules).

**GOAL**
Modern look with day/night, parallax, particles, dino expressions, juice moments.

**BACKEND REQUIREMENTS**
None.

**FRONTEND REQUIREMENTS**
1. `palette.ts`: day/night/retro tokens, lerp fade.
2. `layers.ts`: sky gradient, far dunes, mid dunes, ground texture, factors per ASSETS.md.
3. Moon (7 phases) + twinkling stars at night.
4. `particles.ts`: run dust, landing dust, death burst; pooled, max 100.
5. Jump squash/stretch, death flash, screen shake (visual only).
6. Retro mode toggle: flat sprites, no parallax/particles.

**FILES**
`src/client/renderer/palette.ts`, `layers.ts`, `particles.ts`, updates to `renderer.ts`, `ui/settings.ts`

**ACCEPTANCE CRITERIA**
- Night toggles at 700, 1400 with smooth fade.
- Retro mode renders flat look; setting persists after reload.
- Gameplay identical with effects on/off (same seed + inputs → same core state; test).
- 60 FPS desktop in Chrome performance panel.

**CONSTRAINTS**
Effects read core state only. Zero effect on physics.

---

## T09 — HUD, overlay, audio, storage
Status: TODO | Depends: T08

**CONTEXT**
product.md sections 6, 8, 10; ASSETS.md HUD and audio.

**GOAL**
Complete UI and sound.

**BACKEND REQUIREMENTS**
None. (`storage.ts` wraps localStorage in try/catch.)

**FRONTEND REQUIREMENTS**
1. `hud.ts`: 5-digit score, `HI 00000`, 3x flash on milestone (250 ms each).
2. `overlay.ts`: READY prompt, GAME OVER text, restart icon, mobile tap hint.
3. `synth.ts`: jump, milestone, crash sounds per ASSETS.md; AudioContext on first input; mute (M + button), persisted.
4. `storage.ts`: high score + settings; works if storage blocked.

**FILES**
`src/client/ui/hud.ts`, `overlay.ts`, `settings.ts`, `src/client/audio/synth.ts`, `src/client/storage.ts`

**ACCEPTANCE CRITERIA**
- High score survives reload.
- Sound plays on jump/crash/milestone, none when muted.
- Game works with localStorage disabled.
- Overlay states match phase.

**CONSTRAINTS**
No audio before user input. Score caps at 99999.

---

## T10 — Mobile and responsive
Status: TODO | Depends: T09

**CONTEXT**
product.md section 9.

**GOAL**
Playable on phones.

**BACKEND REQUIREMENTS**
None.

**FRONTEND REQUIREMENTS**
1. Touch: tap = jump, hold lower half = duck, tap to restart.
2. Prevent scroll/zoom/pull-to-refresh on canvas (`touch-action: none`).
3. Layout centers canvas; works in portrait and landscape.
4. Mute button reachable on mobile.

**FILES**
`input.ts`, `index.html`, `src/client/styles.css`

**ACCEPTANCE CRITERIA**
- Playwright mobile emulation (iPhone 12, Pixel 5): start, jump, crash, restart via touch.
- No page scroll during play.

**CONSTRAINTS**
Same physics as desktop.

---

## T11 — Biomes, skins, creative layer
Status: TODO | Depends: T10

**CONTEXT**
DESIGN.md sections 3, 5, 7, 9, 11. Visual and audio only. GAME_SPEC.md physics untouched.

**GOAL**
7 biomes with obstacle skins, props, weather, juice moments, extra sounds, easter eggs.

**BACKEND REQUIREMENTS**
1. Expose `biomeIndex = floor(score / 700) % 7` in `GameState` (derived from score only, no effect on physics).
2. Expose events: `nearMiss` (obstacle passes trex within 6 px without collision), `highScore`, `biomeChange`.
3. Tests: biomeIndex derived correctly; adding events does not change golden snapshot of physics fields.

**FRONTEND REQUIREMENTS**
1. Biome table from DESIGN.md: palette (day/night), far/mid layers, props, weather, 3 s crossfade on change.
2. Obstacle skins per biome as SVG, same viewBox and footprint as originals.
3. Dino expressions (idle, run, air, near miss, crash, milestone) and READY idles (yawn, tail wag, nap after 10 s).
4. Juice: 100-pt sparkle, 500-pt badge, biome banner, high score gold + fanfare, crash slow-mo look (visual only).
5. Extra sounds: landing thud, near-miss whoosh, biome pad, high-score fanfare, quiet ambient bed per biome.
6. Ambient life: lizard, birds, rare UFO in background only.
7. Easter eggs per DESIGN.md section 11.
8. Reduced effects toggle (disables shake, flash, grain, weather, confetti, slow-mo look); persisted.
9. Degrade effects if frame time > 16 ms for 2 s (particles → weather → grain).

**FILES**
`src/client/renderer/biomes.ts`, `props.ts`, `expressions.ts`, `src/client/audio/ambient.ts`, `src/client/ui/badges.ts`, `src/assets/svg/skins/**`, updates to `renderer.ts`, `synth.ts`, `settings.ts`, `src/core/game.ts` (read-only derived fields and events)

**ACCEPTANCE CRITERIA**
- All 7 biomes appear in order every 700 score and loop.
- Hitbox overlay (H) shows every skin fits its box in every biome.
- Same seed + inputs → identical physics state in every biome and with effects on/off.
- Readability rules in DESIGN.md section 8 hold in each biome (log manual check in PROGRESS.md).
- Reduced effects mode works and persists.
- Retro mode still shows only the original look.

**CONSTRAINTS**
No change to speed, gravity, spawn, hitboxes, score. Weather max 60 particles. Flash ≤ 3 per second. No audio files.

---

## T12 — Tests, fidelity check, polish
Status: TODO | Depends: T11

**CONTEXT**
TESTING.md.

**GOAL**
All checklist items pass.

**BACKEND REQUIREMENTS**
1. Add golden-state test: fixed seed, scripted input, snapshot of state at steps 100/1000/5000.
2. Add bot test: simple jump bot survives > 3000 steps, proving obstacles are jumpable.

**FRONTEND REQUIREMENTS**
1. Playwright smoke: load, press Space, wait, assert score > 0, crash, restart.
2. Bundle size check < 300 KB gzip.
3. README with run, build, controls, retro mode.

**FILES**
`tests/**`, `README.md`

**ACCEPTANCE CRITERIA**
- Every item in TESTING.md checklist ticked.
- All npm scripts green.
- PROGRESS.md final entry "COMPLETE".

**CONSTRAINTS**
Do not edit snapshots to make tests pass without a logged reason.
