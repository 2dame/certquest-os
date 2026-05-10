/**
 * Readiness engine — combines six signal categories into a single 0-100 score
 * per cert and per domain. Weights are configurable per cert.
 *
 * Pure functions only. No I/O. The host app fetches the inputs and feeds them
 * in; the engine returns a fully populated readiness snapshot.
 */

export interface ReadinessInputs {
  certId: string;
  // 0-100 average mastery score across the cert's objectives
  objectiveMastery: number;
  // 0-100 rolling quiz/practice-question accuracy
  quizPerformance: number;
  // 0-100 flashcard retention rate (correct on first try / total reviews)
  flashcardRetention: number;
  // 0-100 boss battle pass rate weighted by rubric score
  bossBattlePerformance: number;
  // 0-100 recency: how recently and consistently the user has reviewed
  recencyConsistency: number;
  // 0-100 self-explanation/confidence aggregate
  selfExplanationConfidence: number;
  // Per-domain breakdowns
  domainScores: Array<{ domainId: string; score: number; weight: number }>;
  // Pass status
  passedBossBattles: string[];
  passedPracticeExams: string[];
  totalQuizAttempts: number;
}

export interface ReadinessConfig {
  weights: {
    objectiveMastery: number;
    quizPerformance: number;
    flashcardRetention: number;
    bossBattlePerformance: number;
    recencyConsistency: number;
    selfExplanationConfidence: number;
  };
  practiceExamUnlock: { minOverallReadiness: number; minDomainReadiness: number };
  finalSimulationUnlock: { minOverallReadiness: number; minDomainReadiness: number };
}

export const DEFAULT_READINESS_CONFIG: ReadinessConfig = {
  weights: {
    objectiveMastery: 0.35,
    quizPerformance: 0.20,
    flashcardRetention: 0.15,
    bossBattlePerformance: 0.15,
    recencyConsistency: 0.10,
    selfExplanationConfidence: 0.05,
  },
  practiceExamUnlock: { minOverallReadiness: 80, minDomainReadiness: 65 },
  finalSimulationUnlock: { minOverallReadiness: 90, minDomainReadiness: 75 },
};

export interface ReadinessSnapshot {
  certId: string;
  overall: number;
  domains: Array<{ domainId: string; score: number }>;
  components: {
    objectiveMastery: number;
    quizPerformance: number;
    flashcardRetention: number;
    bossBattlePerformance: number;
    recencyConsistency: number;
    selfExplanationConfidence: number;
  };
  ceilingApplied: boolean;
  takenAt: string;
}

/**
 * Compute a readiness snapshot. Until the user has passed at least one boss
 * battle for the cert, the overall score is capped at 70 to prevent fake
 * confidence from accumulating across only flashcards and quizzes.
 */
export function computeReadiness(
  inputs: ReadinessInputs,
  config: ReadinessConfig = DEFAULT_READINESS_CONFIG,
): ReadinessSnapshot {
  const w = config.weights;
  const raw =
    inputs.objectiveMastery * w.objectiveMastery +
    inputs.quizPerformance * w.quizPerformance +
    inputs.flashcardRetention * w.flashcardRetention +
    inputs.bossBattlePerformance * w.bossBattlePerformance +
    inputs.recencyConsistency * w.recencyConsistency +
    inputs.selfExplanationConfidence * w.selfExplanationConfidence;

  const ceilingApplied = inputs.passedBossBattles.length === 0;
  const overall = Math.round(ceilingApplied ? Math.min(70, raw) : raw);

  return {
    certId: inputs.certId,
    overall,
    domains: inputs.domainScores.map((d) => ({ domainId: d.domainId, score: Math.round(d.score) })),
    components: {
      objectiveMastery: Math.round(inputs.objectiveMastery),
      quizPerformance: Math.round(inputs.quizPerformance),
      flashcardRetention: Math.round(inputs.flashcardRetention),
      bossBattlePerformance: Math.round(inputs.bossBattlePerformance),
      recencyConsistency: Math.round(inputs.recencyConsistency),
      selfExplanationConfidence: Math.round(inputs.selfExplanationConfidence),
    },
    ceilingApplied,
    takenAt: new Date().toISOString(),
  };
}

