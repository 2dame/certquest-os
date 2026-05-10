import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { theme } from '../../lib/theme';
import { Card } from '../../components/Card';
import { certPacks } from '@certquest/content';

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const quiz = Object.values(certPacks).flatMap((p) => (p as any).quizzes ?? []).find((q: any) => q.id === id) as any;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  if (!quiz) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg, padding: theme.space(4) }}>
        <Text style={{ color: theme.colors.text }}>Quiz not found.</Text>
      </SafeAreaView>
    );
  }

  const question = quiz.questions[index];
  const isMultiSelect = question?.kind === 'multiple_select' || (question?.correctAnswerIds.length ?? 0) > 1;

  function toggle(choiceId: string) {
    if (revealed) return;
    setSelected((prev) =>
      isMultiSelect
        ? prev.includes(choiceId) ? prev.filter((c) => c !== choiceId) : [...prev, choiceId]
        : [choiceId],
    );
  }

  function reveal() {
    if (!question) return;
    const correct =
      selected.length === question.correctAnswerIds.length &&
      selected.every((s) => question.correctAnswerIds.includes(s));
    if (correct) setCorrectCount((c) => c + 1);
    setRevealed(true);
  }

  function next() {
    if (index + 1 >= quiz.questions.length) {
      setDone(true);
    } else {
      setIndex(index + 1);
      setSelected([]);
      setRevealed(false);
    }
  }

  if (done) {
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passThreshold;
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg, padding: theme.space(6), justifyContent: 'center' }}>
        <Text style={{ color: theme.colors.gold, fontSize: 11, letterSpacing: 2 }}>
          {passed ? 'QUIZ PASSED' : 'NOT YET PASSED'}
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 56, fontWeight: '700', marginTop: 12 }}>
          {score}%
        </Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 8 }}>
          {correctCount} of {quiz.questions.length} correct · pass at {quiz.passThreshold}%
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={{ backgroundColor: theme.colors.gold, padding: theme.space(4), marginTop: theme.space(6) }}
        >
          <Text style={{ color: theme.colors.bg, textAlign: 'center', fontWeight: '700' }}>RETURN</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!question) return null;

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: theme.space(4), gap: theme.space(3) }}>
        <Text style={{ color: theme.colors.textMuted, letterSpacing: 1 }}>
          QUESTION {index + 1} / {quiz.questions.length}
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 18, lineHeight: 26 }}>{question.prompt}</Text>

        {question.choices.map((c: any) => {
          const picked = selected.includes(c.id);
          const isCorrect = question.correctAnswerIds.includes(c.id);
          let borderColor: string = theme.colors.border;
          if (revealed) {
            borderColor = isCorrect
              ? theme.colors.success
              : picked
                ? theme.colors.danger
                : theme.colors.border;
          } else if (picked) {
            borderColor = theme.colors.gold;
          }
          return (
            <Pressable key={c.id} onPress={() => toggle(c.id)}>
              <Card style={{ borderColor }}>
                <Text style={{ color: theme.colors.text }}>{c.text}</Text>
                {revealed && (
                  <Text style={{
                    color: isCorrect ? theme.colors.success : theme.colors.textMuted,
                    marginTop: 8, fontSize: 13,
                  }}>
                    {isCorrect
                      ? question.explanationCorrect
                      : question.explanationIncorrect[c.id] ?? ''}
                  </Text>
                )}
              </Card>
            </Pressable>
          );
        })}

        {revealed && question.examTrap && (
          <Card style={{ borderColor: theme.colors.warning }}>
            <Text style={{ color: theme.colors.warning, fontSize: 11, letterSpacing: 1 }}>EXAM TRAP</Text>
            <Text style={{ color: theme.colors.text, marginTop: 6 }}>{question.examTrap}</Text>
          </Card>
        )}

        {!revealed ? (
          <Pressable
            onPress={reveal}
            disabled={selected.length === 0}
            style={{
              backgroundColor: selected.length ? theme.colors.gold : theme.colors.border,
              padding: theme.space(4),
            }}
          >
            <Text style={{ color: theme.colors.bg, textAlign: 'center', fontWeight: '700' }}>
              SUBMIT
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={next}
            style={{ backgroundColor: theme.colors.gold, padding: theme.space(4) }}
          >
            <Text style={{ color: theme.colors.bg, textAlign: 'center', fontWeight: '700' }}>
              {index + 1 >= quiz.questions.length ? 'FINISH' : 'NEXT'}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
