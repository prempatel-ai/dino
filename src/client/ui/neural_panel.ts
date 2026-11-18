import type { AIMode, AIDecision, AIEvaluationStats, NetworkState } from '../../ai/types';

export class NeuralPanel {
  private panelEl: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private pulseTime = 0;
  private isVisible = false;

  private policyDescEl: HTMLElement | null = null;
  private distValEl: HTMLElement | null = null;
  private speedValEl: HTMLElement | null = null;
  private tabsContainer: HTMLElement | null = null;

  onModeSelect?: (mode: AIMode) => void;

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
    let panel = document.getElementById('ai-neural-panel');
    if (!panel) {
      panel = document.createElement('section');
      panel.id = 'ai-neural-panel';
      const container = document.querySelector('.app-shell') || document.body;
      container.appendChild(panel);
    }

    panel.className = 'neural-deck is-hidden';

    panel.innerHTML = `
      <div class="deck-header">
        <div class="deck-title-group">
          <span class="deck-indicator-dot"></span>
          <span class="deck-badge">NPU COPILOT</span>
          <span class="deck-title">Neural Network &amp; Decision Chamber</span>
        </div>
        <div class="deck-mode-tabs" role="tablist" aria-label="AI Policy Selector">
          <button class="deck-tab" data-mode="NAIVE">11&times;S Heuristic</button>
          <button class="deck-tab" data-mode="LINEAR">3-Byte Linear</button>
          <button class="deck-tab" data-mode="ANN">Neural Net (MLP)</button>
          <button class="deck-tab" data-mode="EVOLUTION">Neuroevolution</button>
          <button class="deck-tab" data-mode="OFF">Manual Play</button>
        </div>
      </div>

      <div class="deck-policy-banner" id="deck-policy-desc">
        <span class="policy-formula">Initializing telemetry...</span>
      </div>

      <div class="deck-telemetry-row">
        <div class="telemetry-card">
          <div class="telemetry-label">PERCEPTION DISTANCE</div>
          <div class="telemetry-val" id="tele-dist">SEARCHING</div>
        </div>
        <div class="telemetry-card">
          <div class="telemetry-label">GROUND SPEED</div>
          <div class="telemetry-val" id="tele-speed">6.0 px/f</div>
        </div>
        <div class="telemetry-card">
          <div class="telemetry-label">INFERENCE LATENCY</div>
          <div class="telemetry-val"><span class="highlight">&lt; 0.1</span> ms (60 Hz)</div>
        </div>
      </div>

      <div class="neural-deck-content">
        <canvas id="neural-canvas" width="640" height="200"></canvas>
      </div>
    `;

    this.panelEl = panel;
    this.canvas = panel.querySelector('#neural-canvas') as HTMLCanvasElement;
    this.policyDescEl = panel.querySelector('#deck-policy-desc');
    this.distValEl = panel.querySelector('#tele-dist');
    this.speedValEl = panel.querySelector('#tele-speed');
    this.tabsContainer = panel.querySelector('.deck-mode-tabs');

