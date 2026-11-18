import type { Game } from '../core/game';
import type { InputHandler } from './input';
import type { Renderer } from './renderer/renderer';
import type { AIController } from '../ai/controller';
import type { NeuralPanel } from './ui/neural_panel';

export class GameLoop {
  private readonly STEP_MS = 1000 / 60;
  private readonly MAX_DT = 100;

  private game: Game;
  private input: InputHandler;
  private renderer: Renderer;
  private aiController: AIController | null;
  private neuralPanel: NeuralPanel | null;

  private accumulator: number = 0;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private isPaused: boolean = false;

  constructor(
    game: Game,
    input: InputHandler,
    renderer: Renderer,
    aiController: AIController | null = null,
    neuralPanel: NeuralPanel | null = null,
  ) {
    this.game = game;
    this.input = input;
    this.renderer = renderer;
    this.aiController = aiController;
    this.neuralPanel = neuralPanel;

    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  start(): void {
    if (this.animationFrameId !== null) return;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.isPaused = false;
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.isPaused = true;
    } else {
      this.isPaused = false;
      this.lastTime = performance.now();
      this.accumulator = 0;
    }
  };

  private tick = (currentTime: number): void => {
    this.animationFrameId = requestAnimationFrame(this.tick);

    if (this.isPaused) {
      return;
    }

    const dt = Math.min(currentTime - this.lastTime, this.MAX_DT);
    this.lastTime = currentTime;
    this.accumulator += dt;

    while (this.accumulator >= this.STEP_MS) {
      let inputState = this.input.consume();

      if (this.aiController && this.aiController.mode !== 'OFF') {
        const aiInput = this.aiController.update(this.game.state);
        if (aiInput) {
          inputState = {
            jumpPressed: inputState.jumpPressed || aiInput.jumpPressed,
            jumpHeld: inputState.jumpHeld || aiInput.jumpHeld,
            duckHeld: inputState.duckHeld || aiInput.duckHeld,
            restartPressed: inputState.restartPressed || aiInput.restartPressed,
          };
        }
      }

      this.game.step(inputState, 1);
      this.accumulator -= this.STEP_MS;
    }

    const alpha = this.accumulator / this.STEP_MS;
    const aiMode = this.aiController?.mode || 'OFF';
    const decision = this.aiController?.getLastDecision() || null;
    const stats = this.aiController?.getEvolutionStats() || null;

    this.renderer.draw(this.game.state, alpha, aiMode, decision, stats);
    this.neuralPanel?.update(aiMode, decision, stats, dt);
  };

  destroy(): void {
    this.stop();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}
