import trexIdleRaw from '../../assets/svg/trex-idle.svg?raw';
import trexRun1Raw from '../../assets/svg/trex-run1.svg?raw';
import trexRun2Raw from '../../assets/svg/trex-run2.svg?raw';
import trexDuck1Raw from '../../assets/svg/trex-duck1.svg?raw';
import trexDuck2Raw from '../../assets/svg/trex-duck2.svg?raw';
import trexDeadRaw from '../../assets/svg/trex-dead.svg?raw';

import cactusSmall1Raw from '../../assets/svg/cactus-small-1.svg?raw';
import cactusSmall2Raw from '../../assets/svg/cactus-small-2.svg?raw';
import cactusSmall3Raw from '../../assets/svg/cactus-small-3.svg?raw';

import cactusLarge1Raw from '../../assets/svg/cactus-large-1.svg?raw';
import cactusLarge2Raw from '../../assets/svg/cactus-large-2.svg?raw';
import cactusLarge3Raw from '../../assets/svg/cactus-large-3.svg?raw';

import ptero1Raw from '../../assets/svg/ptero-1.svg?raw';
import ptero2Raw from '../../assets/svg/ptero-2.svg?raw';
import cloudRaw from '../../assets/svg/cloud.svg?raw';

import moon0Raw from '../../assets/svg/moon-0.svg?raw';
import moon1Raw from '../../assets/svg/moon-1.svg?raw';
import moon2Raw from '../../assets/svg/moon-2.svg?raw';
import moon3Raw from '../../assets/svg/moon-3.svg?raw';
import moon4Raw from '../../assets/svg/moon-4.svg?raw';
import moon5Raw from '../../assets/svg/moon-5.svg?raw';
import moon6Raw from '../../assets/svg/moon-6.svg?raw';

import starRaw from '../../assets/svg/star.svg?raw';
import restartRaw from '../../assets/svg/restart.svg?raw';

export type SpriteKey =
  | 'trex-idle'
  | 'trex-run1'
  | 'trex-run2'
  | 'trex-duck1'
  | 'trex-duck2'
  | 'trex-dead'
  | 'cactus-small-1'
  | 'cactus-small-2'
  | 'cactus-small-3'
  | 'cactus-large-1'
  | 'cactus-large-2'
  | 'cactus-large-3'
  | 'ptero-1'
  | 'ptero-2'
  | 'cloud'
  | 'moon-0'
  | 'moon-1'
  | 'moon-2'
  | 'moon-3'
  | 'moon-4'
  | 'moon-5'
  | 'moon-6'
  | 'star'
  | 'restart';

const RAW_SVGS: Record<SpriteKey, string> = {
  'trex-idle': trexIdleRaw,
  'trex-run1': trexRun1Raw,
  'trex-run2': trexRun2Raw,
  'trex-duck1': trexDuck1Raw,
  'trex-duck2': trexDuck2Raw,
  'trex-dead': trexDeadRaw,
  'cactus-small-1': cactusSmall1Raw,
  'cactus-small-2': cactusSmall2Raw,
  'cactus-small-3': cactusSmall3Raw,
  'cactus-large-1': cactusLarge1Raw,
  'cactus-large-2': cactusLarge2Raw,
  'cactus-large-3': cactusLarge3Raw,
  'ptero-1': ptero1Raw,
  'ptero-2': ptero2Raw,
  cloud: cloudRaw,
  'moon-0': moon0Raw,
  'moon-1': moon1Raw,
  'moon-2': moon2Raw,
  'moon-3': moon3Raw,
  'moon-4': moon4Raw,
  'moon-5': moon5Raw,
  'moon-6': moon6Raw,
  star: starRaw,
  restart: restartRaw,
};

export class SpriteAtlas {
  private cache: Map<string, HTMLCanvasElement> = new Map();
  private scale: number = 1;
  private dpr: number = 1;

  constructor() {
    this.updateScale(1, 1);
  }

  updateScale(scale: number, dpr: number): void {
    if (this.scale === scale && this.dpr === dpr && this.cache.size > 0) {
      return;
    }
    this.scale = scale;
    this.dpr = dpr;
    this.cache.clear();
  }

  getSprite(
    key: SpriteKey,
    color: string = '#535353',
    width: number,
    height: number,
  ): HTMLCanvasElement | null {
    const targetW = Math.max(1, Math.round(width * this.scale * this.dpr));
    const targetH = Math.max(1, Math.round(height * this.scale * this.dpr));
    const cacheKey = `${key}_${color}_${targetW}_${targetH}`;

    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const rawSvg = RAW_SVGS[key];
    if (!rawSvg) {
      return null;
    }

    const coloredSvg = rawSvg.replace(/currentColor/g, color);
    const encoded = encodeURIComponent(coloredSvg);
    const dataUri = `data:image/svg+xml;charset=utf-8,${encoded}`;

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, targetW, targetH);
      }
    };
    img.src = dataUri;

    this.cache.set(cacheKey, canvas);
    return canvas;
  }

  async preloadAll(colors: string[] = ['#535353', '#E8E8E8', '#4F6F52', '#9FBFA2']): Promise<void> {
    const promises: Promise<void>[] = [];

    const defaultDims: Partial<Record<SpriteKey, [number, number]>> = {
      'trex-idle': [44, 47],
      'trex-run1': [44, 47],
      'trex-run2': [44, 47],
      'trex-duck1': [59, 25],
      'trex-duck2': [59, 25],
      'trex-dead': [44, 47],
      'cactus-small-1': [17, 35],
      'cactus-small-2': [34, 35],
      'cactus-small-3': [51, 35],
      'cactus-large-1': [25, 50],
      'cactus-large-2': [50, 50],
      'cactus-large-3': [75, 50],
      'ptero-1': [46, 40],
      'ptero-2': [46, 40],
      cloud: [46, 14],
      restart: [36, 32],
    };

    for (const color of colors) {
      for (const [key, [w, h]] of Object.entries(defaultDims)) {
        promises.push(
          new Promise((resolve) => {
            const canvas = this.getSprite(key as SpriteKey, color, w, h);
            if (canvas) {
              resolve();
            } else {
              resolve();
            }
          }),
        );
      }
    }

    await Promise.all(promises);
  }
}
