import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getFlashcardsForCert, getCertPack } from '@certquest/content';
import { useStore } from '../../lib/store';
import { theme } from '../../lib/theme';

type Rating = 'again' | 'hard' | 'good' | 'easy';

export default function ReviewRoute() {
  const { certId } = useLocalSearchParams<{ certId: string }>();
  const recordFlashcardReview = useStore((s) => s.recordFlashcardReview);
  const flashcards = getFlashcardsForCert(certId ?? '');
  const pack = getCertPack(certId ?? '');

  const queue = useMemo(() => [...flashcards].sort(() => Math.random() - 0.5).slice(0, 15), [certId]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  if (!pack || queue.length === 0) {
    return <View style={styles.container}><Text style={styles.error}>No flashcards for this cert.</Text></View>;
  }

  const card = queue[idx]!;

  function rate(r: Rating) {
    recordFlashcardReview({
      flashcardId: card.id,
      certId: certId!,
      objectiveId: card.objectiveId ?? '',
      rating: r,
      reviewedAt: new Date().toISOString(),
    });
    setStats((s) => ({ ...s, [r]: s[r] + 1 }));
    if (idx < queue.length - 1) {
      setIdx((i) => i + 1);
      setRevealed(false);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>REVIEW COMPLETE</Text>
        <Text style={styles.title}>{queue.length} cards reviewed</Text>
        <View style={styles.statsRow}>
          <Stat label="Again" value={stats.again} color={theme.colors.danger} />
          <Stat label="Hard" value={stats.hard} />
          <Stat label="Good" value={stats.good} />
          <Stat label="Easy" value={stats.easy} color={theme.colors.gold} />
        </View>
        <Text style={styles.body}>Cards rated "Again" will appear sooner. Cards rated "Easy" will appear much later.</Text>
        <Pressable onPress={() => router.back()} style={styles.primary}>
          <Text style={styles.primaryText}>BACK</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Flashcard Review</Text>
        <Text style={styles.headerProgress}>{idx + 1}/{queue.length}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cardFace}>
          <Text style={styles.kind}>{(card.kind || 'basic').toUpperCase()}</Text>
          <Text style={styles.front}>{card.front}</Text>
        </View>
        {revealed && (
          <View style={styles.cardBack}>
            <Text style={styles.kind}>ANSWER</Text>
            <Text style={styles.back}>{card.back}</Text>
          </View>
        )}
      </ScrollView>
      {!revealed ? (
        <Pressable onPress={() => setRevealed(true)} style={styles.revealBar}>
          <Text style={styles.revealText}>SHOW ANSWER</Text>
        </Pressable>
      ) : (
        <View style={styles.ratingBar}>
          <RatingBtn label="Again" sub="<1m" onPress={() => rate('again')} color={theme.colors.danger} />
          <RatingBtn label="Hard" sub="6m" onPress={() => rate('hard')} />
          <RatingBtn label="Good" sub="10m" onPress={() => rate('good')} />
          <RatingBtn label="Easy" sub="4d" onPress={() => rate('easy')} color={theme.colors.gold} />
        </View>
      )}
    </View>
  );
}

function RatingBtn({ label, sub, onPress, color }: { label: string; sub: string; onPress: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} style={styles.ratingBtn}>
      <Text style={[styles.ratingLabel, color ? { color } : undefined]}>{label}</Text>
      <Text style={styles.ratingSub}>{sub}</Text>
    </Pressable>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, color ? { color } : undefined]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  error: { color: theme.colors.text, padding: 20 },
  header: { padding: 14, borderBottomColor: theme.colors.border, borderBottomWidth: 1, backgroundColor: theme.colors.bgElevated, flexDirection: 'row', justifyContent: 'space-between' },
  headerTitle: { color: theme.colors.text, fontWeight: '600' },
  headerProgress: { color: theme.colors.gold, fontWeight: '700' },
  cardFace: { padding: 24, borderColor: theme.colors.border, borderWidth: 1, backgroundColor: theme.colors.bgElevated, marginBottom: 12, minHeight: 200, justifyContent: 'center' },
  cardBack: { padding: 24, borderColor: theme.colors.gold, borderWidth: 1, backgroundColor: theme.colors.bgElevated, marginBottom: 12 },
  kind: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1, marginBottom: 10 },
  front: { color: theme.colors.text, fontSize: 18, lineHeight: 26 },
  back: { color: theme.colors.text, fontSize: 16, lineHeight: 24 },
  revealBar: { backgroundColor: theme.colors.gold, padding: 18, alignItems: 'center' },
  revealText: { color: theme.colors.bg, fontWeight: '700', letterSpacing: 1 },
  ratingBar: { flexDirection: 'row', borderTopColor: theme.colors.border, borderTopWidth: 1, backgroundColor: theme.colors.bgElevated },
  ratingBtn: { flex: 1, padding: 14, alignItems: 'center', borderRightColor: theme.colors.border, borderRightWidth: 1 },
  ratingLabel: { color: theme.colors.text, fontWeight: '700', fontSize: 13 },
  ratingSub: { color: theme.colors.textDim, fontSize: 10, marginTop: 2 },
  eyebrow: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '700', marginBottom: 16 },
  body: { color: theme.colors.text, fontSize: 13, marginVertical: 16, lineHeight: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flex: 1, alignItems: 'center', padding: 12, borderColor: theme.colors.border, borderWidth: 1, marginRight: 6 },
  statValue: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  statLabel: { color: theme.colors.textDim, fontSize: 10, letterSpacing: 0.5, marginTop: 2 },
  primary: { backgroundColor: theme.colors.gold, padding: 14, alignItems: 'center', marginTop: 12 },
  primaryText: { color: theme.colors.bg, fontWeight: '700', letterSpacing: 1 },
});
