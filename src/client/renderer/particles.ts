export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  active: boolean;
}

export class ParticleSystem {
  private readonly maxParticles = 100;
  private pool: Particle[] = [];
  private runDustTimer: number = 0;

  constructor() {
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        color: '#8A8A8A',
        alpha: 1,
        decay: 0.05,
        active: false,
      });
    }
  }

  private spawn(
    x: number,
    y: number,
    vx: number,
    vy: number,
    size: number,
    color: string,
    alpha: number = 0.8,
    decay: number = 0.04,
  ): void {
    const p = this.pool.find((item) => !item.active);
    if (!p) return;

    p.x = x;
    p.y = y;
    p.vx = vx;
    p.vy = vy;
    p.size = size;
    p.color = color;
    p.alpha = alpha;
    p.decay = decay;
    p.active = true;
  }

  emitRunDust(x: number, y: number, color: string): void {
    this.runDustTimer++;
    if (this.runDustTimer >= 6) {
      this.runDustTimer = 0;
      this.spawn(
        x + 4,
        y + 44,
        -1.5 - Math.random() * 0.8,
        -0.5 - Math.random() * 0.5,
        2 + Math.random() * 1.5,
        color,
        0.5,
        0.06,
      );
    }
  }

  emitLandingDust(x: number, y: number, color: string): void {
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 6) * i + Math.PI;
      const speed = 1.2 + Math.random() * 1.5;
      this.spawn(
        x + 20,
        y + 44,
        Math.cos(angle) * speed,
        Math.sin(angle) * 0.8,
        2.5 + Math.random() * 2,
        color,
        0.7,
        0.05,
      );
    }
  }

  emitDeathBurst(x: number, y: number, color: string): void {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.spawn(
        x + 22,
        y + 24,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        2 + Math.random() * 2.5,
        color,
        0.9,
        0.035,
      );
    }
  }

  update(frames: number = 1): void {
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.x += p.vx * frames;
      p.y += p.vy * frames;
      p.alpha -= p.decay * frames;

      if (p.alpha <= 0) {
        p.active = false;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.restore();
  }

  reset(): void {
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool[i].active = false;
    }
    this.runDustTimer = 0;
  }
}
