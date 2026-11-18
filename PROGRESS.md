# PROGRESS.md

Agent appends here after every task. Newest at bottom. Never delete entries.

## Entry format
```
### T## — <title> — DONE
- Date:
- What changed:
- Tests: <counts, pass/fail>
- Decisions:
- Notes:
```

## Decisions
(Agent logs choices made where spec was ambiguous. Format: `T## — decision — reason`.)

## Blockers
(Agent logs anything stuck after 3 attempts. Format: `T## — problem — tried — fallback used`.)

## Unverified constants
(Agent lists any GAME_SPEC.md value it could not verify against Chromium `offline.js`.)

## Log
### T01 — Project scaffold — DONE
- Date: 2026-11-18
- What changed: Initialized repository structure, strict TypeScript config, Vite, Vitest, Playwright, ESLint. Implemented `constants.ts` with all values from GAME_SPEC.md and `rng.ts` (mulberry32). Configured `index.html` with canvas and overlay, styles, and dummy test.
- Tests: 2 unit tests passing, 1 e2e test passing, typecheck/build/lint clean.
- Decisions: T01 — Configured Vitest to target `tests/core/**/*.test.ts` so unit runner does not conflict with Playwright test files.
- Notes: Verified GAME_SPEC.md constants against Chromium offline.js source. All match.

### T02 — Core: Trex physics — DONE
- Date: 2026-11-18
- What changed: Implemented `src/core/trex.ts` with exact Chromium jump velocity, gravity, short hop via early release, fast drop via down key in air, and ground ducking (59x25 dimension switch and top Y offset).
- Tests: 9 unit tests passing (full hold apex = 2, airFrames = 35 at speed 6), all typecheck, build, and lint checks green.
- Decisions: T02 — Preserved duck input during airborne state as pending duck so landing smoothly transitions to ducking if down key remains held.
- Notes: Full jump holds, early release hops, speed drops, and ground ducks match GAME_SPEC.md.

### T03 — Core: Obstacles and horizon — DONE
- Date: 2026-11-18
- What changed: Implemented `src/core/obstacle.ts` and `src/core/horizon.ts` with exact obstacle configs, grouping rules, pterodactyl speed threshold and flight heights, dynamic gap calculation, 3000 ms clear time before first obstacle, ground offset scrolling, cloud management, and obstacle duplication capping.
- Tests: 18 unit tests passing across all suites; typecheck, test, build, lint all green.
- Decisions: T03 — Preserved entire obstacle history in horizon for deterministic auditability and verified duplication limit <= 2.
- Notes: Gap equations and obstacle spawn thresholds verified against Chromium values.

### T04 — Core: Collision — DONE
- Date: 2026-11-18
- What changed: Implemented `src/core/collision.ts` with two-phase AABB collision detection: 1px-inset outer bounding box fast-reject followed by per-subbox intersection tests for standing dino (6 boxes), ducking dino (1 box), and obstacle multi-part boxes.
- Tests: 23 unit tests passing; verified direct hit, jump apex clearance over small and large cacti, ducking under mid-level pterodactyl, and outer-overlap-subbox-miss edge cases.
- Decisions: T04 — Implemented pure `boxCompare`, `checkCollision`, and `isNearMiss` helpers without mutations or allocations.
- Notes: Hitboxes match GAME_SPEC.md section 7 exactly.

### T05 — Core: Score, speed, day/night, game state machine — DONE
- Date: 2026-11-18
- What changed: Implemented `src/core/score.ts`, `src/core/daynight.ts`, and `src/core/game.ts`. Assembled the complete headless 60 FPS deterministic game state machine (BOOT/READY/INTRO/RUNNING/CRASHED) with speed acceleration (up to 13), milestone flash events, day/night palette cycles, and 750 ms restart lock.
- Tests: 28 unit tests passing; verified deterministic replay over 5000 steps, automated unassisted crash, milestone events, and restart locking.
- Decisions: T05 — Emitted discrete step events (`jump`, `land`, `crash`, `milestone`, `nearMiss`, `highScore`, `biomeChange`) for clean client-side audio and particle reaction without coupling.
- Notes: Headless core is completely pure, deterministic, and free of DOM/canvas dependencies.

### T06 — Client: loop, input, canvas scaling — DONE
- Date: 2026-11-18
- What changed: Implemented `src/client/renderer/camera.ts` (600x150 logical 4:1 viewport, DPR-aware, resize handling), `src/client/input.ts` (desktop keys Space/Up/Down/Enter/W/S/M/R/H, mobile touch tap/swipe/lower-half-hold, single-frame action consumption), `src/client/loop.ts` (fixed 60 Hz accumulator, 100ms dt clamp, pause on tab visibility change), and `src/client/renderer/renderer.ts`.
- Tests: 28 unit tests passing, Playwright e2e smoke test passing with live canvas inspection.
- Decisions: T06 — Added debug hitbox visualization toggle (H key) directly in the renderer for visual validation against GAME_SPEC.md hitboxes.
- Notes: Verified responsive 4:1 aspect ratio scaling without stretching on high-DPI displays.

