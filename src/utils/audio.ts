/**
 * Sound synthesizer & Audio utilities for Jannat Al-Rahman
 */

// Play a gentle soothing Islamic chime using Web Audio API (no external asset required)
export function playChime(type: 'success' | 'click' | 'bell' | 'milestone' | 'streak' | 'pop' = 'click') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    if (type === 'click' || type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'milestone' || type === 'streak') {
      // 3 ascending notes
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.15, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.35);
      });
    } else if (type === 'success') {
      // Soft gentle chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } else if (type === 'bell') {
      // Warm gong/bowl tone
      [440, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(i === 0 ? 0.25 : 0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      });
    }
  } catch {
    // Ignore audio context errors in quiet mode or user blocked
  }
}

// Trigger browser vibration if supported
export function triggerHaptic(duration: number | number[] | 'light' | 'medium' | 'heavy' | 'selection' = 25) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      let pattern: number | number[] = 25;
      if (typeof duration === 'number' || Array.isArray(duration)) {
        pattern = duration;
      } else if (duration === 'light' || duration === 'selection') {
        pattern = 15;
      } else if (duration === 'medium') {
        pattern = 30;
      } else if (duration === 'heavy') {
        pattern = 60;
      }
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
}
