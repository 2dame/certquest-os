// Pure TypeScript domain types used across apps and engines.

export type CertId =
  | 'a-plus-core1'
  | 'a-plus-core2'
  | 'network-plus'
  | 'aws-ccp'
  | 'aws-saa'
  | 'ccna';

export type MasteryState =
  | 'locked'
  | 'unlocked'
  | 'seen'
  | 'practiced'
  | 'battle_tested'
  | 'mastered'
  | 'rusty';

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export type StudyIntensity = 'chill' | 'normal' | 'aggressive';

export type Rank =
  | 'Recruit'
  | 'Apprentice'
  | 'Operator'
  | 'Specialist'
  | 'Tactician'
  | 'Architect'
  | 'Master';

export type MasteryLabel =
  | 'Unknown'
  | 'Familiar'
  | 'Practiced'
  | 'Reliable'
  | 'Battle-Tested'
  | 'Mastered'
  | 'Rusty';

export type DailyPlanItemKind =
  | 'flashcard_batch'
  | 'lesson'
  | 'weak_objective_review'
  | 'quick_quiz'
  | 'side_quest'
  | 'lab'
  | 'boss_battle';

export interface DailyPlanItem {
  kind: DailyPlanItemKind;
  refId: string; // lesson id, quiz id, side_quest id, etc; for flashcard_batch this is a synthetic id
  title: string;
  estimatedMinutes: number;
  completed?: boolean;
  meta?: Record<string, unknown>;
}

export interface DailyPlan {
  certId: CertId;
  planDate: string; // YYYY-MM-DD
  items: DailyPlanItem[];
  totalEstimatedMinutes: number;
}

export interface SrsState {
  easeFactor: number;
  intervalDays: number;
  dueAt: string; // ISO
  reviewCount: number;
  lastReviewedAt?: string;
}

export interface ObjectiveProgress {
  objectiveId: string;
  state: MasteryState;
  score: number; // 0-100
  lastEvidenceAt?: string;
  rustyAt?: string;
}
