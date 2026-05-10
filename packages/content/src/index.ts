/**
 * Unified content registry. All six cert packs in one map.
 */

import * as aPlusCore1 from './certs/a-plus-core1';
import * as aPlusCore2 from './certs/a-plus-core2';
import * as networkPlus from './certs/network-plus';
import * as awsCcp from './certs/aws-ccp';
import * as awsSaa from './certs/aws-saa';
import * as ccna from './certs/ccna';
import { certLore, getCertLore, getRegionForDomain, pickDailyMessage } from './lore';
import type {
  CertMeta, CertDomain, CertObjective, Lesson, Flashcard,
  BossBattle, GlossaryTerm, Acronym, ExamTrap, CertExamCode,
} from '@certquest/types';
import type { QuestionBankItem, PracticeExamBlueprint } from '@certquest/practice-exam';

export interface SideQuestEntry {
  id: string;
  certId: string;
  objectiveId?: string;
  template: string;
  title: string;
  story: string;
  payload: Record<string, unknown>;
  loreBrief?: Record<string, string>;
}

export interface CertPack {
  meta: CertMeta;
  examCodes: CertExamCode[];
  domains: CertDomain[];
  objectives: CertObjective[];
  lessons: Lesson[];
  flashcards: Flashcard[];
  questionBank: QuestionBankItem[];
  sideQuests: SideQuestEntry[];
  bossBattles: BossBattle[];
  practiceExams: PracticeExamBlueprint[];
  glossary: GlossaryTerm[];
  acronyms: Acronym[];
  examTraps: ExamTrap[];
}

// Module namespaces cannot be directly assigned to an interface — a single-level
// cast is needed. TypeScript still checks structural compatibility for most fields;
// the cast is narrower than `as unknown as` and will surface obvious shape errors.
export const certPacks: Record<string, CertPack> = {
  [aPlusCore1.CERT_ID]: aPlusCore1 as CertPack,
  [aPlusCore2.CERT_ID]: aPlusCore2 as CertPack,
  [networkPlus.CERT_ID]: networkPlus as CertPack,
  [awsCcp.CERT_ID]: awsCcp as CertPack,
  [awsSaa.CERT_ID]: awsSaa as CertPack,
  [ccna.CERT_ID]: ccna as CertPack,
};

export const certDisplayOrder: string[] = [
  aPlusCore1.CERT_ID, aPlusCore2.CERT_ID, networkPlus.CERT_ID,
  awsCcp.CERT_ID, awsSaa.CERT_ID, ccna.CERT_ID,
];

export const certGroups = [
  { id: 'a-plus', title: 'CompTIA A+', blurb: 'Two-exam cert. Pass both Cores to certify.', certIds: [aPlusCore1.CERT_ID, aPlusCore2.CERT_ID] },
  { id: 'network-plus', title: 'CompTIA Network+', blurb: 'Single-exam network fundamentals.', certIds: [networkPlus.CERT_ID] },
  { id: 'aws-ccp', title: 'AWS Cloud Practitioner', blurb: 'Foundational AWS certification.', certIds: [awsCcp.CERT_ID] },
  { id: 'aws-saa', title: 'AWS Solutions Architect Associate', blurb: 'Associate-level AWS architecture.', certIds: [awsSaa.CERT_ID] },
  { id: 'ccna', title: 'Cisco CCNA', blurb: 'Cisco network associate certification.', certIds: [ccna.CERT_ID] },
];

// ---------------------------------------------------------------------------
// Registry helpers — required by spec
// ---------------------------------------------------------------------------

export function getAllCertPacks(): CertPack[] {
  return certDisplayOrder.map((id) => certPacks[id]!).filter(Boolean);
}

export function getCertPack(certId: string): CertPack | undefined {
  return certPacks[certId];
}

export function listCertIds(): string[] {
  return certDisplayOrder;
}

export function findLessonById(id: string): { lesson: Lesson; pack: CertPack } | undefined {
  for (const pack of getAllCertPacks()) {
    const found = pack.lessons.find((l) => l.id === id);
    if (found) return { lesson: found, pack };
  }
  return undefined;
}

export function findQuestionById(id: string): { question: QuestionBankItem; pack: CertPack } | undefined {
  for (const pack of getAllCertPacks()) {
    const found = pack.questionBank.find((q) => q.id === id);
    if (found) return { question: found, pack };
  }
  return undefined;
}

export function findSideQuestById(id: string): { sideQuest: SideQuestEntry; pack: CertPack } | undefined {
  for (const pack of getAllCertPacks()) {
    const found = pack.sideQuests.find((s) => s.id === id);
    if (found) return { sideQuest: found, pack };
  }
  return undefined;
}

export function findBossBattleById(id: string): { bossBattle: BossBattle; pack: CertPack } | undefined {
  for (const pack of getAllCertPacks()) {
    const found = pack.bossBattles.find((b) => b.id === id);
    if (found) return { bossBattle: found, pack };
  }
  return undefined;
}

export function findFlashcardById(id: string): { flashcard: Flashcard; pack: CertPack } | undefined {
  for (const pack of getAllCertPacks()) {
    const found = pack.flashcards.find((f) => f.id === id);
    if (found) return { flashcard: found, pack };
  }
  return undefined;
}

export function findObjectiveById(id: string): { objective: CertObjective; pack: CertPack } | undefined {
  for (const pack of getAllCertPacks()) {
    const found = pack.objectives.find((o) => o.id === id);
    if (found) return { objective: found, pack };
  }
  return undefined;
}

export function getPackByContentId(id: string): CertPack | undefined {
  return findLessonById(id)?.pack
    ?? findQuestionById(id)?.pack
    ?? findSideQuestById(id)?.pack
    ?? findBossBattleById(id)?.pack
    ?? findFlashcardById(id)?.pack
    ?? findObjectiveById(id)?.pack;
}

export function getQuestionsForCert(certId: string) {
  return certPacks[certId]?.questionBank ?? [];
}

export function getFlashcardsForCert(certId: string) {
  return certPacks[certId]?.flashcards ?? [];
}

export function getSideQuestsForCert(certId: string) {
  return certPacks[certId]?.sideQuests ?? [];
}

export function getBossBattlesForCert(certId: string) {
  return certPacks[certId]?.bossBattles ?? [];
}

export function getPracticeExamBlueprintsForCert(certId: string) {
  return certPacks[certId]?.practiceExams ?? [];
}

// Lore re-exports
export { certLore, getCertLore, getRegionForDomain, pickDailyMessage };

// Cert pack re-exports for convenience
export { aPlusCore1, aPlusCore2, networkPlus, awsCcp, awsSaa, ccna };
export * from './authoring';
export * from './authoring-rich';

// Rich content registries (rich flashcards + proof-based labs)
export {
  richFlashcardsByCert,
  allRichFlashcards,
  getRichFlashcardsForCert,
} from './rich-flashcards';
export {
  proofLabsByCert,
  allProofLabs,
  getProofLabsForCert,
} from './proof-labs';
