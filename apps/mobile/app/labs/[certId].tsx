import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getProofLabsForCert, getCertPack, getCertLore } from '@certquest/content';
import { useStore } from '../../lib/store';
import { theme } from '../../lib/theme';

export default function LabsListRoute() {
  const { certId } = useLocalSearchParams<{ certId: string }>();
  const labs = getProofLabsForCert(certId ?? '');
  const pack = getCertPack(certId ?? '');
  const lore = getCertLore(certId ?? '');
  const getLabStatus = useStore((s) => s.getLabStatus);

  if (!pack || labs.length === 0) {
    return (
      <View style={s.container}>
        <Pressable onPress={() => router.back()} style={s.backBtn}><Text style={s.backText}>{'< Back'}</Text></Pressable>
        <Text style={s.error}>No proof labs for this cert yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Pressable onPress={() => router.back()} style={s.backBtn}>
        <Text style={s.backText}>{'< Back'}</Text>
      </Pressable>
      <Text style={s.world}>{lore?.worldName ?? ''}</Text>
      <Text style={s.title}>Proof Labs</Text>
      <Text style={s.subtitle}>Hands-on exercises with verifiable proof. Complete every task to earn XP.</Text>

      {labs.map((lab) => {
        const status = getLabStatus(lab.id);
        const statusColors: Record<string, string> = {
          completed: theme.colors.gold,
          in_progress: theme.colors.warning,
          not_started: theme.colors.textDim,
        };
        const statusLabels: Record<string, string> = {
          completed: 'COMPLETED',
          in_progress: 'IN PROGRESS',
          not_started: 'NOT STARTED',
        };

        return (
          <Pressable
            key={lab.id}
            style={s.labCard}
            onPress={() => router.push(`/labs/run/${lab.id}?certId=${certId}`)}
          >
            <View style={s.labHead}>
              <View style={{ flex: 1 }}>
                <Text style={s.labTitle}>{lab.title}</Text>
                <Text style={s.labMeta}>
                  {lab.estimatedMinutes} min · {lab.difficulty} · {lab.xpReward} XP
                </Text>
              </View>
              <Text style={[s.labStatus, { color: statusColors[status] }]}>
                {statusLabels[status]}
              </Text>
            </View>
            <Text style={s.labObjectives} numberOfLines={2}>
              {lab.learningObjectives.slice(0, 2).join(' · ')}
            </Text>
            <View style={s.toolRow}>
              {lab.tools.map((t, i) => (
                <Text key={i} style={s.toolChip}>{t.name}</Text>
              ))}
            </View>
            <Text style={s.labTasks}>{lab.tasks.length} tasks</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  error: { color: theme.colors.text, padding: 20 },
  backBtn: { paddingVertical: 6, marginBottom: 8 },
  backText: { color: theme.colors.gold, fontSize: 13 },
  world: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '700', marginTop: 4 },
  subtitle: { color: theme.colors.textDim, fontSize: 13, marginTop: 6, marginBottom: 16, lineHeight: 19 },
  labCard: { padding: 14, borderColor: theme.colors.border, borderWidth: 1, backgroundColor: theme.colors.bgElevated, marginBottom: 10 },
  labHead: { flexDirection: 'row', alignItems: 'flex-start' },
  labTitle: { color: theme.colors.text, fontSize: 15, fontWeight: '700' },
  labMeta: { color: theme.colors.textDim, fontSize: 11, marginTop: 3 },
  labStatus: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  labObjectives: { color: theme.colors.textMuted, fontSize: 12, marginTop: 8, lineHeight: 17 },
  toolRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  toolChip: { color: theme.colors.gold, fontSize: 10, borderColor: theme.colors.gold, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  labTasks: { color: theme.colors.textDim, fontSize: 11, marginTop: 8 },
});
