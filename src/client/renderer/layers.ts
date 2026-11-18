import type { PaletteTokens } from './palette';

export class ParallaxLayers {
  private farOffset: number = 0;
  private midOffset: number = 0;

  update(speed: number, frames: number = 1): void {
    this.farOffset = (this.farOffset + 0.1 * speed * frames) % 600;
    this.midOffset = (this.midOffset + 0.3 * speed * frames) % 600;
  }

  drawSky(ctx: CanvasRenderingContext2D, width: number, height: number, palette: PaletteTokens): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, palette.skyTop);
    gradient.addColorStop(1, palette.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  drawFarDunes(ctx: CanvasRenderingContext2D, width: number, palette: PaletteTokens): void {
    ctx.save();
    ctx.fillStyle = palette.farDunes;

    const offset = this.farOffset;
    ctx.beginPath();
    ctx.moveTo(0, 127);

    // Draw smooth repeating gentle rolling dunes
    for (let x = -offset; x <= width + 600 - offset; x += 300) {
      ctx.quadraticCurveTo(x + 75, 100, x + 150, 115);
      ctx.quadraticCurveTo(x + 225, 105, x + 300, 127);
    }

    ctx.lineTo(width, 127);
    ctx.lineTo(0, 127);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawMidDunes(ctx: CanvasRenderingContext2D, width: number, palette: PaletteTokens): void {
    ctx.save();
    ctx.fillStyle = palette.midDunes;

    const offset = this.midOffset;
    ctx.beginPath();
    ctx.moveTo(0, 127);

    // Draw sharper mid-ground desert dunes
    for (let x = -offset; x <= width + 600 - offset; x += 200) {
      ctx.lineTo(x + 40, 118);
      ctx.lineTo(x + 100, 112);
      ctx.lineTo(x + 160, 122);
      ctx.lineTo(x + 200, 127);
    }

    ctx.lineTo(width, 127);
    ctx.lineTo(0, 127);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  reset(): void {
    this.farOffset = 0;
    this.midOffset = 0;
  }
}
