// ============================================================
// GRSS FIELD ANALYST — Client Game Data (DISPLAY ONLY)
// All answers & scoring data live on the server.
// This file contains only UI display constants.
// ============================================================

export const LEVEL_INTROS: Record<number, { icon: string; badge: string; title: string; story: string; rules: string }> = {
  1: { icon: '🔤', badge: 'MISSION 01', title: 'TRAINING MISSION', story: "You've just been deployed as a GRSS Field Analyst. Unscramble classified satellite terminology and decode encrypted field riddles.", rules: '📋 Mission Rules\n• 10 questions: 5 Word Scrambles + 5 Riddles\n• ⏱ 60 seconds per question\n• Type your answer and press Enter\n• Speed bonus for fast correct answers' },
  2: { icon: '🛰️', badge: 'MISSION 02', title: 'INTELLIGENCE GATHERING', story: "Ground sensors are offline. Analyse incoming satellite imagery and correctly identify what Earth's orbit is revealing.", rules: '📋 Mission Rules\n• 5 satellite image analysis questions\n• ⏱ 60 seconds per image\n• Select the correct interpretation from 4 options' },
  3: { icon: '🔐', badge: 'MISSION 03', title: 'CODE BREAKING', story: "Intercepted transmissions contain encrypted geoscience terminology replaced with emoji sequences. Reconstruct the original words.", rules: '📋 Mission Rules\n• 5 Emoji Hangman challenges\n• ⏱ 120 seconds per challenge\n• Click letters to guess — 6 wrong guesses allowed' },
  4: { icon: '⚡', badge: 'MISSION 04', title: 'RAPID ASSESSMENT', story: "Incoming alert — a cascade of satellite data is flooding your terminal. Rapidly assess and classify each data feed.", rules: '📋 Mission Rules\n• 10 multiple-choice questions\n• ⏱ 90 seconds per question\n• Progressive difficulty (⭐ → ⭐⭐⭐)' },
  5: { icon: '🌍', badge: 'MISSION 05', title: 'CORE SIMULATION', story: "Final challenge. Acquire satellite monitoring tools from a live auction, then deploy them to respond to a real-world crisis.", rules: '📋 Mission Rules\n• Part A: Auction — $10,000 budget, max 5 tools\n• Part B: Deploy tools against a disaster\n• Scoring = effectiveness + budget efficiency + combos' },
};

export function getTitle(score: number): string {
  if (score >= 3000) return 'Disaster Strategist';
  if (score >= 2500) return 'Climate Guardian';
  if (score >= 2000) return 'Resource Optimizer';
  if (score >= 1500) return 'Earth Observer';
  if (score >= 1000) return 'Field Analyst';
  return 'GRSS Trainee';
}
