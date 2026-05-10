/**
 * Authoring helpers for enriched flashcards and proof-based labs.
 *
 * Companion to `authoring.ts`. Use `rfc()` for 9-field flashcards and
 * `proofLab()` for verifiable hands-on labs. Both default qaStatus to
 * 'multi_ai_checked' — agents must NOT bump to 'human_reviewed' or
 * 'self_verified' (see AGENTS.md §QA).
 */

import type { RichFlashcard, ProofLab, LabTask, LabTool } from '@certquest/types';

export interface RfcInput {
  id: string;
  certId: string;
  domainId: string;
  objectiveId: string;
  term: string;
  definition: string;
  whyItMatters: string;
  memoryHook: string;
  commonTrap: string;
  example: string;
  examAngle: string;
  notebookLmReadyText?: string; // auto-generated if omitted
  audioBriefText?: string;      // auto-generated if omitted
  tags?: string[];
  difficulty?: RichFlashcard['difficulty'];
  qaStatus?: RichFlashcard['qaStatus'];
}

/**
 * Build a RichFlashcard. If notebookLmReadyText / audioBriefText are
 * omitted, this helper composes structured/audio-friendly text from the
 * other fields. Authored fields take priority — supply them whenever
 * possible.
 */
export function rfc(input: RfcInput): RichFlashcard {
  const notebookLmReadyText = input.notebookLmReadyText ?? composeNotebookLm(input);
  const audioBriefText = input.audioBriefText ?? composeAudioBrief(input);

  return {
    id: input.id,
    certId: input.certId,
    domainId: input.domainId,
    objectiveId: input.objectiveId,
    term: input.term,
    definition: input.definition,
    whyItMatters: input.whyItMatters,
    memoryHook: input.memoryHook,
    commonTrap: input.commonTrap,
    example: input.example,
    examAngle: input.examAngle,
    notebookLmReadyText,
    audioBriefText,
    conceptTags: input.tags ?? [],
    difficulty: input.difficulty ?? 'intermediate',
    qaStatus: input.qaStatus ?? 'multi_ai_checked',
    isScaffold: false,
  };
}

function composeNotebookLm(i: RfcInput): string {
  return [
    `# ${i.term}`,
    ``,
    `## Definition`,
    i.definition,
    ``,
    `## Why It Matters`,
    i.whyItMatters,
    ``,
    `## Memory Hook`,
    i.memoryHook,
    ``,
    `## Common Trap`,
    i.commonTrap,
    ``,
    `## Example`,
    i.example,
    ``,
    `## Exam Angle`,
    i.examAngle,
  ].join('\n');
}

function composeAudioBrief(i: RfcInput): string {
  // Smooth, TTS-friendly prose. Sentence-by-sentence rhythm; no bullet residue.
  return [
    `Today's concept is ${i.term}.`,
    `Here's what it is: ${i.definition}`,
    `Why does this matter? ${i.whyItMatters}`,
    `To remember it: ${i.memoryHook}`,
    `Watch out — ${i.commonTrap}`,
    `Quick example. ${i.example}`,
    `On the exam: ${i.examAngle}`,
  ].join(' ');
}

// ============================================================================
// PROOF-BASED LABS
// ============================================================================

export interface ProofLabInput {
  id: string;
  certId: string;
  domainId: string;
  objectiveId: string;
  title: string;
  difficulty: ProofLab['difficulty'];
  estimatedMinutes: number;
  xpReward: number;
  loreNarration: string;
  tools: LabTool[];
  setup: string;
  learningObjectives: string[];
  tasks: LabTask[];
  commonMistakes?: string[];
  troubleshooting?: Array<{ symptom: string; fix: string }>;
  sourceRefs?: string[];
  qaStatus?: ProofLab['qaStatus'];
}

export function proofLab(input: ProofLabInput): ProofLab {
  return {
    id: input.id,
    certId: input.certId,
    domainId: input.domainId,
    objectiveId: input.objectiveId,
    title: input.title,
    difficulty: input.difficulty,
    estimatedMinutes: input.estimatedMinutes,
    xpReward: input.xpReward,
    loreNarration: input.loreNarration,
    tools: input.tools,
    setup: input.setup,
    learningObjectives: input.learningObjectives,
    tasks: input.tasks,
    commonMistakes: input.commonMistakes ?? [],
    troubleshooting: input.troubleshooting ?? [],
    qaStatus: input.qaStatus ?? 'multi_ai_checked',
    isScaffold: false,
    sourceRefs: input.sourceRefs ?? [],
  };
}

/** Concise task helper. */
export function task(
  id: string,
  prompt: string,
  verificationKind: LabTask['verificationKind'],
  expected?: string,
  hint?: string,
  reasoningRequired = false,
): LabTask {
  return { id, prompt, verificationKind, expected, hint, reasoningRequired };
}
