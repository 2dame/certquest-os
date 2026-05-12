'use client';

import { create, type StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { computeReadiness, type ReadinessSnapshot, type ReadinessInputs } from '@certquest/readiness';
import {
  rankForXp, updateStreak, checkBadgeUnlocks, XP_AWARDS,
  type Rank, type StreakState,
} from '@certquest/gamification';
import { certPacks, getFlashcardsForCert, getProofLabsForCert } from '@certquest/content';

// ---------------------------------------------------------------------------
// SM-2
// ---------------------------------------------------------------------------
interface SM2Card { ease: number; interval: number; reps: number; nextDue: string; }
const SM2_DEFAULT: SM2Card = { ease: 2.5, interval: 0, reps: 0, nextDue: new Date().toISOString() };

function applySM2(prev: SM2Card | undefined, rating: 'again' | 'hard' | 'good' | 'easy'): SM2Card {
  const cur = prev ?? SM2_DEFAULT;
  let { ease, interval, reps } = cur;
  if (rating === 'again') {
    reps = 0; interval = 0; ease = Math.max(1.3, ease - 0.2);
  } else {
    if (reps === 0) interval = rating === 'easy' ? 4 : 1;
    else if (reps === 1) interval = rating === 'easy' ? 6 : rating === 'hard' ? 3 : 4;
    else interval = Math.round(interval * (rating === 'hard' ? 1.2 : ease));
    reps += 1;
    if (rating === 'easy') ease += 0.15;
    else if (rating === 'hard') ease = Math.max(1.3, ease - 0.15);
  }
  const nextDue = new Date(Date.now() + interval * 24 * 60 * 60 * 1000).toISOString();
  return { ease, interval, reps, nextDue };
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface CompletedLesson { lessonId: string; certId: string; objectiveId: string; completedAt: string; }
interface QuizAttempt {
  certId: string; attemptedAt: string; questionCount: number; correctCount: number;
  questions: Array<{ questionId: string; isCorrect: boolean; selected: string[]; objectiveId: string; domainId: string; confidence?: 1 | 2 | 3 | 4; }>;
  averageConfidence?: number;
}
interface WrongAnswerEntry {
  questionId: string; certId: string; objectiveId: string; domainId: string;
  firstMissedAt: string; lastMissedAt: string; timesWrong: number; timesCorrect: number; resolved: boolean;
}
interface FlashcardReview {
  flashcardId: string; certId: string; objectiveId: string;
  rating: 'again' | 'hard' | 'good' | 'easy'; reviewedAt: string;
  nextDue?: string; ease?: number; interval?: number; reps?: number;
}
interface BossBattleAttemptRecord {
  bossId: string; certId: string; objectiveIds: string[]; score: number; passed: boolean; attemptedAt: string;
}
interface ExamAttemptRecord {
  attemptId: string; certId: string; blueprintId: string;
  rawPercent: number; scaledScore: number; passEstimate: boolean; takenAt: string;
}
interface LabTaskResult { taskId: string; completed: boolean; submittedAt: string; userAnswer?: string; }
interface LabAttemptRecord {
  labId: string; certId: string; startedAt: string; completedAt?: string;
  taskResults: LabTaskResult[]; xpAwarded: number;
}
export interface Settings {
  studyIntensity: 'chill' | 'normal' | 'aggressive';
  notificationsEnabled: boolean;
  examDates: Record<string, string>;
}
interface DueFlashcard { flashcardId: string; certId: string; nextDue: string; ease: number; interval: number; }

interface StoreState {
  activeCertId: string;
  setActiveCert: (id: string) => void;

  completedLessons: CompletedLesson[];
  completeLesson: (l: CompletedLesson) => void;

  quizAttempts: QuizAttempt[];
  wrongAnswerLog: Record<string, WrongAnswerEntry>;
  recordQuizAttempt: (a: QuizAttempt) => void;
  getWrongAnswers: (certId?: string, includeResolved?: boolean) => WrongAnswerEntry[];

  flashcardReviews: FlashcardReview[];
  flashcardSchedule: Record<string, SM2Card>;
  recordFlashcardReview: (r: FlashcardReview) => void;
  getDueFlashcards: (certId: string, now?: Date) => DueFlashcard[];

  bossBattleAttempts: BossBattleAttemptRecord[];
  recordBossBattleAttempt: (a: BossBattleAttemptRecord) => void;

  examAttempts: ExamAttemptRecord[];
  recordPracticeExamAttempt: (a: ExamAttemptRecord) => void;

  diagnosticTaken: Record<string, { takenAt: string; baselineReadiness: number }>;
  recordDiagnostic: (certId: string, baseline: number) => void;

  labAttempts: LabAttemptRecord[];
  labTaskProgress: Record<string, LabTaskResult[]>;
  startLab: (labId: string, certId: string) => void;
  recordLabTask: (labId: string, task: LabTaskResult) => void;
  completeLab: (labId: string) => void;
  getLabStatus: (labId: string) => 'not_started' | 'in_progress' | 'completed';

  readinessByCert: Record<string, ReadinessSnapshot>;
  recomputeReadinessForCert: (certId: string) => void;

  objectiveMastery: Record<string, number>;
  updateObjectiveMastery: (objectiveId: string, delta: number) => void;

  xp: number;
  xpByCert: Record<string, number>;
  streak: StreakState;
  badges: string[];
  rankByCert: Record<string, Rank>;
  addXp: (amount: number, certId?: string) => void;
  unlockBadge: (badgeId: string) => void;

  dueReviewCount: Record<string, number>;
  refreshDueReviewCount: (certId: string) => void;

  lastStudiedAt: string | null;
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
  resetProgress: () => void;
}

const INITIAL_SETTINGS: Settings = { studyIntensity: 'normal', notificationsEnabled: false, examDates: {} };
const INITIAL_STREAK: StreakState = { current: 0, longest: 0, lastStudyDate: null };

function buildReadinessInputs(state: StoreState, certId: string): ReadinessInputs | null {
  const pack = certPacks[certId];
  if (!pack) return null;
  const objIds = (pack.objectives as any[]).map((o: any) => o.id);
  const masteryValues = objIds.map((id: string) => state.objectiveMastery[id] ?? 0);
  const objectiveMastery = objIds.length ? (masteryValues.reduce((s: number, v: number) => s + v, 0) / objIds.length) * 100 : 0;
  const certQuizzes = state.quizAttempts.filter((q) => q.certId === certId);
  const totalQ = certQuizzes.reduce((s, q) => s + q.questionCount, 0);
  const totalCorrect = certQuizzes.reduce((s, q) => s + q.correctCount, 0);
  const quizPerformance = totalQ ? (totalCorrect / totalQ) * 100 : 0;
  const certReviews = state.flashcardReviews.filter((r) => r.certId === certId);
  const goodOrEasy = certReviews.filter((r) => r.rating === 'good' || r.rating === 'easy').length;
  const flashcardRetention = certReviews.length ? (goodOrEasy / certReviews.length) * 100 : 0;
  const certBosses = state.bossBattleAttempts.filter((b) => b.certId === certId);
  const bossBattlePerformance = certBosses.length ? certBosses.reduce((s, b) => s + b.score, 0) / certBosses.length : 0;
  const daysSince = state.lastStudiedAt ? Math.floor((Date.now() - new Date(state.lastStudiedAt).getTime()) / 86400000) : 999;
  const recencyScore = daysSince <= 1 ? 100 : daysSince <= 3 ? 75 : daysSince <= 7 ? 50 : daysSince <= 14 ? 25 : 0;
  const recencyConsistency = (recencyScore + Math.min(100, state.streak.current * 10)) / 2;
  const domainScores = (pack.domains as any[]).map((d: any) => {
    const domObjs = (pack.objectives as any[]).filter((o: any) => o.domainId === d.id);
    const scores = domObjs.map((o: any) => (state.objectiveMastery[o.id] ?? 0) * 100);
    return { domainId: d.id, score: scores.length ? scores.reduce((s: number, v: number) => s + v, 0) / scores.length : 0, weight: d.weight };
  });
  return {
    certId, objectiveMastery, quizPerformance, flashcardRetention, bossBattlePerformance,
    recencyConsistency, selfExplanationConfidence: objectiveMastery,
    domainScores,
    passedBossBattles: certBosses.filter((b) => b.passed).map((b) => b.bossId),
    passedPracticeExams: state.examAttempts.filter((e) => e.certId === certId && e.passEstimate).map((e) => e.blueprintId),
    totalQuizAttempts: certQuizzes.length,
  };
}

const storeCreator: StateCreator<StoreState> = (set, get) => ({
      activeCertId: 'a-plus-core1',
      setActiveCert: (id) => {
        set({ activeCertId: id });
        import('./supabase-browser').then(({ getBrowserSupabase }) => {
          getBrowserSupabase()?.auth.updateUser({ data: { activeCertId: id } }).catch(() => {});
        });
      },

      completedLessons: [],
      completeLesson: (l) => {
        set((s) => ({ completedLessons: [...s.completedLessons.filter((x) => x.lessonId !== l.lessonId), l], lastStudiedAt: l.completedAt }));
        get().updateObjectiveMastery(l.objectiveId, 0.10);
        get().addXp(XP_AWARDS.lessonComplete, l.certId);
        bumpStreak(set, get);
        get().recomputeReadinessForCert(l.certId);
      },

      quizAttempts: [],
      wrongAnswerLog: {},
      recordQuizAttempt: (a) => {
        set((s) => {
          const log = { ...s.wrongAnswerLog };
          for (const q of a.questions) {
            const key = `${a.certId}:${q.questionId}`;
            const existing = log[key];
            if (q.isCorrect) {
              if (existing && !existing.resolved) log[key] = { ...existing, timesCorrect: existing.timesCorrect + 1, resolved: true };
            } else {
              if (existing) log[key] = { ...existing, lastMissedAt: a.attemptedAt, timesWrong: existing.timesWrong + 1, resolved: false };
              else log[key] = { questionId: q.questionId, certId: a.certId, objectiveId: q.objectiveId, domainId: q.domainId, firstMissedAt: a.attemptedAt, lastMissedAt: a.attemptedAt, timesWrong: 1, timesCorrect: 0, resolved: false };
            }
          }
          return { quizAttempts: [...s.quizAttempts, a], wrongAnswerLog: log, lastStudiedAt: a.attemptedAt };
        });
        for (const q of a.questions) {
          get().updateObjectiveMastery(q.objectiveId, q.isCorrect ? 0.04 : -0.02);
          get().addXp(q.isCorrect ? XP_AWARDS.quizQuestionCorrect ?? 5 : XP_AWARDS.quizQuestionWrong ?? 1, a.certId);
        }
        bumpStreak(set, get);
        get().recomputeReadinessForCert(a.certId);
      },
      getWrongAnswers: (certId?: string, includeResolved = false) =>
        Object.values(get().wrongAnswerLog).filter((w: WrongAnswerEntry) => {
          if (certId && w.certId !== certId) return false;
          if (!includeResolved && w.resolved) return false;
          return true;
        }).sort((a: WrongAnswerEntry, b: WrongAnswerEntry) => b.timesWrong - a.timesWrong),

      flashcardReviews: [],
      flashcardSchedule: {},
      recordFlashcardReview: (r) => {
        const sm2 = applySM2(get().flashcardSchedule[r.flashcardId], r.rating);
        set((s) => ({
          flashcardReviews: [...s.flashcardReviews, { ...r, nextDue: sm2.nextDue, ease: sm2.ease, interval: sm2.interval, reps: sm2.reps }],
          flashcardSchedule: { ...s.flashcardSchedule, [r.flashcardId]: sm2 },
          lastStudiedAt: r.reviewedAt,
        }));
        const xpKey = r.rating === 'easy' ? XP_AWARDS.flashcardReviewEasy : r.rating === 'good' ? XP_AWARDS.flashcardReviewGood : r.rating === 'hard' ? XP_AWARDS.flashcardReviewHard : 1;
        get().addXp(xpKey, r.certId);
        get().updateObjectiveMastery(r.objectiveId, r.rating === 'easy' ? 0.02 : r.rating === 'good' ? 0.01 : r.rating === 'hard' ? 0 : -0.01);
        bumpStreak(set, get);
        get().refreshDueReviewCount(r.certId);
        get().recomputeReadinessForCert(r.certId);
      },
      getDueFlashcards: (certId, now = new Date()) => {
        const cards = getFlashcardsForCert(certId);
        const schedule = get().flashcardSchedule;
        const cutoff = now.getTime();
        return (cards as any[]).filter((card: any) => {
          const sm2 = schedule[card.id];
          return !sm2 || new Date(sm2.nextDue).getTime() <= cutoff;
        }).map((card: any) => {
          const sm2 = schedule[card.id];
          return { flashcardId: card.id, certId, nextDue: sm2?.nextDue ?? new Date().toISOString(), ease: sm2?.ease ?? 2.5, interval: sm2?.interval ?? 0 };
        });
      },

      bossBattleAttempts: [],
      recordBossBattleAttempt: (a) => {
        set((s) => ({ bossBattleAttempts: [...s.bossBattleAttempts, a], lastStudiedAt: a.attemptedAt }));
        get().addXp(a.passed ? XP_AWARDS.bossBattlePass : XP_AWARDS.bossBattleFail, a.certId);
        if (a.passed) for (const oid of a.objectiveIds) get().updateObjectiveMastery(oid, 0.08);
        bumpStreak(set, get);
        get().recomputeReadinessForCert(a.certId);
      },

      examAttempts: [],
      recordPracticeExamAttempt: (a) => {
        set((s) => ({ examAttempts: [...s.examAttempts, a], lastStudiedAt: a.takenAt }));
        get().addXp(a.passEstimate ? XP_AWARDS.practiceExamPass : XP_AWARDS.practiceExamFail, a.certId);
        bumpStreak(set, get);
        get().recomputeReadinessForCert(a.certId);
      },

      diagnosticTaken: {},
      recordDiagnostic: (certId, baseline) =>
        set((s) => ({ diagnosticTaken: { ...s.diagnosticTaken, [certId]: { takenAt: new Date().toISOString(), baselineReadiness: baseline } } })),

      labAttempts: [],
      labTaskProgress: {},
      startLab: (labId, certId) => set((s) => {
        if (s.labAttempts.find((a) => a.labId === labId && !a.completedAt)) return s;
        return { labAttempts: [...s.labAttempts, { labId, certId, startedAt: new Date().toISOString(), taskResults: [], xpAwarded: 0 }], labTaskProgress: { ...s.labTaskProgress, [labId]: [] } };
      }),
      recordLabTask: (labId, task) => {
        set((s) => {
          const updated = [...(s.labTaskProgress[labId] ?? []).filter((t) => t.taskId !== task.taskId), task];
          return { labTaskProgress: { ...s.labTaskProgress, [labId]: updated }, lastStudiedAt: task.submittedAt };
        });
        bumpStreak(set, get);
      },
      completeLab: (labId) => {
        const attempt = get().labAttempts.find((a) => a.labId === labId && !a.completedAt);
        if (!attempt) return;
        const labs = getProofLabsForCert(attempt.certId);
        const lab = (labs as any[]).find((l: any) => l.id === labId);
        const xp = lab?.xpReward ?? 50;
        set((s) => ({ labAttempts: s.labAttempts.map((a) => a.labId === labId && !a.completedAt ? { ...a, completedAt: new Date().toISOString(), taskResults: s.labTaskProgress[labId] ?? [], xpAwarded: xp } : a) }));
        get().addXp(xp, attempt.certId);
        if (lab?.objectiveId) get().updateObjectiveMastery(lab.objectiveId, 0.06);
        get().recomputeReadinessForCert(attempt.certId);
      },
      getLabStatus: (labId) => {
        const attempts = get().labAttempts.filter((a) => a.labId === labId);
        if (attempts.some((a) => a.completedAt)) return 'completed';
        if (attempts.some((a) => !a.completedAt)) return 'in_progress';
        return 'not_started';
      },

      readinessByCert: {},
      recomputeReadinessForCert: (certId) => {
        const inputs = buildReadinessInputs(get(), certId);
        if (!inputs) return;
        const snap = computeReadiness(inputs);
        set((s) => ({ readinessByCert: { ...s.readinessByCert, [certId]: snap } }));
      },

      objectiveMastery: {},
      updateObjectiveMastery: (objectiveId, delta) =>
        set((s) => ({ objectiveMastery: { ...s.objectiveMastery, [objectiveId]: Math.max(0, Math.min(1, (s.objectiveMastery[objectiveId] ?? 0) + delta)) } })),

      xp: 0, xpByCert: {}, streak: INITIAL_STREAK, badges: [], rankByCert: {},
      addXp: (amount, certId) => {
        set((s) => ({ xp: s.xp + amount, xpByCert: certId ? { ...s.xpByCert, [certId]: (s.xpByCert[certId] ?? 0) + amount } : s.xpByCert }));
        const st = get();
        const newBadges = checkBadgeUnlocks({ earnedBadgeIds: st.badges, lessonCount: st.completedLessons.length, bossPassedCount: st.bossBattleAttempts.filter((b) => b.passed).length, examPassedCount: st.examAttempts.filter((e) => e.passEstimate).length, streakCurrent: st.streak.current, rank: rankForXp(st.xp) });
        for (const b of newBadges) get().unlockBadge(b);
      },
      unlockBadge: (badgeId) => set((s) => s.badges.includes(badgeId) ? s : { badges: [...s.badges, badgeId] }),

      dueReviewCount: {},
      refreshDueReviewCount: (certId) => {
        const due = get().getDueFlashcards(certId);
        set((s) => ({ dueReviewCount: { ...s.dueReviewCount, [certId]: due.length } }));
      },

      lastStudiedAt: null,
      settings: INITIAL_SETTINGS,
      updateSettings: (s) => set((cur) => ({ settings: { ...cur.settings, ...s } })),

      resetProgress: () => set({
        completedLessons: [], quizAttempts: [], wrongAnswerLog: {},
        flashcardReviews: [], flashcardSchedule: {},
        bossBattleAttempts: [], examAttempts: [], readinessByCert: {}, diagnosticTaken: {},
        objectiveMastery: {}, xp: 0, xpByCert: {}, streak: INITIAL_STREAK,
        badges: [], rankByCert: {}, dueReviewCount: {}, lastStudiedAt: null,
        labAttempts: [], labTaskProgress: {},
      }),
});

export const useStore = create<StoreState>()(
  persist(storeCreator, { name: 'certquest-web-store', storage: createJSONStorage(() => localStorage) })
);

function bumpStreak(set: (partial: Partial<StoreState>) => void, get: () => StoreState) {
  const newStreak = updateStreak(get().streak);
  if (newStreak.lastStudyDate !== get().streak.lastStudyDate) {
    set({ streak: newStreak });
    get().addXp(XP_AWARDS.streakDay);
  }
}