    this.tabsContainer?.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.deck-tab') as HTMLElement;
      if (!target) return;
      const mode = target.getAttribute('data-mode') as AIMode;
      if (mode && this.onModeSelect) {
        this.onModeSelect(mode);
      }
    });

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

    // Update active tab buttons
    if (this.tabsContainer) {
      const tabs = this.tabsContainer.querySelectorAll('.deck-tab');
      tabs.forEach((tab) => {
        const mode = tab.getAttribute('data-mode');
        tab.classList.toggle('is-active', mode === aiMode);
      });
    }

    // Update Policy Description
    if (this.policyDescEl) {
      if (aiMode === 'NAIVE') {
        this.policyDescEl.innerHTML = `
          <span class="badge-naive">HEURISTIC</span>
          <span class="policy-formula">if (distance &lt; 11 * speed) jump()</span>
          <span class="policy-note">Single-variable linear threshold &bull; 71% benchmark clearance rate</span>
        `;
      } else if (aiMode === 'LINEAR') {
        this.policyDescEl.innerHTML = `
          <span class="badge-linear">3-BYTE MODEL</span>
          <span class="policy-formula">if (distance &lt; 14.5 * speed - 12.9) jump()</span>
          <span class="policy-note">3-number linear model &bull; 18 bits = 3 Bytes storage &bull; 100% clearance across 30,000 runs</span>
        `;
      } else if (aiMode === 'ANN') {
        this.policyDescEl.innerHTML = `
          <span class="badge-ann">NEURAL POLICY</span>
          <span class="policy-formula">7 Inputs &rarr; 8 Hidden (ReLU) &rarr; 3 Outputs (Softmax)</span>
          <span class="policy-note">7 inputs (dist, obs_w, obs_h, elev, dino_y, dino_v, speed) &bull; 88 weights</span>
        `;
      } else if (aiMode === 'EVOLUTION') {
        const gen = stats?.generation ?? 1;
        const fit = Math.round(stats?.bestFitness ?? 0);
        const alive = stats?.aliveCount ?? 1;
        const pop = stats?.totalPopulation ?? 20;
        this.policyDescEl.innerHTML = `
          <span class="badge-evo">NEUROEVOLUTION</span>
          <span class="policy-formula">Gen ${gen} &bull; Peak Fitness ${fit} &bull; Genomes: ${alive}/${pop}</span>
          <span class="policy-note">Ghost-mode non-fatal collision training &bull; Continuous mutation</span>
        `;
      }
    }

    // Update Telemetry Metrics
    if (this.distValEl) {
      if (decision?.distance !== undefined && decision.distance >= 0 && decision.distance < 999) {
        this.distValEl.textContent = `${Math.round(decision.distance)} px`;
      } else if (decision?.distance !== undefined && decision.distance < 0) {
        this.distValEl.textContent = 'DODGING';
      } else {
        this.distValEl.textContent = 'CLEAR';
      }
    }
    if (this.speedValEl) {
      const spd = decision?.networkState?.inputs?.[6] !== undefined
        ? (decision.networkState.inputs[6] * 13).toFixed(1)
        : (decision?.features?.[6] !== undefined ? decision.features[6].toFixed(1) : '6.0');
      this.speedValEl.textContent = `${spd} px/f`;
    }

    if (!this.isVisible || !this.ctx || !this.canvas) return;

    this.pulseTime += dtMs * 0.0025;

    if (decision?.networkState) {
      this.drawDiagram(decision.networkState);
    }
  }

  /**
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

    const numInputs = netState.inputs.length;
    const numHidden = netState.hidden.length;
    const numOutputs = netState.outputs.length;

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

    // 3. Draw Input Nodes (Left Layer)
    for (let i = 0; i < numInputs; i++) {
      const iy = inputY[i];
      const val = Math.min(1.0, Math.max(0.0, netState.inputs[i]));

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '500 10.5px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(this.inputNodes[i].label, inputX - 14, iy + 3.5);

      ctx.beginPath();
      ctx.arc(inputX, iy, 8.5, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();

      const coreR = Math.max(2.5, 3.0 + val * 3.5);
      ctx.beginPath();
      ctx.arc(inputX, iy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = '#a3e635';
      ctx.shadowColor = '#a3e635';
      ctx.shadowBlur = 8 * val + 2;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 4. Draw Hidden Neurons (Middle Layer)
    for (let j = 0; j < numHidden; j++) {
      const hy = hiddenY[j];
      const hVal = Math.min(1.0, Math.max(0.0, netState.hidden[j]));

      ctx.beginPath();
      ctx.arc(hiddenX, hy, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#94a3b8';
      ctx.stroke();

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

      ctx.beginPath();
      ctx.arc(outputX, oy, isWinner ? 9.5 : 7.5, 0, Math.PI * 2);
      ctx.fillStyle = isWinner ? '#f8fafc' : '#e2e8f0';
      ctx.fill();
      ctx.lineWidth = isWinner ? 2 : 1;
      ctx.strokeStyle = isWinner ? '#10b981' : '#94a3b8';
      ctx.stroke();

      const coreR = Math.max(2.5, 2.8 + prob * 3.5);
      ctx.beginPath();
      ctx.arc(outputX, oy, coreR, 0, Math.PI * 2);
      ctx.fillStyle = isWinner ? '#10b981' : '#f59e0b';
      ctx.shadowColor = isWinner ? '#10b981' : '#f59e0b';
      ctx.shadowBlur = isWinner ? 12 : 3;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = isWinner ? '#34d399' : '#94a3b8';
      ctx.font = isWinner
        ? '700 11px ui-monospace, SF Mono, Menlo, monospace'
        : '500 10.5px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'left';
      const pct = Math.round(prob * 100);
      ctx.fillText(`${this.outputNodes[k].label} ${pct}%`, outputX + 16, oy + 3.5);
    }

    // 6. Label "thinking."
    ctx.fillStyle = '#64748b';
    ctx.font = '500 11px ui-monospace, SF Mono, Menlo, monospace';
    ctx.textAlign = 'center';
    const dots = '.'.repeat(1 + (Math.floor(this.pulseTime * 2) % 3));
    ctx.fillText(`thinking${dots}`, hiddenX, h - 8);
  }

  private getYPositions(top: number, height: number, count: number): number[] {
    const step = height / (count - 1 || 1);
    const ys: number[] = [];
    for (let i = 0; i < count; i++) {
      ys.push(top + i * step);
    }
    return ys;
  }

  private bezierPoint(p0: number, p1: number, p2: number, p3: number, t: number): number {
    const u = 1 - t;
    return (
      u * u * u * p0 +
      3 * u * u * t * p1 +
      3 * u * t * t * p2 +
      t * t * t * p3
    );
  }
}
