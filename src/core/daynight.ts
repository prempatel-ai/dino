import { RUNNER_CONFIG } from './constants';

export class DayNightManager {
  isNight: boolean = false;
  nightFade: number = 0; // 0 (day) to 1 (night)
  moonPhase: number = 0; // 0 to 6
  lastInvertScore: number = 0;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.isNight = false;
    this.nightFade = 0;
    this.moonPhase = 0;
    this.lastInvertScore = 0;
  }

  update(
    score: number,
    frames: number = 1,
    msPerFrame: number = 1000 / 60,
  ): { inverted: boolean; biomeChanged: boolean } {
    let inverted = false;
    let biomeChanged = false;

    // Check invert trigger: every INVERT_DISTANCE (700) points
    if (
      score > 0 &&
      Math.floor(score / RUNNER_CONFIG.INVERT_DISTANCE) >
        Math.floor(this.lastInvertScore / RUNNER_CONFIG.INVERT_DISTANCE)
    ) {
      this.isNight = !this.isNight;
      inverted = true;
      biomeChanged = true;
      this.lastInvertScore = score;

      if (this.isNight) {
        this.moonPhase = (this.moonPhase + 1) % 7;
      }
    }

    // Smooth visual fade
    const targetFade = this.isNight ? 1 : 0;
    const fadeSpeed = (frames * msPerFrame) / 1000; // 1 second smooth transition
    if (this.nightFade < targetFade) {
      this.nightFade = Math.min(targetFade, this.nightFade + fadeSpeed);
    } else if (this.nightFade > targetFade) {
      this.nightFade = Math.max(targetFade, this.nightFade - fadeSpeed);
    }

    return { inverted, biomeChanged };
  }
}
