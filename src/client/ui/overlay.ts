import type { GameState } from '../../core/types';
import type { SpriteAtlas } from '../renderer/sprites';
import type { AIMode, AIDecision, AIEvaluationStats } from '../../ai/types';

export class Overlay {
  private overlayEl: HTMLElement | null;
  private muteBtn: HTMLButtonElement | null = null;
  private retroBtn: HTMLButtonElement | null = null;
  private aiBtn: HTMLButtonElement | null = null;
  private uiBar: HTMLElement | null = null;

  onMuteClick?: () => void;
  onRetroClick?: () => void;
  onAIClick?: () => void;

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
    `;

    this.uiBar = this.overlayEl.querySelector('.ui-bar');
    this.muteBtn = document.getElementById('btn-mute') as HTMLButtonElement;
    this.retroBtn = document.getElementById('btn-retro') as HTMLButtonElement;
    this.aiBtn = document.getElementById('btn-ai') as HTMLButtonElement;

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

  updateButtons(isMuted: boolean, isRetro: boolean, aiMode: AIMode = 'OFF'): void {
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
    mode: AIMode,
    decision: AIDecision | null,
    stats: AIEvaluationStats | null,
  ): void {
    const trex = state.trex;
    const dinoFront = trex.x + trex.w;
    const dinoCenterY = trex.y + trex.h / 2;

    ctx.save();

    // Raycast Line to incoming obstacle
    if (decision?.targetObs && decision.distance !== undefined && decision.distance > 0) {
      const obs = decision.targetObs;
      const obsCenterY = obs.y + obs.h / 2;
      const isDangerous = decision.action === 'JUMP' || decision.action === 'DUCK';

      // Laser line
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = isDangerous ? 'rgba(239, 68, 68, 0.85)' : 'rgba(16, 185, 129, 0.75)';
      ctx.lineWidth = isDangerous ? 2 : 1;
      ctx.moveTo(dinoFront, dinoCenterY);
      ctx.lineTo(obs.x, obsCenterY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Distance indicator tag
      const midX = (dinoFront + obs.x) / 2;
      const midY = (dinoCenterY + obsCenterY) / 2 - 6;
      ctx.fillStyle = isDangerous ? '#ef4444' : '#10b981';
      ctx.font = '9px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'center';
      const label = `d: ${Math.round(decision.distance)}px` + (decision.threshold ? ` | t: ${Math.round(decision.threshold)}px` : '');
      ctx.fillText(label, midX, midY);
    }

    // Top-left AI badge
    const badgeX = 14;
    const badgeY = 24;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.fillRect(badgeX, badgeY - 14, 160, 20);

    ctx.fillStyle = mode === 'NAIVE' ? '#f59e0b' : mode === 'LINEAR' ? '#38bdf8' : mode === 'ANN' ? '#a855f7' : '#10b981';
    ctx.font = 'bold 9px ui-monospace, SF Mono, Menlo, monospace';
    ctx.textAlign = 'left';
    
    let modeText = `AI: ${mode}`;
    if (mode === 'NAIVE') modeText = '📏 NAIVE (11*S)';
    else if (mode === 'LINEAR') modeText = '⚡ 3-BYTE LINEAR';
    else if (mode === 'ANN') modeText = '🧠 NEURAL NET';
    else if (mode === 'EVOLUTION') modeText = `🧬 GEN ${stats?.generation || 1} [GHOST]`;

    ctx.fillText(modeText, badgeX + 6, badgeY);

    // Action indicator: JUMP, DUCK, RUN
    const action = decision?.action || 'NONE';
    const actionText = action === 'JUMP' ? '⬆ JUMP' : action === 'DUCK' ? '⬇ DUCK' : '➡ RUN';
    ctx.fillStyle = action === 'JUMP' ? '#ef4444' : action === 'DUCK' ? '#eab308' : '#22c55e';
    ctx.textAlign = 'right';
    ctx.fillText(actionText, badgeX + 154, badgeY);

    ctx.restore();
  }
}
