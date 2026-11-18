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
