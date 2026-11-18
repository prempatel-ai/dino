# product.md — Dino Run (Chrome Offline Dinosaur Game Clone)

## 1. Product
Browser game. Exact clone of Chrome's offline T-Rex runner: same mechanics, same physics, same world dimensions. Only the visuals and audio polish are upgraded.

## 2. Key decision: 2D or 3D
**2D side-scroller.** The original is 2D. Same-to-same mechanics = 2D. "Better graphics" means HD vector art, parallax, particles, lighting-style effects. Not 3D.

## 3. Principles
1. Gameplay is identical. If a mechanic differs from the original, it is a bug.
2. Physics runs in original logical units (world = 600 x 150). Rendering scales on top. Art never changes hitboxes.
3. Fixed 60 Hz simulation. Same input sequence = same result (deterministic with a seeded RNG).
4. No external art or audio downloads. All sprites authored as SVG by the agent. All sound synthesized with WebAudio.
5. Zero backend. Static site.

## 4. Platform and stack
- Web. Desktop + mobile browsers (Chrome, Safari, Firefox, Edge).
- TypeScript + Vite. HTML5 Canvas 2D. No game engine.
- Vitest for tests. Playwright for smoke test.
- Deploy: static build (`dist/`), Vercel-ready.

## 5. World dimensions (must match original)
| Item | Value |
|---|---|
| Logical world | 600 x 150 px |
| Sim rate | 60 FPS fixed step |
| Dino standing | 44 x 47 |
| Dino ducking | 59 x 25 |
| Dino start X | 50 |
| Ground Y (dino feet line) | 150 - 47 - 10 = 93 (dino top Y when standing) |
| Small cactus | 17 x 35 per unit |
| Large cactus | 25 x 50 per unit |
| Pterodactyl | 46 x 40 |
| Cloud | 46 x 14 |

Render: canvas CSS width = min(window width, 600 * scale), height = width / 4. Keep 4:1 aspect. Back buffer = CSS size x devicePixelRatio. Never stretch.

## 6. Core mechanics (summary; exact numbers in GAME_SPEC.md)
- Start: press Space/Up/tap. Dino runs in (intro), world reveals.
- Jump: Space or Up. Hold = full jump. Release early = short hop.
- Duck: Down (hold). On the ground = duck sprite. In air = fast drop.
- Speed: starts 6, increases every frame, caps at 13.
- Obstacles: small cactus, large cactus (groups of 1-3), pterodactyl (3 heights, only after speed >= 8.5).
- No obstacles for first 3000 ms.
- Score = distance based. 5 digits. Flashes every 100. Max 99999.
- Day/night toggle every 700 score.
- Collision = original multi-box AABB.
- Game over → "G A M E O V E R" + restart icon. Restart allowed after 750 ms.
- High score saved in localStorage, shown as `HI 00000`.

## 7. Visual upgrade (allowed)
- Dino, cactus, pterodactyl, cloud, moon, stars drawn as clean SVG with soft shading and flat modern palette. Silhouette and proportions must read like the original.
- Parallax: 3 background layers (far dunes, mid dunes, clouds), speed tied to game speed.
- Ground: textured line with pebbles, same scroll speed as obstacles.
- Dust particles on landing and running.
- Subtle screen shake + dino flash on death.
- Smooth day/night color fade (sky gradient, moon phases, twinkling stars).
- Run animation 2 frames at original rate, plus squash/stretch on jump and land (visual only).
- Pixel-crisp option: toggle "Retro mode" that renders the original look (flat 1-bit style). Default = modern.

Not allowed: changing speed, gravity, hitboxes, spawn logic, score formula, world size.

## 8. Audio (WebAudio synth, no files)
- Jump: short rising blip.
- Score 100 milestone: two-tone chime.
- Death: short falling hit.
- Mute toggle (M key + button). Audio starts only after first user input.

## 9. Controls
| Action | Desktop | Mobile |
|---|---|---|
| Start / Jump | Space, ArrowUp | Tap |
| Duck | ArrowDown (hold) | Swipe down / hold lower half |
| Restart | Space, ArrowUp, Enter | Tap |
| Mute | M | Mute button |
| Pause | Auto on tab hidden | Auto on tab hidden |

## 10. Screens and states
`BOOT → READY → INTRO → RUNNING → CRASHED → (restart) RUNNING`
- READY: dino idle, blinking, "Press Space to play".
- CRASHED: dead sprite, game over text, restart icon, score stays, high score updates.

## 11. Non-goals
- Multiplayer, accounts, leaderboards, backend.
- 3D, skins shop, new obstacles, power-ups.
- Changing difficulty curve.

## 12. Success criteria
- Side-by-side with original: same jump arc, same obstacle gaps, same speed curve, same game over behavior.
- 60 FPS on mid-range phone.
- All tests in TESTING.md pass.
- Bundle < 300 KB gzip (no audio/image files).

## 13. File map
See ARCHITECTURE.md. Agent instructions in AGENTS.md. Tasks in TASKS.md. Start prompt in START_PROMPT.md.
