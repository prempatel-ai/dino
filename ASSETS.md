# ASSETS.md — Art and Audio Direction

## Approach
Agent authors everything. No downloads, no AI-image tools needed.
- Sprites: hand-written SVG files in `src/assets/svg/`.
- Sound: WebAudio oscillators in `audio/synth.ts`.
- Backgrounds: drawn procedurally on canvas (gradients, shapes).

## Sprite rules
- Each SVG `viewBox` = original sprite logical size (dino 44x47, duck 59x25, cactus small 17x35, large 25x50, ptero 46x40, cloud 46x14). Render at DPR scale → sharp at any size.
- Silhouette must match the original: same pose, same proportions, same head/tail/arm placement. Detail is added **inside** the silhouette (shading, highlights, eye, belly tone).
- Transparent background. No external fonts or images inside SVG.
- Keep each SVG < 3 KB.

## Palette
| Token | Day | Night | Retro (day) |
|---|---|---|---|
| sky top | #F7F7F2 | #14161F | #FFFFFF |
| sky bottom | #E9EEF2 | #1F2433 | #FFFFFF |
| dino body | #535353 | #E8E8E8 | #535353 |
| dino shade | #3E3E3E | #BDBDBD | — |
| cactus | #4F6F52 | #9FBFA2 | #535353 |
| ground | #535353 | #CFCFCF | #535353 |
| far dunes | #E3DCCB | #1B1F2C | — |
| mid dunes | #D2C8AE | #252B3B | — |
| accent (score flash) | #FFB020 | #FFB020 | #535353 |

Dino stays dark gray (original identity). Cactus gets a muted green in modern mode.

## Animation set
- Dino: idle (blink), run1/run2, duck1/duck2, dead, jump pose (= run1 static).
- Ptero: wing up / wing down.
- Visual-only polish: jump squash/stretch (max 8%), landing dust, run dust every 6 frames, death flash 80 ms + shake 6 px decaying over 300 ms.

## Parallax
| Layer | Speed factor |
|---|---|
| far dunes | 0.1 × game speed |
| clouds | 0.2 (original BG_CLOUD_SPEED) |
| mid dunes | 0.3 × game speed |
| ground + obstacles | 1.0 × game speed |

## Night
- Moon: 7 phases, drawn as SVG, advances each night.
- Stars: ~20, twinkle opacity 0.4–1.0, drift slowly.
- Palette fade via lerp between day/night tokens.

## Retro mode
Flat single-color sprites, no parallax, no particles, white/near-black inversion at night. Same sprite silhouettes. Toggle in settings, persisted.

## Audio (synth.ts)
| Sound | Recipe |
|---|---|
| jump | square osc, 440→880 Hz over 90 ms, gain 0.15 → 0 |
| milestone (100) | two square blips 880 Hz then 1320 Hz, 70 ms each |
| crash | square 300→80 Hz over 220 ms + short noise burst |
- Master gain 0.5. `AudioContext` created on first user input. Mute persists.

## HUD
- Font: system monospace stack. Score = 5 digits zero-padded. HI = dimmer color.
- Flash: score toggles visible/hidden 3 times at 250 ms on each 100 milestone.
- Game over text spaced letters "G A M E  O V E R". Restart icon = circular arrow SVG.
