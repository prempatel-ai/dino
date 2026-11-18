import type { GameState } from '../../core/types';
import type { SpriteAtlas } from '../renderer/sprites';

export class Overlay {
  private overlayEl: HTMLElement | null;
  private muteBtn: HTMLButtonElement | null = null;
  private retroBtn: HTMLButtonElement | null = null;

  onMuteClick?: () => void;
  onRetroClick?: () => void;

  constructor() {
    this.overlayEl = document.getElementById('overlay');
    this.setupDomButtons();
  }

  private setupDomButtons(): void {
    if (!this.overlayEl) return;

    this.overlayEl.innerHTML = `
      <div class="ui-bar" style="position: absolute; top: 10px; left: 10px; display: flex; gap: 8px; pointer-events: auto; z-index: 10;">
        <button id="btn-mute" aria-label="Toggle sound" style="cursor: pointer; background: rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.15); border-radius: 16px; padding: 4px 10px; font-family: inherit; font-size: 11px; font-weight: bold; color: inherit;">
          SFX: ON
        </button>
        <button id="btn-retro" aria-label="Toggle retro mode" style="cursor: pointer; background: rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.15); border-radius: 16px; padding: 4px 10px; font-family: inherit; font-size: 11px; font-weight: bold; color: inherit;">
          RETRO
        </button>
      </div>
    `;

    this.muteBtn = document.getElementById('btn-mute') as HTMLButtonElement;
    this.retroBtn = document.getElementById('btn-retro') as HTMLButtonElement;

    this.muteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onMuteClick?.();
    });

    this.retroBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onRetroClick?.();
    });
  }

  updateButtons(isMuted: boolean, isRetro: boolean): void {
    if (this.muteBtn) {
      this.muteBtn.textContent = isMuted ? 'SFX: OFF' : 'SFX: ON';
      this.muteBtn.style.opacity = isMuted ? '0.6' : '1';
    }
    if (this.retroBtn) {
      this.retroBtn.textContent = isRetro ? 'RETRO: ON' : 'RETRO: OFF';
      this.retroBtn.style.opacity = isRetro ? '1' : '0.6';
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    atlas: SpriteAtlas,
    textColor: string,
    width: number,
  ): void {
    ctx.save();

    if (state.phase === 'READY') {
      ctx.fillStyle = textColor;
      ctx.font = '12px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRESS SPACE OR TAP TO PLAY', width / 2, 75);
    } else if (state.phase === 'CRASHED') {
      ctx.fillStyle = textColor;
      ctx.font = 'bold 16px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('G A M E   O V E R', width / 2, 65);

      const restartSprite = atlas.getSprite('restart', textColor, 36, 32);
      if (restartSprite) {
        ctx.drawImage(restartSprite, width / 2 - 18, 80, 36, 32);
      }

      ctx.font = '10px ui-monospace, SF Mono, Menlo, monospace';
      ctx.fillText('TAP OR PRESS SPACE TO RESTART', width / 2, 126);
    }

    ctx.restore();
  }
}
