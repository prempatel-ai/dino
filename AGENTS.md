# AGENTS.md — Rules for Autonomous Agent

## Mission
Build the game described in `product.md`. Work alone, no questions. Finish all tasks in `TASKS.md`.

## Read order (every session start)
1. `AGENTS.md`
2. `product.md`
3. `GAME_SPEC.md`
4. `ARCHITECTURE.md`
5. `PROGRESS.md` (resume from last entry)
6. `TASKS.md`
7. `DESIGN.md` (creative direction; visual/audio only, never changes mechanics)
8. `ASSETS.md`, `TESTING.md` when needed

## Loop
```
repeat:
  pick first task in TASKS.md with status TODO (respect dependencies)
  set status IN_PROGRESS
  implement
  run: npm run typecheck && npm test && npm run build
  fix until green
  check task ACCEPTANCE CRITERIA
  set status DONE
  append entry to PROGRESS.md
until all tasks DONE
```

## Hard rules
1. Never change a constant in `GAME_SPEC.md` without verifying against Chromium `offline.js`. If you cannot verify, keep the spec value.
2. Core (`src/core`) has no DOM, canvas, audio, or `Date`/`Math.random` calls. Use injected RNG and frame counts.
3. Art and visual effects never touch physics or hitboxes.
4. Do not add runtime dependencies. Dev deps allowed: vite, typescript, vitest, playwright, eslint, prettier.
5. Do not download assets. Author SVG and synth audio yourself.
6. Do not skip failing tests. Fix the cause.
7. Do not ask the user questions. If something is ambiguous, pick the option closest to the original Chrome game and log the decision in `PROGRESS.md` under "Decisions".
8. Do not invent mechanics. Do not add features outside `product.md`.
9. Commit after every DONE task: `feat(T##): <title>`.
10. Keep files small and typed. No `any`.

## Commands (must exist after T01)
```
npm run dev
npm run build
npm run typecheck
npm test
npm run test:e2e
npm run lint
```

## Definition of done (whole project)
- All tasks DONE.
- All commands above pass.
- Every item in `TESTING.md` checklist ticked.
- `README.md` has run + build + controls.
- `PROGRESS.md` final entry = "COMPLETE".

## Stuck protocol
If blocked 3 attempts on the same problem: log it in `PROGRESS.md` under "Blockers" with what was tried, implement the simplest spec-compliant fallback, continue to next task.
