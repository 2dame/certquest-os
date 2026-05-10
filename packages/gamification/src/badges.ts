import type { CertId } from '@certquest/types';

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  criteria: BadgeCriteria;
}

export type BadgeCriteria =
  | { kind: 'first_lesson' }
  | { kind: 'first_boss_battle' }
  | { kind: 'streak_days'; days: number }
  | { kind: 'flashcards_reviewed'; count: number }
  | { kind: 'objective_mastered'; certId?: CertId }
  | { kind: 'cert_completed'; certId: CertId };

export const BADGES: BadgeDef[] = [
  {
    id: 'first-light',
    title: 'First Light',
    description: 'Complete your first lesson.',
    icon: 'sparkle',
    criteria: { kind: 'first_lesson' },
  },
  {
    id: 'boss-slayer',
    title: 'Boss Slayer',
    description: 'Pass your first boss battle.',
    icon: 'sword',
    criteria: { kind: 'first_boss_battle' },
  },
  {
    id: 'streak-7',
    title: 'Seven-Day Drill',
    description: 'Maintain a 7-day study streak.',
    icon: 'flame',
    criteria: { kind: 'streak_days', days: 7 },
  },
  {
    id: 'streak-30',
    title: 'Iron Discipline',
    description: 'Maintain a 30-day study streak.',
    icon: 'flame-2',
    criteria: { kind: 'streak_days', days: 30 },
  },
  {
    id: 'card-warden',
    title: 'Card Warden',
    description: 'Successfully review 500 flashcards.',
    icon: 'cards',
    criteria: { kind: 'flashcards_reviewed', count: 500 },
  },
  {
    id: 'a-plus-core1-graduate',
    title: 'Core 1 Cleared',
    description: 'Reach exam-ready readiness on CompTIA A+ Core 1 (220-1101).',
    icon: 'shield',
    criteria: { kind: 'cert_completed', certId: 'a-plus-core1' },
  },
  {
    id: 'a-plus-core2-graduate',
    title: 'Help Desk Initiate',
    description: 'Reach exam-ready readiness on CompTIA A+ Core 2 (220-1102).',
    icon: 'shield-check',
    criteria: { kind: 'cert_completed', certId: 'a-plus-core2' },
  },
];
