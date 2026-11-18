export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export class PropsSystem {
  private weatherParticles: WeatherParticle[] = [];
  private readonly maxWeatherParticles = 50; // Strictly under 60 particles limit
  private ufoX: number = -100;
  private ufoActive: boolean = false;
  private lizardX: number = -50;
  private lizardActive: boolean = false;

  constructor() {
    for (let i = 0; i < this.maxWeatherParticles; i++) {
      this.weatherParticles.push({
        x: Math.random() * 600,
        y: Math.random() * 125,
        vx: -1 - Math.random() * 2,
        vy: 0.2 + Math.random() * 0.5,
        size: 1.5,
        alpha: 0.4 + Math.random() * 0.4,
        color: '#FFFFFF',
      });
    }
  }

  update(
    weatherType: string,
    speed: number,
    score: number,
    frames: number = 1,
  ): void {
    // 1. Update weather particles
    for (let i = 0; i < this.maxWeatherParticles; i++) {
      const p = this.weatherParticles[i];

      switch (weatherType) {
        case 'sand':
          p.vx = -speed * 0.4 - Math.random() * 1;
          p.vy = (Math.random() - 0.5) * 0.3;
          p.color = '#D2C8AE';
          p.size = 1.5;
          break;

        case 'snow':
          p.vx = -speed * 0.2 - 0.5;
          p.vy = 0.8 + Math.random() * 0.5;
          p.color = '#FFFFFF';
          p.size = 2;
          break;

        case 'embers':
          p.vx = -speed * 0.3 - 0.8;
          p.vy = -0.6 - Math.random() * 0.6;
          p.color = Math.random() > 0.5 ? '#FF4500' : '#FFD700';
          p.size = 1.8;
          break;

        case 'rain':
          p.vx = -speed * 0.5 - 2;
          p.vy = 4 + Math.random() * 2;
          p.color = '#7DF9FF';
          p.size = 2;
          break;

        case 'fireflies':
        case 'cosmic':
        default:
          p.vx = -speed * 0.2 + (Math.random() - 0.5) * 0.5;
          p.vy = (Math.random() - 0.5) * 0.4;
          p.color = '#FFDE59';
          p.size = 1.8;
          break;
      }

      p.x += p.vx * frames;
      p.y += p.vy * frames;

      // Wrap around bounds
      if (p.x < 0) p.x = 600;
      if (p.x > 600) p.x = 0;
      if (p.y < 0) p.y = 125;
      if (p.y > 125) p.y = 0;
    }

    // 2. Ambient lizard scurrying
    if (!this.lizardActive && Math.random() < 0.002) {
      this.lizardActive = true;
      this.lizardX = 620;
    }
    if (this.lizardActive) {
      this.lizardX -= (speed + 2) * frames;
      if (this.lizardX < -40) {
        this.lizardActive = false;
      }
    }

    // 3. Rare UFO appearance (around score multiples of ~3000)
    if (!this.ufoActive && score > 2000 && score % 3000 < 150) {
      this.ufoActive = true;
      this.ufoX = 650;
    }
    if (this.ufoActive) {
      this.ufoX -= 2 * frames;
      if (this.ufoX < -80) {
        this.ufoActive = false;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, isRetro: boolean): void {
    if (isRetro) return;

    ctx.save();

    // Draw Weather Particles
    for (let i = 0; i < this.maxWeatherParticles; i++) {
      const p = this.weatherParticles[i];
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }

    // Draw Ambient Lizard
    if (this.lizardActive) {
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#654321';
      ctx.fillRect(Math.round(this.lizardX), 125, 8, 2);
      ctx.fillRect(Math.round(this.lizardX + 7), 124, 3, 2);
    }

    // Draw Rare UFO in background sky
    if (this.ufoActive) {
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#B0C4DE';
      // UFO body
      ctx.beginPath();
      ctx.ellipse(this.ufoX, 22, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // UFO dome
      ctx.fillStyle = '#00FFFF';
      ctx.beginPath();
      ctx.arc(this.ufoX, 20, 5, Math.PI, 0);
      ctx.fill();
      // Tiny tractor beam
      ctx.fillStyle = '#00FFCC';
      ctx.globalAlpha = 0.15;
      ctx.beginPath();
      ctx.moveTo(this.ufoX - 2, 26);
      ctx.lineTo(this.ufoX + 2, 26);
      ctx.lineTo(this.ufoX + 10, 60);
      ctx.lineTo(this.ufoX - 10, 60);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}
