import { z } from 'zod';

/**
 * Practice exam and question bank schemas.
 * Layered on top of the base CertPackSchema in ./schemas.ts.
 */

export const QuestionTypeSchema = z.enum([
  'multiple_choice',
  'multiple_select',
  'scenario',
  'troubleshooting',
  'command_selection',
  'ordering',
  'matching',
  'pbq_sim',
  'architecture_decision',
  'subnetting',
  'cli_output_interpretation',
]);

export const QuestionDifficultySchema = z.enum(['easy', 'medium', 'hard', 'exam_level']);

export const QuestionChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
});

/** Universal question bank item — replaces the older quiz_question shape going forward. */
export const QuestionBankItemSchema = z.object({
  id: z.string(),
  certId: z.string(),
  examCode: z.string().optional(),
  domainId: z.string(),
  objectiveId: z.string(),
  type: QuestionTypeSchema,
  difficulty: QuestionDifficultySchema,
  questionText: z.string(),
  choices: z.array(QuestionChoiceSchema),
  correctAnswers: z.array(z.string()),
  explanation: z.string(),
  wrongAnswerExplanations: z.record(z.string(), z.string()).default({}),
  examTrap: z.string().optional(),
  hint: z.string().optional(),
  tags: z.array(z.string()).default([]),
  timeEstimateSeconds: z.number().int().positive().default(60),
  readinessWeight: z.number().min(0).max(2).default(1),
  sourceType: z.literal('original').default('original'),
  isPracticeExamEligible: z.boolean().default(true),
  isPbqStyle: z.boolean().default(false),
});

export type QuestionBankItem = z.infer<typeof QuestionBankItemSchema>;

/** Practice exam blueprint — defines the exam structure but not the questions chosen for any single attempt. */
export const PracticeExamBlueprintSchema = z.object({
  id: z.string(),
  certId: z.string(),
  examCode: z.string(),
  title: z.string(),
  mode: z.enum(['full', 'mini', 'core1', 'core2', 'domain', 'weak_area', 'final_simulation']),
  questionCount: z.number().int().positive(),
  timeLimitSeconds: z.number().int().positive(),
  passingScaledScore: z.number().int().positive(),
  scaledScoreMax: z.number().int().positive(),
  scaledScoreMin: z.number().int().nonnegative().default(100),
  domainTargets: z.array(z.object({
    domainId: z.string(),
    questionCount: z.number().int().nonnegative(),
  })),
  difficultyMix: z.object({
    easy: z.number().min(0).max(1),
    medium: z.number().min(0).max(1),
    hard: z.number().min(0).max(1),
    exam_level: z.number().min(0).max(1),
  }),
  unlockRequirements: z.object({
    minReadiness: z.number().int().min(0).max(100),
    minDomainReadiness: z.number().int().min(0).max(100),
    requiredBossBattlesPassed: z.array(z.string()).default([]),
    minQuizAttempts: z.number().int().nonnegative().default(0),
    requiresPriorPracticeExamPass: z.boolean().default(false),
  }),
  allowManualOverride: z.boolean().default(true),
});

export type PracticeExamBlueprint = z.infer<typeof PracticeExamBlueprintSchema>;

/** Readiness configuration — weights are configurable per cert. */
export const ReadinessConfigSchema = z.object({
  weights: z.object({
    objectiveMastery: z.number().min(0).max(1),
    quizPerformance: z.number().min(0).max(1),
    flashcardRetention: z.number().min(0).max(1),
    bossBattlePerformance: z.number().min(0).max(1),
    recencyConsistency: z.number().min(0).max(1),
    selfExplanationConfidence: z.number().min(0).max(1),
  }),
  practiceExamUnlock: z.object({
    minOverallReadiness: z.number().int().default(80),
    minDomainReadiness: z.number().int().default(65),
  }),
  finalSimulationUnlock: z.object({
    minOverallReadiness: z.number().int().default(90),
    minDomainReadiness: z.number().int().default(75),
  }),
});

export type ReadinessConfig = z.infer<typeof ReadinessConfigSchema>;

/** Cert metadata extended with multi-exam support (A+ has Core 1 + Core 2). */
export const CertExamCodeSchema = z.object({
  examCode: z.string(),
  examName: z.string(),
  scaledScoreMin: z.number().int().nonnegative(),
  scaledScoreMax: z.number().int().positive(),
  passingScaledScore: z.number().int().positive(),
  questionCount: z.number().int().positive(),
  timeLimitMinutes: z.number().int().positive(),
});

export type CertExamCode = z.infer<typeof CertExamCodeSchema>;