### T07 — Sprites (SVG) — DONE
- Date: 2026-11-18
- What changed: Authored 18 clean, lightweight SVGs (< 1.5 KB each) for Trex (idle, run 1 & 2, duck 1 & 2, dead), Small Cacti (1-3), Large Cacti (1-3), Pterodactyls (wings up & down), Cloud, Moon phases (0-6), Stars, and Restart icon. Implemented `SpriteAtlas` with dynamic DPR/scale rasterization, `currentColor` palette swapping, and integrated into `Renderer`.
- Tests: 28 unit tests passing, Playwright e2e smoke test verified sprite loading and rendering.
- Decisions: T07 — Bundled SVGs via Vite raw imports to guarantee zero network latency and synchronous offline canvas availability.
- Notes: Verified exact alignment of SVG silhouettes with collision boxes from GAME_SPEC.md.

### T08 — Modern visuals — DONE
- Date: 2026-11-18
- What changed: Implemented `src/client/renderer/palette.ts` (day, night, and retro palette tokens with hex lerp interpolation), `src/client/renderer/layers.ts` (far and mid dunes parallax layers with smooth curves), `src/client/renderer/particles.ts` (pre-allocated 100-particle pool for running dust, landing burst, and death burst), `src/client/ui/settings.ts`, and `src/client/storage.ts`. Enhanced renderer with jump squash/stretch, decaying screen shake, death flash, and retro mode toggle (R key).
- Tests: 29 unit tests passing including `effects_equivalence.test.ts` (verifying identical simulation state with visual effects on vs off); Playwright smoke test passing.
- Decisions: T08 — Applied squash/stretch and screen shake purely via canvas context matrix transformations so physics and core state remain completely untouched.
- Notes: Pre-allocated object pools ensure zero garbage collection churn during active 60 FPS gameplay.

### T09 — HUD, overlay, audio, storage — DONE
- Date: 2026-11-18
- What changed: Implemented `src/client/audio/synth.ts` with WebAudio synthesis (jump square blip 440->880Hz, milestone two-tone chime 880/1320Hz, crash 300->80Hz + noise burst, landing thud, near-miss whoosh, and high score fanfare), `src/client/ui/hud.ts`, `src/client/ui/overlay.ts` with interactive mute & retro UI controls, and `src/client/storage.ts` with resilient localStorage wrapper.
- Tests: 30 unit tests passing, Playwright e2e test passing.
- Decisions: T09 — AudioContext created only upon first user interaction to comply with modern browser autoplay policies.
- Notes: High scores and settings persist safely and gracefully fall back to an in-memory dictionary if localStorage is restricted.

### T10 — Mobile and responsive — DONE
- Date: 2026-11-18
- What changed: Enhanced `styles.css` with `touch-action: none` and centered responsive letterboxing; upgraded `src/client/input.ts` to support multitouch, touch tap-to-jump, lower-half hold to duck, downward swipe to duck, and tap to restart. Added mobile UI button tap handling. Added Playwright mobile emulation tests in `tests/e2e/mobile.spec.ts`.
- Tests: 30 unit tests passing, Playwright mobile tests passing on Mobile Chrome (Pixel 5).
- Decisions: T10 — Differentiated touch coordinate thresholds between canvas bounds and full screen to guarantee responsive touch zones across both portrait and landscape mobile layouts.
- Notes: Verified no accidental page scroll or zooming occurs on touch devices.

### T11 — Biomes, skins, creative layer — DONE
- Date: 2026-11-18
- What changed: Implemented full creative suite: 7 cycling biomes with 3s crossfades (Classic Desert, Canyon Sunset, Oasis Sanctuary, Frozen Tundra, Volcanic Badlands, Neon Future, Space Dunes); custom SVG obstacle skins for all biomes; procedural weather particle system (max 50 particles); background ambient life (lizard, birds, rare UFO); Dino expressions (squint & sweat drop on near miss, ready idle nap zzz, milestone happy eyes); 500-pt celebratory badges and biome name banners; WebAudio ambient noise loops; Konami code sunglasses easter egg; and frame-rate watchdog for auto-degrading visual effects if FPS dips.
- Tests: 32 unit tests passing, Playwright e2e tests passing with touch emulation.
- Decisions: T11 — Readability rules manually verified: obstacle skins adhere strictly to base collision box boundaries; props and weather stay outside play lane (x=50..110, y=93..140); flash effects constrained to <= 1/sec; reduced effects toggle cleanly bypasses all auxiliary particle, shake, and banner layers.
- Notes: Visual upgrades are 100% decoupling-compliant: physics state and RNG remain entirely unaffected whether biomes/effects are active or disabled.
