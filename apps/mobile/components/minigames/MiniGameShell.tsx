import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import type { MiniGamePayload, MiniGameAttempt, MiniGameResult } from '@certquest/minigames';
import { gradeMiniGameAttempt, getMiniGameInstructions } from '@certquest/minigames';
import { theme } from '../../lib/theme';

export interface MiniGameShellProps {
  questId: string;
  certId: string;
  payload: MiniGamePayload;
  loreBrief: { setup: string; stakes: string; successMessage: string; failureMessage: string };
  title: string;
  /** Render the game-specific UI. Calls onResponseChange when responses change. */
  renderGame: (props: {
    payload: MiniGamePayload;
    responses: Record<string, string>;
    onChange: (itemId: string, value: string) => void;
  }) => React.ReactNode;
  onComplete: (result: MiniGameResult) => void;
  onClose: () => void;
}

type Phase = 'briefing' | 'playing' | 'scored';

export function MiniGameShell(props: MiniGameShellProps) {
  const [phase, setPhase] = useState<Phase>('briefing');
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(props.payload.timeLimitSeconds ?? 0);
  const [result, setResult] = useState<MiniGameResult | null>(null);
  const startedAt = useRef<number>(0);

  useEffect(() => {
    if (phase !== 'playing' || !props.payload.timeLimitSeconds) return;
    if (secondsLeft <= 0) { handleSubmit(); return; }
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase, secondsLeft]);

  function handleStart() {
    startedAt.current = Date.now();
    setPhase('playing');
  }

  function handleSubmit() {
    const attempt: MiniGameAttempt = {
      template: props.payload.template,
      responses: Object.entries(responses).map(([itemId, answer]) => ({ itemId, answer })),
      timeUsedSeconds: Math.round((Date.now() - startedAt.current) / 1000),
    };
    const r = gradeMiniGameAttempt(props.payload, attempt);
    setResult(r);
    setPhase('scored');
    props.onComplete(r);
  }

  if (phase === 'briefing') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>Side Quest</Text>
        <Text style={styles.title}>{props.title}</Text>
        <View style={styles.brief}>
          <Text style={styles.briefLabel}>SETUP</Text>
          <Text style={styles.briefBody}>{props.loreBrief.setup}</Text>
          <Text style={styles.briefLabel}>STAKES</Text>
          <Text style={styles.briefBody}>{props.loreBrief.stakes}</Text>
          <Text style={styles.briefLabel}>HOW TO PLAY</Text>
          <Text style={styles.briefBody}>{getMiniGameInstructions(props.payload.template)}</Text>
          <Text style={styles.briefLabel}>PASS THRESHOLD</Text>
          <Text style={styles.briefBody}>{props.payload.passThreshold}% correct</Text>
          {props.payload.timeLimitSeconds && (
            <>
              <Text style={styles.briefLabel}>TIME LIMIT</Text>
              <Text style={styles.briefBody}>{Math.round(props.payload.timeLimitSeconds / 60)} minutes</Text>
            </>
          )}
        </View>
        <Pressable onPress={handleStart} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>BEGIN</Text>
        </Pressable>
        <Pressable onPress={props.onClose} style={styles.secondaryBtn}>
          <Text style={styles.secondaryBtnText}>Back</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (phase === 'playing') {
    return (
      <View style={styles.container}>
        <View style={styles.gameHeader}>
          <Text style={styles.gameHeaderTitle}>{props.title}</Text>
          {props.payload.timeLimitSeconds && (
            <Text style={styles.timer}>
              {String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:{String(secondsLeft % 60).padStart(2, '0')}
            </Text>
          )}
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          {props.renderGame({
            payload: props.payload,
            responses,
            onChange: (id, v) => setResponses((r) => ({ ...r, [id]: v })),
          })}
        </ScrollView>
        <Pressable onPress={handleSubmit} style={styles.submitBar}>
          <Text style={styles.submitBarText}>SUBMIT</Text>
        </Pressable>
      </View>
    );
  }

  // scored
  if (!result) return null;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>{result.passed ? 'VICTORY' : 'NOT YET'}</Text>
      <Text style={styles.title}>
        {result.scorePercent}% — {result.correctCount}/{result.totalItems}
      </Text>
      <Text style={styles.loreResult}>
        {result.passed ? props.loreBrief.successMessage : props.loreBrief.failureMessage}
      </Text>
      <View style={styles.statsRow}>
        <Stat label="XP earned" value={`+${result.xpEarned}`} accent />
        <Stat label="Mastery" value={`+${(result.masteryDelta * 100).toFixed(1)}%`} accent={result.passed} />
        <Stat label="Time" value={`${result.timeUsedSeconds}s`} />
      </View>
      {result.missed.length > 0 && (
        <>
          <Text style={styles.section}>MISSED ITEMS</Text>
          {result.missed.map((m) => (
            <View key={m.itemId} style={styles.missedRow}>
              <Text style={styles.missedPrompt}>{m.prompt}</Text>
              <Text style={styles.missedAnswer}>You: {m.submitted}</Text>
              <Text style={styles.missedCorrect}>Correct: {m.correct}</Text>
              {m.explanation && <Text style={styles.missedExplain}>{m.explanation}</Text>}
            </View>
          ))}
        </>
      )}
      <Pressable onPress={props.onClose} style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>BACK</Text>
      </Pressable>
    </ScrollView>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, accent && { color: theme.colors.gold }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  eyebrow: { color: theme.colors.gold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700', marginBottom: 16 },
  brief: { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1, padding: 16, marginBottom: 20 },
  briefLabel: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, marginTop: 8, marginBottom: 4 },
  briefBody: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  primaryBtn: { backgroundColor: theme.colors.gold, padding: 16, alignItems: 'center', marginTop: 12 },
  primaryBtnText: { color: theme.colors.bg, fontWeight: '700', letterSpacing: 1 },
  secondaryBtn: { padding: 14, alignItems: 'center', marginTop: 8 },
  secondaryBtnText: { color: theme.colors.textDim, fontSize: 13 },
  gameHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomColor: theme.colors.border, borderBottomWidth: 1, backgroundColor: theme.colors.bgElevated },
  gameHeaderTitle: { color: theme.colors.text, fontWeight: '700', fontSize: 14, flex: 1 },
  timer: { color: theme.colors.gold, fontFamily: 'Courier', fontSize: 16, fontWeight: '700' },
  submitBar: { backgroundColor: theme.colors.gold, padding: 16, alignItems: 'center' },
  submitBarText: { color: theme.colors.bg, fontWeight: '700', letterSpacing: 1 },
  loreResult: { color: theme.colors.text, fontSize: 14, fontStyle: 'italic', marginBottom: 16, lineHeight: 22 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  stat: { flex: 1, alignItems: 'center', padding: 12, borderColor: theme.colors.border, borderWidth: 1, marginRight: 8 },
  statValue: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  statLabel: { color: theme.colors.textDim, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 2 },
  section: { color: theme.colors.text, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginTop: 16, marginBottom: 8, fontWeight: '600' },
  missedRow: { padding: 12, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 6, backgroundColor: theme.colors.bgElevated },
  missedPrompt: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  missedAnswer: { color: theme.colors.danger, fontSize: 12, marginTop: 4 },
  missedCorrect: { color: theme.colors.gold, fontSize: 12, marginTop: 2 },
  missedExplain: { color: theme.colors.textDim, fontSize: 11, marginTop: 4, fontStyle: 'italic' },
});
