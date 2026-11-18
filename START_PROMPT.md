# START_PROMPT.md — Paste this into Antigravity

**CONTEXT**
Repo contains product.md, DESIGN.md, GAME_SPEC.md, ARCHITECTURE.md, ASSETS.md, TESTING.md, TASKS.md, PROGRESS.md, AGENTS.md. Product = clone of Chrome offline dino game, 2D, same mechanics and dimensions, modern graphics.

**GOAL**
Build the complete game autonomously. Complete T01–T12 in TASKS.md. No questions to the user.

**BACKEND REQUIREMENTS**
1. Read AGENTS.md first and follow its loop.
2. Implement headless core in `src/core` exactly per GAME_SPEC.md.
3. Verify GAME_SPEC.md constants against Chromium `components/neterror/resources/offline.js` if network is available. Fix the spec if different. Log in PROGRESS.md.
4. Core is deterministic: injected seeded RNG, frame-based time.
5. After every task: typecheck, test, build, commit, append PROGRESS.md.

**FRONTEND REQUIREMENTS**
1. Canvas 2D, logical 600x150, 4:1, DPR-aware.
2. Author all sprites as SVG. Author all audio via WebAudio.
3. Modern visuals per ASSETS.md. Retro mode toggle.
4. Desktop keyboard + mobile touch.
5. HUD, game over overlay, high score in localStorage.

**FILES**
Per ARCHITECTURE.md tree.

**ACCEPTANCE CRITERIA**
- All tasks DONE in TASKS.md.
- All npm scripts pass: dev, build, typecheck, test, test:e2e, lint.
- Every TESTING.md checklist item ticked.
- Gameplay matches original Chrome dino (physics, spawn, speed, score, day/night, collision).
- PROGRESS.md ends with "COMPLETE".

**CONSTRAINTS**
- No runtime dependencies.
- No downloaded assets.
- Art and effects never alter physics or hitboxes.
- No features outside product.md.
- If ambiguous, choose the original Chrome behavior and log it.
- Do not stop until the acceptance criteria are met.
