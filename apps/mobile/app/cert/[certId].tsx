import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { certPacks, getCertLore, getRichFlashcardsForCert, getProofLabsForCert } from '@certquest/content';
import { useStore } from '../../lib/store';
import { theme } from '../../lib/theme';
import { getExamCountdown, formatCountdown } from '../../lib/examDates';

export default function CertOverviewScreen() {
  const { certId } = useLocalSearchParams<{ certId: string }>();
  const pack = certPacks[certId ?? ''];
  const lore = getCertLore(certId ?? '');
  const readiness = useStore((s) => s.readinessByCert[certId ?? '']);
  const completedLessons = useStore((s) => s.completedLessons);
  const bossAttempts = useStore((s) => s.bossBattleAttempts);
  const rank = useStore((s) => s.rankByCert[certId ?? ''] ?? 'Recruit');
  const examDate = useStore((s) => s.settings.examDates[certId ?? '']);
  const countdown = examDate ? getExamCountdown(certId ?? '', examDate) : null;

  if (!pack || !lore) {
    return <View style={styles.container}><Text style={styles.error}>Cert not found</Text></View>;
  }

  const overall = readiness?.overall ?? 0;
  const completedSet = new Set(completedLessons.filter((c) => c.certId === certId).map((c) => c.lessonId));
  const passedBosses = new Set(bossAttempts.filter((b) => b.certId === certId && b.passed).map((b) => b.bossId));
  const richCards = getRichFlashcardsForCert(certId ?? '');
  const proofLabs = getProofLabsForCert(certId ?? '');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>{'< Back'}</Text>
      </Pressable>

      <Text style={styles.world}>{lore.worldName}</Text>
      <Text style={styles.title}>{pack.meta.examName}</Text>
      <Text style={styles.code}>{pack.meta.examCode}</Text>
      <Text style={styles.tagline}>"{lore.tagline}"</Text>

      <View style={styles.mentorBox}>
        <Text style={styles.mentorLabel}>MENTOR</Text>
        <Text style={styles.mentorName}>{lore.mentor.name}</Text>
        <Text style={styles.mentorTitle}>{lore.mentor.title}</Text>
        {lore.mentor.catchphrase && (
          <Text style={styles.catchphrase}>"{lore.mentor.catchphrase}"</Text>
        )}
      </View>

      {lore.rival && (
        <View style={styles.rivalBox}>
          <Text style={styles.rivalLabel}>THREAT</Text>
          <Text style={styles.rivalName}>{lore.rival.name}</Text>
          <Text style={styles.rivalPurpose}>{lore.rival.purpose}</Text>
        </View>
      )}

      {countdown && (
        <View style={[styles.countdownBox, countdown.urgency === 'imminent' && { borderColor: theme.colors.danger }]}>
          <Text style={[styles.countdownLabel, countdown.urgency === 'imminent' && { color: theme.colors.danger }]}>
            EXAM COUNTDOWN
          </Text>
          <Text style={styles.countdownText}>{formatCountdown(countdown)}</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <Stat label="Trial Readiness" value={`${overall}%`} accent />
        <Stat label="Rank" value={rank} />
        <Stat label="Lessons" value={`${completedSet.size}/${pack.lessons.length}`} />
      </View>

      <Text style={styles.section}>WORLD MAP</Text>
      {lore.regions.map((region) => {
        const domain = pack.domains.find((d) => d.id === region.domainId);
        const dr = readiness?.domains.find((x: { domainId: string; score: number }) => x.domainId === region.domainId);
        const score = dr?.score ?? 0;
        const objectivesInRegion = pack.objectives.filter((o) => o.domainId === region.domainId);
        const lessonsInRegion = pack.lessons.filter((l) =>
          objectivesInRegion.some((o) => o.id === l.objectiveId)
        );
        const completedInRegion = lessonsInRegion.filter((l) => completedSet.has(l.id)).length;

        return (
          <View key={region.domainId} style={styles.regionCard}>
            <View style={styles.regionHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.regionName}>{region.regionName}</Text>
                <Text style={styles.domainName}>{domain?.title} · {Math.round((domain?.weight ?? 0) * 100)}% of exam</Text>
              </View>
              <Text style={[styles.regionScore, score >= 75 && { color: theme.colors.gold }]}>{score}%</Text>
            </View>
            <Text style={styles.regionDesc}>{region.description}</Text>
            <Text style={styles.regionThreat}>Threat: {region.threat}</Text>
            <View style={styles.regionBar}>
              <View style={[styles.regionBarFill, { width: `${score}%` }]} />
            </View>
            <Text style={styles.regionProgress}>
              {completedInRegion}/{lessonsInRegion.length} lessons complete
            </Text>
          </View>
        );
      })}

      <Text style={styles.section}>TRIALS</Text>
      {pack.bossBattles.map((boss) => {
        const passed = passedBosses.has(boss.id);
        return (
          <Pressable key={boss.id} style={styles.trialRow} onPress={() => router.push(`/boss/${boss.id}`)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.trialTitle}>{boss.title}</Text>
              <Text style={styles.trialMeta}>Boss battle{passed ? ' · Defeated' : ''}</Text>
            </View>
            <Text style={[styles.trialState, passed && { color: theme.colors.gold }]}>{passed ? 'PASSED' : 'OPEN'}</Text>
          </Pressable>
        );
      })}
      {pack.practiceExams.map((exam) => {
        const unlocked = overall >= exam.unlockRequirements.minReadiness;
        return (
          <Pressable
            key={exam.id}
            style={styles.trialRow}
            onPress={() => unlocked && router.push(`/practice/${certId}/exam/${exam.id}`)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.trialTitle}>{exam.title}</Text>
              <Text style={styles.trialMeta}>
                {exam.questionCount} questions · {Math.round(exam.timeLimitSeconds / 60)} min
              </Text>
            </View>
            <Text style={[styles.trialState, unlocked && { color: theme.colors.gold }]}>
              {unlocked ? 'OPEN' : 'LOCK'}
            </Text>
          </Pressable>
        );
      })}

      <Text style={styles.section}>STUDY TOOLS</Text>
      {richCards.length > 0 && (
        <Pressable
          style={styles.trialRow}
          onPress={() => router.push(`/rich-review/${certId}`)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.trialTitle}>Rich Flashcard Review</Text>
            <Text style={styles.trialMeta}>{richCards.length} cards · 9-field cognitive layout</Text>
          </View>
          <Text style={[styles.trialState, { color: theme.colors.gold }]}>OPEN</Text>
        </Pressable>
      )}
      {proofLabs.length > 0 && (
        <Pressable
          style={styles.trialRow}
          onPress={() => router.push(`/labs/${certId}`)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.trialTitle}>Proof Labs</Text>
            <Text style={styles.trialMeta}>{proofLabs.length} lab{proofLabs.length !== 1 ? 's' : ''} · hands-on verifiable tasks</Text>
          </View>
          <Text style={[styles.trialState, { color: theme.colors.gold }]}>OPEN</Text>
        </Pressable>
      )}
      {richCards.length === 0 && proofLabs.length === 0 && (
        <Text style={styles.trialMeta}>No study tools available for this cert yet.</Text>
      )}
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
  error: { color: theme.colors.text, padding: 20 },
  backBtn: { paddingVertical: 6, marginBottom: 8 },
  backText: { color: theme.colors.gold, fontSize: 13 },
  world: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '700', marginTop: 4 },
  code: { color: theme.colors.textDim, fontSize: 12, marginTop: 2 },
  tagline: { color: theme.colors.text, fontSize: 13, fontStyle: 'italic', marginTop: 10, marginBottom: 16, lineHeight: 19 },
  mentorBox: { padding: 12, borderColor: theme.colors.gold, borderWidth: 1, marginBottom: 10, backgroundColor: theme.colors.bgElevated },
  mentorLabel: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1 },
  mentorName: { color: theme.colors.text, fontSize: 16, fontWeight: '700', marginTop: 2 },
  mentorTitle: { color: theme.colors.textDim, fontSize: 11, marginTop: 2 },
  catchphrase: { color: theme.colors.text, fontSize: 12, fontStyle: 'italic', marginTop: 6 },
  rivalBox: { padding: 12, borderColor: theme.colors.danger, borderWidth: 1, marginBottom: 16, backgroundColor: theme.colors.bgElevated },
  rivalLabel: { color: theme.colors.danger, fontSize: 10, letterSpacing: 1 },
  rivalName: { color: theme.colors.text, fontSize: 15, fontWeight: '600', marginTop: 2 },
  rivalPurpose: { color: theme.colors.textDim, fontSize: 11, marginTop: 4, lineHeight: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  stat: { flex: 1, alignItems: 'center', padding: 10, borderColor: theme.colors.border, borderWidth: 1, marginRight: 6 },
  statValue: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
  statLabel: { color: theme.colors.textDim, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 2 },
  section: { color: theme.colors.text, fontSize: 11, letterSpacing: 1, marginTop: 16, marginBottom: 8, fontWeight: '600' },
  regionCard: { padding: 12, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 8, backgroundColor: theme.colors.bgElevated },
  regionHead: { flexDirection: 'row', alignItems: 'flex-start' },
  regionName: { color: theme.colors.text, fontSize: 15, fontWeight: '600' },
  domainName: { color: theme.colors.textDim, fontSize: 11, marginTop: 2 },
  regionScore: { color: theme.colors.textDim, fontSize: 14, fontWeight: '700' },
  regionDesc: { color: theme.colors.textDim, fontSize: 12, fontStyle: 'italic', marginTop: 6, lineHeight: 17 },
  regionThreat: { color: theme.colors.danger, fontSize: 11, marginTop: 4 },
  regionBar: { height: 3, backgroundColor: theme.colors.bg, marginTop: 8 },
  regionBarFill: { height: 3, backgroundColor: theme.colors.gold },
  regionProgress: { color: theme.colors.textDim, fontSize: 11, marginTop: 6 },
  trialRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 6, backgroundColor: theme.colors.bgElevated },
  trialTitle: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  trialMeta: { color: theme.colors.textDim, fontSize: 11, marginTop: 2 },
  trialState: { color: theme.colors.textDim, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  countdownBox: { padding: 12, borderColor: theme.colors.gold, borderWidth: 1, marginBottom: 12, backgroundColor: theme.colors.bgElevated },
  countdownLabel: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1 },
  countdownText: { color: theme.colors.text, fontSize: 16, fontWeight: '700', marginTop: 4 },
});
