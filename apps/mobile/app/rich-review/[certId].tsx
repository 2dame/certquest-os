import { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getRichFlashcardsForCert, getCertPack, getCertLore } from '@certquest/content';
import { useStore } from '../../lib/store';
import { theme } from '../../lib/theme';

type Rating = 'again' | 'hard' | 'good' | 'easy';

export default function RichReviewRoute() {
  const { certId } = useLocalSearchParams<{ certId: string }>();
  const recordFlashcardReview = useStore((s) => s.recordFlashcardReview);
  const cards = getRichFlashcardsForCert(certId ?? '');
  const pack = getCertPack(certId ?? '');
  const lore = getCertLore(certId ?? '');

  const queue = useMemo(() => [...cards].sort(() => Math.random() - 0.5), [certId]);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'front' | 'answer' | 'deep'>('front');
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  if (!pack || queue.length === 0) {
    return <View style={s.container}><Text style={s.error}>No rich flashcards for this cert yet.</Text></View>;
  }

  const card = queue[idx];

  function rate(r: Rating) {
    recordFlashcardReview({
      flashcardId: card.id,
      certId: certId!,
      objectiveId: card.objectiveId,
      rating: r,
      reviewedAt: new Date().toISOString(),
    });
    setStats((prev) => ({ ...prev, [r]: prev[r] + 1 }));
    if (idx < queue.length - 1) {
      setIdx((i) => i + 1);
      setPhase('front');
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <Text style={s.eyebrow}>{lore?.worldName ?? 'REVIEW COMPLETE'}</Text>
        <Text style={s.title}>{queue.length} enriched cards reviewed</Text>
        <View style={s.statsRow}>
          <StatBadge label="Again" value={stats.again} color={theme.colors.danger} />
          <StatBadge label="Hard" value={stats.hard} />
          <StatBadge label="Good" value={stats.good} />
          <StatBadge label="Easy" value={stats.easy} color={theme.colors.gold} />
        </View>
        <Text style={s.body}>SM-2 intervals updated. Cards rated "Again" return sooner.</Text>
        <Pressable onPress={() => router.back()} style={s.primary}>
          <Text style={s.primaryText}>BACK</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}><Text style={s.backText}>{'< Back'}</Text></Pressable>
        <Text style={s.headerTitle}>Rich Review</Text>
        <Text style={s.headerProgress}>{idx + 1}/{queue.length}</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        {/* FRONT: term + definition */}
        <View style={s.cardFace}>
          <Text style={s.eyebrow}>{card.difficulty.toUpperCase()}</Text>
          <Text style={s.term}>{card.term}</Text>
          {phase !== 'front' && <Text style={s.definition}>{card.definition}</Text>}
        </View>

        {/* ANSWER: core 9 fields */}
        {phase !== 'front' && (
          <>
            <Field label="WHY IT MATTERS" text={card.whyItMatters} />
            <Field label="MEMORY HOOK" text={card.memoryHook} color={theme.colors.gold} />
            <Field label="COMMON TRAP" text={card.commonTrap} color={theme.colors.danger} />
            <Field label="EXAMPLE" text={card.example} />
            <Field label="EXAM ANGLE" text={card.examAngle} color={theme.colors.warning} />
          </>
        )}

        {/* DEEP: notebookLm + audio texts */}
        {phase === 'deep' && (
          <>
            <Field label="NOTEBOOK LM TEXT" text={card.notebookLmReadyText} mono />
            <Field label="AUDIO BRIEF" text={card.audioBriefText} />
          </>
        )}
      </ScrollView>

      {phase === 'front' ? (
        <Pressable onPress={() => setPhase('answer')} style={s.revealBar}>
          <Text style={s.revealText}>SHOW ANSWER</Text>
        </Pressable>
      ) : phase === 'answer' ? (
        <View>
          <Pressable onPress={() => setPhase('deep')} style={s.deepBar}>
            <Text style={s.deepText}>SHOW DEEP FIELDS</Text>
          </Pressable>
          <View style={s.ratingBar}>
            <RatingBtn label="Again" sub="<1m" onPress={() => rate('again')} color={theme.colors.danger} />
            <RatingBtn label="Hard" sub="6m" onPress={() => rate('hard')} />
            <RatingBtn label="Good" sub="10m" onPress={() => rate('good')} />
            <RatingBtn label="Easy" sub="4d" onPress={() => rate('easy')} color={theme.colors.gold} />
          </View>
        </View>
      ) : (
        <View style={s.ratingBar}>
          <RatingBtn label="Again" sub="<1m" onPress={() => rate('again')} color={theme.colors.danger} />
          <RatingBtn label="Hard" sub="6m" onPress={() => rate('hard')} />
          <RatingBtn label="Good" sub="10m" onPress={() => rate('good')} />
          <RatingBtn label="Easy" sub="4d" onPress={() => rate('easy')} color={theme.colors.gold} />
        </View>
      )}
    </View>
  );
}

