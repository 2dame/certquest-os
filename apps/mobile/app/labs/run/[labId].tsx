import { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getProofLabsForCert } from '@certquest/content';
import { useStore } from '../../../lib/store';
import { theme } from '../../../lib/theme';

type Phase = 'intro' | 'task' | 'complete';

export default function LabRunnerScreen() {
  const { labId, certId } = useLocalSearchParams<{ labId: string; certId: string }>();
  const labs = getProofLabsForCert(certId ?? '');
  const lab = labs.find((l) => l.id === labId);

  const startLab = useStore((s) => s.startLab);
  const recordLabTask = useStore((s) => s.recordLabTask);
  const completeLab = useStore((s) => s.completeLab);
  const getLabStatus = useStore((s) => s.getLabStatus);

  const [phase, setPhase] = useState<Phase>('intro');
  const [taskIndex, setTaskIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    if (!lab || !certId) return;
    const status = getLabStatus(lab.id);
    if (status === 'completed') {
      setXpEarned(lab.xpReward);
      setPhase('complete');
    } else {
      startLab(lab.id, certId);
    }
  }, [lab, certId, getLabStatus, startLab]);

  if (!lab) {
    return (
      <View style={s.container}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>{'< Back'}</Text>
        </Pressable>
        <Text style={s.error}>Lab not found. Check that certId was passed as a query parameter.</Text>
      </View>
    );
  }

  const totalTasks = lab.tasks.length;
  const task = lab.tasks[taskIndex];

  const handleSubmitTask = () => {
    if (!task) return;
    recordLabTask(lab.id, {
      taskId: task.id,
      completed: true,
      submittedAt: new Date().toISOString(),
      userAnswer: answer.trim() || undefined,
    });
    setAnswer('');
    setShowHint(false);
    if (taskIndex + 1 >= totalTasks) {
      completeLab(lab.id);
      setXpEarned(lab.xpReward);
      setPhase('complete');
    } else {
      setTaskIndex((i) => i + 1);
    }
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <Pressable onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>{'< Back'}</Text>
        </Pressable>

        <Text style={s.worldTag}>PROOF LAB</Text>
        <Text style={s.title}>{lab.title}</Text>
        <Text style={s.meta}>{lab.estimatedMinutes} min · {lab.difficulty} · {lab.xpReward} XP</Text>

        <View style={s.loreBox}>
          <Text style={s.loreText}>{lab.loreNarration}</Text>
        </View>

        <Text style={s.section}>LEARNING OBJECTIVES</Text>
        {lab.learningObjectives.map((obj, i) => (
          <Text key={i} style={s.listItem}>· {obj}</Text>
        ))}

        <Text style={s.section}>TOOLS NEEDED</Text>
        {lab.tools.map((tool, i) => (
          <View key={i} style={s.toolRow}>
            <Text style={s.toolName}>{tool.name}</Text>
            {tool.notes ? <Text style={s.toolNote}>{tool.notes}</Text> : null}
          </View>
        ))}

        {lab.setup ? (
          <>
            <Text style={s.section}>SETUP</Text>
            <Text style={s.bodyText}>{lab.setup}</Text>
          </>
        ) : null}

        <Text style={s.taskCount}>{totalTasks} task{totalTasks !== 1 ? 's' : ''} ahead.</Text>

        <Pressable style={s.primaryBtn} onPress={() => setPhase('task')}>
          <Text style={s.primaryBtnText}>BEGIN LAB</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ── COMPLETE ───────────────────────────────────────────────────────────────
  if (phase === 'complete') {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <Text style={s.worldTag}>LAB COMPLETE</Text>
        <Text style={s.title}>{lab.title}</Text>

        <View style={s.xpBox}>
          <Text style={s.xpLabel}>XP EARNED</Text>
          <Text style={s.xpValue}>+{xpEarned}</Text>
        </View>

        {lab.commonMistakes.length > 0 && (
          <>
            <Text style={s.section}>COMMON MISTAKES TO REVIEW</Text>
            {lab.commonMistakes.map((mistake, i) => (
              <View key={i} style={s.mistakeRow}>
                <Text style={s.mistakeBullet}>!</Text>
                <Text style={s.mistakeText}>{mistake}</Text>
              </View>
            ))}
          </>
        )}

        {lab.troubleshooting && lab.troubleshooting.length > 0 && (
          <>
            <Text style={s.section}>TROUBLESHOOTING GUIDE</Text>
            {lab.troubleshooting.map((item, i) => (
              <View key={i} style={s.troubleshootCard}>
                <Text style={s.symptomText}>Symptom: {item.symptom}</Text>
                <Text style={s.fixText}>Fix: {item.fix}</Text>
              </View>
            ))}
          </>
        )}

        <Pressable style={s.primaryBtn} onPress={() => router.back()}>
          <Text style={s.primaryBtnText}>RETURN TO LABS</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // ── TASK ───────────────────────────────────────────────────────────────────
  if (!task) return null;

  const needsTextInput = (
    task.verificationKind === 'output_match' ||
    task.verificationKind === 'calculation' ||
    task.verificationKind === 'free_response'
  );
  const submitDisabled = needsTextInput && answer.trim().length === 0;

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      keyboardShouldPersistTaps="handled"
    >
      <Pressable onPress={() => router.back()} style={s.backBtn}>
        <Text style={s.backText}>{'< Back'}</Text>
      </Pressable>

      <View style={s.progressRow}>
        <Text style={s.progressLabel}>Task {taskIndex + 1} of {totalTasks}</Text>
        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${(taskIndex / totalTasks) * 100}%` as any }]} />
        </View>
      </View>

      <Text style={s.taskKind}>{task.verificationKind.replace(/_/g, ' ').toUpperCase()}</Text>
      <Text style={s.taskPrompt}>{task.prompt}</Text>

      {task.reasoningRequired && (
        <Text style={s.reasoningNote}>Explain your reasoning in your answer.</Text>
      )}

      {needsTextInput && (
        <TextInput
          style={s.textInput}
          value={answer}
          onChangeText={setAnswer}
          placeholder={
            task.verificationKind === 'calculation'
              ? 'Enter your calculated value...'
              : 'Paste output or describe what you observe...'
          }
          placeholderTextColor={theme.colors.textDim}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      )}

      {task.hint ? (
        <Pressable style={s.hintBtn} onPress={() => setShowHint((v) => !v)}>
          <Text style={s.hintBtnText}>{showHint ? 'HIDE HINT' : 'SHOW HINT'}</Text>
        </Pressable>
      ) : null}

      {showHint && task.hint ? (
        <View style={s.hintBox}>
          <Text style={s.hintText}>{task.hint}</Text>
        </View>
      ) : null}

      {task.expected ? (
        <View style={s.expectedBox}>
          <Text style={s.expectedLabel}>EXPECTED RESULT</Text>
          <Text style={s.expectedText}>{task.expected}</Text>
        </View>
      ) : null}

      <Pressable
        style={[s.primaryBtn, submitDisabled && s.primaryBtnDisabled]}
        onPress={handleSubmitTask}
        disabled={submitDisabled}
      >
        <Text style={s.primaryBtnText}>
          {taskIndex + 1 === totalTasks ? 'COMPLETE LAB' : 'SUBMIT & NEXT'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 20, paddingBottom: 60 },
  error: { color: theme.colors.text, padding: 20, lineHeight: 22 },
  backBtn: { paddingVertical: 6, marginBottom: 8 },
  backText: { color: theme.colors.gold, fontSize: 13 },
  worldTag: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '700', marginTop: 4, marginBottom: 6 },
  meta: { color: theme.colors.textDim, fontSize: 12, marginBottom: 16 },
  loreBox: {
    padding: 14, borderColor: theme.colors.gold, borderWidth: 1,
    backgroundColor: theme.colors.bgElevated, marginBottom: 20,
  },
  loreText: { color: theme.colors.text, fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  section: {
    color: theme.colors.text, fontSize: 11, letterSpacing: 1,
    marginTop: 16, marginBottom: 8, fontWeight: '600',
  },
  listItem: { color: theme.colors.textDim, fontSize: 13, marginBottom: 4, lineHeight: 18 },
  toolRow: { marginBottom: 8 },
  toolName: { color: theme.colors.text, fontSize: 13, fontWeight: '600' },
  toolNote: { color: theme.colors.textDim, fontSize: 12, marginTop: 2, lineHeight: 17 },
  bodyText: { color: theme.colors.textDim, fontSize: 13, lineHeight: 19 },
  taskCount: {
    color: theme.colors.textMuted, fontSize: 12, marginTop: 20, marginBottom: 20, textAlign: 'center',
  },
  primaryBtn: { backgroundColor: theme.colors.gold, padding: 16, alignItems: 'center', marginTop: 8 },
  primaryBtnDisabled: { opacity: 0.35 },
  primaryBtnText: { color: theme.colors.bg, fontSize: 14, fontWeight: '700', letterSpacing: 1 },
  xpBox: {
    padding: 24, borderColor: theme.colors.gold, borderWidth: 2,
    alignItems: 'center', marginVertical: 24, backgroundColor: theme.colors.bgElevated,
  },
  xpLabel: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1 },
  xpValue: { color: theme.colors.gold, fontSize: 48, fontWeight: '700', marginTop: 4 },
  mistakeRow: {
    flexDirection: 'row', marginBottom: 8,
    backgroundColor: theme.colors.bgCard, padding: 10,
  },
  mistakeBullet: { color: theme.colors.warning, fontSize: 14, fontWeight: '700', marginRight: 8, marginTop: 1 },
  mistakeText: { color: theme.colors.textDim, fontSize: 13, flex: 1, lineHeight: 18 },
  troubleshootCard: {
    padding: 12, borderColor: theme.colors.border, borderWidth: 1,
    marginBottom: 8, backgroundColor: theme.colors.bgElevated,
  },
  symptomText: { color: theme.colors.warning, fontSize: 12, fontWeight: '600' },
  fixText: { color: theme.colors.textDim, fontSize: 12, marginTop: 4, lineHeight: 17 },
  progressRow: { marginBottom: 16 },
  progressLabel: { color: theme.colors.textDim, fontSize: 12, marginBottom: 6 },
  progressTrack: { height: 3, backgroundColor: theme.colors.bgCard },
  progressFill: { height: 3, backgroundColor: theme.colors.gold },
  taskKind: { color: theme.colors.gold, fontSize: 10, letterSpacing: 1, marginBottom: 8 },
  taskPrompt: { color: theme.colors.text, fontSize: 16, lineHeight: 24, fontWeight: '500', marginBottom: 14 },
  reasoningNote: { color: theme.colors.warning, fontSize: 12, marginBottom: 12, fontStyle: 'italic' },
  textInput: {
    borderColor: theme.colors.border, borderWidth: 1, color: theme.colors.text,
    backgroundColor: theme.colors.bgElevated, padding: 12, fontSize: 13,
    lineHeight: 19, minHeight: 110, marginBottom: 12,
  },
  hintBtn: {
    borderColor: theme.colors.gold, borderWidth: 1,
    paddingVertical: 8, paddingHorizontal: 16,
    alignSelf: 'flex-start', marginBottom: 10,
  },
  hintBtnText: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1 },
  hintBox: {
    padding: 12, backgroundColor: theme.colors.bgCard,
    borderColor: theme.colors.border, borderWidth: 1, marginBottom: 12,
  },
  hintText: { color: theme.colors.textDim, fontSize: 13, lineHeight: 18, fontStyle: 'italic' },
  expectedBox: {
    padding: 12, backgroundColor: theme.colors.bgCard,
    borderColor: theme.colors.border, borderWidth: 1, marginBottom: 16,
  },
  expectedLabel: { color: theme.colors.textDim, fontSize: 10, letterSpacing: 1, marginBottom: 4 },
  expectedText: { color: theme.colors.text, fontSize: 13, lineHeight: 18 },
});
