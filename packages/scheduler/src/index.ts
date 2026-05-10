/**
 * Scheduler. Pure function: take active cert state and produce today's plan.
 *
 * Practice exam unlock requires: minReadiness, minDomainReadiness, AND that
 * the boss battles listed in requiredBossBattlesPassed have all been passed.
 * Boss battles themselves require minimum objective mastery before they
 * appear as ready (mastery_required_boss_battles enforcement).
 */

import type { StudyIntensity } from '@certquest/types';
export type { StudyIntensity };

export interface SchedulerInputs {
  certId: string;
  studyIntensity: StudyIntensity;
  lessons: Array<{ id: string; title: string; objectiveId: string; estimatedMinutes: number }>;
  objectives: Array<{ id: string; domainId: string; title: string }>;
  domains: Array<{ id: string; title: string }>;
  sideQuests: Array<{ id: string; title: string; objectiveId?: string }>;
  bossBattles: Array<{
    id: string;
    title: string;
    objectiveIds: string[];
    /** Optional minimum mastery threshold per objective before this boss appears ready (0..1). Defaults to 0.5. */
    masteryThreshold?: number;
  }>;
  practiceExams: Array<{
    id: string;
    title: string;
    unlockRequirements: {
      minReadiness: number;
      minDomainReadiness: number;
      requiredBossBattlesPassed: string[];
      priorPracticeExamPass?: boolean;
    };
  }>;
  completedLessonIds: string[];
  passedBossBattleIds: string[];
  passedPracticeExamIds: string[];
  dueFlashcardCount: number;
  objectiveMastery: Record<string, number>;
  readiness?: { overall: number; domains: Array<{ domainId: string; score: number }> };
  currentRegion?: { regionName: string; threat: string };
}

export interface PlanTask {
  kind: 'lesson' | 'review' | 'quiz' | 'minigame' | 'boss' | 'practice_exam';
  id: string;
  title: string;
  subtitle: string;
  routeHint: string;
  priority: number;
  reason: string;
}

export interface ExamLockReason {
  examId: string;
  unlocked: boolean;
  reasons: string[];
}

export interface TodayPlan {
  certId: string;
  generatedAt: string;
  intensity: StudyIntensity;
  estimatedMinutes: number;
  mentorIntro: string;
  tasks: PlanTask[];
  weakDomain?: { id: string; title: string; score: number };
  practiceExamUnlocked: boolean;
  finalSimulationUnlocked: boolean;
  examLockStates: ExamLockReason[];
}

const INTENSITY_TARGETS: Record<StudyIntensity, { minutes: number; maxTasks: number }> = {
  chill: { minutes: 15, maxTasks: 3 },
  normal: { minutes: 30, maxTasks: 5 },
  aggressive: { minutes: 60, maxTasks: 8 },
};

const DEFAULT_BOSS_MASTERY_THRESHOLD = 0.5;

export function generateTodayPlan(inputs: SchedulerInputs): TodayPlan {
  const target = INTENSITY_TARGETS[inputs.studyIntensity]!;
  const tasks: PlanTask[] = [];
  const completedSet = new Set(inputs.completedLessonIds);
  const passedBossSet = new Set(inputs.passedBossBattleIds);

  if (inputs.dueFlashcardCount > 0) {
    tasks.push({
      kind: 'review', id: `review-${inputs.certId}`,
      title: `${inputs.dueFlashcardCount} reviews due`,
      subtitle: 'Spaced repetition. Do these before they pile up.',
      routeHint: `/review/${inputs.certId}`,
      priority: 100, reason: 'Flashcards due today',
    });
  }

  const weakDomain = findWeakestDomain(inputs);

  const nextLesson = inputs.lessons.find((l) => !completedSet.has(l.id));
  if (nextLesson) {
    tasks.push({
      kind: 'lesson', id: nextLesson.id, title: nextLesson.title,
      subtitle: `~${nextLesson.estimatedMinutes} min`,
      routeHint: `/lesson/${nextLesson.id}`,
      priority: 90, reason: 'Next lesson in path',
    });
  }

  if (target.maxTasks >= 3) {
    tasks.push({
      kind: 'quiz', id: `quiz-${inputs.certId}`,
      title: 'Quick quiz',
      subtitle: '10 mixed-domain questions',
      routeHint: `/quiz/${inputs.certId}`,
      priority: 70, reason: 'Active recall practice',
    });
  }

  const weakObjectiveIds = weakDomain
    ? new Set(inputs.objectives.filter((o) => o.domainId === weakDomain.id).map((o) => o.id))
    : new Set<string>();
  const targetedQuest = inputs.sideQuests.find((q) => q.objectiveId && weakObjectiveIds.has(q.objectiveId));
  const fallbackQuest = inputs.sideQuests[0];
  const quest = targetedQuest ?? fallbackQuest;
  if (quest && target.maxTasks >= 4) {
    tasks.push({
      kind: 'minigame', id: quest.id, title: quest.title,
      subtitle: targetedQuest ? `Targets weak area: ${weakDomain?.title}` : 'Side quest mini-game',
      routeHint: `/game/${quest.id}`,
      priority: targetedQuest ? 85 : 60,
      reason: targetedQuest ? 'Drills your weakest domain' : 'Side quest available',
    });
  }

  // Boss battle: ready only if mastery threshold met across its objectives
  const readyBoss = inputs.bossBattles.find((b) => isBossReady(b, inputs.objectiveMastery, passedBossSet));
  if (readyBoss && target.maxTasks >= 5) {
    tasks.push({
      kind: 'boss', id: readyBoss.id, title: readyBoss.title,
      subtitle: 'Boss battle — readiness sufficient',
      routeHint: `/boss/${readyBoss.id}`,
      priority: 80, reason: 'Boss battle prerequisites met',
    });
  }

  // Per-exam lock evaluation (used for both Today scheduling and the exam list view)
  const examLockStates: ExamLockReason[] = inputs.practiceExams.map((e) =>
    evaluateExamLock(e, inputs, passedBossSet)
  );
  const practiceExamLock = examLockStates.find((l) => {
    const exam = inputs.practiceExams.find((x) => x.id === l.examId)!;
    return exam.unlockRequirements.minReadiness <= 80;
  });
  const practiceExamUnlocked = practiceExamLock?.unlocked ?? false;

  if (practiceExamUnlocked && target.maxTasks >= 6) {
    const exam = inputs.practiceExams.find((e) => e.id === practiceExamLock!.examId)!;
    tasks.push({
      kind: 'practice_exam', id: exam.id, title: exam.title,
      subtitle: 'Trial unlocked — ready when you are',
      routeHint: `/practice/${inputs.certId}/exam/${exam.id}`,
      priority: 75, reason: 'Practice exam unlocked',
    });
  }

  const finalSimLock = examLockStates.find((l) => {
    const exam = inputs.practiceExams.find((x) => x.id === l.examId)!;
    return exam.unlockRequirements.minReadiness >= 90;
  });
  const finalSimulationUnlocked = !!(finalSimLock?.unlocked && inputs.passedPracticeExamIds.length > 0);

  tasks.sort((a, b) => b.priority - a.priority);
  const finalTasks = tasks.slice(0, target.maxTasks);

  const mentorIntro = buildMentorIntro(inputs, finalTasks, weakDomain);

  const minuteEstimates: Record<PlanTask['kind'], number> = {
    review: Math.min(15, Math.ceil(inputs.dueFlashcardCount * 0.25)),
    lesson: nextLesson?.estimatedMinutes ?? 10,
    quiz: 8, minigame: 6, boss: 12, practice_exam: 30,
  };
  const estimatedMinutes = finalTasks.reduce((s, t) => s + (minuteEstimates[t.kind] ?? 5), 0);

  return {
    certId: inputs.certId,
    generatedAt: new Date().toISOString(),
    intensity: inputs.studyIntensity,
    estimatedMinutes, mentorIntro, tasks: finalTasks,
    weakDomain: weakDomain ? { id: weakDomain.id, title: weakDomain.title, score: weakDomain.score } : undefined,
    practiceExamUnlocked, finalSimulationUnlocked,
    examLockStates,
  };
}

