/**
 * Practice exam engine. Pure functions that take a question bank, a blueprint,
 * and (for scoring) a set of answers, and return either an assembled attempt
 * or a complete score report.
 */

import {
  computeReadiness,
  estimateScaledScore,
  buildRemediationPlan,
  type ReadinessInputs,
  type ReadinessSnapshot,
  type RemediationPlan,
  type MissedQuestionBreakdown,
} from '@certquest/readiness';

export interface QuestionBankItem {
  id: string;
  certId: string;
  examCode?: string;
  domainId: string;
  objectiveId: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'exam_level';
  questionText: string;
  choices: Array<{ id: string; text: string }>;
  correctAnswers: string[];
  explanation: string;
  wrongAnswerExplanations: Record<string, string>;
  examTrap?: string;
  tags: string[];
  timeEstimateSeconds: number;
  readinessWeight: number;
  isPracticeExamEligible: boolean;
}

export interface PracticeExamBlueprint {
  id: string;
  certId: string;
  examCode: string;
  title: string;
  mode: 'full' | 'mini' | 'core1' | 'core2' | 'domain' | 'weak_area' | 'final_simulation';
  questionCount: number;
  timeLimitSeconds: number;
  passingScaledScore: number;
  scaledScoreMax: number;
  scaledScoreMin: number;
  domainTargets: Array<{ domainId: string; questionCount: number }>;
  difficultyMix: { easy: number; medium: number; hard: number; exam_level: number };
  unlockRequirements: {
    minReadiness: number;
    minDomainReadiness: number;
    requiredBossBattlesPassed: string[];
    minQuizAttempts: number;
    requiresPriorPracticeExamPass: boolean;
  };
  allowManualOverride: boolean;
}

export interface AssembledAttempt {
  blueprintId: string;
  certId: string;
  examCode: string;
  questions: QuestionBankItem[];
  timeLimitSeconds: number;
  startedAt: string;
}

/**
 * Assemble a practice exam attempt by drawing from the question bank to hit
 * the blueprint's domain targets and difficulty mix. Deterministic if a seed
 * is supplied; otherwise random.
 */
export function assembleAttempt(
  blueprint: PracticeExamBlueprint,
  bank: QuestionBankItem[],
  options: { seed?: number; weakDomainBoost?: string[] } = {},
): AssembledAttempt {
  const eligible = bank.filter(
    (q) => q.certId === blueprint.certId && q.isPracticeExamEligible,
  );
  const rng = makeRng(options.seed ?? Date.now());
  const picked: QuestionBankItem[] = [];
  const used = new Set<string>();

  for (const target of blueprint.domainTargets) {
    let pool = eligible.filter((q) => q.domainId === target.domainId && !used.has(q.id));

    // Boost weak domains by drawing harder questions when supplied
    if (options.weakDomainBoost?.includes(target.domainId)) {
      pool = pool.sort((a, b) => difficultyRank(b.difficulty) - difficultyRank(a.difficulty));
    } else {
      pool = shuffle(pool, rng);
    }

    for (let i = 0; i < target.questionCount && pool.length > 0; i++) {
      const q = pool.shift()!;
      picked.push(q);
      used.add(q.id);
    }
  }

  // If domain targets undershot, top up to questionCount from anywhere
  while (picked.length < blueprint.questionCount) {
    const remaining = eligible.filter((q) => !used.has(q.id));
    if (remaining.length === 0) break;
    const q = remaining[Math.floor(rng() * remaining.length)]!;
    picked.push(q);
    used.add(q.id);
  }

  return {
    blueprintId: blueprint.id,
    certId: blueprint.certId,
    examCode: blueprint.examCode,
    questions: picked.slice(0, blueprint.questionCount),
    timeLimitSeconds: blueprint.timeLimitSeconds,
    startedAt: new Date().toISOString(),
  };
}

export interface AnswerRecord {
  questionId: string;
  selectedAnswerIds: string[];
  timeSpentSeconds: number;
  flagged: boolean;
}

export interface ExamScoreReport {
  blueprintId: string;
  certId: string;
  examCode: string;
  rawCorrect: number;
  rawTotal: number;
  rawPercent: number;
  scaledScore: number;
  scaledMax: number;
  passingScaledScore: number;
  passEstimate: boolean;
  timeUsedSeconds: number;
  domainBreakdown: Array<{
    domainId: string;
    correct: number;
    total: number;
    percent: number;
  }>;
  objectiveBreakdown: Array<{
    objectiveId: string;
    correct: number;
    total: number;
    percent: number;
  }>;
  missedQuestions: MissedQuestionBreakdown[];
  flaggedQuestionIds: string[];
  remediationPlan: RemediationPlan;
  generatedFlashcardSeeds: Array<{
    front: string;
    back: string;
    objectiveId: string;
    sourceQuestionId: string;
  }>;
}

