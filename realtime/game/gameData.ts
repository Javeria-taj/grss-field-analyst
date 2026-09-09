// ============================================================
// GRSS FIELD ANALYST — Server-Side Game Data (WITH ANSWERS)
// This file lives on the realtime server only. Answers never
// leave the server — clients receive stripped question payloads.
//
// Content now lives in ./packs. This module stays as the stable
// import surface and exposes the DEFAULT set, so anything that
// does not care about set switching keeps working unchanged.
// Set-aware code should go through ./packs instead.
// ============================================================

import { getSet, DEFAULT_SET_ID } from './packs';

export * from './packs/types';

const DEFAULT_SET = getSet(DEFAULT_SET_ID);

/** Default set's question data. Prefer getSet(id).data when set-aware. */
const DATA = DEFAULT_SET.data;
export default DATA;

/** Default set's intro copy. Prefer getSet(id).intros when set-aware. */
export const LEVEL_INTROS = DEFAULT_SET.intros;

/** Default set's per-level time limits. Prefer getSet(id).timeLimits. */
export const TIME_LIMITS = DEFAULT_SET.timeLimits;

// Timings shared by every set (not yet per-set).
export const AUCTION_TIME = 420;  // 420s for tool auction
export const DISASTER_TIME = 300; // 300s for disaster response
export const INTRO_TIME = 15;     // 15s level intro
export const REVIEW_TIME = 10;    // 10s answer review
