export class BadgeSystem {
  private badgeText: string | null = null;
  private badgeTimerMs: number = 0;
  private readonly badgeDurationMs = 1200;

  private bannerText: string | null = null;
  private bannerTimerMs: number = 0;
  private readonly bannerDurationMs = 1500;

  private badgeAdjectives = ['Nice!', 'Smooth!', 'Speedy!', 'Unstoppable!'];
  private lastAwardedMilestone: number = 0;

  checkMilestone(score: number): void {
    if (score >= 500 && Math.floor(score / 500) > Math.floor(this.lastAwardedMilestone / 500)) {
      const milestone = Math.floor(score / 500) * 500;
      this.lastAwardedMilestone = score;
      const adjIdx = (milestone / 500 - 1) % this.badgeAdjectives.length;
      this.showBadge(`${milestone} · ${this.badgeAdjectives[adjIdx]}`);
    }
  }

  showBadge(text: string): void {
    this.badgeText = text;
    this.badgeTimerMs = this.badgeDurationMs;
  }

  showBiomeBanner(biomeName: string): void {
    this.bannerText = biomeName.toUpperCase();
    this.bannerTimerMs = this.bannerDurationMs;
  }

  update(msElapsed: number): void {
    if (this.badgeTimerMs > 0) {
      this.badgeTimerMs -= msElapsed;
      if (this.badgeTimerMs <= 0) this.badgeText = null;
    }

    if (this.bannerTimerMs > 0) {
      this.bannerTimerMs -= msElapsed;
      if (this.bannerTimerMs <= 0) this.bannerText = null;
    }
  }

  draw(ctx: CanvasRenderingContext2D, width: number, isRetro: boolean): void {
    if (isRetro) return;

    ctx.save();
    ctx.textAlign = 'center';

    // 1. Draw Biome Banner (Top Center)
    if (this.bannerText && this.bannerTimerMs > 0) {
      const alpha = Math.min(1, this.bannerTimerMs / 300);
      ctx.globalAlpha = alpha;
      ctx.font = 'bold 12px ui-monospace, SF Mono, Menlo, monospace';
      ctx.fillStyle = '#FFB020';
      ctx.fillText(`— ${this.bannerText} —`, width / 2, 38);
    }

    // 2. Draw 500-pt Badge
    if (this.badgeText && this.badgeTimerMs > 0) {
      const alpha = Math.min(1, this.badgeTimerMs / 300);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.roundRect(width / 2 - 60, 48, 120, 20, 10);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px ui-monospace, SF Mono, Menlo, monospace';
      ctx.fillText(this.badgeText, width / 2, 62);
    }

    ctx.restore();
  }

  reset(): void {
    this.badgeText = null;
    this.badgeTimerMs = 0;
    this.bannerText = null;
    this.bannerTimerMs = 0;
    this.lastAwardedMilestone = 0;
  }
}
