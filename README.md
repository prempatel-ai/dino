# Dino Run

A high-fidelity modern 2D recreation of the classic Chrome offline dinosaur game.
Built with TypeScript, HTML5 Canvas 2D, and WebAudio. Zero runtime dependencies.

## Architecture

- **`src/core/`**: Pure headless TypeScript game simulation (deterministic, fixed 60 FPS, seeded RNG, no DOM).
- **`src/client/`**: Renderer (Canvas 2D, DPR-aware, 4:1 aspect ratio), input handling, audio synthesis, and HUD/overlays.
- **`src/assets/svg/`**: Hand-crafted SVG assets for all sprites.

## Requirements

- Node.js 18+ (tested on Node 20+)
- npm 9+

## Development Scripts

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Typecheck with strict TypeScript rules
npm run typecheck

# Run unit and golden-state tests
npm test

# Run end-to-end tests
npm run test:e2e

# Lint code
npm run lint

# Build static bundle for production (dist/)
npm run build
```

## Controls

| Action | Desktop | Mobile |
|---|---|---|
| Start / Jump | Space, ArrowUp | Tap |
| Duck / Fast Drop | ArrowDown (hold) | Swipe down / Hold lower half |
| Restart | Space, ArrowUp, Enter | Tap |
| Mute Audio | M | Mute Button |
| Toggle Retro Mode | R | Settings Panel |
| Toggle Hitboxes | H | Settings Panel |