function Field({ label, text, color, mono }: { label: string; text: string; color?: string; mono?: boolean }) {
  return (
    <View style={s.field}>
      <Text style={[s.fieldLabel, color ? { color } : undefined]}>{label}</Text>
      <Text style={[s.fieldText, mono ? { fontFamily: 'monospace', fontSize: 12 } : undefined]}>{text}</Text>
    </View>
  );
}

function RatingBtn({ label, sub, onPress, color }: { label: string; sub: string; onPress: () => void; color?: string }) {
  return (
    <Pressable onPress={onPress} style={s.ratingBtn}>
      <Text style={[s.ratingLabel, color ? { color } : undefined]}>{label}</Text>
      <Text style={s.ratingSub}>{sub}</Text>
    </Pressable>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <View style={s.stat}>
      <Text style={[s.statValue, color ? { color } : undefined]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 60 },
  error: { color: theme.colors.text, padding: 20 },
  header: { padding: 14, borderBottomColor: theme.colors.border, borderBottomWidth: 1, backgroundColor: theme.colors.bgElevated, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: theme.colors.text, fontWeight: '600' },
  headerProgress: { color: theme.colors.gold, fontWeight: '700' },
  backText: { color: theme.colors.gold, fontSize: 13 },
  cardFace: { padding: 20, borderColor: theme.colors.border, borderWidth: 1, backgroundColor: theme.colors.bgElevated, marginBottom: 12 },
  eyebrow: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1, marginBottom: 6 },
  term: { color: theme.colors.text, fontSize: 20, fontWeight: '700', lineHeight: 28 },
  definition: { color: theme.colors.text, fontSize: 15, lineHeight: 22, marginTop: 12 },
  field: { padding: 14, borderColor: theme.colors.border, borderWidth: 1, backgroundColor: theme.colors.bgCard, marginBottom: 8 },
  fieldLabel: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1, marginBottom: 6 },
  fieldText: { color: theme.colors.text, fontSize: 14, lineHeight: 21 },
  revealBar: { backgroundColor: theme.colors.gold, padding: 18, alignItems: 'center' },
  revealText: { color: theme.colors.bg, fontWeight: '700', letterSpacing: 1 },
  deepBar: { backgroundColor: theme.colors.bgElevated, padding: 12, alignItems: 'center', borderTopColor: theme.colors.border, borderTopWidth: 1 },
  deepText: { color: theme.colors.gold, fontWeight: '600', fontSize: 12, letterSpacing: 1 },
  ratingBar: { flexDirection: 'row', borderTopColor: theme.colors.border, borderTopWidth: 1, backgroundColor: theme.colors.bgElevated },
  ratingBtn: { flex: 1, padding: 14, alignItems: 'center', borderRightColor: theme.colors.border, borderRightWidth: 1 },
  ratingLabel: { color: theme.colors.text, fontWeight: '700', fontSize: 13 },
  ratingSub: { color: theme.colors.textDim, fontSize: 10, marginTop: 2 },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '700', marginBottom: 16 },
  body: { color: theme.colors.text, fontSize: 13, marginVertical: 16, lineHeight: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flex: 1, alignItems: 'center', padding: 12, borderColor: theme.colors.border, borderWidth: 1, marginRight: 6 },
  statValue: { color: theme.colors.text, fontSize: 18, fontWeight: '700' },
  statLabel: { color: theme.colors.textDim, fontSize: 10, letterSpacing: 0.5, marginTop: 2 },
  primary: { backgroundColor: theme.colors.gold, padding: 14, alignItems: 'center', marginTop: 12 },
  primaryText: { color: theme.colors.bg, fontWeight: '700', letterSpacing: 1 },
});
