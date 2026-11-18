export class AmbientAudio {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isMuted: boolean = false;
  private isRunning: boolean = false;

  constructor(isMuted: boolean = false) {
    this.isMuted = isMuted;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(muted ? 0 : 0.03, this.ctx.currentTime);
    }
  }

  start(): void {
    if (this.isRunning || typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = this.isMuted ? 0 : 0.03; // Gentle ambient <= 5%
      this.gainNode.connect(this.ctx.destination);

      // Low pass filter for soft desert wind hum
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.value = 400;
      this.filterNode.connect(this.gainNode);

      // 2 seconds looping pink-like noise buffer
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
      }

      this.noiseNode = this.ctx.createBufferSource();
      this.noiseNode.buffer = buffer;
      this.noiseNode.loop = true;
      this.noiseNode.connect(this.filterNode);
      this.noiseNode.start();

      this.isRunning = true;
    } catch {
      // Audio context policy blocked
    }
  }

  stop(): void {
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
      } catch {
        // already stopped
      }
      this.noiseNode.disconnect();
      this.noiseNode = null;
    }
    this.isRunning = false;
  }
}
