export class SoundSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor(initialMuted: boolean = false) {
    this.isMuted = initialMuted;
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.5;
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.5, this.ctx.currentTime);
    }
  }

  // Jump: square osc, 440 -> 880 Hz over 90 ms, gain 0.15 -> 0
  playJump(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.09);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.095);
  }

  // Milestone (100): two square blips 880 Hz then 1320 Hz, 70 ms each
  playMilestone(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;

    // Blip 1: 880 Hz
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(880, t);
    gain1.gain.setValueAtTime(0.12, t);
    gain1.gain.setValueAtTime(0.12, t + 0.06);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(t);
    osc1.stop(t + 0.075);

    // Blip 2: 1320 Hz after 80 ms
    const t2 = t + 0.08;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1320, t2);
    gain2.gain.setValueAtTime(0.12, t2);
    gain2.gain.setValueAtTime(0.12, t2 + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.07);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(t2);
    osc2.stop(t2 + 0.075);
  }

  // Crash: square 300 -> 80 Hz over 220 ms + short noise burst
  playCrash(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;

    // Tone drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.22);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.23);

    // Noise burst
    const bufferSize = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    noise.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(t);
  }

  // Landing: soft low sine 120 -> 60 Hz over 60 ms
  playLand(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.06);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.065);
  }

  // Near miss whoosh
  playNearMiss(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.085);
  }

  // High score 3-note rising fanfare
  playHighScore(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    const master = this.masterGain;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const t = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.1;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.15, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);

      osc.connect(gain);
      gain.connect(master);
      osc.start(noteTime);
      osc.stop(noteTime + 0.13);
    });
  }
}
