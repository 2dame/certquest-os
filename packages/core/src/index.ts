// @certquest/types is the canonical source for all shared domain types.
export * from '@certquest/types';

// Scheduler — generateTodayPlan + helpers. StudyIntensity re-exported from types above.
export * from '@certquest/scheduler';

// Gamification — explicit named exports to avoid XpEvent/XpEventKind/Rank conflicts
// (gamification defines its own XpEventKind with different event names than @certquest/types).
export type {
  BadgeDefinition,
  BadgeCriteria,
  StreakState,
  EvidenceKind,
} from '@certquest/gamification';
export {
  BADGES,
  CORE_BADGES,
  RANKS,
  RANK_THRESHOLDS,
  rankForXp,
  nextRankInfo,
  XP_AWARDS,
  makeXpEvent,
  updateStreak,
  checkBadgeUnlocks,
  applyEvidence,
  SCORE_FLOORS,
} from '@certquest/gamification';
