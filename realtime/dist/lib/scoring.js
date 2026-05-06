"use strict";
// Scoring utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcScore = calcScore;
exports.getTotalScore = getTotalScore;
exports.getTitle = getTitle;
exports.shuffle = shuffle;
function calcScore(correct, timeLeft, maxTime, base) {
    if (!correct)
        return 0;
    return base + Math.round(base * 0.5 * (timeLeft / maxTime));
}
function getTotalScore(scores) {
    return Object.values(scores).reduce((a, b) => a + b, 0);
}
function getTitle(score) {
    if (score >= 3000)
        return 'Disaster Strategist';
    if (score >= 2500)
        return 'Climate Guardian';
    if (score >= 2000)
        return 'Resource Optimizer';
    if (score >= 1500)
        return 'Earth Observer';
    if (score >= 1000)
        return 'Field Analyst';
    return 'GRSS Trainee';
}
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
