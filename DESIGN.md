# DESIGN.md — Creative Direction

## Golden rule
**Creativity is visual and audio only.** Physics, speed, spawn logic, hitboxes, score formula, world size = untouched (GAME_SPEC.md). Every skin, effect and biome must fit the original obstacle footprint (cactus 17x35 / 25x50, ptero 46x40) so hitboxes stay valid.

## 1. Concept
**"Dino Run: Endless Desert"** — the original joke (a dino alone in a desert), told as a living world. Calm, minimal, a bit funny. Not cluttered. The dino is the star.

Tone: warm minimalism. Flat shapes + soft shading + light grain. Original silhouette always readable at a glance.

## 2. Character: the Dino
- Same pose and proportions as original. Dark charcoal body, lighter belly patch, small orange eye-glint, tiny cheek blush.
- **Expressions (face swaps, visual only):**
  - idle: blinks, occasional look-around
  - running: focused eye
  - airborne: wide eye
  - near miss (obstacle passes within 6 px): eyes squint, sweat drop
  - crash: X eyes, tongue out, little stars orbit head
  - milestone: quick happy eye
- **Personality idles on READY screen** (random every ~4 s): yawn, tail wag, scratch head, tiny stretch.
- **Trail:** faint dust puffs at feet; at speed > 11 add motion streaks behind the dino.
- **Landing:** squash 8%, dust ring.
- **Death:** 80 ms white flash → dino tips back, dust burst, screen shake 6 px decaying 300 ms, brief slow-mo look (visual only, sim not slowed).

## 3. Biomes (visual themes cycling by score, zero gameplay effect)
Biome changes every 700 score, together with the existing day/night toggle. Order loops. Transition = 3 s crossfade of palette, parallax layers and props.

| # | Biome | Day mood | Night mood | Prop / weather |
|---|---|---|---|---|
| 1 | Classic Desert | beige dunes, pale sky | indigo sky, moon, stars | tumbleweed, drifting dust |
| 2 | Canyon Sunset | orange mesas, red sky | purple dusk, fireflies | hot-air balloon far away |
| 3 | Oasis | palm trees, pond reflections | glowing water, fireflies | dragonflies, ripples |
| 4 | Frozen Tundra | ice dunes, pale blue sky | aurora borealis ribbons | snowfall, breath puffs |
| 5 | Volcanic Badlands | ash sky, dark rock | lava glow on horizon | ember sparks, distant eruption |
| 6 | Neon Future | synthwave grid ground, sun disc | neon city skyline | light trails, glitch flicker |
| 7 | Space Dunes | moon-dust ground, huge planet | starfield, shooting stars | floating rocks, low-gravity looking dust |

First biome = original look (also Retro mode base). Retro mode disables all biomes.

### Obstacle skins per biome (same footprint, same hitboxes)
| Biome | Small cactus skin | Large cactus skin | Ptero skin |
|---|---|---|---|
| Desert | cactus | tall cactus | pterodactyl |
| Canyon | cactus with flower | saguaro | pterodactyl, warm tint |
| Oasis | reed bush | palm stump | dragonfly-winged ptero |
| Tundra | ice crystal | ice spire | frost ptero |
| Volcanic | charred cactus | obsidian spike | ash ptero with ember wings |
| Neon | neon cactus outline | neon pillar | holo ptero |
| Space | crystal | crystal cluster | satellite-ptero |

Rule: skin silhouette must stay inside the original collision-box area and read as "ground obstacle" vs "flying obstacle" instantly. No skin may look smaller or larger than its hitbox.

## 4. Environment details
- **Parallax:** far layer, mid layer, ground, foreground grass/pebbles (foreground is non-interactive and never covers obstacles).
- **Ambient life:** lizard darts across far ground, birds in distance, rare UFO (1 per ~3000 score, background only, tiny beam, dino looks up).
- **Weather (visual only):** light wind-blown sand, rain streaks in Oasis night, snow in Tundra, embers in Volcanic. Max 60 particles.
- **Lighting:** soft gradient sky, subtle vignette, glow around moon/neon, rim light on dino at night.
- **Grain:** very light film grain overlay (opacity 4%), off in Retro mode.

## 5. Moments and juice
| Trigger | Effect |
|---|---|
| Start | Dino runs in, title letters slide out, ground draws in |
| Every 100 pts | Score flash + confetti sparkle puff at score + chime |
| Every 500 pts | Small badge pops: "500 · Nice!" (fades 1.2 s) |
| Biome change | Banner with biome name slides in/out (1.5 s) |
| Near miss | Sweat drop + tiny "whoosh" |
| New high score | Gold score color, sparkle ring, fanfare (3 notes) |
| Crash | Flash, shake, X eyes, game over |
| Idle 10 s on READY | Dino naps, "z z z" floats |