export interface PracticeExamGateResult {
  unlocked: boolean;
  reasons: string[];
  canManualOverride: boolean;
}

/**
 * Evaluate whether a regular practice exam should unlock for the cert.
 * Returns reasons (failed conditions) so the UI can explain what's missing.
 */
export function evaluatePracticeExamGate(
  snapshot: ReadinessSnapshot,
  inputs: ReadinessInputs,
  blueprint: {
    unlockRequirements: {
      minReadiness: number;
      minDomainReadiness: number;
      requiredBossBattlesPassed: string[];
      minQuizAttempts: number;
      requiresPriorPracticeExamPass: boolean;
    };
    allowManualOverride: boolean;
  },
): PracticeExamGateResult {
  const reasons: string[] = [];
  const r = blueprint.unlockRequirements;

  if (snapshot.overall < r.minReadiness)
    reasons.push(`Overall readiness ${snapshot.overall}% (need ${r.minReadiness}%)`);

  const lowestDomain = snapshot.domains.reduce(
    (m, d) => (d.score < m.score ? d : m),
    { domainId: '', score: 100 },
  );
  if (lowestDomain.score < r.minDomainReadiness)
    reasons.push(`Domain ${lowestDomain.domainId} at ${lowestDomain.score}% (need ${r.minDomainReadiness}%)`);

  for (const id of r.requiredBossBattlesPassed) {
    if (!inputs.passedBossBattles.includes(id))
      reasons.push(`Boss battle ${id} not yet defeated`);
  }

  if (inputs.totalQuizAttempts < r.minQuizAttempts)
    reasons.push(`${inputs.totalQuizAttempts} quiz attempts (need ${r.minQuizAttempts})`);

  if (r.requiresPriorPracticeExamPass && inputs.passedPracticeExams.length === 0)
    reasons.push('At least one prior practice exam pass required');

  return {
    unlocked: reasons.length === 0,
    reasons,
    canManualOverride: blueprint.allowManualOverride,
  };
}

/** Estimate scaled score from raw percentage and the exam's scaled-score range. */
export function estimateScaledScore(
  rawPercent: number,
  range: { min: number; max: number; passingScaledScore: number },
): { scaled: number; passed: boolean } {
  // Linear mapping from raw percent -> scaled score range. Real exams use
  // psychometric scaling that is not public; this is a transparent estimate.
  const scaled = Math.round(range.min + (rawPercent / 100) * (range.max - range.min));
  return { scaled, passed: scaled >= range.passingScaledScore };
}

/** Build a remediation plan from missed-question breakdowns. */
export interface MissedQuestionBreakdown {
  questionId: string;
  domainId: string;
  objectiveId: string;
  tags: string[];
  difficulty: string;
}

export interface RemediationPlan {
  weakDomains: Array<{ domainId: string; missedCount: number; severity: 'mild' | 'moderate' | 'severe' }>;
  weakObjectives: Array<{ objectiveId: string; missedCount: number }>;
  recommendedTags: string[];
  generatedFlashcardCount: number;
  recommendedBossBattleRetry: boolean;
}

export function buildRemediationPlan(misses: MissedQuestionBreakdown[]): RemediationPlan {
  const byDomain = new Map<string, number>();
  const byObjective = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  for (const m of misses) {
    byDomain.set(m.domainId, (byDomain.get(m.domainId) ?? 0) + 1);
    byObjective.set(m.objectiveId, (byObjective.get(m.objectiveId) ?? 0) + 1);
    for (const tag of m.tags) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  }

  return {
    weakDomains: [...byDomain.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([domainId, missedCount]) => ({
        domainId,
        missedCount,
        severity: missedCount >= 5 ? 'severe' : missedCount >= 3 ? 'moderate' : 'mild',
      })),
    weakObjectives: [...byObjective.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([objectiveId, missedCount]) => ({ objectiveId, missedCount })),
    recommendedTags: [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag),
    generatedFlashcardCount: misses.length,
    recommendedBossBattleRetry: misses.length >= 8,
  };
}
