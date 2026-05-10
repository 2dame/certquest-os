import { useMemo } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import {
  certPacks, certDisplayOrder, getCertLore, getRegionForDomain, pickDailyMessage,
} from '@certquest/content';
import { useStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { getExamCountdown, formatCountdown } from '../../lib/examDates';

export default function TodayScreen() {
  const activeCertId = useStore((s) => s.activeCertId) ?? certDisplayOrder[0]!;
  const setActiveCert = useStore((s) => s.setActiveCert);
  const readiness = useStore((s) => s.readinessByCert[activeCertId]);
  const dueReviews = useStore((s) => s.dueReviewCount[activeCertId] ?? 0);
  const completedLessons = useStore((s) => s.completedLessons);
  const objectiveMastery = useStore((s) => s.objectiveMastery);
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const rank = useStore((s) => s.rankByCert[activeCertId] ?? 'Recruit');
  const examDate = useStore((s) => s.settings.examDates[activeCertId]);
  const countdown = examDate ? getExamCountdown(activeCertId, examDate) : null;

  const pack = certPacks[activeCertId];
  const lore = getCertLore(activeCertId);
  if (!pack) return <Text style={{ color: '#fff', padding: 20 }}>Loading</Text>;

  const overall = readiness?.overall ?? 0;
  const exam = pack.practiceExams[0];
  const examUnlocked = overall >= (exam?.unlockRequirements.minReadiness ?? 80);

  const completedSet = useMemo(
    () => new Set(completedLessons.filter((c) => c.certId === activeCertId).map((c) => c.lessonId)),
    [completedLessons, activeCertId],
  );

  const nextLesson = pack.lessons.find((l) => !completedSet.has(l.id)) ?? pack.lessons[0];
  const nextObjective = pack.objectives.find((o) => o.id === nextLesson?.objectiveId);
  const currentRegion = nextObjective ? getRegionForDomain(activeCertId, nextObjective.domainId) : undefined;

  const weakDomain = useMemo(() => {
    if (!readiness) return null;
    const lowest = readiness.domains.reduce((m: { domainId: string; score: number }, d: { domainId: string; score: number }) => (d.score < m.score ? d : m), { domainId: '', score: 100 });
    if (lowest.score >= 100) return null;
    const dom = pack.domains.find((d) => d.id === lowest.domainId);
    return dom?.title ?? null;
  }, [readiness, pack]);

  const mentorMessage = pickDailyMessage(activeCertId, {
    nextLesson: nextLesson?.title,
    dueReviews,
    weakDomain: weakDomain ?? undefined,
    readiness: overall,
    nextTrial: exam?.title,
  });

  const startTraining = () => {
    if (nextLesson) router.push(`/lesson/${nextLesson.id}`);
  };

  const availableQuest = pack.sideQuests[0];
  const availableBoss = pack.bossBattles[0];
  const bossPassedThisCert = useStore((s) => s.bossBattleAttempts.some((b) => b.certId === activeCertId && b.passed));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.world}>{lore?.worldName}</Text>
      <Text style={styles.title}>{pack.meta.examName}</Text>
      <Text style={styles.role}>You are: {lore?.userRole}</Text>

      {currentRegion && (
        <View style={styles.regionBox}>
          <Text style={styles.regionLabel}>CURRENT REGION</Text>
          <Text style={styles.regionName}>{currentRegion.regionName}</Text>
          <Text style={styles.regionThreat}>Threat: {currentRegion.threat}</Text>
        </View>
      )}

      {mentorMessage && (
        <View style={styles.mentorBox}>
          <Text style={styles.mentorLabel}>{lore?.mentor.name.toUpperCase()}</Text>
          <Text style={styles.mentorMsg}>{mentorMessage}</Text>
        </View>
      )}

      {countdown && (
        <View style={[styles.countdownBox, countdown.urgency === 'imminent' && styles.countdownImminent]}>
          <Text style={[styles.countdownLabel, countdown.urgency === 'imminent' && { color: theme.colors.danger }]}>
            EXAM COUNTDOWN
          </Text>
          <Text style={styles.countdownText}>{formatCountdown(countdown)}</Text>
          {countdown.urgency === 'imminent' && (
            <Text style={styles.countdownHint}>Recommended: aggressive intensity. Drill weak domains daily.</Text>
          )}
          {countdown.urgency === 'approaching' && (
            <Text style={styles.countdownHint}>Recommended: aggressive intensity. Build into the routine now.</Text>
          )}
        </View>
      )}

      <View style={styles.statsRow}>
        <Stat label="Trial Readiness" value={`${overall}%`} accent />
        <Stat label="Rank" value={rank} />
        <Stat label="Streak" value={`${streak.current}d`} />
      </View>

      <Pressable onPress={startTraining} style={styles.startBtn}>
        <Text style={styles.startBtnText}>START TRAINING</Text>
        <Text style={styles.startBtnSub}>{nextLesson?.title ?? 'No lessons available'}</Text>
      </Pressable>

      <Text style={styles.section}>TODAY'S PLAN</Text>
      <PlanRow icon="REV" label={`${dueReviews} reviews due`} sub="Spaced repetition"
        onPress={() => router.push(`/review/${activeCertId}`)} />
      <PlanRow icon="QQ" label="Quick quiz" sub="10 mixed-domain questions"
        onPress={() => router.push(`/quiz/${activeCertId}`)} />
      {availableQuest && (
        <PlanRow icon="SQ" label={availableQuest.title} sub="Side quest mini-game"
          onPress={() => router.push(`/game/${availableQuest.id}`)} />
      )}
      {availableBoss && (
        <PlanRow icon={bossPassedThisCert ? 'OK' : 'BB'} label={availableBoss.title}
          sub={bossPassedThisCert ? 'Defeated — retry available' : 'Boss battle'}
          onPress={() => router.push(`/boss/${availableBoss.id}`)} />
      )}
      <PlanRow icon={examUnlocked ? 'OK' : 'LK'} label="Practice exam"
        sub={examUnlocked ? `Unlocked: ${exam?.title}` : `Unlocks at ${exam?.unlockRequirements.minReadiness}% readiness`}
        onPress={() => router.push('/practice')}
        accent={examUnlocked} />

      <Text style={styles.section}>SWITCH CERT PATH</Text>
      <View style={styles.certSwitcher}>
        {certDisplayOrder.map((id) => {
          const p = certPacks[id]!;
          const isActive = id === activeCertId;
          return (
            <Pressable key={id} style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => setActiveCert(id)}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{p.meta.examCode}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.footer}>Total XP: {xp}</Text>
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

function PlanRow({ icon, label, sub, onPress, accent }: { icon: string; label: string; sub: string; onPress: () => void; accent?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, accent && styles.rowAccent]}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Text style={styles.rowChev}>{'>'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  world: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700', marginTop: 4 },
  role: { color: theme.colors.textDim, fontSize: 13, fontStyle: 'italic', marginBottom: 16 },
  regionBox: { padding: 12, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 10, backgroundColor: theme.colors.bgElevated },
  regionLabel: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1 },
  regionName: { color: theme.colors.text, fontSize: 16, fontWeight: '600', marginTop: 2 },
  regionThreat: { color: theme.colors.textDim, fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  mentorBox: { padding: 12, borderColor: theme.colors.gold, borderWidth: 1, marginBottom: 16, backgroundColor: theme.colors.bgElevated },
  mentorLabel: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1 },
  mentorMsg: { color: theme.colors.text, fontSize: 14, marginTop: 6, lineHeight: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  stat: { flex: 1, alignItems: 'center', padding: 10, borderColor: theme.colors.border, borderWidth: 1, marginRight: 6 },
  statValue: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  statLabel: { color: theme.colors.textDim, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 2 },
  startBtn: { backgroundColor: theme.colors.gold, padding: 16, alignItems: 'center', marginBottom: 16 },
  startBtnText: { color: theme.colors.bg, fontWeight: '700', letterSpacing: 1, fontSize: 15 },
  startBtnSub: { color: theme.colors.bg, fontSize: 12, marginTop: 4, opacity: 0.85 },
  section: { color: theme.colors.text, fontSize: 11, letterSpacing: 1, marginTop: 16, marginBottom: 8, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1, padding: 12, marginBottom: 6 },
  rowAccent: { borderColor: theme.colors.gold },
  rowIcon: { color: theme.colors.gold, fontSize: 11, fontWeight: '700', width: 32 },
  rowLabel: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  rowSub: { color: theme.colors.textDim, fontSize: 12, marginTop: 2 },
  rowChev: { color: theme.colors.textDim, fontSize: 18 },
  certSwitcher: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderColor: theme.colors.border, borderWidth: 1 },
  chipActive: { borderColor: theme.colors.gold, backgroundColor: theme.colors.bgElevated },
  chipText: { color: theme.colors.textDim, fontSize: 11, fontWeight: '600' },
  chipTextActive: { color: theme.colors.gold },
  countdownBox: { padding: 12, borderColor: theme.colors.gold, borderWidth: 1, marginBottom: 12, backgroundColor: theme.colors.bgElevated },
  countdownImminent: { borderColor: theme.colors.danger },
  countdownLabel: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1 },
  countdownText: { color: theme.colors.text, fontSize: 16, fontWeight: '700', marginTop: 4 },
  countdownHint: { color: theme.colors.textDim, fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  footer: { color: theme.colors.textDim, fontSize: 11, textAlign: 'center', marginTop: 24 },
});
