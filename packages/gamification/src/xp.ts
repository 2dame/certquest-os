import type { XpEvent } from '@certquest/types';

// XP awarded per event kind. Mastery-relevant work is rewarded; opening the app is not.
export const XP_TABLE: Record<XpEvent['kind'], number> = {
  flashcard_correct: 2,
  quiz_passed: 30,
  lesson_completed: 15,
  side_quest_completed: 25,
  lab_completed: 40,
  boss_battle_passed: 120,
  weak_concept_improved: 20,
  daily_plan_completed: 50,
  practice_exam_improved: 60,
};

export function xpForEvent(kind: XpEvent['kind']): number {
  return XP_TABLE[kind];
}

export function totalXp(events: Array<{ amount: number }>): number {
  return events.reduce((sum, e) => sum + e.amount, 0);
}
