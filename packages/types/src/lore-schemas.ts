import { z } from 'zod';

/**
 * Lore schemas. Layered onto cert packs and content items so the lore
 * system is part of the content model rather than UI decoration.
 */

export const MentorSchema = z.object({
  name: z.string(),
  title: z.string(),
  voice: z.string(),
  catchphrase: z.string().optional(),
});

export const RivalSchema = z.object({
  name: z.string(),
  title: z.string(),
  purpose: z.string(),
});

export const LoreRegionSchema = z.object({
  domainId: z.string(),
  regionName: z.string(),
  description: z.string(),
  threat: z.string(),
  unlockMessage: z.string(),
  completionMessage: z.string(),
});

export const CertLoreSchema = z.object({
  worldName: z.string(),
  userRole: z.string(),
  tagline: z.string(),
  tone: z.string(),
  mentor: MentorSchema,
  rival: RivalSchema.optional(),
  regions: z.array(LoreRegionSchema),
  rankTitles: z.array(z.string()).min(1),
  dailyMessageTemplates: z.array(z.string()).min(1),
});

export type CertLore = z.infer<typeof CertLoreSchema>;
export type LoreRegion = z.infer<typeof LoreRegionSchema>;
export type Mentor = z.infer<typeof MentorSchema>;
export type Rival = z.infer<typeof RivalSchema>;

export const LessonLoreIntroSchema = z.object({
  scene: z.string(),
  mentorMessage: z.string(),
  missionObjective: z.string(),
});

export const SideQuestLoreBriefSchema = z.object({
  setup: z.string(),
  stakes: z.string(),
  successMessage: z.string(),
  failureMessage: z.string(),
});

export const BossBattleLoreBriefSchema = z.object({
  bossName: z.string(),
  arena: z.string(),
  setup: z.string(),
  stakes: z.string(),
  victoryMessage: z.string(),
  retryMessage: z.string(),
});

export const PracticeExamLoreTrialSchema = z.object({
  trialName: z.string(),
  unlockMessage: z.string(),
  lockedMessage: z.string(),
  passMessage: z.string(),
  failMessage: z.string(),
});

export const BadgeLoreSchema = z.object({
  loreTitle: z.string(),
  titleFlavor: z.string(),
});

export type LessonLoreIntro = z.infer<typeof LessonLoreIntroSchema>;
export type SideQuestLoreBrief = z.infer<typeof SideQuestLoreBriefSchema>;
export type BossBattleLoreBrief = z.infer<typeof BossBattleLoreBriefSchema>;
export type PracticeExamLoreTrial = z.infer<typeof PracticeExamLoreTrialSchema>;
export type BadgeLore = z.infer<typeof BadgeLoreSchema>;
