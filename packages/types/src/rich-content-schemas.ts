import { z } from 'zod';

/**
 * Rich content schemas: enriched flashcards (9-field cognitive-science layout)
 * and proof-based labs (verifiable hands-on tasks with free-tool integration).
 *
 * These are layered on top of the existing FlashcardSchema and LabSchema
 * in ./schemas.ts. Old flashcards/labs continue to work unchanged.
 */

// =============================================================================
// RICH FLASHCARDS — 9-field cognitive-science layout
// =============================================================================
// Based on: dual-coding theory (Paivio), spaced repetition (Anki), elaborative
// encoding, retrieval practice, and the "exam angle" technique used by top
// cert trainers (Messer, Bonso, Brown, Bombal). Each field plays a specific
// memory role; together they support recall under exam-room time pressure.

export const RichFlashcardSchema = z.object({
  id: z.string(),
  certId: z.string(),
  domainId: z.string(),
  objectiveId: z.string(),

  // Core
  term: z.string().min(1).max(120),
  definition: z.string().min(1).max(400),

  // Cognitive scaffolding
  whyItMatters: z.string().min(1).max(400),
  memoryHook: z.string().min(1).max(400),
  commonTrap: z.string().min(1).max(400),
  example: z.string().min(1).max(500),
  examAngle: z.string().min(1).max(400),

  // Multi-modal study
  notebookLmReadyText: z.string().min(1),
  audioBriefText: z.string().min(1),

  // Metadata
  conceptTags: z.array(z.string()).default([]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),

  // Authoring provenance — required for the QA pipeline.
  // Agents may set up to 'multi_ai_checked'. Only humans set 'human_reviewed'/'self_verified'.
  qaStatus: z.enum([
    'unreviewed',
    'structural_pass',
    'ai_reviewed',
    'source_checked',
    'multi_ai_checked',
    'human_reviewed',
    'self_verified',
    'needs_fix',
  ]).default('multi_ai_checked'),

  // Authored vs scaffolded — see AGENTS.md.
  // [SCAFFOLD] cards are auto-generated and should not be counted in richness metrics.
  isScaffold: z.boolean().default(false),
});

export type RichFlashcard = z.infer<typeof RichFlashcardSchema>;

// =============================================================================
// PROOF-BASED LABS — verifiable hands-on tasks with free-tool integration
// =============================================================================
// Each lab produces a checkable artifact (CLI output, screenshot, calculated
// value, decision with reasoning). Labs cannot be passed by clicking through;
// the user must demonstrate they can do the thing.

export const LabToolSchema = z.object({
  name: z.string(),
  url: z.string().url().optional(),
  notes: z.string().optional(),
});

export const LabTaskSchema = z.object({
  id: z.string(),
  prompt: z.string().min(1),
  // What the user must produce/verify. Examples:
  //   - 'output_match': output must contain or equal expected
  //   - 'screenshot': user uploads/pastes proof
  //   - 'calculation': numeric value compared after normalization
  //   - 'decision': user picks correct option AND writes a reason
  verificationKind: z.enum(['output_match', 'screenshot', 'calculation', 'decision', 'free_response']),
  expected: z.string().optional(), // for output_match, calculation, decision
  reasoningRequired: z.boolean().default(false),
  hint: z.string().optional(),
});

export const ProofLabSchema = z.object({
  id: z.string(),
  certId: z.string(),
  domainId: z.string(),
  objectiveId: z.string(),

  // Display
  title: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedMinutes: z.number().int().min(10).max(120),
  xpReward: z.number().int().min(40).max(200),

  // Lore wrapper — 1–2 paragraphs in-character. NOT decorative; the lab is
  // framed as a quest in the cert's world (Help Desk Guild, etc.).
  loreNarration: z.string().min(50),

  // Real-world setup
  tools: z.array(LabToolSchema).min(1),
  setup: z.string().min(20), // step-by-step environment setup

  // Pedagogy
  learningObjectives: z.array(z.string()).min(3).max(6),

  // Tasks the user must complete with proof
  tasks: z.array(LabTaskSchema).min(3).max(10),

  // Failure-mode awareness
  commonMistakes: z.array(z.string()).default([]),
  troubleshooting: z.array(z.object({
    symptom: z.string(),
    fix: z.string(),
  })).default([]),

  // Authoring provenance
  qaStatus: z.enum([
    'unreviewed',
    'structural_pass',
    'ai_reviewed',
    'source_checked',
    'multi_ai_checked',
    'human_reviewed',
    'self_verified',
    'needs_fix',
  ]).default('multi_ai_checked'),
  isScaffold: z.boolean().default(false),

  // Reference to source-of-truth doc/objective (for source-checked verification)
  sourceRefs: z.array(z.string().url()).default([]),
});

export type ProofLab = z.infer<typeof ProofLabSchema>;
export type LabTool = z.infer<typeof LabToolSchema>;
export type LabTask = z.infer<typeof LabTaskSchema>;
