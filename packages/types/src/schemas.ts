import { z } from 'zod';

// =============================================================================
// PRIMITIVES
// =============================================================================
export const CertIdSchema = z.enum([
  'a-plus-core1',
  'a-plus-core2',
  'network-plus',
  'aws-ccp',
  'aws-saa',
  'ccna',
]);

export const DifficultySchema = z.enum(['beginner', 'intermediate', 'advanced']);
export const MasteryStateSchema = z.enum([
  'locked',
  'unlocked',
  'seen',
  'practiced',
  'battle_tested',
  'mastered',
  'rusty',
]);
export const ReviewRatingSchema = z.enum(['again', 'hard', 'good', 'easy']);
export const StudyIntensitySchema = z.enum(['chill', 'normal', 'aggressive']);
export const FlashcardKindSchema = z.enum([
  'basic',
  'cloze',
  'scenario',
  'command',
  'port_protocol',
  'acronym',
  'reverse',
  'image',
]);
// Legacy quiz-question kind enum — superseded by QuestionTypeSchema in
// practice-exam-schemas.ts for the modern question bank. Kept here to match
// the DB enum 'quiz_question_kind' in migration 0001_init.sql. No new content
// should use these kind values directly; use QuestionBankItem instead.
export const QuizQuestionKindSchema = z.enum([
  'multiple_choice',
  'multiple_select',
  'scenario',
  'troubleshooting_sequence',
  'command_select',
  'architecture_select',
  'cli_interpret',
]);

// =============================================================================
// CERT METADATA
// =============================================================================
export const CertMetaSchema = z.object({
  id: CertIdSchema,
  provider: z.enum(['comptia', 'aws', 'cisco']),
  examName: z.string(),
  examCode: z.string(),
  examVersion: z.string(),
  officialSourceUrl: z.string().url(),
  lastVerifiedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  themeName: z.string(),
  themeBlurb: z.string(),
  displayOrder: z.number().int().nonnegative(),
});
export type CertMeta = z.infer<typeof CertMetaSchema>;

export const DomainSchema = z.object({
  id: z.string(),
  certId: CertIdSchema,
  title: z.string(),
  blurb: z.string().optional(),
  weight: z.number().min(0).max(1).optional(),
  displayOrder: z.number().int().nonnegative(),
});
export type CertDomain = z.infer<typeof DomainSchema>;

export const MasteryCriteriaSchema = z.object({
  minQuizScore: z.number().int().min(0).max(100).default(80),
  requiredReviews: z.number().int().min(0).default(3),
  requiredBossBattles: z.number().int().min(0).default(1),
  requiresSelfExplanation: z.boolean().default(false),
});

export const ObjectiveSchema = z.object({
  id: z.string(),
  certId: CertIdSchema,
  domainId: z.string(),
  title: z.string(),
  difficulty: DifficultySchema,
  estimatedMinutes: z.number().int().positive(),
  prerequisites: z.array(z.string()).default([]),
  concepts: z.array(z.string()).default([]),
  masteryCriteria: MasteryCriteriaSchema,
  displayOrder: z.number().int().nonnegative(),
});
export type CertObjective = z.infer<typeof ObjectiveSchema>;

// =============================================================================
// LESSONS
// =============================================================================
export const LessonBlockKindSchema = z.enum([
  'concept',
  'why_it_matters',
  'beginner_explanation',
  'analogy',
  'technical',
  'exam_angle',
  'trap',
  'memory_hook',
  'quick_check',
  'related_flashcards',
  'side_quest_link',
  'mastery_challenge',
]);

export const LessonBlockSchema = z.object({
  kind: LessonBlockKindSchema,
  body: z.string(),
});
export type LessonBlock = z.infer<typeof LessonBlockSchema>;

export const LessonSchema = z.object({
  id: z.string(),
  certId: CertIdSchema,
  objectiveId: z.string(),
  title: z.string(),
  estimatedMinutes: z.number().int().positive(),
  blocks: z.array(LessonBlockSchema),
  loreIntro: z.object({
    scene: z.string(),
    mentorMessage: z.string(),
    missionObjective: z.string(),
  }).optional(),
});
export type Lesson = z.infer<typeof LessonSchema>;

