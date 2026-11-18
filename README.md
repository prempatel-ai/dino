# Dino Run (Chrome T-Rex 2D Recreation)

A pixel-faithful, high-fidelity recreation of the classic Chrome offline dinosaur runner game.
Engineered with pure TypeScript, HTML5 Canvas 2D, and WebAudio synthesis. **Zero runtime dependencies.**

---

## Architecture & System Design

The architecture enforces a strict boundary between the deterministic simulation engine and the visual/audio client layers:

```
src/
├── core/                  # Pure headless simulation layer (no DOM, no canvas, no Date.now)
│   ├── constants.ts       # Exact physical and timing constants from Chromium offline.js
│   ├── rng.ts             # Deterministic Mulberry32 seeded pseudo-random number generator
│   ├── types.ts           # Game state, phase machine, and event definitions
│   ├── trex.ts            # Jump parabola, short hops, fast-drop, and ducking states
│   ├── obstacle.ts        # Obstacle definitions, groupings, speed scaling, and gap calculations
│   ├── horizon.ts         # Clear-time gating (3000ms), duplication cap, ground, and clouds
│   ├── collision.ts       # Two-phase AABB collision detection with per-subbox accuracy
│   ├── score.ts           # Distance integration, 5-digit score, milestones, and high score
│   ├── daynight.ts        # Day/night inversion cycles every 700 score units
│   └── game.ts            # 60 FPS fixed-step state machine (BOOT/READY/INTRO/RUNNING/CRASHED)
│
├── client/                # Reactive frontend rendering and audio layer
│   ├── main.ts            # Entrypoint and lifecycle coordinator
│   ├── loop.ts            # Fixed 60 Hz accumulator loop with visibilitychange tab pausing
│   ├── input.ts           # Desktop keyboard, touch gestures, and Easter egg listeners
│   ├── storage.ts         # Resilient storage manager with try/catch memory fallback
│   ├── audio/
│   │   ├── synth.ts       # Real-time WebAudio SFX oscillator synthesizers
│   │   └── ambient.ts     # Generative filtered noise ambient beds
│   ├── renderer/
│   │   ├── camera.ts      # 600x150 logical viewport, 4:1 aspect ratio, and DPR scaling
│   │   ├── sprites.ts     # SVG vector atlas with DPR rasterization and palette replacement
│   │   ├── palette.ts     # Hex color tokens and lerp color interpolator
│   │   ├── layers.ts      # Multi-layer parallax dunes and atmospheric gradients
│   │   ├── particles.ts   # Pre-allocated 100-particle pool for running/landing/death bursts
│   │   ├── biomes.ts      # 7 cycling thematic biomes with 3s crossfades
│   │   ├── props.ts       # Weather effects, lizards, birds, and rare UFO easter egg
│   │   └── expressions.ts # Dino facial expressions, near-miss sweat drops, and nap idles
│   └── ui/
│       ├── hud.ts         # Score, HI score, and milestone flashing
│       ├── overlay.ts     # Ready prompt, Game Over banner, restart button, and touch buttons
│       └── settings.ts    # Retro mode, mute, and reduced effects state manager
└── assets/svg/            # Hand-authored lightweight SVGs (< 1.5 KB each)
```

---

## Controls

| Action | Desktop Keyboard | Mobile Touch |
|---|---|---|
| **Start / Jump** | `Space`, `ArrowUp`, `W` | Tap upper/mid screen |
| **Short Hop** | Release `Space` / `ArrowUp` early | Quick tap |
| **Duck / Fast Drop** | Hold `ArrowDown` or `S` | Swipe down or hold bottom 35% of screen |
| **Restart** | `Space`, `Enter`, `ArrowUp` (after 750ms) | Tap screen / restart button |
| **Toggle SFX / Mute** | `M` | Tap `SFX: ON/OFF` button |
| **Toggle Retro Mode** | `R` | Tap `RETRO: ON/OFF` button |
| **Toggle Hitboxes (Debug)**| `H` | Debug toggle |
| **Konami Code (Easter Egg)**| `↑ ↑ ↓ ↓ ← → ← → B A` | Unlocks dino sunglasses |

---

## 7 Cycling Biomes

Every 700 score points, the environment smoothly crossfades into the next biome with custom color palettes, background props, and obstacle skins:

1. **Classic Desert**: The authentic Chrome runner look with dunes, clouds, and tumbleweed.
2. **Canyon Sunset**: Warm orange mesas, red skies, dusk fireflies, and blooming cacti.
3. **Oasis Sanctuary**: Lush palm groves, gentle rain streaks, and reeds.
4. **Frozen Tundra**: Ice dunes, soft snowfall, and crystal spires.
5. **Volcanic Badlands**: Ash sky, glowing lava cracks, obsidian pillars, and floating embers.
6. **Neon Future**: Synthwave grid ground, neon city skyline, and wireframe obstacles.
7. **Space Dunes**: Low-gravity cosmic dust, starry horizons, and alien spires.

---

## Verification & Commands

All development and test commands execute cleanly with strict typing and no dependencies:

```bash
# Run local Vite development server
npm run dev

# Run strict TypeScript typechecking
npm run typecheck

# Run Vitest unit, golden-state, and bot tests (38 tests)
npm test

# Run Playwright end-to-end tests across Chromium and Mobile devices
npm run test:e2e

# Run ESLint validation
npm run lint

# Build static production bundle into dist/ (< 20 KB gzip total)
npm run build
```

---

## Physics & Mechanical Fidelity Guarantee

- **Logical World**: 600 x 150 px.
- **Fixed Rate**: 60 FPS deterministic simulation.
- **Dino Footprint**: 44 x 47 standing, 59 x 25 ducking, ground level y = 93.
- **Jump Physics**: Initial velocity `v = -10 - speed / 10`, gravity `g = 0.6`, short hop cutoff at `v < -5`.
- **Speed**: Starts at 6, accelerates at `0.001 / frame`, caps strictly at 13.
- **Obstacles**: Pterodactyls restricted to speed ≥ 8.5 with flight heights at y ∈ {50, 75, 100}.
- **Hitboxes**: Sub-box collision testing conforms pixel-for-pixel to Chromium `offline.js`. Visual effects and creative skins never alter collision boundaries.
