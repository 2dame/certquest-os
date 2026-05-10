import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { certPacks } from '@certquest/content';
import { assembleAttempt, scoreAttempt, type AnswerRecord, type ExamScoreReport } from '@certquest/practice-exam';
import { useStore } from '../../../../lib/store';
import { theme } from '../../../../lib/theme';

type Phase = 'taking' | 'scored';

export default function ExamRunner() {
  const { certId, blueprintId } = useLocalSearchParams<{ certId: string; blueprintId: string }>();
  const pack = certPacks[certId ?? ''];
  const blueprint = pack?.practiceExams.find((e) => e.id === blueprintId);

  const attempt = useMemo(() => {
    if (!pack || !blueprint) return null;
    return assembleAttempt(blueprint, pack.questionBank, { seed: Date.now() });
  }, [pack, blueprint]);

  const [phase, setPhase] = useState<Phase>('taking');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [secondsLeft, setSecondsLeft] = useState(blueprint?.timeLimitSeconds ?? 0);
  const [report, setReport] = useState<ExamScoreReport | null>(null);
  const recordPracticeExamAttempt = useStore((s) => s.recordPracticeExamAttempt);

  useEffect(() => {
    if (phase !== 'taking') return;
    const t = setInterval(() => setSecondsLeft((s: number) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => { if (secondsLeft === 0 && phase === 'taking') submit(); }, [secondsLeft]);

  if (!pack || !blueprint || !attempt) return <Text style={{ color: '#fff', padding: 20 }}>Exam not found</Text>;
  const q = attempt.questions[currentIdx]!;
  const isMulti = q.correctAnswers.length > 1;
  const selected = answers[q.id] ?? [];
  const isFlagged = !!flags[q.id];

  function toggle(id: string) {
    setAnswers((prev) => {
      const cur = prev[q.id] ?? [];
      if (isMulti) {
        return { ...prev, [q.id]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] };
      }
      return { ...prev, [q.id]: [id] };
    });
  }

  function submit() {
    if (!attempt || !blueprint) return;
    const records: AnswerRecord[] = attempt.questions.map((qq) => ({
      questionId: qq.id,
      selectedAnswerIds: answers[qq.id] ?? [],
      timeSpentSeconds: Math.round((blueprint.timeLimitSeconds - secondsLeft) / attempt.questions.length),
      flagged: !!flags[qq.id],
    }));
    const computed = scoreAttempt(attempt, records, blueprint);
    setReport(computed);
    recordPracticeExamAttempt({
      attemptId: `${blueprint.id}-${Date.now()}`,
      certId: blueprint.certId,
      blueprintId: blueprint.id,
      rawPercent: computed.rawPercent,
      scaledScore: computed.scaledScore,
      passEstimate: computed.passEstimate,
      takenAt: new Date().toISOString(),
    });
    setPhase('scored');
  }

  if (phase === 'scored' && report) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Score Report</Text>
        <Text style={styles.title}>{blueprint.title}</Text>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreBig}>{report.scaledScore}</Text>
          <Text style={styles.scoreSub}>of {report.scaledMax} (pass {report.passingScaledScore})</Text>
          <Text style={[styles.passEstimate, { color: report.passEstimate ? theme.colors.gold : theme.colors.danger }]}>
            {report.passEstimate ? 'PASS ESTIMATE' : 'NOT YET'}
          </Text>
          <Text style={styles.scoreSub}>
            {report.rawCorrect}/{report.rawTotal} correct ({report.rawPercent}%)
          </Text>
        </View>

        <Text style={styles.section}>Domain breakdown</Text>
        {report.domainBreakdown.map((d) => {
          const dom = pack.domains.find((x) => x.id === d.domainId);
          return (
            <View key={d.domainId} style={styles.domainRow}>
              <Text style={styles.domainName}>{dom?.title ?? d.domainId}</Text>
              <Text style={styles.domainScore}>{d.correct}/{d.total} ({d.percent}%)</Text>
            </View>
          );
        })}

        <Text style={styles.section}>Remediation plan</Text>
        {report.remediationPlan.weakDomains.length === 0 ? (
          <Text style={styles.smallNote}>No weak domains. Maintain consistency and consider the final simulation.</Text>
        ) : report.remediationPlan.weakDomains.map((w) => {
          const dom = pack.domains.find((x: any) => x.id === w.domainId);
          return (
            <View key={w.domainId} style={styles.remRow}>
              <Text style={styles.remDomain}>{dom?.title ?? w.domainId}</Text>
              <Text style={[styles.remSeverity, w.severity === 'severe' ? { color: theme.colors.danger } : null]}>
                {w.severity.toUpperCase()} ({w.missedCount} missed)
              </Text>
            </View>
          );
        })}

        <Text style={styles.section}>Generated flashcards</Text>
        <Text style={styles.smallNote}>{report.generatedFlashcardSeeds.length} flashcards seeded from misses.</Text>

        <Pressable style={styles.primary} onPress={() => router.replace('/practice')}>
          <Text style={styles.primaryText}>Back to Practice</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.examHeader}>
        <Text style={styles.examHeaderTitle}>{blueprint.title}</Text>
        <Text style={styles.examHeaderTimer}>{formatTime(secondsLeft)}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.questionMeta}>
          Question {currentIdx + 1} of {attempt.questions.length}
          {isMulti ? ' · Choose all that apply' : ''}
        </Text>
        <Text style={styles.questionText}>{q.questionText}</Text>
        {q.choices.map((c) => {
          const checked = selected.includes(c.id);
          return (
            <Pressable key={c.id} onPress={() => toggle(c.id)} style={[styles.choice, checked && styles.choiceActive]}>
              <Text style={[styles.choiceText, checked && styles.choiceTextActive]}>{c.id.toUpperCase()}.  {c.text}</Text>
            </Pressable>
          );
        })}

        <Pressable onPress={() => setFlags((p) => ({ ...p, [q.id]: !p[q.id] }))} style={styles.flagBtn}>
          <Text style={[styles.flagText, isFlagged && { color: theme.colors.gold }]}>
            {isFlagged ? 'FLAGGED' : 'Flag for review'}
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.navBar}>
        <Pressable disabled={currentIdx === 0} onPress={() => setCurrentIdx((i) => Math.max(0, i - 1))} style={[styles.navBtn, currentIdx === 0 && styles.navBtnDisabled]}>
          <Text style={styles.navText}>Back</Text>
        </Pressable>
        {currentIdx < attempt.questions.length - 1 ? (
          <Pressable onPress={() => setCurrentIdx((i) => Math.min(attempt.questions.length - 1, i + 1))} style={styles.navBtn}>
            <Text style={styles.navText}>Next</Text>
          </Pressable>
        ) : (
          <Pressable onPress={submit} style={[styles.navBtn, styles.submitBtn]}>
            <Text style={styles.submitText}>Submit</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 80 },
  examHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomColor: theme.colors.border, borderBottomWidth: 1 },
  examHeaderTitle: { color: theme.colors.text, fontWeight: '700', fontSize: 14, flex: 1 },
  examHeaderTimer: { color: theme.colors.gold, fontFamily: 'Courier', fontSize: 16, fontWeight: '700' },
  questionMeta: { color: theme.colors.textDim, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  questionText: { color: theme.colors.text, fontSize: 16, lineHeight: 24, marginBottom: 16 },
  choice: { borderColor: theme.colors.border, borderWidth: 1, padding: 14, marginBottom: 8, backgroundColor: theme.colors.bgElevated },
  choiceActive: { borderColor: theme.colors.gold, backgroundColor: theme.colors.bg },
  choiceText: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  choiceTextActive: { color: theme.colors.gold },
  flagBtn: { padding: 12, alignItems: 'center', marginTop: 12 },
  flagText: { color: theme.colors.textDim, fontSize: 12, letterSpacing: 1 },
  navBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', borderTopColor: theme.colors.border, borderTopWidth: 1, backgroundColor: theme.colors.bgElevated },
  navBtn: { flex: 1, padding: 16, alignItems: 'center', borderRightColor: theme.colors.border, borderRightWidth: 1 },
  navBtnDisabled: { opacity: 0.4 },
  submitBtn: { backgroundColor: theme.colors.gold },
  navText: { color: theme.colors.text, fontWeight: '600' },
  submitText: { color: theme.colors.bg, fontWeight: '700' },
  eyebrow: { color: theme.colors.gold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '700', marginBottom: 16 },
  scoreBlock: { padding: 20, borderColor: theme.colors.border, borderWidth: 1, alignItems: 'center', marginBottom: 16 },
  scoreBig: { color: theme.colors.gold, fontSize: 48, fontWeight: '700' },
  scoreSub: { color: theme.colors.textDim, fontSize: 12, marginTop: 4 },
  passEstimate: { fontSize: 14, fontWeight: '700', letterSpacing: 1, marginTop: 12 },
  section: { color: theme.colors.text, fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', marginTop: 16, marginBottom: 8 },
  domainRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 4 },
  domainName: { color: theme.colors.text, fontSize: 13, flex: 1 },
  domainScore: { color: theme.colors.gold, fontSize: 13, fontWeight: '600' },
  remRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 4 },
  remDomain: { color: theme.colors.text, fontSize: 13, flex: 1 },
  remSeverity: { color: theme.colors.gold, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  smallNote: { color: theme.colors.textDim, fontSize: 12, lineHeight: 18 },
  primary: { padding: 14, backgroundColor: theme.colors.gold, alignItems: 'center', marginTop: 20 },
  primaryText: { color: theme.colors.bg, fontWeight: '700' },
});
