import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { certPacks, certDisplayOrder, getCertLore } from '@certquest/content';
import { CORE_BADGES, nextRankInfo } from '@certquest/gamification';
import { useStore } from '../../lib/store';
import { theme } from '../../lib/theme';

export default function ProgressScreen() {
  const activeCertId = useStore((s) => s.activeCertId);
  const readinessByCert = useStore((s) => s.readinessByCert);
  const objectiveMastery = useStore((s) => s.objectiveMastery);
  const examAttempts = useStore((s) => s.examAttempts);
  const completedLessons = useStore((s) => s.completedLessons);
  const flashcardReviews = useStore((s) => s.flashcardReviews);
  const quizAttempts = useStore((s) => s.quizAttempts);
  const bossAttempts = useStore((s) => s.bossBattleAttempts);
  const badges = useStore((s) => s.badges);
  const xp = useStore((s) => s.xp);
  const xpByCert = useStore((s) => s.xpByCert);
  const streak = useStore((s) => s.streak);

  const activePack = certPacks[activeCertId];
  const activeLore = getCertLore(activeCertId);
  const activeReadiness = readinessByCert[activeCertId];
  const rankInfo = nextRankInfo(xp);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>PROGRESS</Text>
      <Text style={styles.title}>Your training record</Text>

      {/* Overall stats */}
      <View style={styles.overallBox}>
        <View style={styles.overallRow}>
          <View style={styles.overallStat}>
            <Text style={styles.overallValue}>{rankInfo.current}</Text>
            <Text style={styles.overallLabel}>Rank</Text>
          </View>
          <View style={styles.overallStat}>
            <Text style={styles.overallValue}>{xp}</Text>
            <Text style={styles.overallLabel}>Total XP</Text>
          </View>
          <View style={styles.overallStat}>
            <Text style={styles.overallValue}>{streak.current}d</Text>
            <Text style={styles.overallLabel}>Streak</Text>
          </View>
          <View style={styles.overallStat}>
            <Text style={styles.overallValue}>{streak.longest}d</Text>
            <Text style={styles.overallLabel}>Longest</Text>
          </View>
        </View>
        {rankInfo.next && (
          <View style={styles.rankBar}>
            <View style={[styles.rankFill, { width: `${rankInfo.progress * 100}%` }]} />
            <Text style={styles.rankText}>
              {rankInfo.xpToNext} XP to {rankInfo.next}
            </Text>
          </View>
        )}
      </View>

      {/* Per-cert readiness cards */}
      <Text style={styles.section}>READINESS BY CERT</Text>
      {certDisplayOrder.map((id) => {
        const pack = certPacks[id]!;
        const lore = getCertLore(id);
        const r = readinessByCert[id];
        const overall = r?.overall ?? 0;
        const certXp = xpByCert[id] ?? 0;
        return (
          <View key={id} style={styles.certCard}>
            <View style={styles.certHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.certWorld}>{lore?.worldName}</Text>
                <Text style={styles.certName}>{pack.meta.examCode}</Text>
              </View>
              <Text style={styles.certScore}>{overall}%</Text>
            </View>
            <View style={styles.certBar}>
              <View style={[styles.certBarFill, { width: `${overall}%` }]} />
              {r?.ceilingApplied && <View style={styles.ceilingMark} />}
            </View>
            <View style={styles.certMeta}>
              <Text style={styles.certMetaText}>{certXp} XP</Text>
              {r?.ceilingApplied && (
                <Text style={[styles.certMetaText, { color: theme.colors.danger }]}>70% ceiling — pass a boss to lift</Text>
              )}
            </View>
          </View>
        );
      })}

      {/* Active cert: weak areas */}
      {activePack && activeReadiness && (
        <>
          <Text style={styles.section}>WEAK AREAS — {activeLore?.worldName}</Text>
          {[...activeReadiness.domains]
            .sort((a, b) => a.score - b.score)
            .slice(0, 3)
            .map((d) => {
              const dom = activePack.domains.find((x) => x.id === d.domainId);
              const region = activeLore?.regions.find((r) => r.domainId === d.domainId);
              return (
                <View key={d.domainId} style={styles.weakCard}>
                  <View style={styles.weakHead}>
                    <Text style={styles.weakRegion}>{region?.regionName ?? dom?.title}</Text>
                    <Text style={[styles.weakScore, d.score < 50 && { color: theme.colors.danger }]}>{d.score}%</Text>
                  </View>
                  <Text style={styles.weakDomain}>{dom?.title}</Text>
                  <View style={styles.weakBar}>
                    <View style={[styles.weakBarFill, { width: `${d.score}%`, backgroundColor: d.score < 50 ? theme.colors.danger : theme.colors.gold }]} />
                  </View>
                  {region?.threat && <Text style={styles.weakThreat}>Threat: {region.threat}</Text>}
                </View>
              );
            })}
        </>
      )}

      {/* Active cert: objective mastery */}
      {activePack && (
        <>
          <Text style={styles.section}>OBJECTIVE MASTERY — {activePack.meta.examCode}</Text>
          {activePack.objectives.map((obj) => {
            const mastery = Math.round((objectiveMastery[obj.id] ?? 0) * 100);
            const dom = activePack.domains.find((d) => d.id === obj.domainId);
            return (
              <View key={obj.id} style={styles.objRow}>
                <View style={styles.objHead}>
                  <Text style={styles.objTitle} numberOfLines={2}>{obj.title}</Text>
                  <Text style={styles.objScore}>{mastery}%</Text>
                </View>
                <Text style={styles.objDomain}>{dom?.title}</Text>
                <View style={styles.objBar}>
                  <View style={[styles.objBarFill, { width: `${mastery}%` }]} />
                </View>
              </View>
            );
          })}
        </>
      )}

      {/* Badges grid */}
      <Text style={styles.section}>BADGES</Text>
      <View style={styles.badgeGrid}>
        {CORE_BADGES.map((b) => {
          const earned = badges.includes(b.id);
          return (
            <View key={b.id} style={[styles.badge, earned && styles.badgeEarned]}>
              <Text style={[styles.badgeName, earned && styles.badgeNameEarned]}>{b.name}</Text>
              <Text style={styles.badgeTitle}>{b.loreTitle}</Text>
              <Text style={styles.badgeDesc}>{earned ? b.titleFlavor : b.description}</Text>
              {!earned && <Text style={styles.badgeLocked}>LOCKED</Text>}
            </View>
          );
        })}
      </View>

      {/* Exam attempt history */}
      <Text style={styles.section}>30-DAY STUDY CALENDAR</Text>
      <StreakCalendar
        days={buildStudyDays(completedLessons, flashcardReviews, quizAttempts, bossAttempts, examAttempts)}
      />

      <Text style={styles.section}>PRACTICE EXAM HISTORY</Text>
      {examAttempts.length === 0 ? (
        <Text style={styles.empty}>No practice exams taken yet.</Text>
      ) : (
        [...examAttempts].reverse().slice(0, 10).map((a) => {
          const pack = certPacks[a.certId];
          const exam = pack?.practiceExams.find((e) => e.id === a.blueprintId);
          return (
            <View key={a.attemptId} style={styles.examRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.examName}>{exam?.title ?? a.blueprintId}</Text>
                <Text style={styles.examDate}>
                  {new Date(a.takenAt).toLocaleDateString()} · {pack?.meta.examCode}
                </Text>
              </View>
              <Text style={[styles.examResult, a.passEstimate && { color: theme.colors.gold }]}>
                {a.scaledScore}
              </Text>
              <Text style={[styles.examStatus, a.passEstimate && { color: theme.colors.gold }]}>
                {a.passEstimate ? 'PASS' : 'FAIL'}
              </Text>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  eyebrow: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '700', marginTop: 4, marginBottom: 16 },
  overallBox: { padding: 14, borderColor: theme.colors.gold, borderWidth: 1, backgroundColor: theme.colors.bgElevated, marginBottom: 16 },
  overallRow: { flexDirection: 'row', justifyContent: 'space-between' },
  overallStat: { flex: 1, alignItems: 'center' },
  overallValue: { color: theme.colors.gold, fontSize: 16, fontWeight: '700' },
  overallLabel: { color: theme.colors.textDim, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 2 },
  rankBar: { height: 4, backgroundColor: theme.colors.bg, marginTop: 12, position: 'relative' },
  rankFill: { height: 4, backgroundColor: theme.colors.gold },
  rankText: { color: theme.colors.textDim, fontSize: 10, marginTop: 6, textAlign: 'right' },
  section: { color: theme.colors.text, fontSize: 11, letterSpacing: 1, marginTop: 18, marginBottom: 8, fontWeight: '600' },
  certCard: { padding: 12, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 6, backgroundColor: theme.colors.bgElevated },
  certHead: { flexDirection: 'row', alignItems: 'center' },
  certWorld: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1, fontWeight: '700' },
  certName: { color: theme.colors.text, fontSize: 13, fontWeight: '600', marginTop: 2 },
  certScore: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  certBar: { height: 4, backgroundColor: theme.colors.bg, marginTop: 8, position: 'relative' },
  certBarFill: { height: 4, backgroundColor: theme.colors.gold },
  ceilingMark: { position: 'absolute', left: '70%', top: -2, bottom: -2, width: 1, backgroundColor: theme.colors.danger },
  certMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  certMetaText: { color: theme.colors.textDim, fontSize: 10 },
  weakCard: { padding: 12, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 6, backgroundColor: theme.colors.bgElevated },
  weakHead: { flexDirection: 'row', justifyContent: 'space-between' },
  weakRegion: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  weakScore: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  weakDomain: { color: theme.colors.textDim, fontSize: 11, marginTop: 2 },
  weakBar: { height: 3, backgroundColor: theme.colors.bg, marginTop: 6 },
  weakBarFill: { height: 3 },
  weakThreat: { color: theme.colors.danger, fontSize: 11, marginTop: 6, fontStyle: 'italic' },
  objRow: { padding: 10, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 4, backgroundColor: theme.colors.bgElevated },
  objHead: { flexDirection: 'row', alignItems: 'center' },
  objTitle: { color: theme.colors.text, fontSize: 12, fontWeight: '600', flex: 1 },
  objScore: { color: theme.colors.gold, fontSize: 12, fontWeight: '700', marginLeft: 8 },
  objDomain: { color: theme.colors.textDim, fontSize: 10, marginTop: 2 },
  objBar: { height: 2, backgroundColor: theme.colors.bg, marginTop: 6 },
  objBarFill: { height: 2, backgroundColor: theme.colors.gold },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { width: '48.5%', padding: 10, borderColor: theme.colors.border, borderWidth: 1, backgroundColor: theme.colors.bgElevated, opacity: 0.55 },
  badgeEarned: { borderColor: theme.colors.gold, opacity: 1 },
  badgeName: { color: theme.colors.textDim, fontSize: 12, fontWeight: '700' },
  badgeNameEarned: { color: theme.colors.gold },
  badgeTitle: { color: theme.colors.textDim, fontSize: 10, fontStyle: 'italic', marginTop: 2 },
  badgeDesc: { color: theme.colors.textDim, fontSize: 10, marginTop: 6, lineHeight: 14 },
  badgeLocked: { color: theme.colors.danger, fontSize: 9, letterSpacing: 1, marginTop: 6 },
  empty: { color: theme.colors.textDim, fontSize: 13, fontStyle: 'italic', padding: 12 },
  examRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 4, backgroundColor: theme.colors.bgElevated },
  examName: { color: theme.colors.text, fontSize: 12, fontWeight: '600' },
  examDate: { color: theme.colors.textDim, fontSize: 10, marginTop: 2 },
  examResult: { color: theme.colors.text, fontSize: 14, fontWeight: '700', width: 50, textAlign: 'right', marginRight: 8 },
  examStatus: { color: theme.colors.danger, fontSize: 9, letterSpacing: 1, fontWeight: '700' },
});

interface DayCell { dateKey: string; events: number; }

function buildStudyDays(
  completedLessons: any[], flashcardReviews: any[], quizAttempts: any[],
  bossAttempts: any[], examAttempts: any[],
): DayCell[] {
  const counts: Record<string, number> = {};
  const tally = (iso: string) => { if (!iso) return; const key = iso.slice(0, 10); counts[key] = (counts[key] ?? 0) + 1; };
  completedLessons.forEach((l) => tally(l.completedAt));
  flashcardReviews.forEach((r) => tally(r.reviewedAt));
  quizAttempts.forEach((q) => tally(q.attemptedAt));
  bossAttempts.forEach((b) => tally(b.attemptedAt));
  examAttempts.forEach((e) => tally(e.takenAt));
  const days: DayCell[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({ dateKey: d.toISOString().slice(0, 10), events: counts[d.toISOString().slice(0, 10)] ?? 0 });
  }
  return days;
}

function StreakCalendar({ days }: { days: DayCell[] }) {
  const weeks: DayCell[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const maxEvents = Math.max(1, ...days.map((d) => d.events));
  const todayKey = new Date().toISOString().slice(0, 10);
  const heatColor = (intensity: number) =>
    intensity === 0 ? theme.colors.bg
    : intensity < 0.34 ? '#3a2a08'
    : intensity < 0.67 ? '#7a5a14'
    : theme.colors.gold;
  return (
    <View style={calStyles.box}>
      <View style={calStyles.grid}>
        {weeks.map((week, wi) => (
          <View key={wi} style={calStyles.week}>
            {week.map((day) => {
              const intensity = day.events === 0 ? 0 : Math.min(1, day.events / maxEvents);
              return (
                <View key={day.dateKey} style={[calStyles.cell, { backgroundColor: heatColor(intensity) }, day.dateKey === todayKey && calStyles.cellToday]} />
              );
            })}
          </View>
        ))}
      </View>
      <View style={calStyles.legend}>
        <Text style={calStyles.legendText}>30 days ago</Text>
        <View style={{ flexDirection: 'row', gap: 3 }}>
          {[0, 0.3, 0.6, 1].map((v, i) => (
            <View key={i} style={[calStyles.legendCell, { backgroundColor: heatColor(v) }]} />
          ))}
        </View>
        <Text style={calStyles.legendText}>today</Text>
      </View>
    </View>
  );
}

const calStyles = StyleSheet.create({
  box: { padding: 12, borderColor: theme.colors.border, borderWidth: 1, backgroundColor: theme.colors.bgElevated },
  grid: { flexDirection: 'column', gap: 3 },
  week: { flexDirection: 'row', gap: 3 },
  cell: { width: 14, height: 14 },
  cellToday: { borderColor: theme.colors.text, borderWidth: 1 },
  legend: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  legendText: { color: theme.colors.textDim, fontSize: 9, letterSpacing: 0.5 },
  legendCell: { width: 10, height: 10 },
});
