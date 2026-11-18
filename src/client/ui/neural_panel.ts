import type { AIMode, AIDecision, AIEvaluationStats, NetworkState } from '../../ai/types';

export class NeuralPanel {
  private panelEl: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private modelTag: HTMLElement | null = null;
  private decisionTag: HTMLElement | null = null;
  private latencyTag: HTMLElement | null = null;

  private pulseTime = 0;
  private isVisible = false;

  private readonly inputLabels = [
    { key: 'dist', name: 'distance' },
    { key: 'width', name: 'obs_width' },
    { key: 'height', name: 'obs_height' },
    { key: 'elev', name: 'elevation' },
    { key: 'dino_y', name: 'dino_height' },
    { key: 'vel_y', name: 'dino_vel_y' },
    { key: 'speed', name: 'world_speed' },
  ];

  private readonly outputLabels = ['RUN', 'JUMP', 'DUCK'];

  constructor() {
    this.createDom();
  }

  private createDom(): void {
    const existing = document.getElementById('ai-neural-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'ai-neural-panel';
    panel.className = 'neural-panel is-hidden';

    panel.innerHTML = `
      <div class="neural-header">
        <div class="neural-title">
          <svg class="neural-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 10l-.75-.07A4.002 4.002 0 0 1 12 2z"></path>
            <path d="M6 8a4 4 0 0 1 7.25-2.07l.75.07v1.86a4 4 0 0 1-8 0z"></path>
            <rect x="3" y="11" width="18" height="10" rx="3"></rect>
            <circle cx="8" cy="16" r="1.5" fill="currentColor"></circle>
            <circle cx="16" cy="16" r="1.5" fill="currentColor"></circle>
          </svg>
          <span class="neural-title-text">AI Neural Decision Engine</span>
          <span id="neural-model-tag" class="neural-badge">3-BYTE LINEAR</span>
        </div>
        <div class="neural-telemetry">
          <span id="neural-latency-tag" class="telemetry-pill">latency: 0.1ms</span>
          <span id="neural-decision-tag" class="telemetry-pill is-active">RUN 98%</span>
        </div>
      </div>
      <div class="neural-canvas-container">
        <canvas id="neural-canvas" width="540" height="175"></canvas>
      </div>
    `;

    // Append directly below game-container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer && gameContainer.parentElement) {
      gameContainer.parentElement.appendChild(panel);
    } else {
      document.body.appendChild(panel);
    }

    this.panelEl = panel;
    this.canvas = panel.querySelector('#neural-canvas') as HTMLCanvasElement;
    this.modelTag = panel.querySelector('#neural-model-tag');
    this.decisionTag = panel.querySelector('#neural-decision-tag');
    this.latencyTag = panel.querySelector('#neural-latency-tag');

    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      // Setup 2x Retina DPI for ultra crisp rendering
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();
      const w = rect.width || 540;
      const h = rect.height || 175;
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.ctx?.scale(dpr, dpr);
    }
  }

  update(
    aiMode: AIMode,
    decision: AIDecision | null,
    stats: AIEvaluationStats | null,
    dtMs: number,
  ): void {
    const shouldBeVisible = aiMode !== 'OFF';
    if (shouldBeVisible !== this.isVisible) {
      this.isVisible = shouldBeVisible;
      if (this.panelEl) {
        this.panelEl.classList.toggle('is-hidden', !this.isVisible);
        this.panelEl.classList.toggle('is-visible', this.isVisible);
      }
    }

    if (!this.isVisible || !this.ctx || !this.canvas) return;

    this.pulseTime += dtMs * 0.003;

    // Update Header Badges
    if (this.modelTag) {
      if (aiMode === 'NAIVE') this.modelTag.textContent = '📏 NAIVE (11*S)';
      else if (aiMode === 'LINEAR') this.modelTag.textContent = '⚡ 3-BYTE LINEAR (14.5*S - 12.9)';
      else if (aiMode === 'ANN') this.modelTag.textContent = '🧠 7-INPUT ANN (MLP 7-8-3)';
      else if (aiMode === 'EVOLUTION') this.modelTag.textContent = `🧬 NEUROEVOLUTION [GEN ${stats?.generation || 1}]`;
    }

    if (this.decisionTag && decision) {
      const action = decision.action;
      const pct = Math.round((decision.confidence || 0.95) * 100);
      this.decisionTag.textContent = `${action} ${pct}%`;
      this.decisionTag.className = `telemetry-pill is-active ${action.toLowerCase()}`;
    }

    if (this.latencyTag) {
      this.latencyTag.textContent = `latency: < 0.2ms`;
    }

    // Render Neural Network Diagram
    if (decision?.networkState) {
      this.drawDiagram(decision.networkState);
    }
  }

  private drawDiagram(netState: NetworkState): void {
    const ctx = this.ctx;
    if (!ctx || !this.canvas) return;

    const w = 540;
    const h = 175;

    ctx.clearRect(0, 0, w, h);

    const paddingX = 70;
    const paddingY = 16;
    const innerW = w - paddingX * 2;
    const innerH = h - paddingY * 2;

    const inputX = paddingX;
    const hiddenX = paddingX + innerW * 0.5;
    const outputX = w - paddingX;

    const numInputs = netState.inputs.length; // 7
    const numHidden = netState.hidden.length; // 8
    const numOutputs = netState.outputs.length; // 3

    const inputPositions = this.getYPositions(paddingY + 6, innerH - 12, numInputs);
    const hiddenPositions = this.getYPositions(paddingY + 4, innerH - 8, numHidden);
    const outputPositions = this.getYPositions(paddingY + 22, innerH - 44, numOutputs);

    // 1. Draw Synapses: Inputs -> Hidden
    for (let i = 0; i < numInputs; i++) {
      const iy = inputPositions[i];
      const inVal = Math.min(1.0, Math.max(0.0, netState.inputs[i]));

      for (let j = 0; j < numHidden; j++) {
        const hy = hiddenPositions[j];
        const weight = netState.w1[i] ? netState.w1[i][j] : 0;
        const activation = Math.abs(weight * inVal);

        if (activation > 0.04) {
          const alpha = Math.min(0.55, activation * 0.35 + 0.06);
          ctx.beginPath();
          ctx.strokeStyle = weight >= 0
            ? `rgba(234, 179, 8, ${alpha})`
            : `rgba(236, 72, 153, ${alpha * 0.75})`;
          ctx.lineWidth = Math.min(2.0, 0.4 + activation * 0.8);

          const cp1x = inputX + (hiddenX - inputX) * 0.45;
          const cp2x = inputX + (hiddenX - inputX) * 0.55;
          ctx.moveTo(inputX, iy);
          ctx.bezierCurveTo(cp1x, iy, cp2x, hy, hiddenX, hy);
          ctx.stroke();
        }
      }
    }

    // 2. Draw Synapses: Hidden -> Outputs
    for (let j = 0; j < numHidden; j++) {
      const hy = hiddenPositions[j];
      const hVal = Math.min(1.0, netState.hidden[j]);

      for (let k = 0; k < numOutputs; k++) {
        const oy = outputPositions[k];
        const weight = netState.w2[j] ? netState.w2[j][k] : 0;
        const activation = Math.abs(weight * hVal);

        if (activation > 0.04) {
          const isWinning = k === netState.actionIndex;
          const alpha = Math.min(0.85, activation * 0.4 + (isWinning ? 0.35 : 0.06));
          ctx.beginPath();
          ctx.strokeStyle = isWinning
            ? `rgba(52, 211, 153, ${alpha})`
            : `rgba(245, 158, 11, ${alpha * 0.55})`;
          ctx.lineWidth = isWinning ? 2.0 : 0.7;

          const cp1x = hiddenX + (outputX - hiddenX) * 0.45;
          const cp2x = hiddenX + (outputX - hiddenX) * 0.55;
          ctx.moveTo(hiddenX, hy);
          ctx.bezierCurveTo(cp1x, hy, cp2x, oy, outputX, oy);
          ctx.stroke();
        }
      }
    }

    // 3. Draw Input Nodes (Left) with Neon Halo
    for (let i = 0; i < numInputs; i++) {
      const iy = inputPositions[i];
      const val = Math.min(1.0, Math.max(0.0, netState.inputs[i]));

      // Label on the left
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 9px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(this.inputLabels[i]?.name || `in_${i}`, inputX - 10, iy + 3);

      // Outer ring
      ctx.beginPath();
      ctx.arc(inputX, iy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Glowing Neon Core
      if (val > 0.01) {
        ctx.beginPath();
        const coreR = Math.max(2, val * 4.5);
        ctx.arc(inputX, iy, coreR, 0, Math.PI * 2);
        ctx.fillStyle = '#bef264';
        ctx.shadowColor = '#bef264';
        ctx.shadowBlur = 8 * val;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // 4. Draw Hidden Neurons (Center "thinking")
    for (let j = 0; j < numHidden; j++) {
      const hy = hiddenPositions[j];
      const hVal = Math.min(1.0, Math.max(0.0, netState.hidden[j]));

      ctx.beginPath();
      ctx.arc(hiddenX, hy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (hVal > 0.01) {
        ctx.beginPath();
        ctx.arc(hiddenX, hy, Math.max(1.5, hVal * 3.5), 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 7 * hVal;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // 5. Draw Output Action Nodes (Right)
    for (let k = 0; k < numOutputs; k++) {
      const oy = outputPositions[k];
      const isWinner = k === netState.actionIndex;
      const prob = netState.outputs[k] || 0;

      // Outer circle
      ctx.beginPath();
      ctx.arc(outputX, oy, isWinner ? 7.5 : 5.5, 0, Math.PI * 2);
      ctx.fillStyle = isWinner ? '#064e3b' : '#0f172a';
      ctx.fill();
      ctx.strokeStyle = isWinner ? '#34d399' : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = isWinner ? 2 : 1;
      ctx.stroke();

      // Radiant Core
      if (isWinner) {
        ctx.beginPath();
        ctx.arc(outputX, oy, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#34d399';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Output action label on right with probability
      ctx.fillStyle = isWinner ? '#34d399' : '#64748b';
      ctx.font = isWinner ? 'bold 10px ui-monospace, SF Mono, Menlo, monospace' : '9px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'left';
      const pct = Math.round(prob * 100);
      ctx.fillText(`${this.outputLabels[k]} ${pct}%`, outputX + 11, oy + 3.5);
    }

    // Bottom "thinking" label from reference image
    ctx.fillStyle = '#64748b';
    ctx.font = '600 8.5px ui-monospace, SF Mono, Menlo, monospace';
    ctx.textAlign = 'center';
    const dots = '.'.repeat((Math.floor(this.pulseTime * 2.5) % 3) + 1);
    ctx.fillText(`thinking${dots}`, hiddenX, h - 3);
  }

  private getYPositions(startY: number, totalH: number, count: number): number[] {
    const step = totalH / (count - 1);
    const positions: number[] = [];
    for (let i = 0; i < count; i++) {
      positions.push(startY + i * step);
    }
    return positions;
  }
}
