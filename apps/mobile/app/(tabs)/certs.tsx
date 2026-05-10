import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { certPacks, certGroups, getCertLore } from '@certquest/content';
import { useStore } from '../../lib/store';
import { theme } from '../../lib/theme';

export default function CertsScreen() {
  const readinessByCert = useStore((s) => s.readinessByCert);
  const setActiveCert = useStore((s) => s.setActiveCert);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        Five cert paths. Each is its own world. Pick any path to enter.
      </Text>
      {certGroups.map((group) => (
        <View key={group.id} style={styles.groupBlock}>
          <Text style={styles.groupTitle}>{group.title}</Text>
          <Text style={styles.groupBlurb}>{group.blurb}</Text>
          {group.certIds.map((certId) => {
            const pack = certPacks[certId]!;
            const lore = getCertLore(certId);
            const r = readinessByCert[certId];
            const overall = r?.overall ?? 0;
            const exam = pack.practiceExams[0];
            const examUnlocked = overall >= (exam?.unlockRequirements.minReadiness ?? 80);
            return (
              <Pressable
                key={certId}
                style={styles.card}
                onPress={() => { setActiveCert(certId); router.push(`/cert/${certId}`); }}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardWorld}>{lore?.worldName}</Text>
                  <Text style={styles.cardReadiness}>{overall}%</Text>
                </View>
                <Text style={styles.cardTitle}>{pack.meta.examName}</Text>
                <Text style={styles.cardCode}>{pack.meta.examCode}</Text>
                <View style={styles.bar}>
                  <View style={[styles.barFill, { width: `${overall}%` }]} />
                </View>
                <Text style={styles.regionsLabel}>REGIONS</Text>
                <View style={styles.regionsList}>
                  {(lore?.regions ?? []).map((rg) => (
                    <View key={rg.domainId} style={styles.regionPill}>
                      <Text style={styles.regionPillText}>{rg.regionName}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardMeta}>{pack.lessons.length} lessons</Text>
                  <Text style={styles.cardMeta}>{pack.questionBank.length} questions</Text>
                  <Text style={[styles.cardMeta, examUnlocked ? styles.cardOk : null]}>
                    Trial: {examUnlocked ? 'OPEN' : 'LOCKED'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  intro: { color: theme.colors.textDim, fontSize: 14, marginBottom: 20, lineHeight: 20 },
  groupBlock: { marginBottom: 24 },
  groupTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  groupBlurb: { color: theme.colors.textDim, fontSize: 12, marginBottom: 12 },
  card: { backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1, padding: 14, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardWorld: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, fontWeight: '700' },
  cardReadiness: { color: theme.colors.gold, fontSize: 16, fontWeight: '700' },
  cardTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '600', marginTop: 6 },
  cardCode: { color: theme.colors.textDim, fontSize: 11, marginTop: 2 },
  bar: { height: 4, backgroundColor: theme.colors.bg, marginVertical: 10 },
  barFill: { height: 4, backgroundColor: theme.colors.gold },
  regionsLabel: { color: theme.colors.gold, fontSize: 9, letterSpacing: 1, marginBottom: 6 },
  regionsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 10 },
  regionPill: { paddingHorizontal: 8, paddingVertical: 4, borderColor: theme.colors.border, borderWidth: 1 },
  regionPillText: { color: theme.colors.textDim, fontSize: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopColor: theme.colors.border, borderTopWidth: 1, paddingTop: 8, marginTop: 4 },
  cardMeta: { color: theme.colors.textDim, fontSize: 11 },
  cardOk: { color: theme.colors.gold, fontWeight: '600' },
});
