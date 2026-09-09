// ============================================================
// GRSS FIELD ANALYST — SET 2 (Faculty Conclave Pack)
// Content source: GRSS_Faculty_Game_Master_Question_Pack.pdf
// (Levels 1-3, 5) and "Level 4 latest.pdf" (Level 4).
//
// SCAFFOLD ONLY — questions are authored in a later phase.
// A level with an empty array here falls through to nothing:
// startLevel() refuses to run a level this set cannot populate,
// so an unfinished pack can never reach players mid-event.
// ============================================================

import type { ServerGameData, QuestionSet, LevelIntro } from './types';

const SET2_DATA: ServerGameData = {
  level1: { scrambles: [], riddles: [] },
  level2: { qs: [] },
  level3: { chs: [] },
  level4: { qs: [] },
  // Level 5 content for Set 2 lives client-side in
  // components/game/level5/ — see the Level 5 pack work item.
  level5: { tools: [], combos: [], disasters: [] },
};

const SET2_INTROS: Record<number, LevelIntro> = {
  1: { icon: '🔤', badge: 'MISSION 01', title: 'DECODE THE EARTH', story: 'Placeholder — authored with the Set 2 content.', rules: '📋 Mission Rules\n• 10 challenges: 5 Scrambles + 5 Riddles' },
  2: { icon: '🛰️', badge: 'MISSION 02', title: 'SEE WHAT THE SATELLITE SEES', story: 'Placeholder — authored with the Set 2 content.', rules: '📋 Mission Rules\n• 5 visual challenges' },
  3: { icon: '🔐', badge: 'MISSION 03', title: 'CRACK THE CODE', story: 'Placeholder — authored with the Set 2 content.', rules: '📋 Mission Rules\n• 5 Emoji Hangman challenges' },
  4: { icon: '⚡', badge: 'MISSION 04', title: 'RAPID FIRE', story: 'Placeholder — authored with the Set 2 content.', rules: '📋 Mission Rules\n• 5 high-speed MCQs' },
  5: { icon: '🌍', badge: 'MISSION 05', title: 'PRESSURE AUCTION', story: 'Placeholder — authored with the Set 2 content.', rules: '📋 Mission Rules\n• Limited budget — prices rise every 10 seconds' },
};

const SET2_TIME_LIMITS: Record<number, number> = {
  1: 25,
  2: 25,
  3: 25,
  4: 15,
};

export const SET2: QuestionSet = {
  id: 'set2',
  label: 'Set 2 — Faculty Conclave Pack',
  description: 'New faculty-edition pack. Content not yet authored.',
  data: SET2_DATA,
  intros: SET2_INTROS,
  timeLimits: SET2_TIME_LIMITS,
};

export default SET2;