/**
 * Score an attempt and produce the full report. Includes a remediation plan
 * and a set of flashcard seeds derived from missed questions.
 */
export function scoreAttempt(
  attempt: AssembledAttempt,
  answers: AnswerRecord[],
  blueprint: PracticeExamBlueprint,
): ExamScoreReport {
  const answerById = new Map(answers.map((a) => [a.questionId, a]));
  let rawCorrect = 0;
  const missed: MissedQuestionBreakdown[] = [];
  const flaggedIds: string[] = [];
  const flashcardSeeds: ExamScoreReport['generatedFlashcardSeeds'] = [];
  const domainStats = new Map<string, { correct: number; total: number }>();
  const objectiveStats = new Map<string, { correct: number; total: number }>();

  for (const q of attempt.questions) {
    const a = answerById.get(q.id);
    const isCorrect = a ? sameSet(a.selectedAnswerIds, q.correctAnswers) : false;
    if (isCorrect) rawCorrect++;
    if (a?.flagged) flaggedIds.push(q.id);

    bumpStat(domainStats, q.domainId, isCorrect);
    bumpStat(objectiveStats, q.objectiveId, isCorrect);

    if (!isCorrect) {
      missed.push({
        questionId: q.id,
        domainId: q.domainId,
        objectiveId: q.objectiveId,
        tags: q.tags,
        difficulty: q.difficulty,
      });
      flashcardSeeds.push({
        front: q.questionText,
        back: q.explanation,
        objectiveId: q.objectiveId,
        sourceQuestionId: q.id,
      });
    }
  }

  const rawPercent = (rawCorrect / Math.max(1, attempt.questions.length)) * 100;
  const { scaled, passed } = estimateScaledScore(rawPercent, {
    min: blueprint.scaledScoreMin,
    max: blueprint.scaledScoreMax,
    passingScaledScore: blueprint.passingScaledScore,
  });

  const timeUsed = answers.reduce((s, a) => s + (a.timeSpentSeconds || 0), 0);

  return {
    blueprintId: blueprint.id,
    certId: blueprint.certId,
    examCode: blueprint.examCode,
    rawCorrect,
    rawTotal: attempt.questions.length,
    rawPercent: Math.round(rawPercent * 10) / 10,
    scaledScore: scaled,
    scaledMax: blueprint.scaledScoreMax,
    passingScaledScore: blueprint.passingScaledScore,
    passEstimate: passed,
    timeUsedSeconds: timeUsed,
    domainBreakdown: [...domainStats.entries()].map(([domainId, s]) => ({
      domainId,
      correct: s.correct,
      total: s.total,
      percent: Math.round((s.correct / s.total) * 100),
    })),
    objectiveBreakdown: [...objectiveStats.entries()].map(([objectiveId, s]) => ({
      objectiveId,
      correct: s.correct,
      total: s.total,
      percent: Math.round((s.correct / s.total) * 100),
    })),
    missedQuestions: missed,
    flaggedQuestionIds: flaggedIds,
    remediationPlan: buildRemediationPlan(missed),
    generatedFlashcardSeeds: flashcardSeeds,
  };
}

/** Mode-specific blueprint helpers — generate quick-mode and weak-area blueprints from a base. */
export function deriveQuickModeBlueprint(base: PracticeExamBlueprint): PracticeExamBlueprint {
  return {
    ...base,
    id: `${base.id}-quick`,
    title: `${base.title} — Quick Mode`,
    mode: 'mini',
    questionCount: Math.max(15, Math.round(base.questionCount * 0.25)),
    timeLimitSeconds: Math.round(base.timeLimitSeconds * 0.3),
    domainTargets: base.domainTargets.map((d) => ({
      domainId: d.domainId,
      questionCount: Math.max(2, Math.round(d.questionCount * 0.25)),
    })),
  };
}

export function deriveWeakAreaBlueprint(
  base: PracticeExamBlueprint,
  weakDomainIds: string[],
): PracticeExamBlueprint {
  return {
    ...base,
    id: `${base.id}-weak`,
    title: `${base.title} — Weak Area Drill`,
    mode: 'weak_area',
    questionCount: 20,
    timeLimitSeconds: 30 * 60,
    domainTargets: weakDomainIds.map((d) => ({ domainId: d, questionCount: Math.ceil(20 / weakDomainIds.length) })),
  };
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function makeRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s * 1664525 + 1013904223) | 0;
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = new Set(a);
  return b.every((x) => sa.has(x));
}

function difficultyRank(d: string): number {
  return ({ easy: 1, medium: 2, hard: 3, exam_level: 4 } as const)[d as 'easy'] ?? 2;
}

function bumpStat(map: Map<string, { correct: number; total: number }>, key: string, correct: boolean) {
  const s = map.get(key) ?? { correct: 0, total: 0 };
  s.total++;
  if (correct) s.correct++;
  map.set(key, s);
}
