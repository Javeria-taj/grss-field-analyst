// ============================================================
// GRSS FIELD ANALYST — Question Set Registry
// One place that knows every pack the game can run. The engine
// holds a SetId; everything else resolves through getSet().
// ============================================================

import { SET1 } from './set1';
import { SET2 } from './set2';
import type { QuestionSet, SetId } from './types';

export * from './types';

export const QUESTION_SETS: Record<SetId, QuestionSet> = {
  set1: SET1,
  set2: SET2,
};

export const DEFAULT_SET_ID: SetId = 'set1';

export function isSetId(value: unknown): value is SetId {
  return typeof value === 'string' && value in QUESTION_SETS;
}

export function getSet(id: SetId): QuestionSet {
  return QUESTION_SETS[id] ?? QUESTION_SETS[DEFAULT_SET_ID];
}

// How many questions a set can supply for a level, ignoring the
// admin bank. Level 5 is driven client-side, so it always counts
// as populated.
export function setLevelCount(id: SetId, level: number): number {
  const d = getSet(id).data;
  switch (level) {
    case 1: return d.level1.scrambles.length + d.level1.riddles.length;
    case 2: return d.level2.qs.length;
    case 3: return d.level3.chs.length;
    case 4: return d.level4.qs.length;
    case 5: return 1;
    default: return 0;
  }
}

// Per-level question counts for every set — surfaced to the admin
// panel so an empty pack is visible before anyone starts a level.
export function setInventory(id: SetId): Record<number, number> {
  return { 1: setLevelCount(id, 1), 2: setLevelCount(id, 2), 3: setLevelCount(id, 3), 4: setLevelCount(id, 4) };
}

export interface SetCatalogEntry {
  id: SetId;
  label: string;
  description: string;
  inventory: Record<number, number>;
  total: number;
}

/**
 * Content-free description of every set, safe to send to the admin
 * client. Never include the pack data itself — it holds the answers.
 */
export function getSetCatalog(): SetCatalogEntry[] {
  return (Object.keys(QUESTION_SETS) as SetId[]).map(id => {
    const inventory = setInventory(id);
    return {
      id,
      label: QUESTION_SETS[id].label,
      description: QUESTION_SETS[id].description,
      inventory,
      total: Object.values(inventory).reduce((a, b) => a + b, 0),
    };
  });
}
