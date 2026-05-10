import type {
  CertId,
  DailyPlan,
  DailyPlanItem,
  ObjectiveProgress,
  StudyIntensity,
} from '@certquest/types';

export interface DailyPlanInputs {
  certId: CertId;
  planDate?: Date;
  intensity: StudyIntensity;
  /** Target minutes the user has available today. */
  dailyMinutesTarget: number;
  /** Number of flashcards currently due. */
  dueFlashcardCount: number;
  /** Objectives sorted by ascending mastery score (weakest first). */
  objectiveProgress: ObjectiveProgress[];
  /** Lessons not yet completed, in display order, in priority objectives. */
  candidateLessons: Array<{ id: string; title: string; estimatedMinutes: number; objectiveId: string }>;
  /** Side quests gated by recent mistakes / weak concepts. */
  candidateSideQuests: Array<{ id: string; title: string; estimatedMinutes: number; objectiveId?: string }>;
  /** Quick quizzes available (objective-scoped). */
  candidateQuickQuizzes: Array<{ id: string; title: string; estimatedMinutes: number; objectiveId: string }>;
  /** Boss battles unlocked (mastery thresholds met). */
  unlockedBossBattles: Array<{ id: string; title: string; estimatedMinutes: number }>;
  /** Days remaining until exam, if user set one. */
  daysToExam?: number;
}

const INTENSITY_MULTIPLIER: Record<StudyIntensity, number> = {
  chill: 0.7,
  normal: 1.0,
  aggressive: 1.4,
};

const FLASHCARD_MINUTES_PER_CARD = 0.4; // ~25s per card average

/**
 * Generate today's plan. Always front-loads due flashcards; then weak-area review;
 * then a new lesson if budget allows; then quick quiz; then optional side quest;
 * then a boss battle if one is unlocked and budget remains.
 */
export function generateDailyPlan(inputs: DailyPlanInputs): DailyPlan {
  const date = inputs.planDate ?? new Date();
  const planDate = date.toISOString().slice(0, 10);
  const budget = inputs.dailyMinutesTarget * (INTENSITY_MULTIPLIER[inputs.intensity] ?? 1.0);

  const items: DailyPlanItem[] = [];
  let used = 0;

  // 1. Flashcards (always first if any are due).
  if (inputs.dueFlashcardCount > 0) {
    // Cap card count by intensity but never starve the queue too much.
    const cap = inputs.intensity === 'chill' ? 20 : inputs.intensity === 'normal' ? 40 : 80;
    const cardCount = Math.min(inputs.dueFlashcardCount, cap);
    const minutes = Math.max(1, Math.round(cardCount * FLASHCARD_MINUTES_PER_CARD));
    items.push({
      kind: 'flashcard_batch',
      refId: `due-${planDate}`,
      title: `Clear ${cardCount} due flashcards`,
      estimatedMinutes: minutes,
      meta: { count: cardCount },
    });
    used += minutes;
  }

  // 2. Weakest-objective focused review (lowest score that isn't locked).
  const weak = inputs.objectiveProgress
    .filter((p) => p.state !== 'locked' && p.state !== 'mastered')
    .sort((a, b) => a.score - b.score)[0];
  if (weak) {
    items.push({
      kind: 'weak_objective_review',
      refId: weak.objectiveId,
      title: `Shore up weak area`,
      estimatedMinutes: 5,
      meta: { score: weak.score, state: weak.state },
    });
    used += 5;
  }

  // 3. Next new lesson (prefer one tied to a weak/unlocked objective).
  const lesson = pickLesson(inputs.candidateLessons, weak?.objectiveId);
  if (lesson && used + lesson.estimatedMinutes <= budget) {
    items.push({
      kind: 'lesson',
      refId: lesson.id,
      title: lesson.title,
      estimatedMinutes: lesson.estimatedMinutes,
    });
    used += lesson.estimatedMinutes;
  }

  // 4. Quick quiz on the weak objective if there's room.
  const quiz = inputs.candidateQuickQuizzes.find((q) => q.objectiveId === weak?.objectiveId);
  if (quiz && used + quiz.estimatedMinutes <= budget) {
    items.push({
      kind: 'quick_quiz',
      refId: quiz.id,
      title: quiz.title,
      estimatedMinutes: quiz.estimatedMinutes,
    });
    used += quiz.estimatedMinutes;
  }

  // 5. Side quest variety (skip on chill if budget tight).
  if (inputs.intensity !== 'chill' || (inputs.daysToExam ?? 99) < 14) {
    const quest = inputs.candidateSideQuests[0];
    if (quest && used + quest.estimatedMinutes <= budget) {
      items.push({
        kind: 'side_quest',
        refId: quest.id,
        title: quest.title,
        estimatedMinutes: quest.estimatedMinutes,
      });
      used += quest.estimatedMinutes;
    }
  }

  // 6. Boss battle if unlocked and budget remains.
  const boss = inputs.unlockedBossBattles[0];
  if (boss && used + boss.estimatedMinutes <= budget) {
    items.push({
      kind: 'boss_battle',
      refId: boss.id,
      title: boss.title,
      estimatedMinutes: boss.estimatedMinutes,
    });
    used += boss.estimatedMinutes;
  }

  return {
    certId: inputs.certId,
    planDate,
    items,
    totalEstimatedMinutes: used,
  };
}

function pickLesson<T extends { objectiveId: string }>(
  candidates: T[],
  preferredObjectiveId?: string,
): T | undefined {
  if (!candidates.length) return undefined;
  if (preferredObjectiveId) {
    const match = candidates.find((c) => c.objectiveId === preferredObjectiveId);
    if (match) return match;
  }
  return candidates[0];
}
