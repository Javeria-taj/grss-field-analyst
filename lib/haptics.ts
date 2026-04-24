/**
 * Mobile Haptics Engine
 * Provides physical feedback for tactile user interactions.
 */

export const Haptics = {
  vibrate: (pattern: number | number[]) => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  },

  /** 50ms subtle buzz for interface interactions (buttons, tool selection) */
  light: () => Haptics.vibrate(50),

  /** Sharp double-buzz for errors or incorrect answers */
  error: () => Haptics.vibrate([50, 100, 50]),

  /** Rhythmic pulse for high-tension countdowns (Disaster Phase) */
  heartbeat: () => Haptics.vibrate([100, 500, 100, 500]),

  /** Success buzz for correct answers or patches */
  success: () => Haptics.vibrate([50, 20, 50]),
};
