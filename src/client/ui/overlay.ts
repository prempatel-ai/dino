import type { GameState } from '../../core/types';
import type { SpriteAtlas } from '../renderer/sprites';

export class Overlay {
  private overlayEl: HTMLElement | null;
  private muteBtn: HTMLButtonElement | null = null;
  private retroBtn: HTMLButtonElement | null = null;
  private uiBar: HTMLElement | null = null;

  onMuteClick?: () => void;
  onRetroClick?: () => void;

  constructor() {
    this.overlayEl = document.getElementById('overlay');
    this.setupDomButtons();
  }

  private setupDomButtons(): void {
    if (!this.overlayEl) return;

    this.overlayEl.innerHTML = `
      <div class="ui-bar" role="toolbar" aria-label="Game controls">
        <button id="btn-mute" class="ui-btn is-on" aria-label="Toggle sound" title="Toggle SFX (M)">
          <svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
          <span class="btn-text">SFX: ON</span>
        </button>
        <div class="ui-divider"></div>
        <button id="btn-retro" class="ui-btn" aria-label="Toggle retro mode" title="Toggle Visual Mode (R)">
          <svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
          </svg>
          <span class="btn-text">RETRO: OFF</span>
        </button>
      </div>
    `;

    this.uiBar = this.overlayEl.querySelector('.ui-bar');
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
      const icon = isMuted
        ? '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>'
        : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>';
      
      this.muteBtn.innerHTML = `<svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg><span class="btn-text">${isMuted ? 'SFX: OFF' : 'SFX: ON'}</span>`;
      this.muteBtn.classList.toggle('is-off', isMuted);
      this.muteBtn.classList.toggle('is-on', !isMuted);
    }
    if (this.retroBtn) {
      const icon = isRetro
        ? '<rect x="2" y="6" width="20" height="12" rx="2"></rect><circle cx="6" cy="12" r="1.5" fill="currentColor"></circle><circle cx="10" cy="12" r="1.5" fill="currentColor"></circle><line x1="15" y1="9" x2="19" y2="9"></line><line x1="17" y1="13" x2="17" y2="17"></line>'
        : '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>';

      this.retroBtn.innerHTML = `<svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg><span class="btn-text">${isRetro ? 'RETRO: ON' : 'RETRO: OFF'}</span>`;
      this.retroBtn.classList.toggle('is-retro-active', isRetro);
    }
  }

  setNightTheme(isNight: boolean): void {
    if (this.uiBar) {
      this.uiBar.classList.toggle('night', isNight);
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    atlas: SpriteAtlas,
    textColor: string,
    width: number,
  ): void {
    this.setNightTheme(state.isNight);

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
