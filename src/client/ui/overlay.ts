import type { GameState } from '../../core/types';
import type { SpriteAtlas } from '../renderer/sprites';
import type { AIMode, AIDecision, AIEvaluationStats } from '../../ai/types';

export class Overlay {
  private muteBtn: HTMLButtonElement | null = null;
  private retroBtn: HTMLButtonElement | null = null;
  private aiBtn: HTMLButtonElement | null = null;

  onMuteClick?: () => void;
  onRetroClick?: () => void;
  onAIClick?: () => void;

  constructor() {
    this.setupDomButtons();
  }

  private setupDomButtons(): void {
    this.muteBtn = document.getElementById('btn-mute') as HTMLButtonElement | null;
    this.retroBtn = document.getElementById('btn-retro') as HTMLButtonElement | null;
    this.aiBtn = document.getElementById('btn-ai') as HTMLButtonElement | null;

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
      this.muteBtn.classList.toggle('is-off', isMuted);
      this.muteBtn.classList.toggle('is-on', !isMuted);
      const label = this.muteBtn.querySelector('.btn-label');
      if (label) label.textContent = isMuted ? 'Muted' : 'SFX';
    }

    if (this.retroBtn) {
      this.retroBtn.classList.toggle('is-retro-active', isRetro);
      const label = this.retroBtn.querySelector('.btn-label');
      if (label) label.textContent = isRetro ? 'Retro: ON' : 'Retro';
    }

    if (this.aiBtn) {
      let label = 'AI Autopilot: OFF';
      if (aiMode === 'NAIVE') label = '11×S Heuristic';
      else if (aiMode === 'LINEAR') label = '3-Byte Linear';
      else if (aiMode === 'ANN') label = 'Neural Net';
      else if (aiMode === 'EVOLUTION') label = 'Neuroevolution';

      const isActive = aiMode !== 'OFF';
      this.aiBtn.classList.toggle('is-ai-active', isActive);
      const labelEl = this.aiBtn.querySelector('.btn-label');
      if (labelEl) labelEl.textContent = label;
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
    ctx.save();

    // AI Raycast lock-on
    if (aiMode !== 'OFF') {
      this.drawAIDebug(ctx, state, aiMode, decision, stats);
    }

    if (state.phase === 'READY') {
      ctx.fillStyle = textColor;
      ctx.font = '12px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(aiMode !== 'OFF' ? 'AUTOPILOT ENGAGED — READY' : 'PRESS SPACE OR TAP TO PLAY', width / 2, 75);
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
    const dinoCenterY = trex.y + 14;

    ctx.save();

    if (decision?.targetObs && decision.distance !== undefined && decision.distance > 0) {
      const obs = decision.targetObs;
      const isDangerous = decision.action === 'JUMP' || decision.action === 'DUCK';

      // Laser trajectory
      ctx.beginPath();
      ctx.strokeStyle = isDangerous ? 'rgba(239, 68, 68, 0.55)' : 'rgba(14, 165, 233, 0.45)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(dinoFront, dinoCenterY);
      ctx.lineTo(obs.x, obs.y + 6);
      ctx.stroke();
      ctx.setLineDash([]);

      // Lock bracket
      ctx.strokeStyle = isDangerous ? '#ef4444' : '#0ea5e9';
      ctx.lineWidth = 1.2;
      const bW = 5;
      ctx.beginPath();
      ctx.moveTo(obs.x - 3, obs.y + bW);
      ctx.lineTo(obs.x - 3, obs.y - 3);
      ctx.lineTo(obs.x + bW, obs.y - 3);
      ctx.stroke();

      // Distance tag
      ctx.fillStyle = isDangerous ? '#ef4444' : '#0ea5e9';
      ctx.font = 'bold 8px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(decision.distance)}px`, obs.x + obs.w / 2, obs.y - 6);
    }

    ctx.restore();
  }
}
