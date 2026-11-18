import { Storage } from '../storage';

export class SettingsManager {
  isRetro: boolean;
  isMuted: boolean;
  reducedEffects: boolean;
  showHitboxes: boolean;

  constructor() {
    this.isRetro = Storage.getBoolean('dino_retro', false);
    this.isMuted = Storage.getBoolean('dino_muted', false);
    this.reducedEffects = Storage.getBoolean('dino_reduced_effects', false);
    this.showHitboxes = false;
  }

  toggleRetro(): boolean {
    this.isRetro = !this.isRetro;
    Storage.setBoolean('dino_retro', this.isRetro);
    return this.isRetro;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    Storage.setBoolean('dino_muted', this.isMuted);
    return this.isMuted;
  }

  toggleReducedEffects(): boolean {
    this.reducedEffects = !this.reducedEffects;
    Storage.setBoolean('dino_reduced_effects', this.reducedEffects);
    return this.reducedEffects;
  }

  toggleHitboxes(): boolean {
    this.showHitboxes = !this.showHitboxes;
    return this.showHitboxes;
  }
}
