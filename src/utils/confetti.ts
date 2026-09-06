import confetti from 'canvas-confetti';
import { playChime, triggerHaptic } from './audio';

/**
 * Fires a celebratory golden & emerald confetti burst with sparkles
 * for Khatma (Quran completion) or Tree / Habit milestones.
 */
export function fireCelebrationConfetti(type: 'khatma' | 'tree_full' | 'milestone' = 'milestone') {
  playChime('milestone');
  triggerHaptic(type === 'khatma' ? 120 : 60);

  if (typeof window === 'undefined') return;

  if (type === 'khatma') {
    // Grand celebratory fireworks & double cannons
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#0F6B50', '#C19E2B', '#2DD4BF', '#F59E0B', '#E5DDCF', '#10B981'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } else if (type === 'tree_full') {
    // Joyful golden burst from center
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#C19E2B', '#0F6B50', '#FCD34D', '#10B981', '#34D399'],
      shapes: ['circle', 'square'],
      ticks: 200,
      gravity: 0.8
    });
  } else {
    // Light celebration burst
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#0F6B50', '#C19E2B', '#34D399', '#FBBF24'],
      ticks: 160
    });
  }
}
