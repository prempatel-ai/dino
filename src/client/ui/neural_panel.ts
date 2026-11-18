import type { AIMode, AIDecision, AIEvaluationStats, NetworkState } from '../../ai/types';

export class NeuralPanel {
  private panelEl: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private pulseTime = 0;
  private isVisible = false;

  private readonly inputNodes = [
    { label: 'distance', key: 'dist' },
    { label: 'obs_width', key: 'w' },
    { label: 'obs_height', key: 'h' },
    { label: 'elevation', key: 'elev' },
    { label: 'dino_height', key: 'y' },
    { label: 'dino_vel', key: 'vy' },
    { label: 'speed', key: 'spd' },
  ];

  private readonly outputNodes = [
    { label: 'RUN', action: 'NONE' },
    { label: 'JUMP', action: 'JUMP' },
    { label: 'DUCK', action: 'DUCK' },
  ];

  constructor() {
    this.createDom();
  }

  private createDom(): void {
    const existing = document.getElementById('ai-neural-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'ai-neural-panel';
    panel.className = 'neural-deck is-hidden';

    panel.innerHTML = `
      <div class="neural-deck-content">
        <canvas id="neural-canvas" width="640" height="200"></canvas>
      </div>
    `;

    const gameContainer = document.getElementById('game-container');
    if (gameContainer && gameContainer.parentElement) {
      gameContainer.parentElement.appendChild(panel);
    } else {
      document.body.appendChild(panel);
    }

    this.panelEl = panel;
    this.canvas = panel.querySelector('#neural-canvas') as HTMLCanvasElement;

    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = 640 * dpr;
      this.canvas.height = 200 * dpr;
      this.ctx?.scale(dpr, dpr);
    }
  }

  update(
    aiMode: AIMode,
    decision: AIDecision | null,
    _stats: AIEvaluationStats | null,
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

    this.pulseTime += dtMs * 0.0025;

    if (decision?.networkState) {
      this.drawDiagram(decision.networkState);
    }
  }

  /**
   * Handcrafted Neural Visualizer mirroring the reference image:
   * Concentric glowing nodes, dense golden synapse filaments, organic photon flow.
   */
  private drawDiagram(netState: NetworkState): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const w = 640;
    const h = 200;

    ctx.clearRect(0, 0, w, h);

    const paddingLeft = 100;
    const paddingRight = 95;
    const paddingTop = 20;
    const paddingBottom = 26;

    const innerH = h - paddingTop - paddingBottom;
    const innerW = w - paddingLeft - paddingRight;

    const inputX = paddingLeft;
    const hiddenX = paddingLeft + innerW * 0.52;
    const outputX = w - paddingRight;

    const numInputs = netState.inputs.length; // 7
    const numHidden = netState.hidden.length; // 8
    const numOutputs = netState.outputs.length; // 3

    const inputY = this.getYPositions(paddingTop + 6, innerH - 12, numInputs);
    const hiddenY = this.getYPositions(paddingTop + 4, innerH - 8, numHidden);
    const outputY = this.getYPositions(paddingTop + 24, innerH - 48, numOutputs);

