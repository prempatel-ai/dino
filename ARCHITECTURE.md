# ARCHITECTURE.md

## Rule
Two layers. **Core** = pure TypeScript simulation, no DOM, no canvas, no audio. **Client** = input, rendering, audio, UI. Core never imports Client.

## Tree
```
dino-game/
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  src/
    core/                    # headless, testable
      constants.ts           # all numbers from GAME_SPEC.md
      rng.ts                 # mulberry32
      types.ts
      trex.ts                # jump, duck, speed drop
      obstacle.ts            # types, gap, movement
      horizon.ts             # ground, clouds, spawn logic
      collision.ts           # two-phase AABB
      score.ts               # distance, score, achievement, high score
      daynight.ts            # invert trigger, moon phase
      game.ts                # state machine + step(input)
      index.ts
    client/
      main.ts                # bootstrap
      loop.ts                # fixed-step accumulator + interpolation
      input.ts               # keyboard + touch -> InputState
      renderer/
        renderer.ts          # draws core state
        camera.ts            # scale, DPR, resize
        layers.ts            # parallax, sky, ground
        particles.ts         # dust, death burst
        palette.ts           # day / night / retro palettes
        sprites.ts           # SVG -> ImageBitmap atlas
      audio/
        synth.ts             # WebAudio sfx
      ui/
        hud.ts               # score, HI, flash
        overlay.ts           # ready, game over, restart icon
        settings.ts          # mute, retro mode
      storage.ts             # high score, settings (try/catch localStorage)
    assets/svg/              # agent-authored SVGs
      trex-run1.svg trex-run2.svg trex-idle.svg trex-duck1.svg trex-duck2.svg trex-dead.svg
      cactus-small-1.svg cactus-small-2.svg cactus-small-3.svg
      cactus-large-1.svg cactus-large-2.svg cactus-large-3.svg
      ptero-1.svg ptero-2.svg cloud.svg moon-0..6.svg star.svg restart.svg
  tests/
    core/*.test.ts
    e2e/smoke.spec.ts
  docs/ (these md files)
```

## Core API
```ts
type Input = { jumpPressed: boolean; jumpHeld: boolean; duckHeld: boolean; restartPressed: boolean };
interface Game {
  step(input: Input): void;     // one fixed 1/60 step
  state: GameState;             // read-only snapshot for renderer
  reset(seed?: number): void;
}
```
`GameState` includes: phase, trex {x,y,w,h,ducking,jumping,frame}, obstacles[], clouds[], ground offset, speed, distance, score, highScore, night flag, moon phase, flashing, elapsedMs.

## Loop
Accumulator: `acc += min(dt, 100ms); while (acc >= 1000/60) { core.step(input); acc -= 1000/60 }`. Render with `alpha = acc / (1000/60)` interpolation for smooth motion at >60 Hz displays. Interpolation is visual only.

## Rendering
- Back buffer scaled: `scale = cssWidth / 600`, `ctx.scale(scale * dpr)`.
- Sprites pre-rasterized from SVG to ImageBitmap at needed scale on resize.
- Draw order: sky → stars/moon → far parallax → clouds → mid parallax → ground → obstacles → dino → particles → HUD → overlay.

## Data flow
`input.ts → loop.ts → core.step → state → renderer.draw / hud / audio events`
Core emits events array per step (`jump`, `crash`, `milestone`, `land`) consumed by audio and particles.

## Constraints
- No runtime deps except dev tooling.
- No global mutable state outside `Game`.
- All timing in frames inside core.
