import type { InputState } from '../core/types';

export class InputHandler {
  private jumpPressed: boolean = false;
  private jumpHeld: boolean = false;
  private duckHeld: boolean = false;
  private restartPressed: boolean = false;

  private touchStartY: number = 0;

  onMuteToggle?: () => void;
  onRetroToggle?: () => void;
  onHitboxToggle?: () => void;

  constructor(targetElement: HTMLElement | Window = window) {
    targetElement.addEventListener('keydown', this.handleKeyDown as EventListener);
    targetElement.addEventListener('keyup', this.handleKeyUp as EventListener);

    targetElement.addEventListener('touchstart', this.handleTouchStart as EventListener, { passive: false });
    targetElement.addEventListener('touchend', this.handleTouchEnd as EventListener, { passive: false });
    targetElement.addEventListener('touchmove', this.handleTouchMove as EventListener, { passive: false });
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    // Avoid interfering with browser dev tools
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      return;
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

  private handleTouchStart = (e: TouchEvent): void => {
    e.preventDefault();
    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    this.touchStartY = touch.clientY;

    const screenHeight = window.innerHeight;
    const isLowerHalf = touch.clientY > screenHeight * 0.65;

    if (isLowerHalf) {
      this.duckHeld = true;
    } else {
      this.jumpPressed = true;
      this.jumpHeld = true;
      this.restartPressed = true;
    }
  };

  private handleTouchMove = (e: TouchEvent): void => {
    e.preventDefault();
    if (e.touches.length === 0) return;

    const touch = e.touches[0];
    const diffY = touch.clientY - this.touchStartY;

    // Swipe down initiates duck
    if (diffY > 30) {
      this.duckHeld = true;
      this.jumpHeld = false;
    }
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    e.preventDefault();
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

    // Reset single-frame action triggers
    this.jumpPressed = false;
    this.restartPressed = false;

    return input;
  }
}
