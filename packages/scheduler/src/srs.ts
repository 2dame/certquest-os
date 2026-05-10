import type { ReviewRating, SrsState } from '@certquest/types';

// SM-2-style spaced repetition. Conservative defaults; tunable per-deck later.
const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface ReviewResult {
  next: SrsState;
  /** Whether this review counts as "successful" for mastery accounting. */
  successful: boolean;
}

/**
 * Apply a review rating to an existing SRS state and return the updated state.
 * If `prev` is undefined, the card is treated as new.
 */
export function applyReview(
  prev: SrsState | undefined,
  rating: ReviewRating,
  now: Date = new Date(),
): ReviewResult {
  const ease = prev?.easeFactor ?? DEFAULT_EASE;
  const reviewCount = (prev?.reviewCount ?? 0) + 1;
  const lastInterval = prev?.intervalDays ?? 0;

  let nextEase = ease;
  let nextInterval = 0;
  let successful = true;

  switch (rating) {
    case 'again':
      // Reset to short re-show (10 minutes), drop ease.
      nextEase = Math.max(MIN_EASE, ease - 0.2);
      nextInterval = 0; // due ~10 min from now (handled below)
      successful = false;
      break;
    case 'hard':
      nextEase = Math.max(MIN_EASE, ease - 0.15);
      nextInterval = lastInterval === 0 ? 1 : Math.max(1, Math.round(lastInterval * 1.2));
      break;
    case 'good':
      // Standard SM-2 progression.
      if (lastInterval === 0) nextInterval = 1;
      else if (lastInterval === 1) nextInterval = 3;
      else nextInterval = Math.round(lastInterval * nextEase);
      break;
    case 'easy':
      nextEase = ease + 0.15;
      if (lastInterval === 0) nextInterval = 4;
      else nextInterval = Math.round(lastInterval * nextEase * 1.3);
      break;
  }

  const dueAt =
    rating === 'again'
      ? new Date(now.getTime() + 10 * 60 * 1000) // 10 min
      : new Date(now.getTime() + nextInterval * DAY_MS);

  return {
    next: {
      easeFactor: round2(nextEase),
      intervalDays: nextInterval,
      dueAt: dueAt.toISOString(),
      reviewCount,
      lastReviewedAt: now.toISOString(),
    },
    successful,
  };
}

/** Filter a set of SRS states to those due now. */
export function dueNow(states: Array<SrsState & { flashcardId: string }>, now: Date = new Date()) {
  const t = now.getTime();
  return states.filter((s) => new Date(s.dueAt).getTime() <= t);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
