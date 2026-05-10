import { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getQuestionsForCert, getCertPack } from '@certquest/content';
import { useStore } from '../../lib/store';
import { theme } from '../../lib/theme';

type Phase = 'taking' | 'calibrating' | 'scored';
type Confidence = 1 | 2 | 3 | 4;

const CONFIDENCE_LABELS: Record<Confidence, { label: string; sub: string }> = {
  1: { label: 'Guessing', sub: 'Pure coin flip.' },
  2: { label: 'Unsure', sub: 'Eliminated some.' },
  3: { label: 'Confident', sub: 'Pretty sure.' },
  4: { label: 'Certain', sub: 'Know it cold.' },
};

export default function QuizRoute() {
  const { certId } = useLocalSearchParams<{ certId: string }>();
  const recordQuizAttempt = useStore((s) => s.recordQuizAttempt);
  const pack = getCertPack(certId ?? '');
  const allQuestions = getQuestionsForCert(certId ?? '');

  const questions = useMemo(() => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(10, shuffled.length));
  }, [certId]);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [confidences, setConfidences] = useState<Record<string, Confidence>>({});
  const [phase, setPhase] = useState<Phase>('taking');

  if (!pack || questions.length === 0) {
    return <View style={styles.container}><Text style={styles.error}>No questions available for this cert.</Text></View>;
  }

  const q = questions[idx];
  const isMulti = q.correctAnswers.length > 1;
  const sel = answers[q.id] ?? [];
  const conf = confidences[q.id];

  function toggle(choiceId: string) {
    setAnswers((a) => {
      const cur = a[q.id] ?? [];
      const next = isMulti ? (cur.includes(choiceId) ? cur.filter((x) => x !== choiceId) : [...cur, choiceId]) : [choiceId];
      return { ...a, [q.id]: next };
    });
  }

  function pickConfidence(c: Confidence) {
    setConfidences((cs) => ({ ...cs, [q.id]: c }));
  }

  function advanceOrSubmit() {
    if (idx < questions.length - 1) {
      setIdx((i) => i + 1);
      setPhase('taking');
    } else {
      handleSubmit();
    }
  }

  function handleSubmit() {
    let correct = 0;
    let confSum = 0;
    let confCount = 0;
    const perQuestion = questions.map((qq) => {
      const got = answers[qq.id] ?? [];
      const ok = sameSet(got, qq.correctAnswers);
      if (ok) correct++;
      const c = confidences[qq.id];
      if (c) { confSum += c; confCount++; }
      return {
        questionId: qq.id, isCorrect: ok, selected: got,
        objectiveId: qq.objectiveId, domainId: qq.domainId,
        confidence: c,
      };
    });
    recordQuizAttempt({
      certId: certId!,
      attemptedAt: new Date().toISOString(),
      questionCount: questions.length,
      correctCount: correct,
      questions: perQuestion,
      averageConfidence: confCount > 0 ? confSum / confCount : undefined,
    });
    setPhase('scored');
  }

  if (phase === 'scored') {
    let correct = 0;
    questions.forEach((qq) => { if (sameSet(answers[qq.id] ?? [], qq.correctAnswers)) correct++; });
    const pct = Math.round((correct / questions.length) * 100);
    const overconfidentMisses = questions.filter((qq) => {
      const ok = sameSet(answers[qq.id] ?? [], qq.correctAnswers);
      const c = confidences[qq.id];
      return !ok && c !== undefined && c >= 3;
    }).length;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>QUIZ COMPLETE</Text>
        <Text style={styles.title}>{correct}/{questions.length} ({pct}%)</Text>
        <Text style={styles.body}>+{correct * 5 + (questions.length - correct)} XP earned.</Text>
        {overconfidentMisses > 0 && (
          <View style={styles.warnBox}>
            <Text style={styles.warnLabel}>CALIBRATION CHECK</Text>
            <Text style={styles.warnBody}>
              {overconfidentMisses} question{overconfidentMisses > 1 ? 's' : ''} you rated Confident or Certain — and missed.
              Overconfidence is worse than humility. Slow down on those.
            </Text>
          </View>
        )}
        <Text style={styles.section}>REVIEW</Text>
        {questions.map((qq, i) => {
          const got = answers[qq.id] ?? [];
          const ok = sameSet(got, qq.correctAnswers);
          const c = confidences[qq.id];
          return (
            <View key={qq.id} style={[styles.review, !ok && styles.reviewWrong]}>
              <View style={styles.reviewHead}>
                <Text style={styles.reviewNum}>Q{i + 1} — {ok ? 'CORRECT' : 'WRONG'}</Text>
                {c && <Text style={styles.reviewConf}>{CONFIDENCE_LABELS[c].label}</Text>}
              </View>
              <Text style={styles.reviewQ}>{qq.questionText}</Text>
              {!ok && <Text style={styles.reviewExplain}>{qq.explanation}</Text>}
            </View>
          );
        })}
        <Pressable onPress={() => router.back()} style={styles.primary}>
          <Text style={styles.primaryText}>BACK</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (phase === 'calibrating') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>How confident were you?</Text>
          <Text style={styles.headerProgress}>{idx + 1}/{questions.length}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.calIntro}>
            Rate your confidence in your answer. This calibrates your readiness signal — overconfidence on wrong answers hurts more than admitting you guessed.
          </Text>
          <View style={styles.calQ}>
            <Text style={styles.calQText}>{q.questionText}</Text>
          </View>
          {([1, 2, 3, 4] as Confidence[]).map((c) => {
            const isSel = conf === c;
            return (
              <Pressable key={c} onPress={() => pickConfidence(c)} style={[styles.calBtn, isSel && styles.calBtnSel]}>
                <View style={styles.calRow}>
                  <Text style={styles.calNum}>{c}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.calLabel, isSel && styles.calLabelSel]}>{CONFIDENCE_LABELS[c].label}</Text>
                    <Text style={styles.calSub}>{CONFIDENCE_LABELS[c].sub}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={styles.navBar}>
          <Pressable onPress={() => setPhase('taking')} style={styles.navBtn}>
            <Text style={styles.navText}>Change Answer</Text>
          </Pressable>
          <Pressable
            disabled={!conf}
            onPress={advanceOrSubmit}
            style={[styles.navBtn, conf && { backgroundColor: theme.colors.gold }, !conf && { opacity: 0.4 }]}
          >
            <Text style={[styles.navText, conf && { color: theme.colors.bg }]}>
              {idx < questions.length - 1 ? 'Next Question' : 'Submit Quiz'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // taking
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{pack.meta.examName} — Quick Quiz</Text>
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
        <Pressable
          disabled={sel.length === 0}
          onPress={() => setPhase('calibrating')}
          style={[styles.navBtn, sel.length === 0 && { opacity: 0.4 }]}
        >
          <Text style={styles.navText}>Lock In</Text>
        </Pressable>
      </View>
    </View>
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
  header: { padding: 14, borderBottomColor: theme.colors.border, borderBottomWidth: 1, backgroundColor: theme.colors.bgElevated, flexDirection: 'row', justifyContent: 'space-between' },
  headerTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '600', flex: 1 },
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
  eyebrow: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700', marginBottom: 8 },
  body: { color: theme.colors.text, fontSize: 14, marginBottom: 16 },
  warnBox: { padding: 12, borderColor: theme.colors.danger, borderWidth: 1, backgroundColor: theme.colors.bgElevated, marginBottom: 16 },
  warnLabel: { color: theme.colors.danger, fontSize: 10, letterSpacing: 1 },
  warnBody: { color: theme.colors.text, fontSize: 13, marginTop: 6, lineHeight: 18 },
  section: { color: theme.colors.text, fontSize: 12, letterSpacing: 1, marginTop: 16, marginBottom: 8, fontWeight: '600' },
  review: { padding: 12, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 6, backgroundColor: theme.colors.bgElevated },
  reviewWrong: { borderColor: theme.colors.danger },
  reviewHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewNum: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1 },
  reviewConf: { color: theme.colors.textDim, fontSize: 11, fontWeight: '600' },
  reviewQ: { color: theme.colors.text, fontSize: 13, marginBottom: 4 },
  reviewExplain: { color: theme.colors.textDim, fontSize: 12, fontStyle: 'italic', lineHeight: 18 },
  primary: { backgroundColor: theme.colors.gold, padding: 14, alignItems: 'center', marginTop: 16 },
  primaryText: { color: theme.colors.bg, fontWeight: '700', letterSpacing: 1 },
  calIntro: { color: theme.colors.textDim, fontSize: 13, lineHeight: 19, marginBottom: 16, fontStyle: 'italic' },
  calQ: { padding: 12, backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 16 },
  calQText: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  calBtn: { padding: 14, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 8, backgroundColor: theme.colors.bgElevated },
  calBtnSel: { borderColor: theme.colors.gold, backgroundColor: theme.colors.bg },
  calRow: { flexDirection: 'row', alignItems: 'center' },
  calNum: { color: theme.colors.gold, fontSize: 24, fontWeight: '700', width: 36 },
  calLabel: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  calLabelSel: { color: theme.colors.gold },
  calSub: { color: theme.colors.textDim, fontSize: 11, marginTop: 2 },
});
