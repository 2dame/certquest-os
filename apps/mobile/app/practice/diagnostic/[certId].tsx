import { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getCertPack, getQuestionsForCert, getCertLore } from '@certquest/content';
import { useStore } from '../../../lib/store';
import { theme } from '../../../lib/theme';

type Phase = 'intro' | 'taking' | 'done';

const TARGET_COUNT = 30;

export default function DiagnosticRoute() {
  const { certId } = useLocalSearchParams<{ certId: string }>();
  const pack = getCertPack(certId ?? '');
  const lore = getCertLore(certId ?? '');
  const recordQuizAttempt = useStore((s) => s.recordQuizAttempt);
  const recordDiagnostic = useStore((s) => s.recordDiagnostic);
  const readiness = useStore((s) => s.readinessByCert[certId ?? '']);

  // Stratified sample: pick proportionally from each domain
  const questions = useMemo(() => {
    if (!pack) return [];
    const all = getQuestionsForCert(certId ?? '');
    const picks: typeof all = [];
    for (const d of pack.domains) {
      const target = Math.max(1, Math.round((d.weight ?? 0) * TARGET_COUNT));
      const inDomain = all.filter((q) => q.domainId === d.id).sort(() => Math.random() - 0.5);
      picks.push(...inDomain.slice(0, target));
    }
    return picks.sort(() => Math.random() - 0.5).slice(0, TARGET_COUNT);
  }, [certId, pack]);

  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});

  if (!pack || !lore || questions.length === 0) {
    return <View style={styles.container}><Text style={styles.error}>Diagnostic not available — content gap.</Text></View>;
  }

  const q = questions[idx];
  const isMulti = q.correctAnswers.length > 1;
  const sel = answers[q.id] ?? [];

  function toggle(choiceId: string) {
    setAnswers((a) => {
      const cur = a[q.id] ?? [];
      const next = isMulti ? (cur.includes(choiceId) ? cur.filter((x) => x !== choiceId) : [...cur, choiceId]) : [choiceId];
      return { ...a, [q.id]: next };
    });
  }

  function submit() {
    let correct = 0;
    const perQuestion = questions.map((qq) => {
      const got = answers[qq.id] ?? [];
      const ok = sameSet(got, qq.correctAnswers);
      if (ok) correct++;
      return { questionId: qq.id, isCorrect: ok, selected: got, objectiveId: qq.objectiveId, domainId: qq.domainId };
    });
    recordQuizAttempt({
      certId: certId!, attemptedAt: new Date().toISOString(),
      questionCount: questions.length, correctCount: correct,
      questions: perQuestion,
    });
    const baseline = Math.round((correct / questions.length) * 100);
    recordDiagnostic(certId!, baseline);
    setPhase('done');
  }

  if (phase === 'intro') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{lore.worldName} · DIAGNOSTIC</Text>
        <Text style={styles.title}>Pre-Exam Diagnostic</Text>
        <Text style={styles.body}>
          {questions.length} questions across all domains. No timer. Answer honestly — guessing inflates the baseline and misleads your study plan.
        </Text>
        <View style={styles.box}>
          <Text style={styles.label}>WHAT THIS DOES</Text>
          <Text style={styles.body}>· Establishes a baseline readiness score for {pack.meta.examCode}</Text>
          <Text style={styles.body}>· Surfaces your weakest domains immediately</Text>
          <Text style={styles.body}>· Logs misses to your wrong-answer queue</Text>
          <Text style={styles.body}>· Runs once — retake by resetting progress</Text>
        </View>
        <Pressable onPress={() => setPhase('taking')} style={styles.primary}>
          <Text style={styles.primaryText}>BEGIN DIAGNOSTIC</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.secondary}>
          <Text style={styles.secondaryText}>Not now</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (phase === 'taking') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Diagnostic</Text>
          <Text style={styles.headerProgress}>{idx + 1}/{questions.length}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.questionMeta}>{isMulti ? 'Choose all that apply' : 'Choose one'}</Text>
          <Text style={styles.question}>{q.questionText}</Text>
          {q.choices.map((c) => {
            const checked = sel.includes(c.id);
            return (
              <Pressable key={c.id} onPress={() => toggle(c.id)} style={[styles.choice, checked && styles.choiceActive]}>
                <Text style={[styles.choiceText, checked && styles.choiceTextActive]}>
                  {c.id.toUpperCase()}.  {c.text}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.navBar}>
          <Pressable disabled={idx === 0} onPress={() => setIdx((i) => Math.max(0, i - 1))} style={[styles.navBtn, idx === 0 && { opacity: 0.4 }]}>
            <Text style={styles.navText}>Back</Text>
          </Pressable>
          {idx < questions.length - 1 ? (
            <Pressable disabled={sel.length === 0} onPress={() => setIdx((i) => i + 1)} style={[styles.navBtn, sel.length === 0 && { opacity: 0.4 }]}>
              <Text style={styles.navText}>Next</Text>
            </Pressable>
          ) : (
            <Pressable disabled={sel.length === 0} onPress={submit} style={[styles.navBtn, sel.length === 0 ? { opacity: 0.4 } : { backgroundColor: theme.colors.gold }]}>
              <Text style={[styles.navText, sel.length > 0 && { color: theme.colors.bg }]}>Submit</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }

  // done
  let correct = 0;
  questions.forEach((qq) => { if (sameSet(answers[qq.id] ?? [], qq.correctAnswers)) correct++; });
  const baseline = Math.round((correct / questions.length) * 100);
  const overall = readiness?.overall ?? baseline;
  const weakDomains = readiness?.domains.filter((d: { domainId: string; score: number }) => d.score < 65).slice(0, 3) ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>BASELINE ESTABLISHED</Text>
      <Text style={styles.title}>{baseline}% raw · {overall}% calibrated readiness</Text>
      <Text style={styles.body}>
        You answered {correct}/{questions.length} correctly. Your readiness score blends raw performance with mastery, recency, and confidence — the calibrated number is what unlocks practice exam trials.
      </Text>
      {weakDomains.length > 0 && (
        <View style={styles.box}>
          <Text style={styles.label}>WEAK DOMAINS</Text>
          {weakDomains.map((d: { domainId: string; score: number }) => {
            const domain = pack.domains.find((x) => x.id === d.domainId);
            const region = lore.regions.find((r) => r.domainId === d.domainId);
            return (
              <Text key={d.domainId} style={styles.weakRow}>
                · {region?.regionName ?? domain?.title}: {d.score}%
              </Text>
            );
          })}
        </View>
      )}
      <View style={styles.box}>
        <Text style={styles.label}>NEXT STEPS</Text>
        <Text style={styles.body}>· Today's plan now reflects your weak areas</Text>
        <Text style={styles.body}>· Wrong-answer queue logged your misses for review</Text>
        <Text style={styles.body}>· Practice exam unlocks at 80% readiness + boss battles passed</Text>
      </View>
      <Pressable onPress={() => router.replace('/(tabs)')} style={styles.primary}>
        <Text style={styles.primaryText}>BEGIN TRAINING</Text>
      </Pressable>
    </ScrollView>
  );
}

function sameSet(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const sa = new Set(a);
  return b.every((x) => sa.has(x));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  error: { color: theme.colors.text, padding: 20 },
  eyebrow: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '700', marginBottom: 12 },
  body: { color: theme.colors.text, fontSize: 14, lineHeight: 21, marginBottom: 6 },
  box: { padding: 14, backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1, marginVertical: 12 },
  label: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1, marginBottom: 8 },
  weakRow: { color: theme.colors.danger, fontSize: 13, marginBottom: 4 },
  primary: { backgroundColor: theme.colors.gold, padding: 14, alignItems: 'center', marginTop: 12 },
  primaryText: { color: theme.colors.bg, fontWeight: '700', letterSpacing: 1 },
  secondary: { padding: 14, alignItems: 'center', marginTop: 6 },
  secondaryText: { color: theme.colors.textDim, fontSize: 13 },
  header: { padding: 14, borderBottomColor: theme.colors.border, borderBottomWidth: 1, backgroundColor: theme.colors.bgElevated, flexDirection: 'row', justifyContent: 'space-between' },
  headerTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  headerProgress: { color: theme.colors.gold, fontSize: 13, fontWeight: '700' },
  questionMeta: { color: theme.colors.textDim, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 },
  question: { color: theme.colors.text, fontSize: 16, lineHeight: 24, marginBottom: 16 },
  choice: { borderColor: theme.colors.border, borderWidth: 1, padding: 14, marginBottom: 8, backgroundColor: theme.colors.bgElevated },
  choiceActive: { borderColor: theme.colors.gold, backgroundColor: theme.colors.bg },
  choiceText: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  choiceTextActive: { color: theme.colors.gold },
  navBar: { flexDirection: 'row', borderTopColor: theme.colors.border, borderTopWidth: 1, backgroundColor: theme.colors.bgElevated },
  navBtn: { flex: 1, padding: 14, alignItems: 'center', borderRightColor: theme.colors.border, borderRightWidth: 1 },
  navText: { color: theme.colors.text, fontWeight: '600' },
});
