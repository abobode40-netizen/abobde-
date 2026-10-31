import confetti from 'canvas-confetti';
import { playChime, triggerHaptic } from './audio';

/**
 * Fires a celebratory golden & sky blue confetti burst with sparkles
 * for Khatma (Quran completion) or Tree / Habit milestones.
 * Strictly uses celestial light blues, cyan, and royal gold (no green).
 */
export function fireCelebrationConfetti(type: 'khatma' | 'tree_full' | 'milestone' = 'milestone') {
  playChime('milestone');
  triggerHaptic(type === 'khatma' ? 120 : 60);

  if (typeof window === 'undefined') return;

  if (type === 'khatma') {
    // Grand celebratory fireworks & double cannons in sky blue & gold
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#38BDF8', '#C19E2B', '#0284C7', '#F59E0B', '#BAE6FD', '#7DD3FC'];

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
    // Joyful golden & azure burst from center
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#C19E2B', '#38BDF8', '#FCD34D', '#0284C7', '#7DD3FC'],
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
      colors: ['#38BDF8', '#C19E2B', '#7DD3FC', '#FBBF24'],
      ticks: 160
    });
  }
}