Badge texts (rotate): Nice!, Smooth!, Speedy!, Unstoppable!. Never block gameplay area; place at top center, small.

## 6. UI design
- Font: monospace-style pixel-friendly display font via system stack (`ui-monospace, "SF Mono", Menlo, Consolas, monospace`). No web font downloads.
- Score: large, tabular digits, top right. HI score dimmer, left of it.
- Game over: "G A M E  O V E R", restart icon with idle spin/pulse, final score card slides up (score, HI, best streak).
- Buttons (mute, settings): round, 36 px, subtle shadow, thumb reachable on mobile.
- Settings panel: Mute, Retro mode, Reduced effects, Show hitboxes (debug).
- Colors follow ASSETS.md palette per biome (see section 7).

## 7. Biome palettes (day / night)
| Biome | Sky | Far | Mid | Ground | Accent |
|---|---|---|---|---|---|
| Desert | #F7F7F2 / #14161F | #E3DCCB / #1B1F2C | #D2C8AE / #252B3B | #535353 / #CFCFCF | #FFB020 |
| Canyon | #FFD9A8 / #2A1B3D | #E88B5A / #3B2550 | #C55A3C / #4A2E5E | #5A3A32 / #D8B8C8 | #FF6B35 |
| Oasis | #DFF3EA / #0E2A2F | #A8D5BA / #14383C | #6FB38A / #1B4A4A | #4A5A4F / #BFE3D2 | #2EC4B6 |
| Tundra | #E8F4FF / #0B1330 | #C9E3F5 / #12204A | #A4CBE6 / #1B3563 | #55677A / #DDEBFA | #7DF9FF |
| Volcanic | #8C7B75 / #1A0F10 | #5A4A47 / #2A1514 | #3D302E / #3A1C19 | #2B2322 / #E0B8A8 | #FF4500 |
| Neon | #1B1033 / #07040F | #3A1B6E / #120A2A | #5B2A9B / #1E0F45 | #2A1B4D / #00F0FF | #FF2E97 |
| Space | #0B0F2A / #04050F | #1C2350 / #0A0D26 | #2E3A7A / #12173A | #8A8FB0 / #D7DAF0 | #B388FF |

Dino stays dark charcoal in light biomes and light gray in dark ones (always contrasts with ground). Obstacle colors must contrast with ground and sky in every biome.

## 8. Readability rules (non-negotiable)
1. Dino and obstacles always have highest contrast in the frame.
2. No effect or prop overlaps the play lane (dino x=50..110, y=ground area) except dust and the dino's own trail.
3. Obstacle appears clearly at least 0.5 s before reaching the dino at max speed; no pop-in on the right edge, fade-slide only if it does not shorten visibility.
4. Background motion never faster than ground speed.
5. Flash effects ≤ 3 per second. Provide **Reduced effects** toggle: disables shake, flash, grain, weather, confetti, slow-mo look.

## 9. Sound design (WebAudio synth)
Base sounds in ASSETS.md. Added:
- Landing: soft thud (low sine 120→60 Hz, 60 ms).
- Near miss: short filtered-noise whoosh (80 ms).
- Biome change: soft pad swell (2 detuned triangle oscs, 1.2 s).
- High score: 3-note rising fanfare.
- Ambient bed per biome: very quiet filtered noise (wind, crickets via oscillator pulses, snow hush). Volume ≤ 8%. Off when muted.
- Optional chiptune loop is **out of scope** unless all tasks are done.

## 10. Motion principles
- Ease out for appear, ease in for exit, 150–300 ms.
- Squash/stretch only on dino, max 8%.
- Camera never moves (shake only on crash).
- 60 FPS target; effects degrade first (particles → weather → grain) if frame time > 16 ms for 2 s.

## 11. Easter eggs (visual only)
- Konami code → dino wears sunglasses for the run.
- Score 1337 → brief "leet" glitch flicker.
- 3 AM local time → moon is bigger and winks.
- Dino sneezes in Tundra once per run.
- Tap/click dino on READY screen → jump animation + roar sound (no game start).

## 12. Design acceptance
- Original look available via Retro mode, 1:1 silhouette match.
- All 7 biomes implemented with skins, palette, props.
- Hitbox debug overlay (H) shows every skin fits its box in every biome.
- Reduced effects mode works and persists.
- Same seed + inputs → identical core state in every biome and with effects on/off.
- No readability rule violated (manual check per biome, logged in PROGRESS.md).
