/**
 * Authoring helpers — concise factory functions for building large question
 * banks without repeating boilerplate. Used by every cert pack.
 */

import type { QuestionBankItem } from '@certquest/practice-exam';

interface QInput {
  id: string;
  certId: string;
  examCode?: string;
  domainId: string;
  objectiveId: string;
  type?: QuestionBankItem['type'];
  difficulty?: QuestionBankItem['difficulty'];
  q: string;
  a: Array<[id: string, text: string, isCorrect?: boolean]>;
  // For ordering / PBQ questions: supply the sequence directly. Overrides any flags in `a`.
  correctAnswers?: string[];
  why: string;
  wrong?: Record<string, string>;
  trap?: string;
  hint?: string;
  tags?: string[];
  time?: number;
  weight?: number;
  pbq?: boolean;
}

/** Build a QuestionBankItem from a compact author-friendly shape. */
export function q(input: QInput): QuestionBankItem {
  const correctAnswers =
    input.correctAnswers ?? input.a.filter((c) => c[2]).map((c) => c[0]);

  if (correctAnswers.length === 0) {
    throw new Error(`Question ${input.id} has no correct answer marked.`);
  }

  return {
    id: input.id,
    certId: input.certId,
    examCode: input.examCode,
    domainId: input.domainId,
    objectiveId: input.objectiveId,
    type: input.type ?? (correctAnswers.length > 1 ? 'multiple_select' : 'multiple_choice'),
    difficulty: input.difficulty ?? 'medium',
    questionText: input.q,
    choices: input.a.map((c) => ({ id: c[0], text: c[1] })),
    correctAnswers,
    explanation: input.why,
    wrongAnswerExplanations: input.wrong ?? {},
    examTrap: input.trap,
    tags: input.tags ?? [],
    timeEstimateSeconds: input.time ?? 60,
    readinessWeight: input.weight ?? 1,
    sourceType: 'original' as const,
    isPracticeExamEligible: true,
    isPbqStyle: input.pbq ?? false,
  } as QuestionBankItem;
}

/** Concise flashcard helper. */
export function fc(
  id: string,
  certId: string,
  domainId: string,
  objectiveId: string,
  front: string,
  back: string,
  kind: 'basic' | 'cloze' | 'scenario' | 'port_protocol' | 'command' = 'basic',
  tags: string[] = [],
) {
  return { id, certId, domainId, objectiveId, kind, front, back, conceptTags: tags };
}
