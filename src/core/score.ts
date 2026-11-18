import { SCORE_CONFIG } from './constants';

export class ScoreManager {
  distance: number = 0;
  score: number = 0;
  highScore: number = 0;
  isFlashing: boolean = false;
  flashIterations: number = 0;
  flashTimerMs: number = 0;

  private lastMilestoneScore: number = 0;

  constructor(initialHighScore: number = 0) {
    this.highScore = initialHighScore;
    this.reset();
  }

  reset(): void {
    this.distance = 0;
    this.score = 0;
    this.isFlashing = false;
    this.flashIterations = 0;
    this.flashTimerMs = 0;
    this.lastMilestoneScore = 0;
  }

  setHighScore(val: number): void {
    this.highScore = Math.max(this.highScore, val);
  }

  update(
    speed: number,
    frames: number = 1,
    msPerFrame: number = 1000 / 60,
  ): { milestoneAchieved: boolean; newHighScore: boolean } {
    let milestoneAchieved = false;
    let newHighScore = false;

    // Advance distance
    this.distance += speed * frames;
    const newScore = Math.min(
      Math.round(this.distance * SCORE_CONFIG.COEFFICIENT),
      SCORE_CONFIG.MAX_SCORE,
    );

    // Milestone trigger (every 100 points)
    if (newScore > 0 && Math.floor(newScore / 100) > Math.floor(this.lastMilestoneScore / 100)) {
      milestoneAchieved = true;
      this.lastMilestoneScore = newScore;
      this.isFlashing = true;
      this.flashIterations = 0;
      this.flashTimerMs = 0;
    }

    if (newScore > this.highScore && this.highScore > 0 && this.score <= this.highScore) {
      newHighScore = true;
    }

    this.score = newScore;

    // Flash animation logic: 3 flashes at 250 ms each (total 6 toggle half-cycles)
    if (this.isFlashing) {
      this.flashTimerMs += frames * msPerFrame;
      if (this.flashTimerMs >= SCORE_CONFIG.FLASH_DURATION) {
        this.flashTimerMs -= SCORE_CONFIG.FLASH_DURATION;
        this.flashIterations++;
        if (this.flashIterations >= SCORE_CONFIG.FLASH_ITERATIONS * 2) {
          this.isFlashing = false;
          this.flashIterations = 0;
          this.flashTimerMs = 0;
        }
      }
    }

    return { milestoneAchieved, newHighScore };
  }

  onCrash(): boolean {
    let isNewHighScore = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      isNewHighScore = true;
    }
    return isNewHighScore;
  }
}
