// ============================================================
// GRSS FIELD ANALYST — Question Pack Types
// Shared shapes for every question set. Content lives in the
// individual pack files (set1.ts, set2.ts); this module holds
// only types so packs and consumers never import each other.
// ============================================================

export interface ScrambleQ {
  word: string; sc: string; hint: string; hint2?: string; expl: string; cat: string; pts: number; type: 'scramble';
}
export interface RiddleQ {
  q: string; ans: string; hint: string; hint2?: string; expl: string; cat: string; pts: number; type: 'riddle';
}
export type Level1Q = ScrambleQ | RiddleQ;

export interface ImageQ {
  img: string; q: string; opts: string[]; ans: string; expl: string; pts: number; hint?: string; hint2?: string;
}
export interface HangmanChallenge {
  em: string; word: string; hint: string; hint2?: string; expl: string; pts: number;
}
export interface MCQQuestion {
  q: string; opts: string[]; ans: string; expl: string; diff: 1 | 2 | 3; pts: number;
}
export interface Tool {
  id: string; name: string; price: number; icon: string; desc: string;
  eff: { flood: number; wildfire: number; earthquake: number };
}
export interface Combo {
  tools: string[]; name: string; bonus: number; desc: string; icon: string;
}
export interface Disaster {
  id: 'flood' | 'wildfire' | 'earthquake'; name: string; icon: string; color: string;
  desc: string; optTools: string[]; metrics: string[];
}

export interface ServerGameData {
  level1: { scrambles: ScrambleQ[]; riddles: RiddleQ[] };
  level2: { qs: ImageQ[] };
  level3: { chs: HangmanChallenge[] };
  level4: { qs: MCQQuestion[] };
  level5: { tools: Tool[]; combos: Combo[]; disasters: Disaster[] };
}


// ── Set identity ─────────────────────────────────────────────
// A QuestionSet is one complete, self-contained body of content:
// the questions for every level, the mission intro copy, and the
// per-level time limits. Switching sets swaps all three together.
export type SetId = 'set1' | 'set2';

export interface LevelIntro {
  icon: string; badge: string; title: string; story: string; rules: string;
}

export interface QuestionSet {
  id: SetId;
  label: string;          // shown in the admin set picker
  description: string;    // one-line context under the picker
  data: ServerGameData;
  intros: Record<number, LevelIntro>;
  timeLimits: Record<number, number>;
}
