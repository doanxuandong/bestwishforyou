// CozyAudio: Procedural Ambient Morning Music & Kitten Sound Synthesizer via Web Audio API

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

  toggleAmbient(onStateChange) {
    this.init();
    if (this.isPlaying) {
      this.stopAmbient();
      if (onStateChange) onStateChange(false);
      return false;
    } else {
      this.startAmbient();
      if (onStateChange) onStateChange(true);
      return true;
    }
  }

  startAmbient() {
    if (!this.ctx) this.init();
    if (!this.ctx) return;
    this.isPlaying = true;

    // Warm, gentle pentatonic morning chord progression
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00]  // G6
    ];
    let chordIdx = 0;

    const playChord = () => {
      if (!this.isPlaying || !this.ctx) return;
      const currentChord = chords[chordIdx % chords.length];
      currentChord.forEach((freq, i) => {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = i % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.035, this.ctx.currentTime + 1.2 + (i * 0.15));
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 3.8);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start();
          osc.stop(this.ctx.currentTime + 4.0);
        } catch {
          // ignore potential audio node issues
        }
      });
      chordIdx++;
    };

    playChord();
    this.ambientInterval = setInterval(playChord, 3800);
  }

  stopAmbient() {
    this.isPlaying = false;
    if (this.ambientInterval) {
      clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
  }

  // Phát âm thanh file MP3 từ thư mục public do người dùng tải lên
  playMeow() {
    try {
      const audio = new Audio('/yomecerlm3-meow-460686.mp3');
      audio.volume = 0.55; // Âm lượng dịu nhẹ vừa nghe
      audio.play().catch(() => {
        // Tránh lỗi khi trình duyệt chưa nhận user gesture đầu tiên
      });
    } catch {
      // Bỏ qua lỗi audio
    }
  }

  // Tạm dừng purr để âm thanh mp3 của người dùng được tròn trịa và rõ nhất
  playPurr() {}
}

export const soundManager = new CozyAudio();
export default soundManager;
