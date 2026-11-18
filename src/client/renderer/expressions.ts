import type { GameState } from '../../core/types';

export class DinoExpressionSystem {
  hasSunglasses: boolean = false;
  private nearMissTimerMs: number = 0;
  private milestoneTimerMs: number = 0;
  private idleTimeMs: number = 0;

  triggerNearMiss(): void {
    this.nearMissTimerMs = 500;
  }

  triggerMilestone(): void {
    this.milestoneTimerMs = 800;
  }

  update(state: GameState, msElapsed: number): void {
    if (this.nearMissTimerMs > 0) this.nearMissTimerMs -= msElapsed;
    if (this.milestoneTimerMs > 0) this.milestoneTimerMs -= msElapsed;

    if (state.phase === 'READY') {
      this.idleTimeMs += msElapsed;
    } else {
      this.idleTimeMs = 0;
    }
  }

  drawOverlays(ctx: CanvasRenderingContext2D, state: GameState, isRetro: boolean): void {
    if (isRetro) return;

    const trex = state.trex;
    ctx.save();

    // 1. Sunglasses Easter Egg (Konami Code)
    if (this.hasSunglasses) {
      ctx.fillStyle = '#111111';
      const eyeX = trex.ducking ? trex.x + trex.w - 18 : trex.x + 23;
      const eyeY = trex.ducking ? trex.y + 3 : trex.y + 1;
      // Cool black shade frames
      ctx.fillRect(eyeX - 1, eyeY, 10, 4);
      ctx.fillStyle = '#00FFFF';
      ctx.fillRect(eyeX + 1, eyeY + 1, 2, 2);
      ctx.fillRect(eyeX + 6, eyeY + 1, 2, 2);
    }

    // 2. Near Miss Sweat Drop
    if (this.nearMissTimerMs > 0) {
      ctx.fillStyle = '#00E5FF';
      const dropX = trex.x + 18;
      const dropY = trex.y - 4;
      ctx.beginPath();
      ctx.arc(dropX, dropY, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. READY Idle Nap / ZZZ after 10s
    if (state.phase === 'READY' && this.idleTimeMs > 10000) {
      ctx.fillStyle = '#999999';
      ctx.font = 'bold 9px monospace';
      const zOffset = (Math.sin(this.idleTimeMs / 400) * 4);
      ctx.fillText('z', trex.x + 28, trex.y - 4 + zOffset);
      ctx.fillText('Z', trex.x + 36, trex.y - 12 + zOffset);
    }

    ctx.restore();
  }
}
