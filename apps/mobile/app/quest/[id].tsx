import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemo, useState } from 'react';
import { theme } from '../../lib/theme';
import { Card } from '../../components/Card';
import { certPacks } from '@certquest/content';
import type { SideQuestEntry } from '@certquest/content';

interface CableItem {
  id: string;
  label: string;
  answer: string;
  distractors: string[];
}

export default function SideQuestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const quest = Object.values(certPacks).flatMap((p) => p.sideQuests).find((q) => q.id === id) as SideQuestEntry | undefined;

  // Build answer choices once per quest load.
  const items = useMemo<CableItem[]>(
    () => (quest?.payload?.items as CableItem[] | undefined) ?? [],
    [quest],
  );

  const [picks, setPicks] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!quest) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg, padding: theme.space(4) }}>
        <Text style={{ color: theme.colors.text }}>Side quest not found.</Text>
      </SafeAreaView>
    );
  }

  const correctCount = items.filter((it) => picks[it.id] === it.answer).length;
  const score = items.length === 0 ? 0 : Math.round((correctCount / items.length) * 100);
  const passThreshold = (quest.payload?.passThreshold as number) ?? 80;

  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: theme.space(4), gap: theme.space(3) }}>
        <Text style={{ color: theme.colors.gold, fontSize: 11, letterSpacing: 2 }}>SIDE QUEST</Text>
        <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: '700' }}>{quest.title}</Text>
        <Text style={{ color: theme.colors.textMuted, lineHeight: 22 }}>{quest.story}</Text>

        {items.map((it) => {
          const choices = shuffleStable([it.answer, ...it.distractors], it.id);
          return (
            <Card key={it.id}>
              <Text style={{ color: theme.colors.text, fontSize: 15 }}>{it.label}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                {choices.map((c) => {
                  const picked = picks[it.id] === c;
                  const isCorrect = c === it.answer;
                  let border: string = theme.colors.border;
                  if (submitted) {
                    border = isCorrect ? theme.colors.success : picked ? theme.colors.danger : theme.colors.border;
                  } else if (picked) {
                    border = theme.colors.gold;
                  }
                  return (
                    <Pressable
                      key={c}
                      disabled={submitted}
                      onPress={() => setPicks((p) => ({ ...p, [it.id]: c }))}
                      style={{
                        borderWidth: 1,
                        borderColor: border,
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                      }}
                    >
                      <Text style={{ color: theme.colors.text, fontSize: 13 }}>{c}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          );
        })}

        {!submitted ? (
          <Pressable
            onPress={() => setSubmitted(true)}
            disabled={Object.keys(picks).length < items.length}
            style={{
              backgroundColor: Object.keys(picks).length < items.length ? theme.colors.border : theme.colors.gold,
              padding: theme.space(4),
            }}
          >
            <Text style={{ color: theme.colors.bg, textAlign: 'center', fontWeight: '700' }}>SUBMIT</Text>
          </Pressable>
        ) : (
          <Card>
            <Text style={{ color: theme.colors.gold, fontSize: 11, letterSpacing: 2 }}>
              {score >= passThreshold ? 'QUEST CLEARED' : 'TRY AGAIN'}
            </Text>
            <Text style={{ color: theme.colors.text, fontSize: 32, fontWeight: '700', marginTop: 8 }}>
              {score}%
            </Text>
            <Text style={{ color: theme.colors.textMuted, marginTop: 4 }}>
              {correctCount} of {items.length} correct
            </Text>
            <Pressable
              onPress={() => router.back()}
              style={{ backgroundColor: theme.colors.gold, padding: theme.space(3), marginTop: theme.space(3) }}
            >
              <Text style={{ color: theme.colors.bg, textAlign: 'center', fontWeight: '700' }}>RETURN</Text>
            </Pressable>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Deterministic shuffle keyed by item id so the order is stable per render.
function shuffleStable<T>(arr: T[], key: string): T[] {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return [...arr].sort((a, b) => {
    const ha = (h ^ String(a).length) & 0xff;
    const hb = (h ^ String(b).length * 7) & 0xff;
    return ha - hb;
  });
}
