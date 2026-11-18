import { Game } from '../core/game';
import { Camera } from './renderer/camera';
import { Renderer } from './renderer/renderer';
import { InputHandler } from './input';
import { GameLoop } from './loop';
import { SettingsManager } from './ui/settings';

function bootstrap(): void {
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element #game not found');
  }

  const settings = new SettingsManager();
  const camera = new Camera(canvas);
  const renderer = new Renderer(canvas, camera);
  const input = new InputHandler(window);
  const game = new Game();

  // Apply persisted settings
  renderer.isRetro = settings.isRetro;
  renderer.reducedEffects = settings.reducedEffects;
  renderer.showHitboxes = settings.showHitboxes;

  input.onRetroToggle = () => {
    renderer.isRetro = settings.toggleRetro();
    console.log(`Retro mode: ${renderer.isRetro}`);
  };

  input.onHitboxToggle = () => {
    renderer.showHitboxes = settings.toggleHitboxes();
    console.log(`Hitboxes: ${renderer.showHitboxes}`);
  };

  const loop = new GameLoop(game, input, renderer);
  loop.start();

  console.log('Dino Run engine initialized successfully with modern visuals.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
