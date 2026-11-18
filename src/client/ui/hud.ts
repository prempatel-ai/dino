import type { GameState } from '../../core/types';
import type { PaletteTokens } from '../renderer/palette';

export class Hud {
  draw(ctx: CanvasRenderingContext2D, state: GameState, palette: PaletteTokens): void {
    ctx.save();
    ctx.font = 'bold 11px ui-monospace, SF Mono, Menlo, Monaco, Consolas, monospace';

    const scoreStr = String(state.score).padStart(5, '0');
    const hiStr = `HI ${String(state.highScore).padStart(5, '0')}`;

    // HI Score display (dimmer tone)
    ctx.fillStyle = state.isNight ? '#7A8499' : '#8A8A8A';
    ctx.fillText(hiStr, 480, 20);

    // Milestone flashing logic: 3 toggles of 250ms
    const isVisible = !state.isFlashing || state.flashIterations % 2 === 0;
    if (isVisible) {
      ctx.fillStyle = state.isFlashing ? palette.accent : palette.dinoBody;
      ctx.fillText(scoreStr, 550, 20);
    }

    ctx.restore();
  }
}
