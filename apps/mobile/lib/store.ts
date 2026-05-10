import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  computeReadiness, type ReadinessSnapshot, type ReadinessInputs,
} from '@certquest/readiness';
import type { MiniGameResult } from '@certquest/minigames';
import {
  rankForXp, updateStreak, checkBadgeUnlocks, XP_AWARDS,
  type Rank, type StreakState,
} from '@certquest/gamification';
import {
  certPacks, getFlashcardsForCert,
  getRichFlashcardsForCert, getProofLabsForCert,
} from '@certquest/content';

// ---------------------------------------------------------------------------
// SM-2 helpers
// ---------------------------------------------------------------------------

interface SM2Card {
  ease: number;     // 1.3 .. 2.5+
  interval: number; // days until next review
  reps: number;     // consecutive correct
  nextDue: string;  // ISO date
}

const SM2_DEFAULT: SM2Card = { ease: 2.5, interval: 0, reps: 0, nextDue: new Date().toISOString() };

function applySM2(prev: SM2Card | undefined, rating: 'again' | 'hard' | 'good' | 'easy'): SM2Card {
  const cur = prev ?? SM2_DEFAULT;
  let { ease, interval, reps } = cur;

  if (rating === 'again') {
    reps = 0;
    interval = 0; // due now
    ease = Math.max(1.3, ease - 0.2);
  } else {
    if (reps === 0) interval = rating === 'easy' ? 4 : 1;
    else if (reps === 1) interval = rating === 'easy' ? 6 : rating === 'hard' ? 3 : 4;
    else interval = Math.round(interval * (rating === 'hard' ? 1.2 : ease));
    reps += 1;
    if (rating === 'easy') ease += 0.15;
    else if (rating === 'hard') ease = Math.max(1.3, ease - 0.15);
    // good leaves ease unchanged
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
  questions: Array<{
    questionId: string; isCorrect: boolean; selected: string[];
    objectiveId: string; domainId: string;
    /** 1 = Guessing, 2 = Unsure, 3 = Confident, 4 = Certain. Optional — older attempts may not have it. */
    confidence?: 1 | 2 | 3 | 4;
  }>;
  /** Average confidence across all questions in this attempt (1-4). */
  averageConfidence?: number;
}

interface WrongAnswerEntry {
  questionId: string; certId: string; objectiveId: string; domainId: string;
  firstMissedAt: string; lastMissedAt: string; timesWrong: number; timesCorrect: number;
  /** True once the user has gotten this question right after missing it at least once. */
  resolved: boolean;
}
interface FlashcardReview {
  flashcardId: string; certId: string; objectiveId: string;
  rating: 'again' | 'hard' | 'good' | 'easy'; reviewedAt: string;
  nextDue?: string; ease?: number; interval?: number; reps?: number;
}
interface MiniGameAttemptRecord {
  questId: string; certId: string; objectiveId?: string; result: MiniGameResult; attemptedAt: string;
}
interface BossBattleAttemptRecord {
  bossId: string; certId: string; objectiveIds: string[]; score: number; passed: boolean; attemptedAt: string;
}
interface ExamAttemptRecord {
  attemptId: string; certId: string; blueprintId: string;
  rawPercent: number; scaledScore: number; passEstimate: boolean; takenAt: string;
}
interface Settings {
  studyIntensity: 'chill' | 'normal' | 'aggressive';
  notificationsEnabled: boolean;
  examDates: Record<string, string>;
}
interface DueFlashcard {
  flashcardId: string; certId: string; nextDue: string; ease: number; interval: number;
}

// Lab tracking
interface LabTaskResult {
  taskId: string; completed: boolean; submittedAt: string;
  userAnswer?: string; // For free_response / output_match / calculation
}
interface LabAttemptRecord {
  labId: string; certId: string; startedAt: string; completedAt?: string;
  taskResults: LabTaskResult[];
  xpAwarded: number;
}

interface StoreState {
  activeCertId: string;
  setActiveCert: (id: string) => void;
  setActiveCertId: (id: string) => void;

  completedLessons: CompletedLesson[];
  lessonProgress: Record<string, { startedAt: string; lastBlockIndex: number }>;
  completeLesson: (l: CompletedLesson) => void;

  quizAttempts: QuizAttempt[];
  recordQuizAttempt: (a: QuizAttempt) => void;

  /** Map keyed by `${certId}:${questionId}` for fast lookup and update. */
  wrongAnswerLog: Record<string, WrongAnswerEntry>;
  getWrongAnswers: (certId?: string, includeResolved?: boolean) => WrongAnswerEntry[];

  flashcardReviews: FlashcardReview[];
  flashcardSchedule: Record<string, SM2Card>; // flashcardId -> SM-2 state
  recordFlashcardReview: (r: FlashcardReview) => void;
  getDueFlashcards: (certId: string, now?: Date) => DueFlashcard[];

  miniGameAttempts: MiniGameAttemptRecord[];
  sideQuestAttempts: MiniGameAttemptRecord[];
  recordMiniGameAttempt: (a: MiniGameAttemptRecord) => void;

  bossBattleAttempts: BossBattleAttemptRecord[];
  recordBossBattleAttempt: (a: BossBattleAttemptRecord) => void;

  examAttempts: ExamAttemptRecord[];
  recordPracticeExamAttempt: (a: ExamAttemptRecord) => void;

  // Lab tracking
  labAttempts: LabAttemptRecord[];
  labTaskProgress: Record<string, LabTaskResult[]>; // labId -> completed tasks
  startLab: (labId: string, certId: string) => void;
  recordLabTask: (labId: string, taskResult: LabTaskResult) => void;
  completeLab: (labId: string) => void;
  getLabStatus: (labId: string) => 'not_started' | 'in_progress' | 'completed';

  /** Per-cert flag: has the pre-exam diagnostic been completed? */
  diagnosticTaken: Record<string, { takenAt: string; baselineReadiness: number }>;
  recordDiagnostic: (certId: string, baselineReadiness: number) => void;

  readinessByCert: Record<string, ReadinessSnapshot>;
  setReadiness: (certId: string, snap: ReadinessSnapshot) => void;
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
  updateRank: (certId: string) => void;

  dueReviewCount: Record<string, number>;
  setDueReviewCount: (certId: string, count: number) => void;
  refreshDueReviewCount: (certId: string) => void;
  lastStudiedAt: string | null;
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
  resetLocalProgress: () => void;
}

const INITIAL_SETTINGS: Settings = {
  studyIntensity: 'normal', notificationsEnabled: false, examDates: {},
};
const INITIAL_STREAK: StreakState = { current: 0, longest: 0, lastStudyDate: null };

// ---------------------------------------------------------------------------
// Readiness signal builders (pure helpers)
// ---------------------------------------------------------------------------

function buildReadinessInputs(state: StoreState, certId: string): ReadinessInputs | null {
  const pack = certPacks[certId];
  if (!pack) return null;

  // 1. Objective mastery — average across all objectives in the cert
  const objIds = (pack.objectives as any[]).map((o) => o.id);
  const masteryValues = objIds.map((id) => state.objectiveMastery[id] ?? 0);
  const objectiveMastery = objIds.length
    ? (masteryValues.reduce((s, v) => s + v, 0) / objIds.length) * 100
    : 0;

  // 2. Quiz performance — rolling accuracy across attempts for this cert
  const certQuizzes = state.quizAttempts.filter((q) => q.certId === certId);
  const totalQ = certQuizzes.reduce((s, q) => s + q.questionCount, 0);
  const totalCorrect = certQuizzes.reduce((s, q) => s + q.correctCount, 0);
  const quizPerformance = totalQ ? (totalCorrect / totalQ) * 100 : 0;

  // 3. Flashcard retention — % rated good/easy on first try
  const certReviews = state.flashcardReviews.filter((r) => r.certId === certId);
  const goodOrEasy = certReviews.filter((r) => r.rating === 'good' || r.rating === 'easy').length;
  const flashcardRetention = certReviews.length ? (goodOrEasy / certReviews.length) * 100 : 0;

  // 4. Boss battle performance
  const certBosses = state.bossBattleAttempts.filter((b) => b.certId === certId);
  const bossBattlePerformance = certBosses.length
    ? certBosses.reduce((s, b) => s + b.score, 0) / certBosses.length
    : 0;

  // 5. Recency / consistency — based on streak and how recent lastStudiedAt is
  const daysSince = state.lastStudiedAt
    ? Math.floor((Date.now() - new Date(state.lastStudiedAt).getTime()) / 86400000)
    : 999;
  const recencyScore = daysSince <= 1 ? 100 : daysSince <= 3 ? 75 : daysSince <= 7 ? 50 : daysSince <= 14 ? 25 : 0;
  const consistencyScore = Math.min(100, state.streak.current * 10);
  const recencyConsistency = (recencyScore + consistencyScore) / 2;

  // 6. Self-explanation / confidence — calibrated confidence on quiz questions.
  //    A user who is "Certain" (4) and correct gets full credit. Wrong answers that
  //    were rated "Certain" actively penalize (overconfidence is worse than humility).
  let confidencePoints = 0;
  let confidenceMax = 0;
  for (const q of certQuizzes) {
    for (const item of q.questions) {
      if (item.confidence === undefined) continue;
      confidenceMax += 4;
      if (item.isCorrect) {
        confidencePoints += item.confidence; // 1-4
      } else {
        // Wrong + high confidence is worse than wrong + low confidence
        confidencePoints += Math.max(0, 2 - item.confidence); // 4→-2 capped 0, 3→-1 capped 0, 2→0, 1→1
      }
    }
  }
  // Fall back to lesson-completion proxy when no confidence data exists yet
  let selfExplanationConfidence: number;
  if (confidenceMax > 0) {
    selfExplanationConfidence = Math.max(0, Math.min(100, (confidencePoints / confidenceMax) * 100));
  } else {
    const certLessonCompletions = state.completedLessons.filter((c) => c.certId === certId).length;
    const totalLessons = pack.lessons.length;
    selfExplanationConfidence = totalLessons ? (certLessonCompletions / totalLessons) * 100 : 0;
  }

  // Domain breakdown — average mastery of objectives within each domain
  const domainScores = (pack.domains as any[]).map((d) => {
    const domainObjs = (pack.objectives as any[]).filter((o) => o.domainId === d.id);
    const scores = domainObjs.map((o) => (state.objectiveMastery[o.id] ?? 0) * 100);
    const avg = scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : 0;
    return { domainId: d.id, score: avg, weight: d.weight };
  });

  const passedBossBattles = certBosses.filter((b) => b.passed).map((b) => b.bossId);
  const passedPracticeExams = state.examAttempts
    .filter((e) => e.certId === certId && e.passEstimate).map((e) => e.blueprintId);

  return {
    certId,
    objectiveMastery, quizPerformance, flashcardRetention, bossBattlePerformance,
    recencyConsistency, selfExplanationConfidence,
    domainScores,
    passedBossBattles, passedPracticeExams,
    totalQuizAttempts: certQuizzes.length,
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      activeCertId: 'a-plus-core1',
      setActiveCert: (id) => {
        set({ activeCertId: id });
        // Persist to Supabase user metadata so web and future sessions pick it up.
        import('../lib/supabase').then(({ supabase }) => {
          supabase.auth.updateUser({ data: { activeCertId: id } }).catch(() => {});
        });
      },
      setActiveCertId: (id) => set({ activeCertId: id }),

      completedLessons: [],
      lessonProgress: {},
      completeLesson: (l) => {
        set((s) => ({
          completedLessons: [...s.completedLessons.filter((x) => x.lessonId !== l.lessonId), l],
          lastStudiedAt: l.completedAt,
        }));
        get().updateObjectiveMastery(l.objectiveId, 0.10);
        get().addXp(XP_AWARDS.lessonComplete, l.certId);
        bumpStreak(set, get);
        get().recomputeReadinessForCert(l.certId);
      },

      quizAttempts: [],
      wrongAnswerLog: {},
      recordQuizAttempt: (a) => {
        // Append the attempt + update the wrong-answer log atomically
        set((s) => {
          const log = { ...s.wrongAnswerLog };
          for (const q of a.questions) {
            const key = `${a.certId}:${q.questionId}`;
            const existing = log[key];
            if (q.isCorrect) {
              if (existing && !existing.resolved) {
                log[key] = { ...existing, timesCorrect: existing.timesCorrect + 1, resolved: true };
              }
            } else {
              if (existing) {
                log[key] = {
                  ...existing,
                  lastMissedAt: a.attemptedAt,
                  timesWrong: existing.timesWrong + 1,
                  resolved: false,
                };
              } else {
                log[key] = {
                  questionId: q.questionId, certId: a.certId,
                  objectiveId: q.objectiveId, domainId: q.domainId,
                  firstMissedAt: a.attemptedAt, lastMissedAt: a.attemptedAt,
                  timesWrong: 1, timesCorrect: 0, resolved: false,
                };
              }
            }
          }
          return { quizAttempts: [...s.quizAttempts, a], wrongAnswerLog: log, lastStudiedAt: a.attemptedAt };
        });
        for (const q of a.questions) {
          get().updateObjectiveMastery(q.objectiveId, q.isCorrect ? 0.04 : -0.02);
          get().addXp(q.isCorrect ? XP_AWARDS.quizQuestionCorrect : XP_AWARDS.quizQuestionWrong, a.certId);
        }
        bumpStreak(set, get);
        get().recomputeReadinessForCert(a.certId);
      },
      getWrongAnswers: (certId, includeResolved = false) => {
        const all = Object.values(get().wrongAnswerLog);
        return all.filter((w) => {
          if (certId && w.certId !== certId) return false;
          if (!includeResolved && w.resolved) return false;
          return true;
        }).sort((a, b) => b.timesWrong - a.timesWrong || new Date(b.lastMissedAt).getTime() - new Date(a.lastMissedAt).getTime());
      },

      flashcardReviews: [],
      flashcardSchedule: {},
      recordFlashcardReview: (r) => {
        const prev = get().flashcardSchedule[r.flashcardId];
        const sm2 = applySM2(prev, r.rating);
        const enriched: FlashcardReview = {
          ...r, nextDue: sm2.nextDue, ease: sm2.ease, interval: sm2.interval, reps: sm2.reps,
        };
        set((s) => ({
          flashcardReviews: [...s.flashcardReviews, enriched],
          flashcardSchedule: { ...s.flashcardSchedule, [r.flashcardId]: sm2 },
          lastStudiedAt: r.reviewedAt,
        }));
        const xpKey = r.rating === 'easy' ? XP_AWARDS.flashcardReviewEasy
          : r.rating === 'good' ? XP_AWARDS.flashcardReviewGood
          : r.rating === 'hard' ? XP_AWARDS.flashcardReviewHard : 1;
        get().addXp(xpKey, r.certId);
        const masteryDelta = r.rating === 'easy' ? 0.02 : r.rating === 'good' ? 0.01 : r.rating === 'hard' ? 0 : -0.01;
        get().updateObjectiveMastery(r.objectiveId, masteryDelta);
        bumpStreak(set, get);
        get().refreshDueReviewCount(r.certId);
        get().recomputeReadinessForCert(r.certId);
      },
      getDueFlashcards: (certId, now = new Date()) => {
        const cards = getFlashcardsForCert(certId);
        const schedule = get().flashcardSchedule;
        const cutoff = now.getTime();
        const due: DueFlashcard[] = [];
        for (const card of cards as any[]) {
          const sm2 = schedule[card.id];
          if (!sm2 || new Date(sm2.nextDue).getTime() <= cutoff) {
            due.push({
              flashcardId: card.id, certId,
              nextDue: sm2?.nextDue ?? new Date().toISOString(),
              ease: sm2?.ease ?? 2.5,
              interval: sm2?.interval ?? 0,
            });
          }
        }
        return due;
      },

      miniGameAttempts: [],
      sideQuestAttempts: [],
      recordMiniGameAttempt: (a) => {
        set((s) => ({
          miniGameAttempts: [...s.miniGameAttempts, a],
          sideQuestAttempts: [...s.sideQuestAttempts, a],
          lastStudiedAt: a.attemptedAt,
        }));
        get().addXp(a.result.xpEarned, a.certId);
        if (a.objectiveId) get().updateObjectiveMastery(a.objectiveId, a.result.masteryDelta);
        bumpStreak(set, get);
        get().recomputeReadinessForCert(a.certId);
      },

      bossBattleAttempts: [],
      recordBossBattleAttempt: (a) => {
        set((s) => ({ bossBattleAttempts: [...s.bossBattleAttempts, a], lastStudiedAt: a.attemptedAt }));
        get().addXp(a.passed ? XP_AWARDS.bossBattlePass : XP_AWARDS.bossBattleFail, a.certId);
        if (a.passed) for (const oid of a.objectiveIds) get().updateObjectiveMastery(oid, 0.08);
        bumpStreak(set, get);
        get().recomputeReadinessForCert(a.certId);
      },

      diagnosticTaken: {},
      recordDiagnostic: (certId, baselineReadiness) => {
        set((s) => ({
          diagnosticTaken: { ...s.diagnosticTaken, [certId]: { takenAt: new Date().toISOString(), baselineReadiness } },
        }));
      },

      examAttempts: [],
      recordPracticeExamAttempt: (a) => {
        set((s) => ({ examAttempts: [...s.examAttempts, a], lastStudiedAt: a.takenAt }));
        get().addXp(a.passEstimate ? XP_AWARDS.practiceExamPass : XP_AWARDS.practiceExamFail, a.certId);
        bumpStreak(set, get);
        get().recomputeReadinessForCert(a.certId);
      },

      // Lab tracking
      labAttempts: [],
      labTaskProgress: {},
      startLab: (labId, certId) => {
        set((s) => {
          const existing = s.labAttempts.find((a) => a.labId === labId && !a.completedAt);
          if (existing) return s; // already in progress
          return {
            labAttempts: [...s.labAttempts, {
              labId, certId, startedAt: new Date().toISOString(), taskResults: [], xpAwarded: 0,
            }],
            labTaskProgress: { ...s.labTaskProgress, [labId]: [] },
          };
        });
      },
      recordLabTask: (labId, taskResult) => {
        set((s) => {
          const existing = s.labTaskProgress[labId] ?? [];
          const updated = [...existing.filter((t) => t.taskId !== taskResult.taskId), taskResult];
          return { labTaskProgress: { ...s.labTaskProgress, [labId]: updated }, lastStudiedAt: taskResult.submittedAt };
        });
        bumpStreak(set, get);
      },
      completeLab: (labId) => {
        const taskResults = get().labTaskProgress[labId] ?? [];
        // Find the lab to get its XP reward and certId
        const attempt = get().labAttempts.find((a) => a.labId === labId && !a.completedAt);
        if (!attempt) return;
        const labs = getProofLabsForCert(attempt.certId);
        const lab = labs.find((l) => l.id === labId);
        const xp = lab?.xpReward ?? 50;
        set((s) => ({
          labAttempts: s.labAttempts.map((a) =>
            a.labId === labId && !a.completedAt
              ? { ...a, completedAt: new Date().toISOString(), taskResults, xpAwarded: xp }
              : a
          ),
        }));
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
      setReadiness: (certId, snap) =>
        set((s) => ({ readinessByCert: { ...s.readinessByCert, [certId]: snap } })),
      recomputeReadinessForCert: (certId) => {
        const inputs = buildReadinessInputs(get(), certId);
        if (!inputs) return;
        const snap = computeReadiness(inputs);
        set((s) => ({ readinessByCert: { ...s.readinessByCert, [certId]: snap } }));
      },

      objectiveMastery: {},
      updateObjectiveMastery: (objectiveId, delta) =>
        set((s) => ({
          objectiveMastery: {
            ...s.objectiveMastery,
            [objectiveId]: Math.max(0, Math.min(1, (s.objectiveMastery[objectiveId] ?? 0) + delta)),
          },
        })),

      xp: 0, xpByCert: {}, streak: INITIAL_STREAK, badges: [], rankByCert: {},
      addXp: (amount, certId) => {
        set((s) => ({
          xp: s.xp + amount,
          xpByCert: certId ? { ...s.xpByCert, [certId]: (s.xpByCert[certId] ?? 0) + amount } : s.xpByCert,
        }));
        if (certId) get().updateRank(certId);
        const st = get();
        const newBadges = checkBadgeUnlocks({
          earnedBadgeIds: st.badges,
          lessonCount: st.completedLessons.length,
          bossPassedCount: st.bossBattleAttempts.filter((b) => b.passed).length,
          examPassedCount: st.examAttempts.filter((e) => e.passEstimate).length,
          streakCurrent: st.streak.current,
          rank: rankForXp(st.xp),
        });
        for (const b of newBadges) get().unlockBadge(b);
      },
      unlockBadge: (badgeId) =>
        set((s) => s.badges.includes(badgeId) ? s : { badges: [...s.badges, badgeId] }),
      updateRank: (certId) => {
        const xpForCert = get().xpByCert[certId] ?? 0;
        const rank = rankForXp(xpForCert);
        set((s) => ({ rankByCert: { ...s.rankByCert, [certId]: rank } }));
      },

      dueReviewCount: {},
      setDueReviewCount: (certId, count) =>
        set((s) => ({ dueReviewCount: { ...s.dueReviewCount, [certId]: count } })),
      refreshDueReviewCount: (certId) => {
        const due = get().getDueFlashcards(certId);
        set((s) => ({ dueReviewCount: { ...s.dueReviewCount, [certId]: due.length } }));
      },
      lastStudiedAt: null,
      settings: INITIAL_SETTINGS,
      updateSettings: (s) => set((cur) => ({ settings: { ...cur.settings, ...s } })),

      resetLocalProgress: () => set({
        completedLessons: [], lessonProgress: {}, quizAttempts: [], wrongAnswerLog: {},
        flashcardReviews: [], flashcardSchedule: {},
        miniGameAttempts: [], sideQuestAttempts: [],
        bossBattleAttempts: [], examAttempts: [], readinessByCert: {}, diagnosticTaken: {},
        objectiveMastery: {}, xp: 0, xpByCert: {}, streak: INITIAL_STREAK,
        badges: [], rankByCert: {}, dueReviewCount: {}, lastStudiedAt: null,
        labAttempts: [], labTaskProgress: {},
      }),
    }),
    {
      name: 'certquest-os-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

function bumpStreak(set: any, get: any) {
  const newStreak = updateStreak(get().streak);
  if (newStreak.lastStudyDate !== get().streak.lastStudyDate) {
    set({ streak: newStreak });
    get().addXp(XP_AWARDS.streakDay);
  }
}