// =============================================================================
// QUIZZES
// =============================================================================
export const QuizChoiceSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const QuizQuestionSchema = z.object({
  id: z.string(),
  quizId: z.string(),
  certId: CertIdSchema,
  objectiveId: z.string(),
  kind: QuizQuestionKindSchema,
  prompt: z.string(),
  choices: z.array(QuizChoiceSchema).min(2),
  correctAnswerIds: z.array(z.string()).min(1),
  explanationCorrect: z.string(),
  explanationIncorrect: z.record(z.string(), z.string()).default({}),
  difficulty: DifficultySchema,
  conceptTags: z.array(z.string()).default([]),
  examTrap: z.string().optional(),
  hint: z.string().optional(),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizSchema = z.object({
  id: z.string(),
  certId: CertIdSchema,
  objectiveId: z.string(),
  title: z.string(),
  passThreshold: z.number().int().min(0).max(100).default(80),
  questions: z.array(QuizQuestionSchema),
});
export type Quiz = z.infer<typeof QuizSchema>;

// =============================================================================
// FLASHCARDS
// =============================================================================
export const FlashcardSchema = z.object({
  id: z.string(),
  certId: CertIdSchema,
  domainId: z.string().optional(),
  objectiveId: z.string().optional(),
  kind: FlashcardKindSchema,
  front: z.string(),
  back: z.string(),
  conceptTags: z.array(z.string()).default([]),
});
export type Flashcard = z.infer<typeof FlashcardSchema>;

// =============================================================================
// SIDE QUESTS / LABS / BOSS BATTLES
// =============================================================================
export const SideQuestSchema = z.object({
  id: z.string(),
  certId: CertIdSchema,
  objectiveId: z.string().optional(),
  template: z.enum([
    'port_lockpick',
    'osi_tower',
    'subnet_sprint',
    'cable_crafter',
    'packet_detective',
    'cloud_architect',
    'cli_dojo',
    'troubleshoot_sequence',
  ]),
  title: z.string(),
  story: z.string(),
  payload: z.record(z.string(), z.unknown()),
});
export type SideQuest = z.infer<typeof SideQuestSchema>;

export const LabStepSchema = z.object({
  prompt: z.string(),
  expected: z.string().optional(),
  hint: z.string().optional(),
});

export const LabSchema = z.object({
  id: z.string(),
  certId: CertIdSchema,
  objectiveId: z.string().optional(),
  title: z.string(),
  story: z.string(),
  steps: z.array(LabStepSchema),
});
export type Lab = z.infer<typeof LabSchema>;

export const BossBattleRubricSchema = z.object({
  dimensions: z.array(
    z.object({
      key: z.string(), // 'security', 'cost', 'reliability', etc
      weight: z.number(),
      description: z.string(),
    }),
  ),
  passThreshold: z.number().int().min(0).max(100).default(75),
});

export const BossBattleSchema = z.object({
  id: z.string(),
  certId: CertIdSchema,
  objectiveIds: z.array(z.string()),
  title: z.string(),
  storySetup: z.string(),
  scenario: z.string(),
  constraints: z.array(z.string()).optional(),
  rubric: BossBattleRubricSchema,
  remediation: z.record(z.string(), z.unknown()).optional(),
  loreBrief: z.record(z.string(), z.string()).optional(),
  masteryThreshold: z.number().min(0).max(1).optional(),
});
export type BossBattle = z.infer<typeof BossBattleSchema>;

// =============================================================================
// GLOSSARY / ACRONYMS / TRAPS
// =============================================================================
export const GlossaryTermSchema = z.object({
  term: z.string(),
  definition: z.string(),
});
export type GlossaryTerm = z.infer<typeof GlossaryTermSchema>;

export const AcronymSchema = z.object({
  acronym: z.string(),
  expansion: z.string(),
  meaning: z.string(),
});
export type Acronym = z.infer<typeof AcronymSchema>;

export const ExamTrapSchema = z.object({
  trap: z.string(),
  explanation: z.string(),
});
export type ExamTrap = z.infer<typeof ExamTrapSchema>;

// =============================================================================
// FULL CERT PACK
// =============================================================================
export const CertPackSchema = z.object({
  meta: CertMetaSchema,
  domains: z.array(DomainSchema),
  objectives: z.array(ObjectiveSchema),
  lessons: z.array(LessonSchema),
  flashcards: z.array(FlashcardSchema),
  quizzes: z.array(QuizSchema),
  sideQuests: z.array(SideQuestSchema),
  labs: z.array(LabSchema).default([]),
  bossBattles: z.array(BossBattleSchema),
  glossary: z.array(GlossaryTermSchema),
  acronyms: z.array(AcronymSchema),
  examTraps: z.array(ExamTrapSchema).default([]),
});
export type CertPack = z.infer<typeof CertPackSchema>;

// =============================================================================
// STUDY PLAN / XP EVENTS
// =============================================================================
export const XpEventKindSchema = z.enum([
  'flashcard_correct',
  'quiz_passed',
  'lesson_completed',
  'side_quest_completed',
  'lab_completed',
  'boss_battle_passed',
  'weak_concept_improved',
  'daily_plan_completed',
  'practice_exam_improved',
]);
export const XpEventSchema = z.object({
  kind: XpEventKindSchema,
  amount: z.number().int().positive(),
  certId: CertIdSchema.optional(),
  sourceId: z.string().optional(),
});
export type XpEvent = z.infer<typeof XpEventSchema>;
