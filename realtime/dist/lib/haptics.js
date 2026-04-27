"use strict";
/**
 * Mobile Haptics Engine
 * Provides physical feedback for tactile user interactions.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Haptics = void 0;
exports.Haptics = {
    vibrate: (pattern) => {
        if (typeof window !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    },
    /** 50ms subtle buzz for interface interactions (buttons, tool selection) */
    light: () => exports.Haptics.vibrate(50),
    /** Sharp double-buzz for errors or incorrect answers */
    error: () => exports.Haptics.vibrate([50, 100, 50]),
    /** Rhythmic pulse for high-tension countdowns (Disaster Phase) */
    heartbeat: () => exports.Haptics.vibrate([100, 500, 100, 500]),
    /** Success buzz for correct answers or patches */
    success: () => exports.Haptics.vibrate([50, 20, 50]),
};
