import type { GameState } from '../../core/types';
import type { Camera } from './camera';
import { SpriteAtlas, type SpriteKey } from './sprites';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  readonly atlas: SpriteAtlas;

  showHitboxes: boolean = false;
  isRetro: boolean = false;

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;
    this.camera = camera;
    this.atlas = new SpriteAtlas();

    this.camera.onResize(() => {
      this.atlas.updateScale(this.camera.scale, this.camera.dpr);
    });
  }

  draw(state: GameState, _alpha: number = 1): void {
    const ctx = this.ctx;
    this.atlas.updateScale(this.camera.scale, this.camera.dpr);

    // Apply scale and DPR
    this.camera.applyTransform(ctx);

    // Color tokens
    const isNight = state.isNight;
    const skyColor = isNight ? '#14161F' : '#F7F7F2';
    const groundColor = isNight ? '#CFCFCF' : '#535353';
    const dinoColor = isNight ? '#E8E8E8' : '#535353';
    const cactusColor = this.isRetro
      ? (isNight ? '#E8E8E8' : '#535353')
      : (isNight ? '#9FBFA2' : '#4F6F52');
    const pteroColor = this.isRetro
      ? (isNight ? '#E8E8E8' : '#535353')
      : (isNight ? '#8FA8CF' : '#5C768D');
    const cloudColor = isNight ? '#2A3045' : '#DDE3EA';

    // 1. Clear background
    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, this.camera.logicalWidth, this.camera.logicalHeight);

    // 2. Draw Moon & Stars at Night
    if (isNight && !this.isRetro) {
      this.drawNightSky(state);
    }

    // 3. Draw Clouds
    for (const cloud of state.clouds) {
      const sprite = this.atlas.getSprite('cloud', cloudColor, 46, 14);
      if (sprite) {
        ctx.drawImage(sprite, cloud.x, cloud.y, 46, 14);
      }
    }

    // 4. Draw Ground
    this.drawGround(state, groundColor);

    // 5. Draw Obstacles
    this.drawObstacles(state, cactusColor, pteroColor);

    // 6. Draw Trex
    this.drawTrex(state, dinoColor);

    // 7. Draw HUD (Scores)
    this.drawHud(state);

    // 8. Draw Overlays
    this.drawOverlays(state, dinoColor);
  }

  private drawNightSky(state: GameState): void {
    const ctx = this.ctx;
    // Stars
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

    // Moon phase
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

    // Ground details
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
        // Fallback placeholder
        ctx.fillStyle = spriteColor;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      }

      // Hitboxes overlay
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
    if (sprite) {
      ctx.drawImage(sprite, trex.x, trex.y, trex.w, trex.h);
    } else {
      ctx.fillStyle = dinoColor;
      ctx.fillRect(trex.x, trex.y, trex.w, trex.h);
    }

    // Hitboxes overlay on Trex
    if (this.showHitboxes) {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 1;
      ctx.strokeRect(trex.x, trex.y, trex.w, trex.h);
    }
  }

  private drawHud(state: GameState): void {
    const ctx = this.ctx;
    ctx.font = 'bold 11px ui-monospace, SF Mono, Menlo, monospace';

    const scoreStr = String(state.score).padStart(5, '0');
    const hiStr = `HI ${String(state.highScore).padStart(5, '0')}`;

    ctx.fillStyle = state.isNight ? '#7A8499' : '#8A8A8A';
    ctx.fillText(hiStr, 480, 20);

    const showScore = !state.isFlashing || state.flashIterations % 2 === 0;
    if (showScore) {
      ctx.fillStyle = state.isNight ? '#E8E8E8' : '#535353';
      ctx.fillText(scoreStr, 550, 20);
    }
  }

  private drawOverlays(state: GameState, textColor: string): void {
    const ctx = this.ctx;

    if (state.phase === 'READY') {
      ctx.fillStyle = textColor;
      ctx.font = '12px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRESS SPACE OR TAP TO PLAY', 300, 75);
      ctx.textAlign = 'start';
    } else if (state.phase === 'CRASHED') {
      ctx.fillStyle = textColor;
      ctx.font = 'bold 16px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('G A M E   O V E R', 300, 65);

      const restartSprite = this.atlas.getSprite('restart', textColor, 36, 32);
      if (restartSprite) {
        ctx.drawImage(restartSprite, 282, 80, 36, 32);
      }

      ctx.textAlign = 'start';
    }
  }
}
