import type { MasteryLabel, MasteryState, ObjectiveProgress } from '@certquest/types';

// Mastery score milestones — each evidence type bumps the score to at least its floor.
export const SCORE_FLOORS = {
  unlocked: 15,
  lessonCompleted: 35,
  quizPassed: 55,
  flashcardsReviewed: 70,
  sideQuestPassed: 85,
  bossBattlePassed: 100,
} as const;

export type EvidenceKind =
  | 'opened'
  | 'lesson_completed'
  | 'quiz_passed'
  | 'flashcards_reviewed'
  | 'side_quest_passed'
  | 'lab_passed'
  | 'boss_battle_passed'
  | 'self_explanation_written'
  | 'weak_concept_improved';

interface ApplyEvidenceOpts {
  /** When true, the evidence corresponds to the boss-battle gate. */
  requiresSelfExplanation?: boolean;
  selfExplanationProvided?: boolean;
  now?: Date;
}

/**
 * Compute the new objective progress after a piece of evidence is recorded.
 * Score is monotonically increasing per evidence type (no double-bumps).
 */
export function applyEvidence(
  prev: ObjectiveProgress,
  evidence: EvidenceKind,
  opts: ApplyEvidenceOpts = {},
): ObjectiveProgress {
  const now = (opts.now ?? new Date()).toISOString();
  let score = prev.score;
  let state: MasteryState = prev.state === 'locked' ? 'unlocked' : prev.state;

  switch (evidence) {
    case 'opened':
      score = Math.max(score, SCORE_FLOORS.unlocked);
      break;
    case 'lesson_completed':
      score = Math.max(score, SCORE_FLOORS.lessonCompleted);
      if (rankOf(state) < rankOf('seen')) state = 'seen';
      break;
    case 'quiz_passed':
      score = Math.max(score, SCORE_FLOORS.quizPassed);
      if (rankOf(state) < rankOf('practiced')) state = 'practiced';
      break;
    case 'flashcards_reviewed':
      score = Math.max(score, SCORE_FLOORS.flashcardsReviewed);
      if (rankOf(state) < rankOf('practiced')) state = 'practiced';
      break;
    case 'side_quest_passed':
    case 'lab_passed':
      score = Math.max(score, SCORE_FLOORS.sideQuestPassed);
      if (rankOf(state) < rankOf('battle_tested')) state = 'battle_tested';
      break;
    case 'boss_battle_passed': {
      const cleared =
        !opts.requiresSelfExplanation || opts.selfExplanationProvided === true;
      score = cleared ? SCORE_FLOORS.bossBattlePassed : Math.max(score, SCORE_FLOORS.sideQuestPassed);
      state = cleared ? 'mastered' : 'battle_tested';
      break;
    }
    case 'self_explanation_written':
      score = Math.min(100, score + 5);
      break;
    case 'weak_concept_improved':
      score = Math.min(100, score + 10);
      break;
  }

  // If a rusty objective is touched, drop it back to 'practiced' to reflect re-engagement.
  if (prev.state === 'rusty') {
    state = 'practiced';
  }

  return {
    ...prev,
    state,
    score,
    lastEvidenceAt: now,
    rustyAt: undefined,
  };
}

const STATE_RANK: Record<MasteryState, number> = {
  locked: 0,
  unlocked: 1,
  seen: 2,
  practiced: 3,
  battle_tested: 4,
  mastered: 5,
  rusty: 2, // counts as "needs attention" but ahead of unlocked
};
function rankOf(s: MasteryState): number {
  return STATE_RANK[s];
}

export function masteryLabel(state: MasteryState): MasteryLabel {
  switch (state) {
    case 'locked':
    case 'unlocked':
      return 'Unknown';
    case 'seen':
      return 'Familiar';
    case 'practiced':
      return 'Practiced';
    case 'battle_tested':
      return 'Reliable';
    case 'mastered':
      return 'Mastered';
    case 'rusty':
      return 'Rusty';
  }
}

/**
 * Estimate exam readiness across an entire cert: weighted average of objective
 * scores, with a soft cap until at least one boss battle has been passed.
 */
export function readinessPercent(progress: ObjectiveProgress[]): number {
  if (!progress.length) return 0;
  const avg = progress.reduce((s, p) => s + p.score, 0) / progress.length;
  const anyMastered = progress.some((p) => p.state === 'mastered');
  return Math.round(anyMastered ? avg : Math.min(avg, 70));
}
