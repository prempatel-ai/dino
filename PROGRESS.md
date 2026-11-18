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
