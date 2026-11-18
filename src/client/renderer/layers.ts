import type { PaletteTokens } from './palette';

export class ParallaxLayers {
  private farOffset: number = 0;
  private midOffset: number = 0;

  update(speed: number, frames: number = 1): void {
    this.farOffset = (this.farOffset + 0.1 * speed * frames) % 600;
    this.midOffset = (this.midOffset + 0.3 * speed * frames) % 600;
  }

  drawSky(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    palette: PaletteTokens,
    nightFade: number = 0,
  ): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, palette.skyTop);
    gradient.addColorStop(0.7, palette.skyBottom);
    gradient.addColorStop(1, palette.ground);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Modern daytime sun: positioned at (390, 26) well clear of HUD, fades out completely as night falls
    const sunAlpha = Math.max(0, 1 - nightFade * 1.5);
    if (sunAlpha > 0.01) {
      ctx.save();
      ctx.globalAlpha = sunAlpha;
      const sunGrad = ctx.createRadialGradient(390, 26, 4, 390, 26, 32);
      sunGrad.addColorStop(0, 'rgba(255, 235, 180, 0.7)');
      sunGrad.addColorStop(0.35, 'rgba(255, 215, 140, 0.25)');
      sunGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(390, 26, 32, 0, Math.PI * 2);
      ctx.fill();

      // Sun core
      ctx.fillStyle = 'rgba(255, 250, 230, 0.9)';
      ctx.beginPath();
      ctx.arc(390, 26, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  drawFarDunes(ctx: CanvasRenderingContext2D, width: number, palette: PaletteTokens, nightFade: number = 0): void {
    ctx.save();
    const offset = this.farOffset;

    // Atmospheric far dune gradient
    const duneGrad = ctx.createLinearGradient(0, 85, 0, 127);
    duneGrad.addColorStop(0, palette.farDunes);
    duneGrad.addColorStop(1, palette.midDunes);
    ctx.fillStyle = duneGrad;

    ctx.beginPath();
    ctx.moveTo(0, 127);

    // Draw smooth repeating gentle rolling dunes with cubic beziers
    for (let x = -offset - 300; x <= width + 600; x += 300) {
      ctx.bezierCurveTo(x + 80, 96, x + 180, 114, x + 300, 127);
    }

    ctx.lineTo(width, 127);
    ctx.lineTo(0, 127);
    ctx.closePath();
    ctx.fill();

    // Subtle edge rim light on far dunes
    const rimAlpha = Math.max(0.02, 0.1 * (1 - nightFade * 0.7));
    ctx.strokeStyle = `rgba(255, 255, 255, ${rimAlpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  drawMidDunes(ctx: CanvasRenderingContext2D, width: number, palette: PaletteTokens, nightFade: number = 0): void {
    ctx.save();
    const offset = this.midOffset;

    // Mid dunes gradient
    const midGrad = ctx.createLinearGradient(0, 105, 0, 127);
    midGrad.addColorStop(0, palette.midDunes);
    midGrad.addColorStop(1, palette.ground);
    ctx.fillStyle = midGrad;

    ctx.beginPath();
    ctx.moveTo(0, 127);

    // Draw sharper layered desert ridges
    for (let x = -offset - 200; x <= width + 400; x += 200) {
      ctx.quadraticCurveTo(x + 50, 112, x + 100, 116);
      ctx.quadraticCurveTo(x + 150, 120, x + 200, 127);
    }

    ctx.lineTo(width, 127);
    ctx.lineTo(0, 127);
    ctx.closePath();
    ctx.fill();

    // Dune ridge line highlight
    const rimAlpha = Math.max(0.02, 0.08 * (1 - nightFade * 0.7));
    ctx.strokeStyle = `rgba(255, 255, 255, ${rimAlpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  reset(): void {
    this.farOffset = 0;
    this.midOffset = 0;
  }
}
