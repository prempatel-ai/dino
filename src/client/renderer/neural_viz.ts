import type { NetworkState } from '../../ai/types';

export class NeuralVisualizer {
  private pulseTime = 0;

  private readonly inputLabels = [
    'dist',
    'width',
    'height',
    'elev',
    'dino_y',
    'vel_y',
    'speed',
  ];

  private readonly outputLabels = ['RUN', 'JUMP', 'DUCK'];

  update(dtMs: number): void {
    this.pulseTime += dtMs * 0.003;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    netState: NetworkState,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    ctx.save();

    // Background card: Dark sleek frosted glass container matching reference
    ctx.fillStyle = 'rgba(8, 12, 20, 0.88)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    
    // Rounded rect card
    this.roundRect(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.stroke();

    const paddingX = 36;
    const paddingY = 16;
    const innerW = w - paddingX * 2;
    const innerH = h - paddingY * 2;

    const inputX = x + paddingX;
    const hiddenX = x + paddingX + innerW * 0.48;
    const outputX = x + w - paddingX;

    const numInputs = netState.inputs.length; // 7
    const numHidden = netState.hidden.length; // 8
    const numOutputs = netState.outputs.length; // 3

    // Calculate node Y positions
    const inputPositions = this.getYPositions(y + paddingY, innerH, numInputs);
    const hiddenPositions = this.getYPositions(y + paddingY, innerH, numHidden);
    const outputPositions = this.getYPositions(y + paddingY + 12, innerH - 24, numOutputs);

    // 1. Draw Synapses: Inputs -> Hidden
    for (let i = 0; i < numInputs; i++) {
      const iy = inputPositions[i];
      const inVal = Math.min(1.0, Math.max(0.0, netState.inputs[i]));

      for (let j = 0; j < numHidden; j++) {
        const hy = hiddenPositions[j];
        const weight = netState.w1[i] ? netState.w1[i][j] : 0;
        const activation = Math.abs(weight * inVal);

        if (activation > 0.05) {
          const alpha = Math.min(0.65, activation * 0.35 + 0.08);
          ctx.beginPath();
          ctx.strokeStyle = weight >= 0 ? `rgba(234, 179, 8, ${alpha})` : `rgba(236, 72, 153, ${alpha * 0.8})`;
          ctx.lineWidth = Math.min(2.0, 0.5 + activation * 0.8);

          // Subtle bezier curve
          const cp1x = inputX + (hiddenX - inputX) * 0.5;
          const cp2x = inputX + (hiddenX - inputX) * 0.5;
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

        if (activation > 0.05) {
          const isWinning = k === netState.actionIndex;
          const alpha = Math.min(0.85, activation * 0.4 + (isWinning ? 0.3 : 0.05));
          ctx.beginPath();
          ctx.strokeStyle = isWinning
            ? `rgba(52, 211, 153, ${alpha})`
            : `rgba(245, 158, 11, ${alpha * 0.6})`;
          ctx.lineWidth = isWinning ? 1.8 : 0.7;

          const cp1x = hiddenX + (outputX - hiddenX) * 0.5;
          const cp2x = hiddenX + (outputX - hiddenX) * 0.5;
          ctx.moveTo(hiddenX, hy);
          ctx.bezierCurveTo(cp1x, hy, cp2x, oy, outputX, oy);
          ctx.stroke();
        }
      }
    }

    // 3. Draw Input Nodes (Left)
    for (let i = 0; i < numInputs; i++) {
      const iy = inputPositions[i];
      const val = Math.min(1.0, Math.max(0.0, netState.inputs[i]));

      // Label on the left
      ctx.fillStyle = 'rgba(203, 213, 225, 0.75)';
      ctx.font = '7.5px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(this.inputLabels[i] || `in_${i}`, inputX - 6, iy + 2.5);

      // Outer ring
      ctx.beginPath();
      ctx.arc(inputX, iy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Glowing Core
      if (val > 0.02) {
        ctx.beginPath();
        const coreR = Math.max(1.5, val * 3.5);
        ctx.arc(inputX, iy, coreR, 0, Math.PI * 2);
        ctx.fillStyle = '#bef264';
        ctx.shadowColor = '#bef264';
        ctx.shadowBlur = 6 * val;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // 4. Draw Hidden Nodes (Center)
    for (let j = 0; j < numHidden; j++) {
      const hy = hiddenPositions[j];
      const hVal = Math.min(1.0, Math.max(0.0, netState.hidden[j]));

      ctx.beginPath();
      ctx.arc(hiddenX, hy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      if (hVal > 0.02) {
        ctx.beginPath();
        ctx.arc(hiddenX, hy, Math.max(1.2, hVal * 2.8), 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 5 * hVal;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // 5. Draw Output Nodes (Right)
    for (let k = 0; k < numOutputs; k++) {
      const oy = outputPositions[k];
      const isWinner = k === netState.actionIndex;
      const prob = netState.outputs[k] || 0;

      // Outer circle
      ctx.beginPath();
      ctx.arc(outputX, oy, isWinner ? 5.5 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = isWinner ? '#064e3b' : '#1e293b';
      ctx.fill();
      ctx.strokeStyle = isWinner ? '#34d399' : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = isWinner ? 1.5 : 0.8;
      ctx.stroke();

      // Core
      if (isWinner) {
        ctx.beginPath();
        ctx.arc(outputX, oy, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#34d399';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Label on the right
      ctx.fillStyle = isWinner ? '#34d399' : 'rgba(148, 163, 184, 0.7)';
      ctx.font = isWinner ? 'bold 8px ui-monospace, SF Mono, Menlo, monospace' : '7.5px ui-monospace, SF Mono, Menlo, monospace';
      ctx.textAlign = 'left';
      const pct = Math.round(prob * 100);
      ctx.fillText(`${this.outputLabels[k]} ${pct}%`, outputX + 7, oy + 2.5);
    }

    // Bottom "thinking" label matching the reference image
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    ctx.font = '7.5px ui-monospace, SF Mono, Menlo, monospace';
    ctx.textAlign = 'center';
    const dots = '.'.repeat((Math.floor(this.pulseTime * 2) % 3) + 1);
    ctx.fillText(`thinking${dots}`, hiddenX, y + h - 4);

    ctx.restore();
  }

  private getYPositions(startY: number, totalH: number, count: number): number[] {
    const step = totalH / (count - 1);
    const positions: number[] = [];
    for (let i = 0; i < count; i++) {
      positions.push(startY + i * step);
    }
    return positions;
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
}
