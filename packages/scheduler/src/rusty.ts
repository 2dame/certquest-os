import type { ObjectiveProgress } from '@certquest/types';

const RUSTY_DAYS_BY_STATE: Record<string, number> = {
  mastered: 21,
  battle_tested: 14,
  practiced: 10,
  seen: 7,
};

/**
 * Given an objective's progress and the current time, decide whether it should
 * transition to the `rusty` state. Returns the new state if it changed.
 */
export function checkRusty(
  progress: ObjectiveProgress,
  now: Date = new Date(),
): ObjectiveProgress {
  const threshold = RUSTY_DAYS_BY_STATE[progress.state];
  if (!threshold) return progress;
  if (!progress.lastEvidenceAt) return progress;

  const last = new Date(progress.lastEvidenceAt).getTime();
  const days = (now.getTime() - last) / (1000 * 60 * 60 * 24);
  if (days >= threshold) {
    return {
      ...progress,
      state: 'rusty',
      rustyAt: now.toISOString(),
      // Score decay: drop ~15% but never below 40 for previously-mastered work.
      score: Math.max(40, Math.round(progress.score * 0.85)),
    };
  }
  return progress;
}
