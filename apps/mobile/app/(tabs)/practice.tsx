import { useMemo } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { certPacks, getCertLore, getRegionForDomain } from '@certquest/content';
import { generateTodayPlan, type PlanTask } from '@certquest/scheduler';
import { useStore } from '../../lib/store';
import { theme } from '../../lib/theme';

export default function PracticeScreen() {
  const activeCertId = useStore((s) => s.activeCertId);
  const settings = useStore((s) => s.settings);
  const completedLessons = useStore((s) => s.completedLessons);
  const objectiveMastery = useStore((s) => s.objectiveMastery);
  const bossAttempts = useStore((s) => s.bossBattleAttempts);
  const examAttempts = useStore((s) => s.examAttempts);
  const readiness = useStore((s) => activeCertId ? s.readinessByCert[activeCertId] : undefined);
  const getDueFlashcards = useStore((s) => s.getDueFlashcards);
  // These must be declared before any conditional return to satisfy React hooks rules.
  const wrongCount = useStore((s) => activeCertId ? s.getWrongAnswers(activeCertId).length : 0);
  const diagnostic = useStore((s) => activeCertId ? s.diagnosticTaken[activeCertId] : undefined);

  const pack = certPacks[activeCertId];
  const lore = getCertLore(activeCertId);

  const plan = useMemo(() => {
    if (!pack) return null;
    const completedForCert = completedLessons.filter((c) => c.certId === activeCertId).map((c) => c.lessonId);
    const passedBosses = bossAttempts.filter((b) => b.certId === activeCertId && b.passed).map((b) => b.bossId);
    const passedExams = examAttempts.filter((e) => e.certId === activeCertId && e.passEstimate).map((e) => e.blueprintId);
    const dueCount = getDueFlashcards(activeCertId).length;

    // Pull current region from next incomplete lesson
    const completedSet = new Set(completedForCert);
    const nextLesson = pack.lessons.find((l) => !completedSet.has(l.id));
    const nextObj = nextLesson ? pack.objectives.find((o) => o.id === nextLesson.objectiveId) : null;
    const region = nextObj ? getRegionForDomain(activeCertId, nextObj.domainId) : undefined;

    return generateTodayPlan({
      certId: activeCertId,
      studyIntensity: settings.studyIntensity,
      lessons: pack.lessons,
      objectives: pack.objectives,
      domains: pack.domains,
      sideQuests: pack.sideQuests,
      bossBattles: pack.bossBattles,
      practiceExams: pack.practiceExams,
      completedLessonIds: completedForCert,
      passedBossBattleIds: passedBosses,
      passedPracticeExamIds: passedExams,
      dueFlashcardCount: dueCount,
      objectiveMastery,
      readiness: readiness ? { overall: readiness.overall, domains: readiness.domains } : undefined,
      currentRegion: region ? { regionName: region.regionName, threat: region.threat } : undefined,
    });
  }, [activeCertId, settings.studyIntensity, completedLessons, bossAttempts, examAttempts, objectiveMastery, readiness]);

  if (!pack || !plan) return <Text style={{ color: '#fff', padding: 20 }}>Loading</Text>;

  const passedBossSet = new Set(bossAttempts.filter((b) => b.certId === activeCertId && b.passed).map((b) => b.bossId));
  const overall = readiness?.overall ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>{lore?.worldName}</Text>
      <Text style={styles.title}>Today's Plan</Text>

      <View style={styles.intensityBar}>
        <Text style={styles.intensityLabel}>Intensity:</Text>
        <Text style={styles.intensityValue}>{plan.intensity}</Text>
        <Text style={styles.intensitySep}>·</Text>
        <Text style={styles.intensityLabel}>~{plan.estimatedMinutes} min</Text>
        <Text style={styles.intensitySep}>·</Text>
        <Text style={styles.intensityLabel}>{plan.tasks.length} tasks</Text>
      </View>

      {plan.mentorIntro && (
        <View style={styles.mentorBox}>
          <Text style={styles.mentorLabel}>{lore?.mentor.name.toUpperCase()}</Text>
          <Text style={styles.mentorMsg}>{plan.mentorIntro}</Text>
        </View>
      )}

      {plan.weakDomain && (
        <View style={styles.weakBox}>
          <Text style={styles.weakLabel}>WEAKEST DOMAIN</Text>
          <Text style={styles.weakName}>{plan.weakDomain.title} — {plan.weakDomain.score}%</Text>
        </View>
      )}

      {!diagnostic && (
        <Pressable
          onPress={() => router.push(`/practice/diagnostic/${activeCertId}`)}
          style={styles.diagnosticCard}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.diagnosticLabel}>BASELINE DIAGNOSTIC</Text>
            <Text style={styles.diagnosticTitle}>Calibrate where you stand</Text>
            <Text style={styles.diagnosticSub}>30 mixed-domain questions. Run before everything else.</Text>
          </View>
          <Text style={styles.diagnosticChev}>{'>'}</Text>
        </Pressable>
      )}

      {wrongCount > 0 && (
        <Pressable
          onPress={() => router.push(`/practice/wrong-answers?certId=${activeCertId}`)}
          style={styles.wrongCard}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.wrongLabel}>WRONG ANSWER REVIEW</Text>
            <Text style={styles.wrongTitle}>{wrongCount} unresolved miss{wrongCount === 1 ? '' : 'es'}</Text>
            <Text style={styles.wrongSub}>Walk through them with explanations.</Text>
          </View>
          <Text style={styles.wrongChev}>{'>'}</Text>
        </Pressable>
      )}

      <Text style={styles.section}>SCHEDULED TASKS</Text>
      {plan.tasks.length === 0 ? (
        <Text style={styles.empty}>No tasks. Add a cert path or change intensity in Profile.</Text>
      ) : (
        plan.tasks.map((task) => <TaskRow key={`${task.kind}-${task.id}`} task={task} />)
      )}

      <Text style={styles.section}>PRACTICE EXAMS</Text>
      {pack.practiceExams.map((exam) => {
        const reqs = exam.unlockRequirements;
        const minReadinessOk = overall >= reqs.minReadiness;
        const allDomainsOk = readiness ? readiness.domains.every((d: { score: number }) => d.score >= reqs.minDomainReadiness) : false;
        const bossesOk = (reqs.requiredBossBattlesPassed ?? []).every((id: string) => passedBossSet.has(id));
        const priorPassOk = !reqs.requiresPriorPracticeExamPass || examAttempts.some((e) => e.certId === activeCertId && e.passEstimate);
        const unlocked = minReadinessOk && allDomainsOk && bossesOk && priorPassOk;

        const reasons: string[] = [];
        if (!minReadinessOk) reasons.push(`Readiness ${overall}% / need ${reqs.minReadiness}%`);
        if (!allDomainsOk && readiness) {
          const lowDomains = readiness.domains.filter((d: { score: number }) => d.score < reqs.minDomainReadiness);
          if (lowDomains.length) reasons.push(`${lowDomains.length} domain(s) below ${reqs.minDomainReadiness}%`);
        }
        if (!bossesOk) reasons.push(`${reqs.requiredBossBattlesPassed.length} boss battle(s) required`);
        if (!priorPassOk) reasons.push('Pass a prior practice exam first');

        return (
          <Pressable
            key={exam.id}
            style={[styles.examCard, !unlocked && styles.examCardLocked]}
            onPress={() => unlocked && router.push(`/practice/${activeCertId}/exam/${exam.id}`)}
          >
            <View style={styles.examHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.examTitle}>{exam.title}</Text>
                <Text style={styles.examMeta}>
                  {exam.questionCount} questions · {Math.round(exam.timeLimitSeconds / 60)} min
                  {exam.passingScaledScore ? ` · pass ${exam.passingScaledScore}` : ''}
                </Text>
              </View>
              <Text style={[styles.examState, unlocked && styles.examStateUnlocked]}>
                {unlocked ? 'OPEN' : 'LOCKED'}
              </Text>
            </View>
            {!unlocked && reasons.length > 0 && (
              <View style={styles.reasonsBox}>
                {reasons.map((r, i) => (
                  <Text key={i} style={styles.reason}>· {r}</Text>
                ))}
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function TaskRow({ task }: { task: PlanTask }) {
  const ICON: Record<PlanTask['kind'], string> = {
    review: 'REV', lesson: 'LSN', quiz: 'QUI',
    minigame: 'GAM', boss: 'BOS', practice_exam: 'EXM',
  };
  return (
    <Pressable style={styles.taskRow} onPress={() => router.push(task.routeHint as string)}>
      <Text style={styles.taskIcon}>{ICON[task.kind]}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskSub}>{task.subtitle}</Text>
        <Text style={styles.taskReason}>{task.reason}</Text>
      </View>
      <Text style={styles.taskChev}>{'>'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  eyebrow: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '700', marginTop: 4, marginBottom: 12 },
  intensityBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  intensityLabel: { color: theme.colors.textDim, fontSize: 12 },
  intensityValue: { color: theme.colors.gold, fontSize: 12, fontWeight: '700', marginLeft: 4, textTransform: 'uppercase' },
  intensitySep: { color: theme.colors.textDim, fontSize: 12, marginHorizontal: 6 },
  mentorBox: { padding: 12, borderColor: theme.colors.gold, borderWidth: 1, marginBottom: 10, backgroundColor: theme.colors.bgElevated },
  mentorLabel: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1 },
  mentorMsg: { color: theme.colors.text, fontSize: 13, marginTop: 6, lineHeight: 19 },
  weakBox: { padding: 10, borderColor: theme.colors.danger, borderWidth: 1, marginBottom: 16, backgroundColor: theme.colors.bgElevated },
  weakLabel: { color: theme.colors.danger, fontSize: 10, letterSpacing: 1 },
  weakName: { color: theme.colors.text, fontSize: 14, fontWeight: '600', marginTop: 2 },
  section: { color: theme.colors.text, fontSize: 11, letterSpacing: 1, marginTop: 16, marginBottom: 8, fontWeight: '600' },
  empty: { color: theme.colors.textDim, fontSize: 13, fontStyle: 'italic', padding: 12 },
  taskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1, padding: 12, marginBottom: 6 },
  taskIcon: { color: theme.colors.gold, fontSize: 11, fontWeight: '700', width: 36 },
  taskTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  taskSub: { color: theme.colors.textDim, fontSize: 12, marginTop: 2 },
  taskReason: { color: theme.colors.textDim, fontSize: 10, fontStyle: 'italic', marginTop: 3 },
  taskChev: { color: theme.colors.textDim, fontSize: 18 },
  examCard: { padding: 12, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 6, backgroundColor: theme.colors.bgElevated },
  examCardLocked: { opacity: 0.7 },
  examHead: { flexDirection: 'row', alignItems: 'center' },
  examTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  examMeta: { color: theme.colors.textDim, fontSize: 11, marginTop: 2 },
  examState: { color: theme.colors.textDim, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  examStateUnlocked: { color: theme.colors.gold },
  reasonsBox: { marginTop: 8, paddingTop: 8, borderTopColor: theme.colors.border, borderTopWidth: 1 },
  reason: { color: theme.colors.textDim, fontSize: 11, marginTop: 2 },
  wrongCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderColor: theme.colors.danger, borderWidth: 1, backgroundColor: theme.colors.bgElevated, marginBottom: 12 },
  wrongLabel: { color: theme.colors.danger, fontSize: 10, letterSpacing: 1 },
  wrongTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '700', marginTop: 4 },
  wrongSub: { color: theme.colors.textDim, fontSize: 11, marginTop: 2 },
  wrongChev: { color: theme.colors.textDim, fontSize: 18 },
  diagnosticCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderColor: theme.colors.gold, borderWidth: 2, backgroundColor: theme.colors.bgElevated, marginBottom: 12 },
  diagnosticLabel: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1 },
  diagnosticTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700', marginTop: 4 },
  diagnosticSub: { color: theme.colors.textDim, fontSize: 11, marginTop: 2 },
  diagnosticChev: { color: theme.colors.gold, fontSize: 18 },
});
