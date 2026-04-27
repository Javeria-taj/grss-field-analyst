"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionCommander = void 0;
class MissionCommander {
    static async generateCommentary(question, correctAnswer, stats, totalPlayers, phase) {
        const correctCount = stats.distribution[correctAnswer] || 0;
        const accuracy = totalPlayers > 0 ? (correctCount / totalPlayers) * 100 : 0;
        // ── AI Dynamic Prompting ──
        // If an API key is present, we could use a real LLM here.
        // For now, we use a sophisticated Rule-Based Intelligence that mimics the requested personality.
        if (this.apiKey) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [{
                                role: 'system',
                                content: `You are "Mission Commander," a slightly snarky but professional AI overseeing a Remote Sensing / Geospatial competition. 
              Generate a single, short sentence of live commentary (max 15 words).
              Be personality-driven. Use data points provided.
              Moods: snarky (if accuracy < 40%), encouraging (if accuracy > 70%), urgent (if low time), celebratory (if 100% correct).`
                            }, {
                                role: 'user',
                                content: `Question: "${question}". Correct Answer: "${correctAnswer}". Accuracy: ${accuracy.toFixed(1)}%. Total Analysts: ${totalPlayers}. Phase: ${phase}.`
                            }],
                        max_tokens: 40,
                        temperature: 0.8
                    })
                });
                const data = await response.json();
                const text = data.choices[0].message.content;
                return {
                    text,
                    mood: accuracy < 40 ? 'snarky' : accuracy > 80 ? 'celebratory' : 'encouraging'
                };
            }
            catch (err) {
                console.error('AI Commentary Error:', err);
            }
        }
        // ── Rule-Based Intelligence (High Fidelity Fallback) ──
        if (accuracy === 0 && totalPlayers > 0) {
            return { text: "Zero accuracy detected. Is the sensor array upside down? Mission Control is weeping.", mood: 'snarky' };
        }
        if (accuracy < 25) {
            return { text: `Only ${Math.round(accuracy)}% of you got that. I've seen better data from a broken weather balloon.`, mood: 'snarky' };
        }
        if (accuracy > 90) {
            return { text: "Near-perfect telemetry. You guys are operating at peak efficiency.", mood: 'celebratory' };
        }
        if (accuracy > 70) {
            return { text: "Strong performance. The board is looking green.", mood: 'encouraging' };
        }
        if (phase === 'anomaly_active') {
            return { text: "CRITICAL BREACH. PATCH THE FIREWALL OR FACE SCORE DEGRADATION.", mood: 'urgent' };
        }
        const generalSnarks = [
            "I see some of you are still guessing. This isn't a casino, it's a mission.",
            "Data quality is... questionable. Let's tighten up those responses.",
            "Some interesting 'interpretations' of the data appearing on my screen.",
            "The faction split is fascinating. Modis is falling behind.",
        ];
        return {
            text: generalSnarks[Math.floor(Math.random() * generalSnarks.length)],
            mood: 'snarky'
        };
    }
}
exports.MissionCommander = MissionCommander;
MissionCommander.apiKey = process.env.AI_API_KEY;
