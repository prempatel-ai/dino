import type { GameState } from '../../core/types';
import type { SpriteAtlas } from '../renderer/sprites';
import type { AIMode, AIDecision, AIEvaluationStats } from '../../ai/types';

export class Overlay {
  private overlayEl: HTMLElement | null;
  private muteBtn: HTMLButtonElement | null = null;
  private retroBtn: HTMLButtonElement | null = null;
  private aiBtn: HTMLButtonElement | null = null;
  private themeBtn: HTMLButtonElement | null = null;
  private uiBar: HTMLElement | null = null;

  onMuteClick?: () => void;
  onRetroClick?: () => void;
  onAIClick?: () => void;
  onThemeClick?: () => void;

  constructor() {
    this.overlayEl = document.getElementById('overlay');
    this.setupDomButtons();
  }

  private setupDomButtons(): void {
    if (!this.overlayEl) return;

    this.overlayEl.innerHTML = `
      <div class="ui-bar" role="toolbar" aria-label="Game controls">
        <div class="ui-bar-group">
          <button id="btn-theme" class="ui-btn" aria-label="Toggle light or dark theme" title="Toggle Theme (T)">
            <svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <span class="btn-text">THEME: LIGHT</span>
          </button>
          <div class="ui-divider"></div>
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
          <div class="ui-divider"></div>
          <button id="btn-ai" class="ui-btn" aria-label="Toggle AI policy" title="Toggle AI Auto-Pilot (A)">
            <svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2"></rect>
              <circle cx="12" cy="5" r="2"></circle>
              <path d="M12 7v4"></path>
              <circle cx="8" cy="16" r="1" fill="currentColor"></circle>
              <circle cx="16" cy="16" r="1" fill="currentColor"></circle>
            </svg>
            <span class="btn-text">AI: OFF</span>
          </button>
        </div>
        <div class="ui-hints">
          <span class="hint-item"><kbd class="kbd">SPACE</kbd> / <kbd class="kbd">↑</kbd> Jump</span>
          <span class="hint-item"><kbd class="kbd">↓</kbd> Duck</span>
          <span class="hint-item"><kbd class="kbd">A</kbd> AI Mode</span>
          <span class="hint-item"><kbd class="kbd">T</kbd> Theme</span>
          <span class="hint-item"><kbd class="kbd">R</kbd> Retro</span>
          <span class="hint-item"><kbd class="kbd">M</kbd> Mute</span>
        </div>
      </div>
    `;

    this.uiBar = this.overlayEl.querySelector('.ui-bar');
    this.themeBtn = document.getElementById('btn-theme') as HTMLButtonElement;
    this.muteBtn = document.getElementById('btn-mute') as HTMLButtonElement;
    this.retroBtn = document.getElementById('btn-retro') as HTMLButtonElement;
    this.aiBtn = document.getElementById('btn-ai') as HTMLButtonElement;

    this.themeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onThemeClick?.();
    });

    this.muteBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onMuteClick?.();
    });

    this.retroBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onRetroClick?.();
    });

    this.aiBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onAIClick?.();
    });
  }

  updateButtons(isMuted: boolean, isRetro: boolean, aiMode: AIMode = 'OFF', theme: 'light' | 'dark' = 'light'): void {
    if (this.themeBtn) {
      const isLight = theme === 'light';
      const icon = isLight
        ? '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>'
        : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
      this.themeBtn.innerHTML = `<svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</svg><span class="btn-text">THEME: ${theme.toUpperCase()}</span>`;
    }
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

    if (this.aiBtn) {
      let label = 'AI: OFF';
      if (aiMode === 'NAIVE') label = '📏 11*S (71%)';
      else if (aiMode === 'LINEAR') label = '⚡ 3-BYTE (100%)';
      else if (aiMode === 'ANN') label = '🧠 NEURAL NET';
      else if (aiMode === 'EVOLUTION') label = '🧬 EVOLVE (GHOST)';

      const isActive = aiMode !== 'OFF';
      this.aiBtn.innerHTML = `
        <svg class="ui-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2"></rect>
          <circle cx="12" cy="5" r="2"></circle>
          <path d="M12 7v4"></path>
          <circle cx="8" cy="16" r="1" fill="currentColor"></circle>
          <circle cx="16" cy="16" r="1" fill="currentColor"></circle>
        </svg>
        <span class="btn-text">${label}</span>
      `;
      this.aiBtn.classList.toggle('is-ai-active', isActive);
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
    aiMode: AIMode = 'OFF',
    decision: AIDecision | null = null,
    stats: AIEvaluationStats | null = null,
  ): void {
    this.setNightTheme(state.isNight);

    ctx.save();

    // AI Debug HUD & Raycast
    if (aiMode !== 'OFF') {
      this.drawAIDebug(ctx, state, aiMode, decision, stats);
    }

    if (state.phase === 'READY') {
      ctx.fillStyle = textColor;
      ctx.font = '12px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(aiMode !== 'OFF' ? 'AI AUTO-PILOT ACTIVE — STARTING...' : 'PRESS SPACE OR TAP TO PLAY', width / 2, 75);
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

  private drawAIDebug(
    ctx: CanvasRenderingContext2D,
    state: GameState,
    _mode: AIMode,
    decision: AIDecision | null,
    _stats: AIEvaluationStats | null,
  ): void {
    const trex = state.trex;
    const dinoFront = trex.x + trex.w;
    const dinoCenterY = trex.y + 14; // Dino eye level

    ctx.save();

    // Subtle holographic lock-on tracer to incoming obstacle
    if (decision?.targetObs && decision.distance !== undefined && decision.distance > 0) {
      const obs = decision.targetObs;
      const isDangerous = decision.action === 'JUMP' || decision.action === 'DUCK';

      // Soft holographic beam
      ctx.beginPath();
      ctx.strokeStyle = isDangerous ? 'rgba(239, 68, 68, 0.45)' : 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(dinoFront, dinoCenterY);
      ctx.lineTo(obs.x, obs.y + 6);
      ctx.stroke();
      ctx.setLineDash([]);

      // Sleek holographic lock-on bracket around obstacle
      ctx.strokeStyle = isDangerous ? '#ef4444' : '#38bdf8';
      ctx.lineWidth = 1.2;
      const bW = 5;
      ctx.beginPath();
      ctx.moveTo(obs.x - 3, obs.y + bW);
      ctx.lineTo(obs.x - 3, obs.y - 3);
      ctx.lineTo(obs.x + bW, obs.y - 3);
      ctx.stroke();

      // Mini distance tag above obstacle
      ctx.fillStyle = isDangerous ? '#ef4444' : '#38bdf8';
      ctx.font = 'bold 8px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(decision.distance)}px`, obs.x + obs.w / 2, obs.y - 6);
    }

    ctx.restore();
  }
}
