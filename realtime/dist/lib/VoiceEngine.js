"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceEngine = void 0;
class VoiceEngine {
    static speak(text, mood = 'encouraging') {
        if (!this.synth || !this.enabled)
            return;
        // Cancel existing speech
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        // Find a "robotic" or "professional" voice
        const voices = this.synth.getVoices();
        const voice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Microsoft David')) || voices[0];
        if (voice) {
            utterance.voice = voice;
        }
        // Adjust parameters based on mood
        switch (mood) {
            case 'snarky':
                utterance.pitch = 0.8;
                utterance.rate = 1.1;
                break;
            case 'urgent':
                utterance.pitch = 1.2;
                utterance.rate = 1.3;
                break;
            case 'celebratory':
                utterance.pitch = 1.1;
                utterance.rate = 1.0;
                break;
            default:
                utterance.pitch = 1.0;
                utterance.rate = 1.0;
        }
        this.synth.speak(utterance);
    }
    static setEnabled(enabled) {
        this.enabled = enabled;
    }
}
exports.VoiceEngine = VoiceEngine;
VoiceEngine.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
VoiceEngine.enabled = true;
