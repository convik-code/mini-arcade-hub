export class WebAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  
  public sfxOn: boolean = true;
  public musicOn: boolean = true;
  
  private musicOsc: OscillatorNode | null = null;
  
  // Audio state tracking
  private activeTimeouts: Set<ReturnType<typeof setTimeout>> = new Set();
  private activeOscillators: Set<OscillatorNode> = new Set();
  
  // Throttle map: key is sound hash, value is last played timestamp
  private throttleMap: Map<string, number> = new Map();

  public init() {
     // User interaction securely unlocks the AudioContext in strict mobile browsers
     if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioCtx();
        
        // Master Volume Output
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5; 
        
        // Dynamics Compressor to prevent clipping during cascade/spam
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
        
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);
     }
     
     if (this.ctx.state === 'suspended') {
        this.ctx.resume();
     }
  }

  public setPreferences(sfx: boolean, music: boolean) {
     this.sfxOn = sfx;
     this.musicOn = music;
     
     if (!sfx) {
        this.stopAll();
     }
     if (!music && this.musicOsc) {
        try { this.musicOsc.stop(); } catch(e) {}
        this.musicOsc = null;
     }
  }

  public stopAll() {
     // Clear all delayed sounds
     for (const timer of this.activeTimeouts) {
        clearTimeout(timer);
     }
     this.activeTimeouts.clear();

     // Stop immediately active procedural oscillators
     for (const osc of this.activeOscillators) {
        try { osc.stop(); } catch(e) {}
     }
     this.activeOscillators.clear();
  }

  // Safe wrapper for staggered SFX
  private scheduleSound(fn: () => void, delayMs: number) {
     if (!this.sfxOn) return;
     const timerId = setTimeout(() => {
        this.activeTimeouts.delete(timerId);
        if (this.sfxOn) fn();
     }, delayMs);
     this.activeTimeouts.add(timerId);
  }

  // Safely play a synthesized tone
  private playTone(
     freq: number, type: OscillatorType, duration: number, vol = 0.1, 
     slideFreq?: number, secondFreq?: number, attack = 0.01, release = 0.1
  ) {
     if (!this.sfxOn || !this.ctx || !this.masterGain) return;
     
     // Throttling to prevent exactly identical noises overloading the exact same frame
     const hash = `${freq}-${type}-${duration}-${slideFreq || 0}`;
     const now = Date.now();
     const lastPlayed = this.throttleMap.get(hash) || 0;
     if (now - lastPlayed < 40) return; // 40ms throttle
     this.throttleMap.set(hash, now);

     const t = this.ctx.currentTime;
     const osc = this.ctx.createOscillator();
     const gain = this.ctx.createGain();
     
     osc.type = type;
     osc.frequency.setValueAtTime(freq, t);
     
     if (slideFreq) {
        osc.frequency.exponentialRampToValueAtTime(slideFreq, t + duration);
     }

     gain.gain.setValueAtTime(0, t);
     gain.gain.linearRampToValueAtTime(vol, t + attack);
     gain.gain.exponentialRampToValueAtTime(0.01, t + duration - release);
     gain.gain.linearRampToValueAtTime(0, t + duration);

     osc.connect(gain);
     gain.connect(this.masterGain);

     osc.start(t);
     osc.stop(t + duration);
     
     this.activeOscillators.add(osc);
     osc.onended = () => {
        this.activeOscillators.delete(osc);
        osc.disconnect();
        gain.disconnect();
     };

     // Optional dual-oscillator layering (for fuller chords/impacts)
     if (secondFreq) {
        const osc2 = this.ctx.createOscillator();
        osc2.type = type;
        osc2.frequency.setValueAtTime(secondFreq, t);
        if (slideFreq) osc2.frequency.exponentialRampToValueAtTime(slideFreq * (secondFreq/freq), t + duration);
        
        osc2.connect(gain);
        osc2.start(t);
        osc2.stop(t + duration);
        
        this.activeOscillators.add(osc2);
        osc2.onended = () => {
           this.activeOscillators.delete(osc2);
           osc2.disconnect();
        };
     }
  }

  // --- GLOBAL UI SOUNDS ---
  public playClick() {
     this.playTone(600, 'sine', 0.05, 0.2, 800, undefined, 0.01, 0.02);
  }
  public playCardSelect() {
     this.playTone(400, 'sine', 0.15, 0.3, 1200, 600, 0.02, 0.1);
  }
  public playToggle() {
     this.playTone(800, 'sine', 0.08, 0.1, 1000, undefined, 0.01, 0.04);
  }
  public playReward() {
     // An ascending triumphant arpeggio abstraction
     this.playTone(440, 'square', 0.1, 0.1, undefined, 554); // A4, C#5
     this.scheduleSound(() => this.playTone(554, 'square', 0.1, 0.1, undefined, 659), 100); // C#5, E5
     this.scheduleSound(() => this.playTone(880, 'sine', 0.4, 0.2, undefined, 1108, 0.05, 0.3), 200); // A5
  }
  public playError() {
     this.playTone(150, 'sawtooth', 0.2, 0.1, 100, 160, 0.02, 0.1);
  }

  // --- BLOCK BLAST ---
  public playPickUp() {
     this.playTone(300, 'sine', 0.1, 0.1, 400);
  }
  public playDrop() {
     this.playTone(200, 'triangle', 0.15, 0.3, 100, undefined, 0.01, 0.1);
  }
  public playLineClear(lines: number, combo: number) {
     const baseFreq = 400 + (lines * 100) + (combo * 50);
     this.playTone(baseFreq, 'square', 0.3, 0.15, baseFreq * 1.5, baseFreq * 1.2, 0.05, 0.2);
  }

  // --- 2048 MERGE ---
  public playSlide() {
     // Simulate quick swoosh/slide
     this.playTone(100, 'triangle', 0.1, 0.1, 200, undefined, 0.02, 0.05);
  }
  public playMerge(value: number) {
     // Mathematically pitch up higher scales! Math.log2(2) = 1, Math.log2(2048) = 11
     const tier = Math.log2(value) || 1; 
     const freq = 200 + (tier * 60);
     this.playTone(freq, 'sine', 0.2, 0.2, freq * 1.2, freq * 1.5, 0.02, 0.15);
  }
  public playMilestone() {
     this.playReward();
  }

  // --- MATCH-3 ---
  public playSwap() {
     this.playTone(500, 'sine', 0.1, 0.1, 600, undefined, 0.02, 0.05);
  }
  public playMatch(combo: number) {
     const p = Math.min(combo, 10);
     const freq = 300 * Math.pow(1.1, p); // Pitch increases by 10% each cascade
     this.playTone(freq, 'sine', 0.2, 0.2, freq * 1.5, freq * 1.25, 0.02, 0.15);
  }
  public playLaser() {
     this.playTone(1200, 'sawtooth', 0.4, 0.1, 200, undefined, 0.01, 0.3);
  }
  public playExplosion() {
     this.playTone(100, 'square', 0.5, 0.3, 40, 60, 0.01, 0.4);
  }
  public playShuffle() {
     this.playTone(600, 'sine', 0.3, 0.1, 200, 800, 0.1, 0.2);
  }

  // --- GAME OVER ---
  public playGameOver() {
     this.playTone(300, 'sawtooth', 0.3, 0.2, 150, 200, 0.05, 0.2);
     this.scheduleSound(() => this.playTone(250, 'sawtooth', 0.6, 0.2, 100, 150, 0.1, 0.5), 300);
  }

  // --- BACKGROUND MUSIC ---
  // Minimalist hook ready to mount external tracks or synthesizers later
  public playBGM() {
     if (!this.musicOn || !this.ctx || !this.masterGain) return;
     if (this.musicOsc) return; // Already rolling
     
     // Note: A real implementation for a casual game could run a highly complex scheduling 
     // loop here. For now, we prepare the architectural stub as requested.
  }
}

export const soundEngine = new WebAudioEngine();

