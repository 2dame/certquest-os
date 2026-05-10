import { useState } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, Switch, StyleSheet, Alert } from 'react-native';
import { certPacks, certDisplayOrder, getCertLore } from '@certquest/content';
import { useStore } from '../../lib/store';
import { theme } from '../../lib/theme';

type Intensity = 'chill' | 'normal' | 'aggressive';

export default function ProfileScreen() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const resetLocalProgress = useStore((s) => s.resetLocalProgress);
  const activeCertId = useStore((s) => s.activeCertId);
  const setActiveCert = useStore((s) => s.setActiveCert);
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);

  const [examDateDrafts, setExamDateDrafts] = useState<Record<string, string>>(settings.examDates);

  function setIntensity(i: Intensity) {
    updateSettings({ studyIntensity: i });
  }

  function setNotifications(v: boolean) {
    updateSettings({ notificationsEnabled: v });
  }

  function commitExamDate(certId: string, value: string) {
    const trimmed = value.trim();
    setExamDateDrafts((d) => ({ ...d, [certId]: trimmed }));
    updateSettings({ examDates: { ...settings.examDates, [certId]: trimmed } });
  }

  function confirmReset() {
    Alert.alert(
      'Reset all progress?',
      'This wipes lessons, quizzes, flashcards, mini-games, boss battles, exams, XP, streak, and badges. Cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetLocalProgress() },
      ],
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.sub}>Local-only. No login required.</Text>

      <View style={styles.heroBox}>
        <Stat label="XP" value={`${xp}`} />
        <Stat label="Streak" value={`${streak.current}d`} />
        <Stat label="Best" value={`${streak.longest}d`} />
      </View>

      <Text style={styles.section}>ACTIVE CERT</Text>
      <View style={styles.chips}>
        {certDisplayOrder.map((cid) => {
          const pack = certPacks[cid]!;
          const active = cid === activeCertId;
          return (
            <Pressable key={cid} onPress={() => setActiveCert(cid)}
              style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {pack.meta.examCode}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.section}>STUDY INTENSITY</Text>
      <View style={styles.intensityRow}>
        {(['chill', 'normal', 'aggressive'] as Intensity[]).map((i) => {
          const active = settings.studyIntensity === i;
          return (
            <Pressable key={i} onPress={() => setIntensity(i)}
              style={[styles.intensityBtn, active && styles.intensityBtnActive]}>
              <Text style={[styles.intensityLabel, active && styles.intensityLabelActive]}>{i.toUpperCase()}</Text>
              <Text style={styles.intensitySub}>{INTENSITY_DESC[i]}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.section}>NOTIFICATIONS</Text>
      <View style={styles.toggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.toggleLabel}>Daily study reminder</Text>
          <Text style={styles.toggleSub}>Local notifications only. No data leaves the device.</Text>
        </View>
        <Switch
          value={settings.notificationsEnabled}
          onValueChange={setNotifications}
          trackColor={{ false: theme.colors.border, true: theme.colors.gold }}
          thumbColor={theme.colors.text}
        />
      </View>

      <Text style={styles.section}>EXAM DATES</Text>
      <Text style={styles.helperText}>Set target dates so the readiness engine can pace you. YYYY-MM-DD.</Text>
      {certDisplayOrder.map((cid) => {
        const pack = certPacks[cid]!;
        const lore = getCertLore(cid);
        return (
          <View key={cid} style={styles.examDateRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.examDateLabel}>{pack.meta.examCode}</Text>
              <Text style={styles.examDateSub}>{lore?.worldName}</Text>
            </View>
            <TextInput
              value={examDateDrafts[cid] ?? ''}
              onChangeText={(v) => setExamDateDrafts((d) => ({ ...d, [cid]: v }))}
              onBlur={() => commitExamDate(cid, examDateDrafts[cid] ?? '')}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.colors.textDim}
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.dateInput}
            />
          </View>
        );
      })}

      <Text style={styles.section}>CLOUD SYNC</Text>
      <View style={styles.toggleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.toggleLabel}>Supabase sync (optional)</Text>
          <Text style={styles.toggleSub}>Currently disabled. The app runs fully local.</Text>
        </View>
        <Text style={styles.comingSoon}>SOON</Text>
      </View>

      <Text style={styles.section}>DANGER ZONE</Text>
      <Pressable onPress={confirmReset} style={styles.dangerBtn}>
        <Text style={styles.dangerText}>RESET LOCAL PROGRESS</Text>
      </Pressable>

      <Text style={styles.footer}>CertQuest OS · v0.1 · local-first</Text>
    </ScrollView>
  );
}

const INTENSITY_DESC: Record<Intensity, string> = {
  chill: '~15 min · 3 tasks',
  normal: '~30 min · 5 tasks',
  aggressive: '~60 min · 8 tasks',
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700' },
  sub: { color: theme.colors.textDim, fontSize: 12, marginTop: 4, marginBottom: 16 },
  heroBox: { flexDirection: 'row', padding: 14, backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: theme.colors.text, fontSize: 16, fontWeight: '700' },
  statLabel: { color: theme.colors.textDim, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 2 },
  section: { color: theme.colors.text, fontSize: 11, letterSpacing: 1, marginTop: 20, marginBottom: 8, fontWeight: '600' },
  helperText: { color: theme.colors.textDim, fontSize: 11, marginBottom: 8, fontStyle: 'italic' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderColor: theme.colors.border, borderWidth: 1 },
  chipActive: { borderColor: theme.colors.gold, backgroundColor: theme.colors.bgElevated },
  chipText: { color: theme.colors.textDim, fontSize: 11, fontWeight: '600' },
  chipTextActive: { color: theme.colors.gold },
  intensityRow: { flexDirection: 'row', gap: 6 },
  intensityBtn: { flex: 1, padding: 12, borderColor: theme.colors.border, borderWidth: 1, alignItems: 'center' },
  intensityBtnActive: { borderColor: theme.colors.gold, backgroundColor: theme.colors.bgElevated },
  intensityLabel: { color: theme.colors.textDim, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  intensityLabelActive: { color: theme.colors.gold },
  intensitySub: { color: theme.colors.textDim, fontSize: 10, marginTop: 4, textAlign: 'center' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1 },
  toggleLabel: { color: theme.colors.text, fontSize: 14, fontWeight: '600' },
  toggleSub: { color: theme.colors.textDim, fontSize: 11, marginTop: 2 },
  comingSoon: { color: theme.colors.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  examDateRow: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 4 },
  examDateLabel: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  examDateSub: { color: theme.colors.textDim, fontSize: 10, marginTop: 2 },
  dateInput: { color: theme.colors.text, fontSize: 13, padding: 8, borderColor: theme.colors.border, borderWidth: 1, width: 130, fontFamily: 'Courier', textAlign: 'center' },
  dangerBtn: { padding: 14, borderColor: theme.colors.danger, borderWidth: 1, alignItems: 'center' },
  dangerText: { color: theme.colors.danger, fontWeight: '700', letterSpacing: 1 },
  footer: { color: theme.colors.textDim, fontSize: 10, textAlign: 'center', marginTop: 24 },
});