function isBossReady(
  boss: { id: string; objectiveIds: string[]; masteryThreshold?: number },
  mastery: Record<string, number>,
  passed: Set<string>,
): boolean {
  if (passed.has(boss.id)) return false;
  if (boss.objectiveIds.length === 0) return true;
  const threshold = boss.masteryThreshold ?? DEFAULT_BOSS_MASTERY_THRESHOLD;
  const avg = boss.objectiveIds.reduce((s, oid) => s + (mastery[oid] ?? 0), 0) / boss.objectiveIds.length;
  return avg >= threshold;
}

function evaluateExamLock(
  exam: SchedulerInputs['practiceExams'][number],
  inputs: SchedulerInputs,
  passedBossSet: Set<string>,
): ExamLockReason {
  const reasons: string[] = [];
  const overall = inputs.readiness?.overall ?? 0;

  if (overall < exam.unlockRequirements.minReadiness) {
    reasons.push(`Need ${exam.unlockRequirements.minReadiness}% overall readiness (at ${overall}%)`);
  }
  if (inputs.readiness) {
    const failedDomains = inputs.readiness.domains.filter(
      (d) => d.score < exam.unlockRequirements.minDomainReadiness
    );
    if (failedDomains.length > 0) {
      reasons.push(
        `${failedDomains.length} domain(s) below ${exam.unlockRequirements.minDomainReadiness}%`
      );
    }
  } else {
    reasons.push('No readiness snapshot yet — study a bit first');
  }

  // Enforce mastery_required_boss_battles
  const missingBosses = exam.unlockRequirements.requiredBossBattlesPassed.filter(
    (id) => !passedBossSet.has(id)
  );
  if (missingBosses.length > 0) {
    reasons.push(`${missingBosses.length} required boss battle(s) not yet passed`);
  }

  if (exam.unlockRequirements.priorPracticeExamPass && inputs.passedPracticeExamIds.length === 0) {
    reasons.push('Pass a regular practice exam first');
  }

  return { examId: exam.id, unlocked: reasons.length === 0, reasons };
}

function findWeakestDomain(inputs: SchedulerInputs) {
  if (!inputs.readiness) return undefined;
  const lowest = inputs.readiness.domains.reduce(
    (m, d) => (d.score < m.score ? d : m),
    { domainId: '', score: 100 },
  );
  if (lowest.score >= 65 || !lowest.domainId) return undefined;
  const domain = inputs.domains.find((d) => d.id === lowest.domainId);
  if (!domain) return undefined;
  return { id: domain.id, title: domain.title, score: lowest.score };
}

function buildMentorIntro(inputs: SchedulerInputs, tasks: PlanTask[], weakDomain?: { title: string; score: number }): string {
  if (tasks.length === 0) return 'No tasks scheduled. Rest day.';
  if (weakDomain) return `${weakDomain.title} is your soft spot at ${weakDomain.score}%. Today's plan drills it.`;
  if (inputs.currentRegion) return `You're in ${inputs.currentRegion.regionName}. Threat: ${inputs.currentRegion.threat}.`;
  return `${tasks.length} tasks today. Estimated ${INTENSITY_TARGETS[inputs.studyIntensity]!.minutes} minutes.`;
}
