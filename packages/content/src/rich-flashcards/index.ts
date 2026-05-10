/**
 * Rich (9-field) flashcard registry.
 * Layered alongside the existing basic flashcards in each cert pack.
 */

import { aPlusCore1RichFlashcards } from './a-plus-core1';
import { aPlusCore2RichFlashcards } from './a-plus-core2';
import { networkPlusRichFlashcards } from './network-plus';
import { awsCcpRichFlashcards } from './aws-ccp';
import { awsSaaRichFlashcards } from './aws-saa';
import { ccnaRichFlashcards } from './ccna';
import type { RichFlashcard } from '@certquest/types';

export const richFlashcardsByCert: Record<string, RichFlashcard[]> = {
  'a-plus-core1': aPlusCore1RichFlashcards,
  'a-plus-core2': aPlusCore2RichFlashcards,
  'network-plus': networkPlusRichFlashcards,
  'aws-ccp': awsCcpRichFlashcards,
  'aws-saa': awsSaaRichFlashcards,
  'ccna': ccnaRichFlashcards,
};

export const allRichFlashcards: RichFlashcard[] = [
  ...aPlusCore1RichFlashcards,
  ...aPlusCore2RichFlashcards,
  ...networkPlusRichFlashcards,
  ...awsCcpRichFlashcards,
  ...awsSaaRichFlashcards,
  ...ccnaRichFlashcards,
];

export function getRichFlashcardsForCert(certId: string): RichFlashcard[] {
  return richFlashcardsByCert[certId] ?? [];
}

export {
  aPlusCore1RichFlashcards,
  aPlusCore2RichFlashcards,
  networkPlusRichFlashcards,
  awsCcpRichFlashcards,
  awsSaaRichFlashcards,
  ccnaRichFlashcards,
};
