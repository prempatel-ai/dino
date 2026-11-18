import { Game } from '../core/game';
import { Camera } from './renderer/camera';
import { Renderer } from './renderer/renderer';
import { InputHandler } from './input';
import { GameLoop } from './loop';

function bootstrap(): void {
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element #game not found');
  }

  const camera = new Camera(canvas);
  const renderer = new Renderer(canvas, camera);
  const input = new InputHandler(window);
  const game = new Game();

  input.onHitboxToggle = () => {
    renderer.showHitboxes = !renderer.showHitboxes;
  };

  const loop = new GameLoop(game, input, renderer);
  loop.start();

  console.log('Dino Run engine initialized successfully.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
