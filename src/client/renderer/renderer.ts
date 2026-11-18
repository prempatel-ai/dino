import type { GameState } from '../../core/types';
import type { Camera } from './camera';
import { SpriteAtlas, type SpriteKey } from './sprites';
import {
  DAY_PALETTE,
  NIGHT_PALETTE,
  RETRO_DAY_PALETTE,
  RETRO_NIGHT_PALETTE,
  interpolatePalette,
  type PaletteTokens,
} from './palette';
import { ParallaxLayers } from './layers';
import { ParticleSystem } from './particles';
import { Hud } from '../ui/hud';
import { Overlay } from '../ui/overlay';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  readonly atlas: SpriteAtlas;
  readonly layers: ParallaxLayers;
  readonly particles: ParticleSystem;
  readonly hud: Hud;
  readonly overlay: Overlay;

  showHitboxes: boolean = false;
  isRetro: boolean = false;
  reducedEffects: boolean = false;

  // Juice & Visual effect state
  private screenShakeTimeMs: number = 0;
  private screenShakeIntensity: number = 0;
  private flashTimeMs: number = 0;
  private squashStretchX: number = 1;
  private squashStretchY: number = 1;

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

    this.camera.onResize(() => {
      this.atlas.updateScale(this.camera.scale, this.camera.dpr);
    });
  }

  draw(state: GameState, _alpha: number = 1): void {
    const ctx = this.ctx;
    this.atlas.updateScale(this.camera.scale, this.camera.dpr);

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
      this.layers.drawSky(ctx, this.camera.logicalWidth, this.camera.logicalHeight, palette);

      // Night celestial elements
      if (state.isNight || state.nightFade > 0.05) {
        ctx.save();
        ctx.globalAlpha = state.nightFade;
        this.drawNightSky(state);
        ctx.restore();
      }

      // Parallax dunes
      this.layers.drawFarDunes(ctx, this.camera.logicalWidth, palette);
    }

    // 2. Draw Clouds
    for (const cloud of state.clouds) {
      const sprite = this.atlas.getSprite('cloud', palette.skyBottom, 46, 14);
      if (sprite) {
        ctx.drawImage(sprite, cloud.x, cloud.y, 46, 14);
      }
    }

    // Mid dunes
    if (!this.isRetro) {
      this.layers.drawMidDunes(ctx, this.camera.logicalWidth, palette);
    }

    // 3. Draw Ground
    this.drawGround(state, palette.ground);

    // 4. Draw Particles
    if (!this.isRetro && !this.reducedEffects) {
      this.particles.draw(ctx);
    }

    // 5. Draw Obstacles
    this.drawObstacles(state, palette.cactus, palette.dinoBody);

    // 6. Draw Trex
    this.drawTrex(state, palette.dinoBody);

    // 7. Draw HUD (Scores)
    this.hud.draw(ctx, state, palette);

    // 8. Draw Overlays
    this.overlay.draw(ctx, state, this.atlas, palette.dinoBody, this.camera.logicalWidth);

    // 9. Death White Flash
    if (this.flashTimeMs > 0 && !this.reducedEffects && !this.isRetro) {
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = Math.min(1, this.flashTimeMs / 80);
      ctx.fillRect(0, 0, this.camera.logicalWidth, this.camera.logicalHeight);
      ctx.restore();
    }
  }

  private computePalette(state: GameState): PaletteTokens {
    if (this.isRetro) {
      return state.isNight ? RETRO_NIGHT_PALETTE : RETRO_DAY_PALETTE;
    }
    return interpolatePalette(DAY_PALETTE, NIGHT_PALETTE, state.nightFade);
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
      }
    }

    if (
      state.phase === 'RUNNING' &&
      !state.trex.jumping &&
      !this.isRetro &&
      !this.reducedEffects
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
    const starColor = '#E8E8E8';
    const starSprite = this.atlas.getSprite('star', starColor, 9, 9);
    const starCoords = [
      [80, 25],
      [160, 45],
      [240, 20],
      [320, 50],
      [420, 30],
      [510, 40],
      [570, 22],
    ];

    if (starSprite) {
      for (const [sx, sy] of starCoords) {
        ctx.drawImage(starSprite, sx, sy, 9, 9);
      }
    }

    const moonKey = `moon-${state.moonPhase % 7}` as SpriteKey;
    const moonSprite = this.atlas.getSprite(moonKey, '#F0F0E6', 20, 40);
    if (moonSprite) {
      ctx.drawImage(moonSprite, 460, 20, 20, 40);
    }
  }

  private drawGround(state: GameState, groundColor: string): void {
    const ctx = this.ctx;
    ctx.strokeStyle = groundColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 127.5);
    ctx.lineTo(this.camera.logicalWidth, 127.5);
    ctx.stroke();

    ctx.fillStyle = groundColor;
    const groundOffset = state.groundOffset % 40;
    for (let x = -groundOffset; x < this.camera.logicalWidth; x += 40) {
      ctx.fillRect(x, 130, 4, 1.5);
      ctx.fillRect(x + 18, 134, 6, 1.5);
    }
  }

  private drawObstacles(state: GameState, cactusColor: string, pteroColor: string): void {
    const ctx = this.ctx;

    for (const obs of state.obstacles) {
      let spriteKey: SpriteKey;
      let spriteColor: string;

      if (obs.type === 'CACTUS_SMALL') {
        spriteColor = cactusColor;
        spriteKey = obs.size === 3
          ? 'cactus-small-3'
          : obs.size === 2
          ? 'cactus-small-2'
          : 'cactus-small-1';
      } else if (obs.type === 'CACTUS_LARGE') {
        spriteColor = cactusColor;
        spriteKey = obs.size === 3
          ? 'cactus-large-3'
          : obs.size === 2
          ? 'cactus-large-2'
          : 'cactus-large-1';
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
}
