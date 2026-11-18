import type { InputState } from '../core/types';

export class InputHandler {
  private jumpPressed: boolean = false;
  private jumpHeld: boolean = false;
  private duckHeld: boolean = false;
  private restartPressed: boolean = false;

  private touchStartY: number = 0;
  private konamiProgress: number = 0;
  private readonly konamiSequence = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'KeyB',
    'KeyA',
  ];

  onMuteToggle?: () => void;
  onRetroToggle?: () => void;
  onHitboxToggle?: () => void;
  onKonamiCode?: () => void;
  onAIToggle?: () => void;
  onThemeToggle?: () => void;

  constructor(targetElement: HTMLElement | Window = window) {
    targetElement.addEventListener('keydown', this.handleKeyDown as EventListener);
    targetElement.addEventListener('keyup', this.handleKeyUp as EventListener);

    targetElement.addEventListener('touchstart', this.handleTouchStart as EventListener, { passive: false });
    targetElement.addEventListener('touchend', this.handleTouchEnd as EventListener, { passive: false });
    targetElement.addEventListener('touchmove', this.handleTouchMove as EventListener, { passive: false });
    targetElement.addEventListener('touchcancel', this.handleTouchEnd as EventListener, { passive: false });
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      return;
    }

    // Check Konami Code
    if (e.code === this.konamiSequence[this.konamiProgress]) {
      this.konamiProgress++;
      if (this.konamiProgress === this.konamiSequence.length) {
        this.konamiProgress = 0;
        this.onKonamiCode?.();
      }
    } else {
      this.konamiProgress = e.code === this.konamiSequence[0] ? 1 : 0;
    }

    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      if (!this.jumpHeld) {
        this.jumpPressed = true;
      }
      this.jumpHeld = true;
      this.restartPressed = true;
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      e.preventDefault();
      this.duckHeld = true;
    } else if (e.code === 'Enter') {
      e.preventDefault();
      this.restartPressed = true;
    } else if (e.code === 'KeyM') {
      this.onMuteToggle?.();
    } else if (e.code === 'KeyR') {
      this.onRetroToggle?.();
    } else if (e.code === 'KeyH') {
      this.onHitboxToggle?.();
    } else if (e.code === 'KeyA') {
      this.onAIToggle?.();
    } else if (e.code === 'KeyT') {
      this.onThemeToggle?.();
    }
  };

  private handleKeyUp = (e: KeyboardEvent): void => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      this.jumpHeld = false;
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      e.preventDefault();
      this.duckHeld = false;
    }
  };

  private isButtonTarget(target: HTMLElement | null): boolean {
    return !!(target && (target.tagName === 'BUTTON' || target.closest?.('button')));
  }

  private handleTouchStart = (e: TouchEvent): void => {
    const target = e.target as HTMLElement | null;
    if (this.isButtonTarget(target)) {
      return;
    }

    if (e.cancelable) {
      e.preventDefault();
    }

    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    this.touchStartY = touch.clientY;

    const canvas = document.getElementById('game');
    const rect = canvas ? canvas.getBoundingClientRect() : null;

    const isLower = rect
      ? touch.clientY > rect.top + rect.height * 0.6
      : touch.clientY > window.innerHeight * 0.6;

    if (isLower) {
      this.duckHeld = true;
      this.jumpHeld = false;
    } else {
      this.jumpPressed = true;
      this.jumpHeld = true;
      this.restartPressed = true;
    }
  };

  private handleTouchMove = (e: TouchEvent): void => {
    const target = e.target as HTMLElement | null;
    if (this.isButtonTarget(target)) {
      return;
    }

    if (e.cancelable) {
      e.preventDefault();
    }

    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    const diffY = touch.clientY - this.touchStartY;

    if (diffY > 25) {
      this.duckHeld = true;
      this.jumpHeld = false;
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    const target = e.target as HTMLElement | null;
    if (this.isButtonTarget(target)) {
      return;
    }

    if (e.cancelable) {
      e.preventDefault();
    }

    this.jumpHeld = false;
    this.duckHeld = false;
  };

  consume(): InputState {
    const input: InputState = {
      jumpPressed: this.jumpPressed,
      jumpHeld: this.jumpHeld,
      duckHeld: this.duckHeld,
      restartPressed: this.restartPressed,
    };

    this.jumpPressed = false;
    this.restartPressed = false;

    return input;
  }
}
