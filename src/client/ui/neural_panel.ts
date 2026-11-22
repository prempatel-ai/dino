import type { AIMode, AIDecision, AIEvaluationStats, NetworkState } from '../../ai/types';
import { LevelBenchmark } from '../../ai/benchmark';

export class NeuralPanel {
  private panelEl: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private pulseTime = 0;
  private isVisible = false;
  private currentMode: AIMode = 'OFF';

  private policyDescEl: HTMLElement | null = null;
  private distValEl: HTMLElement | null = null;
  private speedValEl: HTMLElement | null = null;
  private tabsContainer: HTMLElement | null = null;

  onModeSelect?: (mode: AIMode) => void;
  onLoadWeights?: (payload: unknown) => { success: boolean; modelType: string; message: string };
  onExportWeights?: () => Record<string, unknown>;

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
          <span class="deck-badge">PILOT DECK</span>
          <span class="deck-title">Game Pilot &amp; Decision Deck</span>
        </div>
        <div class="deck-mode-tabs" role="tablist" aria-label="Game Mode Selector">
          <button class="deck-tab" data-mode="OFF">🎮 Visitor Play (Manual)</button>
          <button class="deck-tab" data-mode="LINEAR">📐 Pure Logic Policy</button>
          <button class="deck-tab" data-mode="ANN">🧠 Trained AI Model</button>
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

      <div class="deck-benchmark-bar">
        <div class="bench-actions-group">
          <button id="btn-run-benchmark" class="deck-bench-btn" title="Run 1,000-level benchmark across reproducible seeds">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
            <span class="bench-btn-text">Run 1,000-Level Test Suite</span>
          </button>
          <button id="btn-toggle-weights" class="deck-bench-btn" title="Load or export trained weights from Google Colab">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span class="bench-btn-text">Weights Manager</span>
          </button>
        </div>
        <span class="bench-result" id="bench-result-text">Click to simulate and test active policy across 1,000 seeds</span>
      </div>

      <div class="deck-weights-drawer is-hidden" id="deck-weights-drawer">
        <div class="weights-drawer-header">
          <span class="weights-drawer-title">Trained Model Weights (Google Colab / Custom JSON)</span>
          <button class="weights-close-btn" id="btn-close-weights" title="Close">&times;</button>
        </div>
        <div class="weights-drawer-body">
          <div class="weights-presets-row">
            <span class="weights-label">PRESETS:</span>
            <button class="weights-preset-btn" data-preset="mlp">Pre-trained MLP Champion</button>
            <button class="weights-preset-btn" data-preset="linear">3-Byte Linear (14.5*S - 12.9)</button>
            <button class="weights-preset-btn" data-preset="export">Export Current JSON</button>
          </div>
          <div class="weights-input-group">
            <div class="weights-file-row">
              <label class="weights-file-label" for="weights-file-input">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                <span>Upload Colab JSON File</span>
              </label>
              <input type="file" id="weights-file-input" accept=".json" class="weights-hidden-file">
              <span class="weights-file-hint" id="weights-filename-hint">or paste JSON directly below:</span>
            </div>
            <textarea id="weights-json-area" class="weights-textarea" placeholder="Paste trained JSON weights from Google Colab (e.g. { w1: [...], b1: [...], w2: [...], b2: [...] } or { a: 14.5, c: -12.9 })..."></textarea>
            <div class="weights-footer-row">
              <button id="btn-apply-weights" class="weights-apply-btn">Apply &amp; Play with Weights</button>
              <span class="weights-status-msg" id="weights-status-msg"></span>
            </div>
          </div>
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

    const benchBtn = panel.querySelector('#btn-run-benchmark') as HTMLButtonElement | null;
    const benchResultEl = panel.querySelector('#bench-result-text') as HTMLElement | null;

    benchBtn?.addEventListener('click', () => {
      if (!benchBtn || !benchResultEl) return;
      benchBtn.disabled = true;
      const originalText = benchBtn.innerHTML;
      benchBtn.textContent = 'Simulating 1,000 Levels...';
      benchResultEl.textContent = 'Running test suite across seeds 1 to 1000...';

      setTimeout(() => {
        const bench = new LevelBenchmark();
        const mode = this.currentMode === 'OFF' ? 'LINEAR' : this.currentMode;
        const res = bench.run(mode, 1000, 1200);
        benchBtn.disabled = false;
        benchBtn.innerHTML = originalText;
        benchResultEl.innerHTML = `<strong>${mode} Result:</strong> Passed <strong>${res.passedCount} / 1000</strong> (${res.passPercentage}%) &bull; Avg Score: ${res.avgScore} pts &bull; Simulated in ${res.durationMs}ms`;
      }, 50);
    });

