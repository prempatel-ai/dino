export class Camera {
  readonly logicalWidth = 600;
  readonly logicalHeight = 150;
  readonly aspectRatio = 4 / 1;

  cssWidth: number = 600;
  cssHeight: number = 150;
  dpr: number = 1;
  scale: number = 1;

  private canvas: HTMLCanvasElement;
  private onResizeCallbacks: (() => void)[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.updateDimensions();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleResize);
  }

  private handleResize = (): void => {
    this.updateDimensions();
    for (const cb of this.onResizeCallbacks) {
      cb();
    }
  };

  onResize(callback: () => void): void {
    this.onResizeCallbacks.push(callback);
  }

  updateDimensions(): void {
    this.dpr = window.devicePixelRatio || 1;

    // Available container or window dimensions
    const parent = this.canvas.parentElement;
    const availableWidth = parent ? parent.clientWidth : window.innerWidth;
    const availableHeight = parent ? parent.clientHeight : window.innerHeight;

    let targetWidth = availableWidth;
    let targetHeight = targetWidth / this.aspectRatio;

    if (targetHeight > availableHeight && availableHeight > 0) {
      targetHeight = availableHeight;
      targetWidth = targetHeight * this.aspectRatio;
    }

    this.cssWidth = targetWidth;
    this.cssHeight = targetHeight;
    this.scale = this.cssWidth / this.logicalWidth;

    this.canvas.width = Math.round(this.cssWidth * this.dpr);
    this.canvas.height = Math.round(this.cssHeight * this.dpr);

    this.canvas.style.width = `${this.cssWidth}px`;
    this.canvas.style.height = `${this.cssHeight}px`;
  }

  applyTransform(ctx: CanvasRenderingContext2D): void {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(this.scale * this.dpr, this.scale * this.dpr);
  }

  destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
  }
}