    // 1. Draw Dense Synapse Filaments (Inputs -> Hidden)
    for (let i = 0; i < numInputs; i++) {
      const iy = inputY[i];
      const inVal = Math.min(1.0, Math.max(0.0, netState.inputs[i]));

      for (let j = 0; j < numHidden; j++) {
        const hy = hiddenY[j];
        const weight = netState.w1[i] ? netState.w1[i][j] : 0;
        const absW = Math.abs(weight);
        const activation = absW * (0.3 + inVal * 0.7);

        // Filament path
        const cp1x = inputX + (hiddenX - inputX) * 0.42;
        const cp2x = inputX + (hiddenX - inputX) * 0.58;

        ctx.beginPath();
        const alpha = Math.min(0.7, 0.04 + activation * 0.18);
        ctx.strokeStyle = weight >= 0
          ? `rgba(245, 158, 11, ${alpha})`
          : `rgba(236, 72, 153, ${alpha * 0.8})`;
        ctx.lineWidth = Math.min(1.8, 0.4 + activation * 0.35);

        ctx.moveTo(inputX, iy);
        ctx.bezierCurveTo(cp1x, iy, cp2x, hy, hiddenX, hy);
        ctx.stroke();

        // Flowing photon pulses along active synapses
        if (activation > 0.45) {
          const t = (this.pulseTime * 1.5 + (i * 0.13 + j * 0.07)) % 1;
          const px = this.bezierPoint(inputX, cp1x, cp2x, hiddenX, t);
          const py = this.bezierPoint(iy, iy, hy, hy, t);

          ctx.beginPath();
          ctx.arc(px, py, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = '#fef08a';
          ctx.fill();
        }
      }
    }

    // 2. Draw Synapses (Hidden -> Outputs)
    for (let j = 0; j < numHidden; j++) {
      const hy = hiddenY[j];
      const hVal = Math.min(1.0, netState.hidden[j]);

      for (let k = 0; k < numOutputs; k++) {
        const oy = outputY[k];
        const isWinner = k === netState.actionIndex;
        const weight = netState.w2[j] ? netState.w2[j][k] : 0;
        const activation = Math.abs(weight) * (0.2 + hVal * 0.8);

        const cp1x = hiddenX + (outputX - hiddenX) * 0.42;
        const cp2x = hiddenX + (outputX - hiddenX) * 0.58;

        ctx.beginPath();
        const alpha = Math.min(0.85, (isWinner ? 0.3 : 0.04) + activation * 0.22);
        ctx.strokeStyle = isWinner
          ? `rgba(52, 211, 153, ${alpha})`
          : `rgba(245, 158, 11, ${alpha * 0.6})`;
        ctx.lineWidth = isWinner ? 1.6 : 0.6;

        ctx.moveTo(hiddenX, hy);
        ctx.bezierCurveTo(cp1x, hy, cp2x, oy, outputX, oy);
        ctx.stroke();
      }
    }

    // 3. Draw Input Nodes (Left Layer) matching reference concentric circles
    for (let i = 0; i < numInputs; i++) {
      const iy = inputY[i];
      const val = Math.min(1.0, Math.max(0.0, netState.inputs[i]));

      // Clean label
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(this.inputNodes[i].label, inputX - 14, iy + 3.5);

      // Outer Disc (light slate/cream)
      ctx.beginPath();
      ctx.arc(inputX, iy, 8.5, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();

      // Soft rim
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();

      // Inner Glowing Core (Vibrant lime/neon)
      const coreR = Math.max(2.5, 3.0 + val * 3.5);
      ctx.beginPath();
      ctx.arc(inputX, iy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = '#a3e635';
      ctx.shadowColor = '#a3e635';
      ctx.shadowBlur = 8 * val + 2;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 4. Draw Hidden Neurons (Middle Layer - "thinking")
    for (let j = 0; j < numHidden; j++) {
      const hy = hiddenY[j];
      const hVal = Math.min(1.0, Math.max(0.0, netState.hidden[j]));

      // Outer Disc
      ctx.beginPath();
      ctx.arc(hiddenX, hy, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();

      // Inner Core (Amber / Orange)
      const coreR = Math.max(2.0, 2.2 + hVal * 2.8);
      ctx.beginPath();
      ctx.arc(hiddenX, hy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 6 * hVal + 1;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 5. Draw Output Nodes (Right Layer)
    for (let k = 0; k < numOutputs; k++) {
      const oy = outputY[k];
      const isWinner = k === netState.actionIndex;
      const prob = netState.outputs[k] || 0;

      // Outer Disc
      ctx.beginPath();
      ctx.arc(outputX, oy, isWinner ? 9.5 : 7.5, 0, Math.PI * 2);
      ctx.fillStyle = isWinner ? '#f8fafc' : '#e2e8f0';
      ctx.fill();
      ctx.lineWidth = isWinner ? 2 : 1;
      ctx.strokeStyle = isWinner ? '#10b981' : '#94a3b8';
      ctx.stroke();

      // Inner Core
      ctx.beginPath();
      ctx.arc(outputX, oy, isWinner ? 5.0 : 3.0, 0, Math.PI * 2);
      ctx.fillStyle = isWinner ? '#10b981' : '#f97316';
      if (isWinner) {
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Right Label with percentage
      ctx.fillStyle = isWinner ? '#34d399' : '#94a3b8';
      ctx.font = isWinner ? 'bold 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' : '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      const pct = Math.round(prob * 100);
      ctx.fillText(`${this.outputNodes[k].label} ${pct}%`, outputX + 16, oy + 4);
    }

    // 6. Bottom "thinking" label directly matching reference image
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    const dots = '.'.repeat((Math.floor(this.pulseTime * 2.5) % 3) + 1);
    ctx.fillText(`thinking${dots}`, hiddenX, h - 8);
  }

  private getYPositions(startY: number, totalH: number, count: number): number[] {
    const step = totalH / (count - 1);
    const positions: number[] = [];
    for (let i = 0; i < count; i++) {
      positions.push(startY + i * step);
    }
    return positions;
  }

  private bezierPoint(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const u = 1 - t;
    return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
  }
}