    // Weights Drawer wiring
    const toggleWeightsBtn = panel.querySelector('#btn-toggle-weights') as HTMLButtonElement | null;
    const closeWeightsBtn = panel.querySelector('#btn-close-weights') as HTMLButtonElement | null;
    const weightsDrawer = panel.querySelector('#deck-weights-drawer') as HTMLElement | null;
    const fileInput = panel.querySelector('#weights-file-input') as HTMLInputElement | null;
    const fileHint = panel.querySelector('#weights-filename-hint') as HTMLElement | null;
    const jsonArea = panel.querySelector('#weights-json-area') as HTMLTextAreaElement | null;
    const applyBtn = panel.querySelector('#btn-apply-weights') as HTMLButtonElement | null;
    const statusMsg = panel.querySelector('#weights-status-msg') as HTMLElement | null;

    toggleWeightsBtn?.addEventListener('click', () => {
      weightsDrawer?.classList.toggle('is-hidden');
    });

    closeWeightsBtn?.addEventListener('click', () => {
      weightsDrawer?.classList.add('is-hidden');
    });

    // Preset buttons
    panel.querySelectorAll('.weights-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        if (preset === 'export') {
          if (this.onExportWeights) {
            const data = this.onExportWeights();
            const jsonStr = JSON.stringify(data, null, 2);
            if (jsonArea) jsonArea.value = jsonStr;
            // Also trigger file download
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dino_trained_weights_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            if (statusMsg) {
              statusMsg.textContent = 'Exported current model weights to JSON!';
              statusMsg.className = 'weights-status-msg is-success';
            }
          }
        } else if (preset === 'linear') {
          if (jsonArea) {
            jsonArea.value = JSON.stringify({ a: 14.5, c: -12.9, duckElev: 75, duckDist: 16 }, null, 2);
          }
          if (statusMsg) {
            statusMsg.textContent = 'Loaded 3-Byte Linear preset into editor.';
            statusMsg.className = 'weights-status-msg';
          }
        } else if (preset === 'mlp') {
          if (this.onExportWeights) {
            const data = this.onExportWeights();
            if (jsonArea) {
              jsonArea.value = JSON.stringify(data.mlp, null, 2);
            }
            if (statusMsg) {
              statusMsg.textContent = 'Loaded Pre-trained MLP weights into editor.';
              statusMsg.className = 'weights-status-msg';
            }
          }
        }
      });
    });

    // File input handling
    fileInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      if (fileHint) fileHint.textContent = `Selected: ${file.name}`;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (jsonArea) jsonArea.value = text;
        if (statusMsg) {
          statusMsg.textContent = `Loaded ${file.name} into editor. Click Apply to activate!`;
          statusMsg.className = 'weights-status-msg';
        }
      };
      reader.readAsText(file);
    });

    // Apply button
    applyBtn?.addEventListener('click', () => {
      if (!jsonArea || !statusMsg) return;
      const text = jsonArea.value.trim();
      if (!text) {
        statusMsg.textContent = 'Please paste JSON or upload a file first.';
        statusMsg.className = 'weights-status-msg is-error';
        return;
      }
      try {
        const parsed = JSON.parse(text);
        if (this.onLoadWeights) {
          const res = this.onLoadWeights(parsed);
          if (res.success) {
            statusMsg.textContent = res.message;
            statusMsg.className = 'weights-status-msg is-success';
            if (benchResultEl) {
              benchResultEl.innerHTML = `<strong>Weights Activated:</strong> ${res.message}`;
            }
          } else {
            statusMsg.textContent = res.message;
            statusMsg.className = 'weights-status-msg is-error';
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        statusMsg.textContent = `JSON Parse Error: ${msg}`;
        statusMsg.className = 'weights-status-msg is-error';
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
    _stats: AIEvaluationStats | null,
    dtMs: number,
  ): void {
    this.currentMode = aiMode;
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
      if (aiMode === 'LINEAR' || aiMode === 'NAIVE') {
        this.policyDescEl.innerHTML = `
          <span class="badge-linear">PURE LOGIC</span>
          <span class="policy-formula">if (distance &lt; 14.5 * speed - 12.0) jump()</span>
          <span class="policy-note">Deterministic math rules &bull; Ducks mid-air pterodactyls &bull; Zero weights</span>
        `;
      } else if (aiMode === 'ANN' || aiMode === 'EVOLUTION') {
        this.policyDescEl.innerHTML = `
          <span class="badge-ann">TRAINED AI</span>
          <span class="policy-formula">7 Inputs &rarr; 8 Hidden (ReLU) &rarr; 3 Outputs (Softmax)</span>
          <span class="policy-note">Neural network policy running trained weights &bull; Real-time decisions</span>
        `;
      } else {
        this.policyDescEl.innerHTML = `
          <span class="badge-naive">VISITOR PLAY</span>
          <span class="policy-formula">Space / &uarr; to Jump &bull; &darr; to Duck &bull; Tap on Screen</span>
          <span class="policy-note">Manual control active &bull; AI is offline &bull; Visitor controls dinosaur</span>
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
