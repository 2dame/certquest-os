import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { findBossBattleById, getCertLore } from '@certquest/content';
import { useStore } from '../../lib/store';
import { theme } from '../../lib/theme';

type Phase = 'briefing' | 'scenario' | 'rubric' | 'result';

export default function BossRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const found = findBossBattleById(id ?? '');
  const recordBossBattleAttempt = useStore((s) => s.recordBossBattleAttempt);
  const [phase, setPhase] = useState<Phase>('briefing');
  const [scores, setScores] = useState<Record<string, number>>({});

  if (!found) {
    return <View style={styles.container}><Text style={styles.error}>Boss "{id}" not found.</Text></View>;
  }

  const boss = found.bossBattle;
  const certId = found.pack.meta.id;
  const lore = getCertLore(certId);
  const loreBrief = boss.loreBrief ?? {
    bossName: boss.title,
    arena: lore?.worldName ?? 'The Arena',
    setup: boss.storySetup ?? '',
    stakes: 'Pass the rubric to advance.',
    victoryMessage: 'The beast falls. The arena bows.',
    retryMessage: 'Not yet. Review the weak dimensions and return.',
  };

  function computeScore(): number {
    let total = 0;
    for (const dim of boss.rubric.dimensions) total += (scores[dim.key] ?? 0) * dim.weight;
    return Math.round(total * 100);
  }

  function handleSubmit() {
    const score = computeScore();
    const passed = score >= boss.rubric.passThreshold;
    recordBossBattleAttempt({
      bossId: id!, certId, objectiveIds: boss.objectiveIds,
      score, passed, attemptedAt: new Date().toISOString(),
    });
    setPhase('result');
  }

  if (phase === 'briefing') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>BOSS BATTLE</Text>
        <Text style={styles.title}>{loreBrief.bossName}</Text>
        <Text style={styles.arena}>Arena: {loreBrief.arena}</Text>
        <View style={styles.box}>
          <Text style={styles.label}>SETUP</Text>
          <Text style={styles.body}>{loreBrief.setup}</Text>
          <Text style={styles.label}>STAKES</Text>
          <Text style={styles.body}>{loreBrief.stakes}</Text>
          <Text style={styles.label}>PASS THRESHOLD</Text>
          <Text style={styles.body}>{boss.rubric.passThreshold}% rubric score</Text>
        </View>
        <Pressable onPress={() => setPhase('scenario')} style={styles.primary}>
          <Text style={styles.primaryText}>ENTER ARENA</Text>
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.secondary}>
          <Text style={styles.secondaryText}>Retreat</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (phase === 'scenario') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>SCENARIO</Text>
        <Text style={styles.title}>{boss.title}</Text>
        <View style={styles.box}><Text style={styles.body}>{boss.scenario}</Text></View>
        {boss.constraints && (
          <View style={styles.box}>
            <Text style={styles.label}>CONSTRAINTS</Text>
            {boss.constraints.map((c: string, i: number) => <Text key={i} style={styles.bullet}>• {c}</Text>)}
          </View>
        )}
        <Text style={styles.note}>
          Work through the scenario in your head or on paper. When done, rate yourself honestly on each rubric dimension.
        </Text>
        <Pressable onPress={() => setPhase('rubric')} style={styles.primary}>
          <Text style={styles.primaryText}>SELF-ASSESS</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (phase === 'rubric') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>RUBRIC</Text>
        <Text style={styles.title}>Rate yourself</Text>
        <Text style={styles.note}>The boss does not punish honesty — only self-deception.</Text>
        {boss.rubric.dimensions.map((dim) => (
          <View key={dim.key} style={styles.box}>
            <Text style={styles.label}>{dim.key.toUpperCase()} ({Math.round(dim.weight * 100)}%)</Text>
            <Text style={styles.body}>{dim.description}</Text>
            <View style={styles.rateRow}>
              {[0, 0.25, 0.5, 0.75, 1].map((v) => {
                const isSel = scores[dim.key] === v;
                return (
                  <Pressable key={v} onPress={() => setScores((s) => ({ ...s, [dim.key]: v }))}
                    style={[styles.rateBtn, isSel && styles.rateBtnSel]}>
                    <Text style={[styles.rateText, isSel && styles.rateTextSel]}>{Math.round(v * 100)}%</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
        <Pressable onPress={handleSubmit} style={styles.primary}>
          <Text style={styles.primaryText}>SUBMIT</Text>
        </Pressable>
      </ScrollView>
    );
  }

  const score = computeScore();
  const passed = score >= boss.rubric.passThreshold;
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>{passed ? 'VICTORY' : 'NOT YET'}</Text>
      <Text style={styles.title}>{score}% rubric score</Text>
      <Text style={styles.body}>{passed ? loreBrief.victoryMessage : loreBrief.retryMessage}</Text>
      <Text style={styles.body}>+{passed ? 100 : 20} XP earned.</Text>
      {!passed && (
        <View style={styles.box}>
          <Text style={styles.label}>WEAK DIMENSIONS</Text>
          {boss.rubric.dimensions.filter((d) => (scores[d.key] ?? 0) < 0.5).map((d) => (
            <Text key={d.key} style={styles.bullet}>• {d.key}: rated {Math.round((scores[d.key] ?? 0) * 100)}%</Text>
          ))}
        </View>
      )}
      <Pressable onPress={() => router.back()} style={styles.primary}>
        <Text style={styles.primaryText}>BACK</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  error: { color: theme.colors.text, padding: 20 },
  eyebrow: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700', marginBottom: 8 },
  arena: { color: theme.colors.textDim, fontSize: 13, fontStyle: 'italic', marginBottom: 16 },
  box: { padding: 14, backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 12 },
  label: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1, marginBottom: 4, marginTop: 4 },
  body: { color: theme.colors.text, fontSize: 14, lineHeight: 21 },
  bullet: { color: theme.colors.text, fontSize: 13, lineHeight: 20, marginTop: 4 },
  note: { color: theme.colors.textDim, fontSize: 12, fontStyle: 'italic', marginVertical: 12, lineHeight: 18 },
  rateRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
  rateBtn: { flex: 1, padding: 8, borderColor: theme.colors.border, borderWidth: 1, alignItems: 'center' },
  rateBtnSel: { borderColor: theme.colors.gold, backgroundColor: theme.colors.bg },
  rateText: { color: theme.colors.textDim, fontSize: 11 },
  rateTextSel: { color: theme.colors.gold, fontWeight: '700' },
  primary: { backgroundColor: theme.colors.gold, padding: 14, alignItems: 'center', marginTop: 12 },
  primaryText: { color: theme.colors.bg, fontWeight: '700', letterSpacing: 1 },
  secondary: { padding: 14, alignItems: 'center', marginTop: 6 },
  secondaryText: { color: theme.colors.textDim, fontSize: 13 },
});
