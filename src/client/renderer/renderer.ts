import type { GameState } from '../../core/types';
import type { Camera } from './camera';
import type { AIMode, AIDecision, AIEvaluationStats } from '../../ai/types';
import { SpriteAtlas, type SpriteKey } from './sprites';
import {
  RETRO_DAY_PALETTE,
  RETRO_NIGHT_PALETTE,
  type PaletteTokens,
} from './palette';
import { ParallaxLayers } from './layers';
import { ParticleSystem } from './particles';
import { Hud } from '../ui/hud';
import { Overlay } from '../ui/overlay';
import { BiomeManager } from './biomes';
import { PropsSystem } from './props';
import { DinoExpressionSystem } from './expressions';
import { BadgeSystem } from '../ui/badges';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  readonly atlas: SpriteAtlas;
  readonly layers: ParallaxLayers;
  readonly particles: ParticleSystem;
  readonly hud: Hud;
  readonly overlay: Overlay;
  readonly biomes: BiomeManager;
  readonly props: PropsSystem;
  readonly expressions: DinoExpressionSystem;
  readonly badges: BadgeSystem;

  showHitboxes: boolean = false;
  isRetro: boolean = false;
  reducedEffects: boolean = false;

  // Visual juice state
  private screenShakeTimeMs: number = 0;
  private screenShakeIntensity: number = 0;
  private flashTimeMs: number = 0;
  private squashStretchX: number = 1;
  private squashStretchY: number = 1;

  // Performance auto-degrade watchdog
  private slowFrameCounter: number = 0;
  private autoDegraded: boolean = false;

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;
    this.camera = camera;
    this.atlas = new SpriteAtlas();
    this.layers = new ParallaxLayers();
    this.particles = new ParticleSystem();
    this.hud = new Hud();
    this.overlay = new Overlay();
    this.biomes = new BiomeManager();
    this.props = new PropsSystem();
    this.expressions = new DinoExpressionSystem();
    this.badges = new BadgeSystem();

    this.camera.onResize(() => {
      this.atlas.updateScale(this.camera.scale, this.camera.dpr);
    });
  }

  draw(
    state: GameState,
    _alpha: number = 1,
    aiMode: AIMode = 'OFF',
    decision: AIDecision | null = null,
    stats: AIEvaluationStats | null = null,
  ): void {
    const ctx = this.ctx;
    const frameMs = 1000 / 60;
    this.atlas.updateScale(this.camera.scale, this.camera.dpr);

    // Update biomes & milestones
    const { transitioned } = this.biomes.update(state.biomeIndex, frameMs);
    if (transitioned && !this.isRetro) {
      this.badges.showBiomeBanner(this.biomes.targetBiome.name);
    }
    this.badges.checkMilestone(state.score);
    this.badges.update(frameMs);
    this.expressions.update(state, frameMs);

    // Update props / weather
    if (!this.isRetro && !this.reducedEffects && !this.autoDegraded) {
      this.props.update(this.biomes.currentBiome.weatherType, state.speed, state.score, 1);
    }

    // Process events from current state
    this.processEvents(state);

    // Update visuals & timers
    this.updateVisualEffects(state);

    // Apply camera transform
    this.camera.applyTransform(ctx);

    // Apply Screen Shake if active
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;
    if (this.screenShakeIntensity > 0 && !this.reducedEffects && !this.isRetro) {
      shakeOffsetX = (Math.random() - 0.5) * this.screenShakeIntensity * 2;
      shakeOffsetY = (Math.random() - 0.5) * this.screenShakeIntensity * 2;
      ctx.translate(shakeOffsetX, shakeOffsetY);
    }

    // Determine Palette
    const palette = this.computePalette(state);

    // 1. Draw Sky & Background
    if (this.isRetro) {
      ctx.fillStyle = palette.skyTop;
      ctx.fillRect(0, 0, this.camera.logicalWidth, this.camera.logicalHeight);
    } else {
      this.layers.drawSky(ctx, this.camera.logicalWidth, this.camera.logicalHeight, palette, state.nightFade);

      // Night celestial elements
      if (state.isNight || state.nightFade > 0.05) {
        ctx.save();
        ctx.globalAlpha = state.nightFade;
        this.drawNightSky(state);
        ctx.restore();
      }

      // Parallax dunes
      this.layers.drawFarDunes(ctx, this.camera.logicalWidth, palette, state.nightFade);
    }

    // 2. Draw Clouds
    for (const cloud of state.clouds) {
      ctx.save();
      if (!this.isRetro && (state.isNight || state.nightFade > 0.1)) {
        ctx.globalAlpha = Math.max(0.3, 1 - state.nightFade * 0.55);
      }
      const sprite = this.atlas.getSprite('cloud', '#FFFFFF', 46, 14);
      if (sprite) {
        ctx.drawImage(sprite, cloud.x, cloud.y, 46, 14);
      }
      ctx.restore();
    }

    // Mid dunes
    if (!this.isRetro) {
      this.layers.drawMidDunes(ctx, this.camera.logicalWidth, palette, state.nightFade);
      // Ambient Props & Weather
      if (!this.reducedEffects && !this.autoDegraded) {
        this.props.draw(ctx, this.isRetro);
      }
    }

    // 3. Draw Ground
    this.drawGround(state, palette.ground);

    // 4. Draw Particles
    if (!this.isRetro && !this.reducedEffects && !this.autoDegraded) {
      this.particles.draw(ctx);
    }

    // Modern Speed Lines
    this.drawSpeedLines(state);

    // 5. Draw Obstacles
    this.drawObstacles(state, palette.cactus, palette.dinoBody);

    // 6. Draw Trex & Expressions
    this.drawTrex(state, palette.dinoBody);
    this.expressions.drawOverlays(ctx, state, this.isRetro);

    // Subtle Modern Cinematic Vignette
    this.drawVignette();

    // 7. Draw HUD (Scores)
    this.hud.draw(ctx, state, palette);

    // 8. Draw Badges & Overlays
    this.badges.draw(ctx, this.camera.logicalWidth, this.isRetro);
    this.overlay.draw(
      ctx,
      state,
      this.atlas,
      palette.dinoBody,
      this.camera.logicalWidth,
      aiMode,
      decision,
      stats,
    );

    // 9. Death White Flash
    if (this.flashTimeMs > 0 && !this.reducedEffects && !this.isRetro) {
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = Math.min(1, this.flashTimeMs / 80);
      ctx.fillRect(0, 0, this.camera.logicalWidth, this.camera.logicalHeight);
      ctx.restore();
    }
  }

  recordFrameDuration(durationMs: number): void {
    if (durationMs > 16.6) {
      this.slowFrameCounter++;
      if (this.slowFrameCounter > 120) {
        // More than 2s of slow frames
        this.autoDegraded = true;
      }
    } else {
      this.slowFrameCounter = Math.max(0, this.slowFrameCounter - 1);
    }
  }

  private computePalette(state: GameState): PaletteTokens {
    if (this.isRetro) {
      return state.isNight ? RETRO_NIGHT_PALETTE : RETRO_DAY_PALETTE;
    }
    return this.biomes.getPalette(state.isNight, state.nightFade);
  }

  private processEvents(state: GameState): void {
    for (const event of state.events) {
      if (event === 'jump') {
        this.squashStretchX = 0.92;
        this.squashStretchY = 1.08;
      } else if (event === 'land') {
        this.squashStretchX = 1.08;
        this.squashStretchY = 0.92;
        if (!this.isRetro && !this.reducedEffects) {
          this.particles.emitLandingDust(state.trex.x, state.trex.y, '#8A8A8A');
        }
      } else if (event === 'crash') {
        if (!this.reducedEffects && !this.isRetro) {
          this.screenShakeTimeMs = 300;
          this.screenShakeIntensity = 6;
          this.flashTimeMs = 80;
          this.particles.emitDeathBurst(state.trex.x, state.trex.y, '#535353');
        }
      } else if (event === 'nearMiss') {
        this.expressions.triggerNearMiss();
      } else if (event === 'milestone') {
        this.expressions.triggerMilestone();
      }
    }

    if (
      state.phase === 'RUNNING' &&
      !state.trex.jumping &&
      !this.isRetro &&
      !this.reducedEffects &&
      !this.autoDegraded
    ) {
      this.particles.emitRunDust(state.trex.x, state.trex.y, '#8A8A8A');
    }
  }

  private updateVisualEffects(state: GameState): void {
    const frameMs = 1000 / 60;

    if (this.screenShakeTimeMs > 0) {
      this.screenShakeTimeMs -= frameMs;
      this.screenShakeIntensity = Math.max(0, (this.screenShakeTimeMs / 300) * 6);
    }

    if (this.flashTimeMs > 0) {
      this.flashTimeMs -= frameMs;
    }

    this.squashStretchX += (1.0 - this.squashStretchX) * 0.15;
    this.squashStretchY += (1.0 - this.squashStretchY) * 0.15;

    if (state.phase === 'RUNNING' || state.phase === 'INTRO') {
      this.layers.update(state.speed, 1);
    }
    this.particles.update(1);
  }

  private drawNightSky(state: GameState): void {
    const ctx = this.ctx;
    const starColor = '#FFFFFF';
    const starSprite = this.atlas.getSprite('star', starColor, 9, 9);

    // Twinkling celestial stars
    const starCoords: [number, number, boolean][] = [
      [35, 20, false],
      [75, 14, true],
      [115, 32, false],
      [160, 18, true],
      [210, 38, false],
      [255, 15, true],
      [395, 22, true],
      [435, 36, false],
      [515, 16, true],
      [570, 34, false],
    ];

    for (const [sx, sy, isSparkle] of starCoords) {
      if (isSparkle && starSprite) {
        ctx.drawImage(starSprite, sx - 4, sy - 4, 8, 8);
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Modern Celestial Moon: centered in tranquil sky at x=330, y=24, well clear of HUD (x=480) & Dino (x=50..94)
    const moonKey = `moon-${state.moonPhase % 7}` as SpriteKey;
    const moonSprite = this.atlas.getSprite(moonKey, '#F8FAFC', 32, 32);

    // Ethereal lunar aura
    ctx.save();
    const aura = ctx.createRadialGradient(330, 24, 6, 330, 24, 34);
    aura.addColorStop(0, 'rgba(240, 248, 255, 0.35)');
    aura.addColorStop(0.4, 'rgba(186, 230, 253, 0.12)');
    aura.addColorStop(1, 'rgba(186, 230, 253, 0)');
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(330, 24, 34, 0, Math.PI * 2);
    ctx.fill();

    if (moonSprite) {
      ctx.drawImage(moonSprite, 314, 8, 32, 32);
    }
    ctx.restore();
  }

  private drawGround(state: GameState, groundColor: string): void {
    const ctx = this.ctx;
    const width = this.camera.logicalWidth;

    if (this.isRetro) {
      ctx.strokeStyle = groundColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 127.5);
      ctx.lineTo(width, 127.5);
      ctx.stroke();

      ctx.fillStyle = groundColor;
      const groundOffset = state.groundOffset % 40;
      for (let x = -groundOffset; x < width; x += 40) {
        ctx.fillRect(x, 130, 4, 1.5);
        ctx.fillRect(x + 18, 134, 6, 1.5);
      }
      return;
    }

    // Modern mode: Layered textured terrain floor
    ctx.save();
    const isNight = state.isNight || state.nightFade > 0.25;

    // 1. Bedrock base fill below ground line: rich deep terrain
    const terrainGrad = ctx.createLinearGradient(0, 127, 0, 150);
    const topGround = isNight ? '#221930' : groundColor;
    const bottomGround = isNight ? '#100B17' : '#0F172A';
    terrainGrad.addColorStop(0, topGround);
    terrainGrad.addColorStop(1, bottomGround);
    ctx.fillStyle = terrainGrad;
    ctx.fillRect(0, 127, width, 23);

    // 2. Horizon line with soft ambient edge
    ctx.strokeStyle = isNight ? '#5A4A70' : groundColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 127.5);
    ctx.lineTo(width, 127.5);
    ctx.stroke();

    // 3. Ground details: smooth desert pebbles & sand ripple accents
    const groundOffset = state.groundOffset % 60;
    const pebbleLight = isNight ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.22)';
    const pebbleDark = isNight ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.28)';
    for (let x = -groundOffset; x < width + 60; x += 60) {
      // Pebble 1
      ctx.fillStyle = pebbleLight;
      ctx.beginPath();
      ctx.ellipse(x + 14, 131, 2, 1, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pebble 2
      ctx.fillStyle = pebbleDark;
      ctx.beginPath();
      ctx.ellipse(x + 38, 134, 2.5, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sand ripple
      ctx.fillStyle = isNight ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(x + 22, 138, 8, 1);
      ctx.fillRect(x + 46, 142, 6, 1);
    }
    ctx.restore();
  }

  private drawDropShadow(centerX: number, groundY: number, radiusX: number, radiusY: number, opacity: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
    ctx.beginPath();
    ctx.ellipse(centerX, groundY, Math.max(1, radiusX), Math.max(0.5, radiusY), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawObstacles(state: GameState, cactusColor: string, pteroColor: string): void {
    const ctx = this.ctx;
    const biome = this.biomes.currentBiome.id;

    // Modern dynamic drop shadows for obstacles
    if (!this.isRetro) {
      for (const obs of state.obstacles) {
        if (obs.type === 'CACTUS_SMALL' || obs.type === 'CACTUS_LARGE') {
          this.drawDropShadow(obs.x + obs.w / 2, 139, obs.w * 0.42, 2.5, 0.22);
        } else {
          // Pterodactyl aerial shadow cast on ground
          const heightAboveGround = Math.max(0, 140 - (obs.y + obs.h));
          const shadowScale = Math.max(0.3, 1 - heightAboveGround / 100);
          const shadowOpacity = Math.max(0.04, 0.16 * shadowScale);
          this.drawDropShadow(obs.x + obs.w / 2, 139, (obs.w * 0.45) * shadowScale, 2 * shadowScale, shadowOpacity);
        }
      }
    }

    for (const obs of state.obstacles) {
      let spriteKey: SpriteKey;
      let spriteColor: string;

      if (obs.type === 'CACTUS_SMALL') {
        spriteColor = cactusColor;
        if (!this.isRetro && obs.size === 1) {
          if (biome === 'canyon') spriteKey = 'canyon-small';
          else if (biome === 'tundra') spriteKey = 'tundra-small';
          else if (biome === 'volcanic') spriteKey = 'volcanic-small';
          else if (biome === 'neon') spriteKey = 'neon-small';
          else spriteKey = 'cactus-small-1';
        } else {
          spriteKey = obs.size === 3
            ? 'cactus-small-3'
            : obs.size === 2
            ? 'cactus-small-2'
            : 'cactus-small-1';
        }
      } else if (obs.type === 'CACTUS_LARGE') {
        spriteColor = cactusColor;
        if (!this.isRetro && obs.size === 1) {
          if (biome === 'canyon') spriteKey = 'canyon-large';
          else if (biome === 'tundra') spriteKey = 'tundra-large';
          else if (biome === 'volcanic') spriteKey = 'volcanic-large';
          else if (biome === 'neon') spriteKey = 'neon-large';
          else spriteKey = 'cactus-large-1';
        } else {
          spriteKey = obs.size === 3
            ? 'cactus-large-3'
            : obs.size === 2
            ? 'cactus-large-2'
            : 'cactus-large-1';
        }
      } else {
        spriteColor = pteroColor;
        spriteKey = obs.frame === 1 ? 'ptero-2' : 'ptero-1';
      }

      const sprite = this.atlas.getSprite(spriteKey, spriteColor, obs.w, obs.h);
      if (sprite) {
        ctx.drawImage(sprite, obs.x, obs.y, obs.w, obs.h);
      } else {
        ctx.fillStyle = spriteColor;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      }

      if (this.showHitboxes) {
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        for (const box of obs.collisionBoxes) {
          ctx.strokeRect(obs.x + box.x, obs.y + box.y, box.w, box.h);
        }
      }
    }
  }

  private drawTrex(state: GameState, dinoColor: string): void {
    const ctx = this.ctx;
    const trex = state.trex;

    // Modern dynamic drop shadow on the ground for Trex
    if (!this.isRetro) {
      const heightDelta = Math.max(0, 93 - trex.y);
      const shadowScale = Math.max(0.32, 1 - heightDelta / 110);
      const shadowOpacity = Math.max(0.04, 0.24 * shadowScale);
      this.drawDropShadow(trex.x + trex.w / 2, 139, (trex.w * 0.42) * shadowScale, 2.5 * shadowScale, shadowOpacity);
    }

    let spriteKey: SpriteKey = 'trex-idle';

    if (state.phase === 'CRASHED') {
      spriteKey = 'trex-dead';
    } else if (trex.ducking) {
      spriteKey = trex.frame === 1 ? 'trex-duck2' : 'trex-duck1';
    } else if (trex.jumping) {
      spriteKey = 'trex-run1';
    } else if (state.phase === 'RUNNING' || state.phase === 'INTRO') {
      spriteKey = trex.frame === 1 ? 'trex-run2' : 'trex-run1';
    } else {
      spriteKey = 'trex-idle';
    }

    const sprite = this.atlas.getSprite(spriteKey, dinoColor, trex.w, trex.h);

    ctx.save();
    if (!this.isRetro && !this.reducedEffects && (this.squashStretchX !== 1 || this.squashStretchY !== 1)) {
      ctx.translate(trex.x + trex.w / 2, trex.y + trex.h);
      ctx.scale(this.squashStretchX, this.squashStretchY);
      ctx.translate(-(trex.x + trex.w / 2), -(trex.y + trex.h));
    }

    if (sprite) {
      ctx.drawImage(sprite, trex.x, trex.y, trex.w, trex.h);
    } else {
      ctx.fillStyle = dinoColor;
      ctx.fillRect(trex.x, trex.y, trex.w, trex.h);
    }
    ctx.restore();

    if (this.showHitboxes) {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 1;
      ctx.strokeRect(trex.x, trex.y, trex.w, trex.h);
    }
  }

  private drawSpeedLines(state: GameState): void {
    if (this.isRetro || state.speed < 9.5 || state.phase !== 'RUNNING') return;
    const ctx = this.ctx;
    ctx.save();
    const alpha = Math.min(0.2, (state.speed - 9.5) * 0.05);
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 1;
    const time = (state.distance * 8) % 600;

    const lines = [
      { y: 35, len: 45, offset: (time * 1.5) % 600 },
      { y: 60, len: 65, offset: (time * 1.8 + 200) % 600 },
      { y: 85, len: 35, offset: (time * 1.2 + 400) % 600 },
      { y: 110, len: 50, offset: (time * 2.0 + 100) % 600 },
    ];

    for (const l of lines) {
      const x = 600 - l.offset;
      ctx.beginPath();
      ctx.moveTo(x, l.y);
      ctx.lineTo(x + l.len, l.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawVignette(): void {
    if (this.isRetro || this.reducedEffects) return;
    const ctx = this.ctx;
    ctx.save();
    const w = this.camera.logicalWidth;
    const h = this.camera.logicalHeight;
    const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.7, w / 2, h / 2, w * 0.65);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
