import { Game } from '../core/game';
import { Camera } from './renderer/camera';
import { Renderer } from './renderer/renderer';
import { InputHandler } from './input';
import { GameLoop } from './loop';
import { SettingsManager } from './ui/settings';
import { SoundSynth } from './audio/synth';
import { AmbientAudio } from './audio/ambient';
import { Storage } from './storage';
import { AIController } from '../ai/controller';
import { NeuralPanel } from './ui/neural_panel';

function bootstrap(): void {
  const canvas = document.getElementById('game') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Canvas element #game not found');
  }

  const settings = new SettingsManager();
  const synth = new SoundSynth(settings.isMuted);
  const ambient = new AmbientAudio(settings.isMuted);
  const camera = new Camera(canvas);
  const renderer = new Renderer(canvas, camera);
  const input = new InputHandler(window);
  const aiController = new AIController();
  const neuralPanel = new NeuralPanel();

  // Load saved high score
  const savedHighScore = Storage.getNumber('dino_high_score', 0);
  const game = new Game(Date.now(), savedHighScore);

  // Sync settings with renderer
  renderer.isRetro = settings.isRetro;
  renderer.reducedEffects = settings.reducedEffects;
  renderer.showHitboxes = settings.showHitboxes;
  renderer.overlay.updateButtons(settings.isMuted, settings.isRetro, aiController.mode);

  // Audio start on first user interaction
  let userInteracted = false;
  const onFirstInteraction = (): void => {
    if (!userInteracted) {
      userInteracted = true;
      ambient.start();
    }
  };

  window.addEventListener('keydown', onFirstInteraction, { once: true });
  window.addEventListener('touchstart', onFirstInteraction, { once: true });
  window.addEventListener('click', onFirstInteraction, { once: true });

  // Audio & events callback
  const handleEvents = (): void => {
    const events = game.state.events;
    for (const ev of events) {
      if (ev === 'jump') synth.playJump();
      else if (ev === 'land') synth.playLand();
      else if (ev === 'crash') {
        synth.playCrash();
        Storage.setNumber('dino_high_score', game.state.highScore);
      } else if (ev === 'milestone') synth.playMilestone();
      else if (ev === 'nearMiss') synth.playNearMiss();
      else if (ev === 'highScore') synth.playHighScore();
    }
  };

  // Mute handlers
  const toggleMute = (): void => {
    const muted = settings.toggleMute();
    synth.setMuted(muted);
    ambient.setMuted(muted);
    renderer.overlay.updateButtons(muted, settings.isRetro, aiController.mode);
  };
  input.onMuteToggle = toggleMute;
  renderer.overlay.onMuteClick = toggleMute;

  // Retro mode handlers
  const toggleRetro = (): void => {
    const retro = settings.toggleRetro();
    renderer.isRetro = retro;
    renderer.overlay.updateButtons(settings.isMuted, retro, aiController.mode);
  };
  input.onRetroToggle = toggleRetro;
  renderer.overlay.onRetroClick = toggleRetro;

  // AI Auto-Pilot mode handlers (Cycle: OFF -> NAIVE -> LINEAR -> ANN -> EVOLUTION)
  const toggleAI = (): void => {
    const mode = aiController.cycleMode();
    renderer.overlay.updateButtons(settings.isMuted, settings.isRetro, mode);
  };
  input.onAIToggle = toggleAI;
  renderer.overlay.onAIClick = toggleAI;

  neuralPanel.onModeSelect = (mode) => {
    aiController.setMode(mode);
    renderer.overlay.updateButtons(settings.isMuted, settings.isRetro, mode);
  };

  input.onHitboxToggle = () => {
    renderer.showHitboxes = settings.toggleHitboxes();
  };

  // Easter egg: Konami code sunglasses
  input.onKonamiCode = () => {
    renderer.expressions.hasSunglasses = !renderer.expressions.hasSunglasses;
    console.log('Easter egg unlocked: Dino Sunglasses!');
  };

  // Create loop with event dispatcher, AI controller, and Neural Panel
  const loop = new GameLoop(game, input, renderer, aiController, neuralPanel);

  const originalStep = game.step.bind(game);
  game.step = (inp, frames = 1) => {
    originalStep(inp, frames);
    handleEvents();
  };

  loop.start();

  console.log('Dino Run engine initialized with biomes, skins, ambient audio, and AI Auto-Pilot.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
