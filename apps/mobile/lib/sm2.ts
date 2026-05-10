/**
 * SM-2 spaced repetition algorithm. Pure functions.
 *
 * State per card:
 *   - ease: difficulty factor (default 2.5, min 1.3)
 *   - interval: days until next due
 *   - nextDue: ISO datetime
 *   - repetitions: consecutive successful reviews
 */

export type Sm2Rating = 'again' | 'hard' | 'good' | 'easy';

export interface Sm2State {
  ease: number;
  interval: number;
  repetitions: number;
  nextDue: string;
  lastReviewedAt: string;
}

export const SM2_DEFAULTS: Sm2State = {
  ease: 2.5,
  interval: 0,
  repetitions: 0,
  nextDue: new Date().toISOString(),
  lastReviewedAt: new Date(0).toISOString(),
};

const RATING_QUALITY: Record<Sm2Rating, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

/** Apply an SM-2 review and return the new state. */
export function applySm2(prev: Sm2State | undefined, rating: Sm2Rating, now: Date = new Date()): Sm2State {
  const cur = prev ?? { ...SM2_DEFAULTS };
  const q = RATING_QUALITY[rating];

  let ease = cur.ease;
  let interval: number;
  let repetitions = cur.repetitions;

  if (q < 3) {
    // Failed — reset to start of cycle
    repetitions = 0;
    interval = 0; // due again within minutes; we treat 0 as "review again today"
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(cur.interval * ease);
    repetitions += 1;

    // Update ease per SM-2 formula
    ease = ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (ease < 1.3) ease = 1.3;
  }

  const nextDue = new Date(now);
  if (interval === 0) {
    nextDue.setMinutes(nextDue.getMinutes() + 10); // re-show in 10 minutes
  } else {
    nextDue.setDate(nextDue.getDate() + interval);
  }

  return {
    ease,
    interval,
    repetitions,
    nextDue: nextDue.toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

/** True if the card is due (or has never been reviewed). */
export function isDue(state: Sm2State | undefined, now: Date = new Date()): boolean {
  if (!state) return true;
  return new Date(state.nextDue).getTime() <= now.getTime();
}
