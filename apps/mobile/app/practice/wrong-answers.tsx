import { useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { findQuestionById, certPacks, certDisplayOrder, getCertLore } from '@certquest/content';
import { useStore } from '../../lib/store';
import { theme } from '../../lib/theme';

type Phase = 'list' | 'reviewing' | 'done';

export default function WrongAnswersRoute() {
  const { certId: paramCertId } = useLocalSearchParams<{ certId?: string }>();
  const activeCertId = useStore((s) => s.activeCertId);
  const certId = paramCertId ?? activeCertId;
  const getWrongAnswers = useStore((s) => s.getWrongAnswers);

  const wrongAnswers = useMemo(() => getWrongAnswers(certId), [certId]);
  const [phase, setPhase] = useState<Phase>('list');
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const pack = certPacks[certId];
  const lore = getCertLore(certId);

  if (!pack || !lore) {
    return <View style={styles.container}><Text style={styles.error}>Cert not found.</Text></View>;
  }

  if (phase === 'list') {
    const byDomain = wrongAnswers.reduce((m, w) => {
      (m[w.domainId] ??= []).push(w);
      return m;
    }, {} as Record<string, typeof wrongAnswers>);

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>{'< Back'}</Text>
        </Pressable>
        <Text style={styles.eyebrow}>{lore.worldName}</Text>
        <Text style={styles.title}>Wrong Answer Review</Text>

        <View style={styles.certSwitcher}>
          {certDisplayOrder.map((cid) => {
            const p = certPacks[cid]!;
            const isActive = cid === certId;
            return (
              <Pressable
                key={cid}
                onPress={() => router.replace(`/practice/wrong-answers?certId=${cid}`)}
                style={[styles.chip, isActive && styles.chipActive]}
              >
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{p.meta.examCode}</Text>
              </Pressable>
            );
          })}
        </View>

        {wrongAnswers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Clean slate.</Text>
            <Text style={styles.emptyBody}>
              No unresolved wrong answers for {pack.meta.examCode}. Either you haven't missed any yet, or you've already corrected every miss.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryNum}>{wrongAnswers.length}</Text>
              <Text style={styles.summaryLabel}>questions to review</Text>
            </View>

            <Pressable onPress={() => { setIdx(0); setRevealed(false); setPhase('reviewing'); }} style={styles.startBtn}>
              <Text style={styles.startBtnText}>BEGIN REVIEW</Text>
            </Pressable>

            <Text style={styles.section}>BY DOMAIN</Text>
            {Object.entries(byDomain).map(([domainId, items]) => {
              const domain = pack.domains.find((d) => d.id === domainId);
              const region = lore.regions.find((r) => r.domainId === domainId);
              return (
                <View key={domainId} style={styles.domainRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.domainName}>{region?.regionName ?? domain?.title}</Text>
                    <Text style={styles.domainSub}>{domain?.title}</Text>
                  </View>
                  <Text style={styles.domainCount}>{items.length}</Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    );
  }

  if (phase === 'reviewing') {
    const entry = wrongAnswers[idx];
    if (!entry) {
      setPhase('done');
      return null;
    }
    const found = findQuestionById(entry.questionId);
    if (!found) {
      // Stale question reference — skip
      setIdx((i) => i + 1);
      setRevealed(false);
      return null;
    }
    const question = found.question;
    const correctSet = new Set(question.correctAnswers);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wrong Answer Review</Text>
          <Text style={styles.headerProgress}>{idx + 1}/{wrongAnswers.length}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.metaRow}>
            Missed {entry.timesWrong}× · last on {new Date(entry.lastMissedAt).toLocaleDateString()}
          </Text>
          <Text style={styles.question}>{question.questionText}</Text>
          {question.choices.map((c) => {
            const isCorrect = correctSet.has(c.id);
            return (
              <View
                key={c.id}
                style={[
                  styles.choice,
                  revealed && isCorrect && styles.choiceCorrect,
                ]}
              >
                <Text style={[styles.choiceText, revealed && isCorrect && styles.choiceTextCorrect]}>
                  {c.id.toUpperCase()}.  {c.text}
                </Text>
              </View>
            );
          })}
          {revealed && (
            <View style={styles.explainBox}>
              <Text style={styles.explainLabel}>EXPLANATION</Text>
              <Text style={styles.explainBody}>{question.explanation}</Text>
              {question.examTrap && (
                <>
                  <Text style={styles.explainLabel}>EXAM TRAP</Text>
                  <Text style={styles.explainBody}>{question.examTrap}</Text>
                </>
              )}
            </View>
          )}
        </ScrollView>
        {!revealed ? (
          <Pressable onPress={() => setRevealed(true)} style={styles.revealBar}>
            <Text style={styles.revealText}>SHOW ANSWER</Text>
          </Pressable>
        ) : (
          <View style={styles.navBar}>
            <Pressable
              onPress={() => {
                if (idx >= wrongAnswers.length - 1) setPhase('done');
                else { setIdx((i) => i + 1); setRevealed(false); }
              }}
              style={styles.navBtn}
            >
              <Text style={styles.navText}>{idx >= wrongAnswers.length - 1 ? 'Finish' : 'Next'}</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  // done
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>REVIEW COMPLETE</Text>
      <Text style={styles.title}>You revisited every miss.</Text>
      <Text style={styles.body}>
        These questions stay in your wrong-answer log until you get them right in a future quiz. Take a quiz next — the same concepts will reappear.
      </Text>
      <Pressable onPress={() => router.replace(`/quiz/${certId}`)} style={styles.startBtn}>
        <Text style={styles.startBtnText}>TAKE A QUIZ</Text>
      </Pressable>
      <Pressable onPress={() => router.back()} style={styles.secondary}>
        <Text style={styles.secondaryText}>Back to Practice</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  back: { paddingVertical: 6, marginBottom: 8 },
  backText: { color: theme.colors.gold, fontSize: 13 },
  error: { color: theme.colors.text, padding: 20 },
  eyebrow: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700', marginBottom: 12 },
  body: { color: theme.colors.text, fontSize: 14, lineHeight: 21, marginBottom: 16 },
  certSwitcher: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderColor: theme.colors.border, borderWidth: 1 },
  chipActive: { borderColor: theme.colors.gold, backgroundColor: theme.colors.bgElevated },
  chipText: { color: theme.colors.textDim, fontSize: 11, fontWeight: '600' },
  chipTextActive: { color: theme.colors.gold },
  emptyBox: { padding: 16, borderColor: theme.colors.border, borderWidth: 1, backgroundColor: theme.colors.bgElevated, marginVertical: 12 },
  emptyTitle: { color: theme.colors.gold, fontSize: 16, fontWeight: '700' },
  emptyBody: { color: theme.colors.text, fontSize: 13, marginTop: 8, lineHeight: 19 },
  summary: { padding: 16, borderColor: theme.colors.danger, borderWidth: 1, backgroundColor: theme.colors.bgElevated, alignItems: 'center', marginVertical: 12 },
  summaryNum: { color: theme.colors.danger, fontSize: 36, fontWeight: '700' },
  summaryLabel: { color: theme.colors.textDim, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 },
  startBtn: { backgroundColor: theme.colors.gold, padding: 14, alignItems: 'center', marginTop: 8 },
  startBtnText: { color: theme.colors.bg, fontWeight: '700', letterSpacing: 1 },
  secondary: { padding: 14, alignItems: 'center', marginTop: 6 },
  secondaryText: { color: theme.colors.textDim, fontSize: 13 },
  section: { color: theme.colors.text, fontSize: 11, letterSpacing: 1, marginTop: 16, marginBottom: 8, fontWeight: '600' },
  domainRow: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 4 },
  domainName: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  domainSub: { color: theme.colors.textDim, fontSize: 10, marginTop: 2 },
  domainCount: { color: theme.colors.danger, fontSize: 16, fontWeight: '700' },
  header: { padding: 14, borderBottomColor: theme.colors.border, borderBottomWidth: 1, backgroundColor: theme.colors.bgElevated, flexDirection: 'row', justifyContent: 'space-between' },
  headerTitle: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  headerProgress: { color: theme.colors.gold, fontSize: 13, fontWeight: '700' },
  metaRow: { color: theme.colors.danger, fontSize: 11, letterSpacing: 0.5, marginBottom: 12 },
  question: { color: theme.colors.text, fontSize: 16, lineHeight: 24, marginBottom: 16 },
  choice: { borderColor: theme.colors.border, borderWidth: 1, padding: 14, marginBottom: 8, backgroundColor: theme.colors.bgElevated },
  choiceCorrect: { borderColor: theme.colors.gold, backgroundColor: theme.colors.bg },
  choiceText: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  choiceTextCorrect: { color: theme.colors.gold, fontWeight: '600' },
  explainBox: { padding: 14, borderColor: theme.colors.gold, borderWidth: 1, backgroundColor: theme.colors.bgElevated, marginTop: 12 },
  explainLabel: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1, marginTop: 4 },
  explainBody: { color: theme.colors.text, fontSize: 13, lineHeight: 19, marginTop: 4 },
  revealBar: { backgroundColor: theme.colors.gold, padding: 18, alignItems: 'center' },
  revealText: { color: theme.colors.bg, fontWeight: '700', letterSpacing: 1 },
  navBar: { flexDirection: 'row', borderTopColor: theme.colors.border, borderTopWidth: 1, backgroundColor: theme.colors.bgElevated },
  navBtn: { flex: 1, padding: 14, alignItems: 'center' },
  navText: { color: theme.colors.text, fontWeight: '600' },
});
