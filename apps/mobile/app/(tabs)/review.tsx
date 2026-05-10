import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { theme } from '../../lib/theme';
import { certPacks } from '@certquest/content';
import { useStore } from '../../lib/store';
import type { ReviewRating } from '@certquest/types';

const SESSION_SIZE = 12;

export default function ReviewScreen() {
  const activeCertId = useStore((s) => s.activeCertId);
  const cards = useMemo(
    () => (certPacks[activeCertId ?? '']?.flashcards ?? []).slice(0, SESSION_SIZE),
    [activeCertId],
  );
  const [index, setIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const card = cards[index];

  function rate(rating: ReviewRating) {
    setStats((s) => ({ ...s, [rating]: s[rating] + 1 }));
    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex(index + 1);
      setShowBack(false);
    }
  }

  if (done || !card) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.bg, justifyContent: 'center', alignItems: 'center', padding: theme.space(6) }}>
        <Text style={{ color: theme.colors.gold, fontSize: 11, letterSpacing: 2 }}>SESSION COMPLETE</Text>
        <Text style={{ color: theme.colors.text, fontSize: 26, fontWeight: '700', marginTop: 12 }}>Queue cleared.</Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 8 }}>
          Again {stats.again} · Hard {stats.hard} · Good {stats.good} · Easy {stats.easy}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: theme.colors.bg, padding: theme.space(4) }}>
      <Text style={{ color: theme.colors.textMuted, letterSpacing: 1 }}>
        CARD {index + 1} / {cards.length}
      </Text>
      <View style={{
        flex: 1,
        backgroundColor: theme.colors.bgCard,
        borderColor: theme.colors.border,
        borderWidth: 1,
        marginTop: theme.space(3),
        padding: theme.space(5),
        justifyContent: 'center',
      }}>
        <Text style={{ color: theme.colors.gold, fontSize: 11, letterSpacing: 1 }}>
          {card.kind.toUpperCase()}
        </Text>
        <Text style={{ color: theme.colors.text, fontSize: 22, marginTop: 12, lineHeight: 30 }}>
          {card.front}
        </Text>
        {showBack && (
          <View style={{ marginTop: theme.space(5), borderTopWidth: 1, borderTopColor: theme.colors.border, paddingTop: theme.space(4) }}>
            <Text style={{ color: theme.colors.textMuted, fontSize: 11, letterSpacing: 1 }}>ANSWER</Text>
            <Text style={{ color: theme.colors.text, fontSize: 18, marginTop: 8, lineHeight: 26 }}>{card.back}</Text>
          </View>
        )}
      </View>

      {!showBack ? (
        <Pressable
          onPress={() => setShowBack(true)}
          style={{ backgroundColor: theme.colors.gold, padding: theme.space(4), marginTop: theme.space(3) }}
        >
          <Text style={{ color: theme.colors.bg, textAlign: 'center', fontWeight: '700' }}>SHOW ANSWER</Text>
        </Pressable>
      ) : (
        <View style={{ flexDirection: 'row', gap: theme.space(2), marginTop: theme.space(3) }}>
          {(['again', 'hard', 'good', 'easy'] as ReviewRating[]).map((r) => (
            <Pressable
              key={r}
              onPress={() => rate(r)}
              style={{
                flex: 1,
                padding: theme.space(3),
                borderWidth: 1,
                borderColor: r === 'again' ? theme.colors.danger : r === 'hard' ? theme.colors.warning : r === 'good' ? theme.colors.success : theme.colors.gold,
              }}
            >
              <Text style={{ color: theme.colors.text, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1, fontSize: 12 }}>{r}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}
