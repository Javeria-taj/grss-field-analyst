// Scoring utilities

export function calcScore(correct: boolean, timeLeft: number, maxTime: number, base: number): number {
  if (!correct) return 0;
  return base + Math.round(base * 0.5 * (timeLeft / maxTime));
}

export function getTotalScore(scores: Record<number, number>): number {
  return Object.values(scores).reduce((a, b) => a + b, 0);
}

export function getTitle(score: number): string {
  if (score >= 3000) return 'Disaster Strategist';
  if (score >= 2500) return 'Climate Guardian';
  if (score >= 2000) return 'Resource Optimizer';
  if (score >= 1500) return 'Earth Observer';
  if (score >= 1000) return 'Field Analyst';
  return 'GRSS Trainee';
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
