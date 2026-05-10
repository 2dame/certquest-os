import { useState } from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { findLessonById, findObjectiveById, getCertLore } from '@certquest/content';
import { useStore } from '../../lib/store';
import { theme } from '../../lib/theme';

type Phase = 'intro' | 'reading' | 'check' | 'done';

export default function LessonRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const found = findLessonById(id ?? '');
  const completeLesson = useStore((s) => s.completeLesson);
  const [phase, setPhase] = useState<Phase>('intro');

  if (!found) {
    return <View style={styles.container}><Text style={styles.error}>Lesson "{id}" not found.</Text></View>;
  }

  const lesson = found.lesson;
  const pack = found.pack;
  const certId = pack.meta.id;
  const lore = getCertLore(certId);
  const obj = findObjectiveById(lesson.objectiveId)?.objective;
  const region = lore?.regions.find((r) => r.domainId === obj?.domainId);

  function handleComplete() {
    completeLesson({ lessonId: id!, certId, objectiveId: lesson.objectiveId, completedAt: new Date().toISOString() });
    setPhase('done');
  }

  if (phase === 'intro') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>{lore?.worldName}</Text>
        <Text style={styles.title}>{lesson.title}</Text>
        {region && (
          <View style={styles.regionBox}>
            <Text style={styles.regionLabel}>REGION</Text>
            <Text style={styles.regionName}>{region.regionName}</Text>
            <Text style={styles.regionDesc}>{region.description}</Text>
          </View>
        )}
        {lesson.loreIntro && (
          <View style={styles.loreBox}>
            <Text style={styles.loreLabel}>{lore?.mentor.name.toUpperCase()}</Text>
            <Text style={styles.loreScene}>{lesson.loreIntro.scene}</Text>
            <Text style={styles.mentorMsg}>"{lesson.loreIntro.mentorMessage}"</Text>
            <Text style={styles.missionLabel}>MISSION</Text>
            <Text style={styles.mission}>{lesson.loreIntro.missionObjective}</Text>
          </View>
        )}
        <Text style={styles.objective}>Objective: {obj?.title}</Text>
        <Text style={styles.estimate}>~{lesson.estimatedMinutes} minutes</Text>
        <Pressable onPress={() => setPhase('reading')} style={styles.primary}>
          <Text style={styles.primaryText}>BEGIN TRAINING</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (phase === 'reading') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>LESSON</Text>
        <Text style={styles.title}>{lesson.title}</Text>
        {lesson.blocks.map((block: any, i: number) => (
          <View key={i} style={styles.block}>
            <Text style={styles.blockKind}>{block.kind.replace(/_/g, ' ').toUpperCase()}</Text>
            <Text style={styles.blockBody}>{block.body}</Text>
          </View>
        ))}
        <Pressable onPress={() => setPhase('check')} style={styles.primary}>
          <Text style={styles.primaryText}>QUICK CHECK</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (phase === 'check') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>QUICK CHECK</Text>
        <Text style={styles.title}>Self-explain</Text>
        <Text style={styles.checkPrompt}>
          Without looking back, explain the key concept of this lesson in your own words. If you can do it, you understand it.
        </Text>
        <Pressable onPress={handleComplete} style={styles.primary}>
          <Text style={styles.primaryText}>I CAN EXPLAIN IT</Text>
        </Pressable>
        <Pressable onPress={() => setPhase('reading')} style={styles.secondary}>
          <Text style={styles.secondaryText}>Re-read the lesson</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>COMPLETE</Text>
      <Text style={styles.title}>Lesson complete</Text>
      <Text style={styles.body}>+20 XP earned. Mastery for {obj?.title} updated.</Text>
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
  title: { color: theme.colors.text, fontSize: 24, fontWeight: '700', marginBottom: 16 },
  regionBox: { padding: 12, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 12, backgroundColor: theme.colors.bgElevated },
  regionLabel: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1 },
  regionName: { color: theme.colors.text, fontSize: 16, fontWeight: '600', marginTop: 2 },
  regionDesc: { color: theme.colors.textDim, fontSize: 12, marginTop: 4, fontStyle: 'italic' },
  loreBox: { padding: 14, borderColor: theme.colors.gold, borderWidth: 1, marginBottom: 16, backgroundColor: theme.colors.bgElevated },
  loreLabel: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1 },
  loreScene: { color: theme.colors.text, fontSize: 13, marginTop: 6, lineHeight: 19 },
  mentorMsg: { color: theme.colors.text, fontSize: 14, fontStyle: 'italic', marginTop: 10, lineHeight: 20 },
  missionLabel: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1, marginTop: 12 },
  mission: { color: theme.colors.text, fontSize: 13, marginTop: 4, lineHeight: 19 },
  objective: { color: theme.colors.textDim, fontSize: 13, marginBottom: 4 },
  estimate: { color: theme.colors.textDim, fontSize: 12, marginBottom: 16 },
  block: { marginBottom: 16, padding: 12, backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1 },
  blockKind: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1, marginBottom: 6 },
  blockBody: { color: theme.colors.text, fontSize: 14, lineHeight: 21 },
  checkPrompt: { color: theme.colors.text, fontSize: 14, lineHeight: 22, marginBottom: 20 },
  body: { color: theme.colors.text, fontSize: 14, marginBottom: 20 },
  primary: { backgroundColor: theme.colors.gold, padding: 14, alignItems: 'center', marginTop: 12 },
  primaryText: { color: theme.colors.bg, fontWeight: '700', letterSpacing: 1 },
  secondary: { padding: 14, alignItems: 'center', marginTop: 6 },
  secondaryText: { color: theme.colors.textDim, fontSize: 13 },
});
