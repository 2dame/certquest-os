/**
 * Gamification engine. XP, levels, ranks, badges, streaks.
 * Pure functions. Per-cert ranks; XP tracked globally and per cert.
 */

export * from './badges';
export { applyEvidence, SCORE_FLOORS } from './mastery';
export type { EvidenceKind } from './mastery';

export const RANKS = [
  'Recruit', 'Apprentice', 'Operator', 'Specialist', 'Tactician', 'Architect', 'Master',
] as const;

export type Rank = typeof RANKS[number];

export const RANK_THRESHOLDS: Record<Rank, number> = {
  Recruit: 0, Apprentice: 250, Operator: 750, Specialist: 1750,
  Tactician: 3500, Architect: 6000, Master: 10000,
};

export function rankForXp(xp: number): Rank {
  let current: Rank = 'Recruit';
  for (const r of RANKS) if (xp >= RANK_THRESHOLDS[r]) current = r;
  return current;
}

export function nextRankInfo(xp: number): { current: Rank; next: Rank | null; xpToNext: number; progress: number } {
  const current = rankForXp(xp);
  const idx = RANKS.indexOf(current);
  if (idx === RANKS.length - 1) return { current, next: null, xpToNext: 0, progress: 1 };
  const next = RANKS[idx + 1]!;
  const cT = RANK_THRESHOLDS[current], nT = RANK_THRESHOLDS[next];
  return { current, next, xpToNext: Math.max(0, nT - xp), progress: Math.max(0, Math.min(1, (xp - cT) / (nT - cT))) };
}

export const XP_AWARDS = {
  appOpen: 1,
  lessonComplete: 20,
  quizQuestionCorrect: 5,
  quizQuestionWrong: 1,
  flashcardReviewGood: 3,
  flashcardReviewEasy: 2,
  flashcardReviewHard: 4,
  miniGamePass: 30,
  miniGameFail: 8,
  bossBattlePass: 100,
  bossBattleFail: 20,
  practiceExamPass: 200,
  practiceExamFail: 50,
  streakDay: 10,
  weakAreaCleared: 50,
} as const;

export type XpEventKind = keyof typeof XP_AWARDS;

export interface XpEvent {
  kind: XpEventKind;
  certId?: string;
  amount: number;
  at: string;
}

export function makeXpEvent(kind: XpEventKind, certId?: string, override?: number): XpEvent {
  return { kind, certId, amount: override ?? XP_AWARDS[kind], at: new Date().toISOString() };
}

export interface StreakState {
  current: number;
  longest: number;
  lastStudyDate: string | null;
}

export function updateStreak(state: StreakState, today: Date = new Date()): StreakState {
  const todayKey = isoDateKey(today);
  if (state.lastStudyDate === todayKey) return state;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = isoDateKey(yesterday);
  let current: number;
  if (state.lastStudyDate === yesterdayKey) current = state.current + 1;
  else if (state.lastStudyDate === null) current = 1;
  else current = 1;
  return { current, longest: Math.max(state.longest, current), lastStudyDate: todayKey };
}

function isoDateKey(d: Date): string { return d.toISOString().slice(0, 10); }

export interface BadgeDefinition {
  id: string;
  name: string;
  loreTitle: string;
  titleFlavor: string;
  description: string;
  unlocksOn: 'firstLesson' | 'firstBoss' | 'firstExamPass' | 'streak7' | 'streak30' | 'rank' | 'masteredCert';
  threshold?: number | string;
}

export const CORE_BADGES: BadgeDefinition[] = [
  { id: 'first-step', name: 'First Step', loreTitle: 'The Initiate', titleFlavor: 'You answered the call.', description: 'Complete your first lesson.', unlocksOn: 'firstLesson' },
  { id: 'first-boss', name: 'Trial by Fire', loreTitle: 'Boss Slayer', titleFlavor: 'The first beast falls.', description: 'Pass your first boss battle.', unlocksOn: 'firstBoss' },
  { id: 'first-exam', name: 'Trial Veteran', loreTitle: 'Exam Survivor', titleFlavor: 'You passed when it mattered.', description: 'Pass your first practice exam.', unlocksOn: 'firstExamPass' },
  { id: 'streak-7', name: 'Seven Days', loreTitle: 'The Disciplined', titleFlavor: 'Consistency is the rarest skill.', description: 'Study 7 days in a row.', unlocksOn: 'streak7' },
  { id: 'streak-30', name: 'Thirty Days', loreTitle: 'The Relentless', titleFlavor: 'The grind reveals the master.', description: 'Study 30 days in a row.', unlocksOn: 'streak30' },
  { id: 'rank-tactician', name: 'Tactician', loreTitle: 'Field Tactician', titleFlavor: 'You see three moves ahead.', description: 'Reach Tactician rank.', unlocksOn: 'rank', threshold: 'Tactician' },
  { id: 'rank-architect', name: 'Architect', loreTitle: 'Architect of Systems', titleFlavor: 'You design what others fix.', description: 'Reach Architect rank.', unlocksOn: 'rank', threshold: 'Architect' },
  { id: 'rank-master', name: 'Master', loreTitle: 'Master of the Craft', titleFlavor: 'There is little left to teach you.', description: 'Reach Master rank.', unlocksOn: 'rank', threshold: 'Master' },
];

export function checkBadgeUnlocks(opts: {
  earnedBadgeIds: string[];
  lessonCount: number;
  bossPassedCount: number;
  examPassedCount: number;
  streakCurrent: number;
  rank: Rank;
}): string[] {
  const newlyEarned: string[] = [];
  const have = new Set(opts.earnedBadgeIds);
  for (const badge of CORE_BADGES) {
    if (have.has(badge.id)) continue;
    let qualifies = false;
    switch (badge.unlocksOn) {
      case 'firstLesson': qualifies = opts.lessonCount >= 1; break;
      case 'firstBoss': qualifies = opts.bossPassedCount >= 1; break;
      case 'firstExamPass': qualifies = opts.examPassedCount >= 1; break;
      case 'streak7': qualifies = opts.streakCurrent >= 7; break;
      case 'streak30': qualifies = opts.streakCurrent >= 30; break;
      case 'rank': qualifies = RANKS.indexOf(opts.rank) >= RANKS.indexOf(badge.threshold as Rank); break;
    }
    if (qualifies) newlyEarned.push(badge.id);
  }
  return newlyEarned;
}
