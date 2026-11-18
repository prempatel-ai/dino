import type { GameState } from '../../core/types';
import type { Camera } from './camera';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;
  showHitboxes: boolean = false;

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;
    this.camera = camera;
  }

  draw(state: GameState, _alpha: number = 1): void {
    const ctx = this.ctx;

    // Apply scale and DPR
    this.camera.applyTransform(ctx);

    // 1. Clear background (Day or Night)
    const bgColor = state.isNight ? '#14161F' : '#F7F7F2';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, this.camera.logicalWidth, this.camera.logicalHeight);

    // 2. Draw Clouds
    ctx.fillStyle = state.isNight ? '#2A3045' : '#DDE3EA';
    for (const cloud of state.clouds) {
      ctx.fillRect(cloud.x, cloud.y, 46, 14);
    }

    // 3. Draw Ground Line
    ctx.strokeStyle = state.isNight ? '#CFCFCF' : '#535353';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 127.5);
    ctx.lineTo(this.camera.logicalWidth, 127.5);
    ctx.stroke();

    // Ground pebbles / ticks
    ctx.fillStyle = state.isNight ? '#6E7688' : '#8A8A8A';
    const groundOffset = state.groundOffset % 40;
    for (let x = -groundOffset; x < this.camera.logicalWidth; x += 40) {
      ctx.fillRect(x, 130, 4, 2);
      ctx.fillRect(x + 18, 134, 6, 2);
    }

    // 4. Draw Obstacles
    for (const obs of state.obstacles) {
      if (obs.type === 'PTERODACTYL') {
        ctx.fillStyle = state.isNight ? '#8FA8CF' : '#5C768D';
      } else {
        ctx.fillStyle = state.isNight ? '#9FBFA2' : '#4F6F52';
      }
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

      // Hitboxes debug overlay
      if (this.showHitboxes) {
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 1;
        for (const box of obs.collisionBoxes) {
          ctx.strokeRect(obs.x + box.x, obs.y + box.y, box.w, box.h);
        }
      }
    }

    // 5. Draw Trex
    ctx.fillStyle = state.isNight ? '#E8E8E8' : '#535353';
    ctx.fillRect(state.trex.x, state.trex.y, state.trex.w, state.trex.h);

    // Trex eye glint
    ctx.fillStyle = '#FF9800';
    if (state.trex.ducking) {
      ctx.fillRect(state.trex.x + state.trex.w - 12, state.trex.y + 4, 3, 3);
    } else {
      ctx.fillRect(state.trex.x + state.trex.w - 12, state.trex.y + 6, 3, 3);
    }

    // Hitboxes debug overlay on Trex
    if (this.showHitboxes) {
      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 1;
      ctx.strokeRect(state.trex.x, state.trex.y, state.trex.w, state.trex.h);
    }

    // 6. Draw HUD (Score & HI Score)
    ctx.font = 'bold 11px ui-monospace, SF Mono, Menlo, monospace';
    const scoreStr = String(state.score).padStart(5, '0');
    const hiStr = `HI ${String(state.highScore).padStart(5, '0')}`;

    ctx.fillStyle = state.isNight ? '#7A8499' : '#8A8A8A';
    ctx.fillText(hiStr, 480, 20);

    // Milestone flash: hide score every alternate flash iteration
    const showScore = !state.isFlashing || state.flashIterations % 2 === 0;
    if (showScore) {
      ctx.fillStyle = state.isNight ? '#E8E8E8' : '#535353';
      ctx.fillText(scoreStr, 550, 20);
    }

    // 7. Overlay / Phase Prompts
    if (state.phase === 'READY') {
      ctx.fillStyle = state.isNight ? '#E8E8E8' : '#535353';
      ctx.font = '12px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRESS SPACE OR TAP TO PLAY', 300, 75);
      ctx.textAlign = 'start';
    } else if (state.phase === 'CRASHED') {
      ctx.fillStyle = state.isNight ? '#E8E8E8' : '#535353';
      ctx.font = 'bold 16px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('G A M E   O V E R', 300, 65);

      ctx.font = '11px ui-monospace, SF Mono, Menlo, monospace';
      ctx.fillText('PRESS SPACE TO RESTART', 300, 90);
      ctx.textAlign = 'start';
    }
  }
}
