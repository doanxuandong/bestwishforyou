// CozyAudio: Procedural Ambient Morning Music & MP3 Puppy Bark Player

class CozyAudio {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.ambientInterval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Plays the requested stu9-small-bark-352865.mp3 sound effect on click/petting
  playBark() {
    try {
      const audio = new Audio('/stu9-small-bark-352865.mp3');
      audio.volume = 0.65;
      audio.play().catch(() => {
        // Fallback or ignore if blocked prior to user interaction
      });
    } catch {
      // Ignore audio error
    }
  }

  // Cute switch chime sound
  playSwitchChime() {
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.04 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.26);
      });
    } catch {}
  }
}

export const soundManager = new CozyAudio();
export default soundManager;
