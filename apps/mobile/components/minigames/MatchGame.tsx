import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { MiniGamePayload } from '@certquest/minigames';
import { theme } from '../../lib/theme';

export interface MatchGameProps {
  payload: MiniGamePayload;
  responses: Record<string, string>;
  onChange: (itemId: string, value: string) => void;
}

/**
 * Generic match-the-answer UI. Each item has a prompt and a list of options
 * (answer + distractors, shuffled). User taps to select. Used by:
 * - cable_crafter, port_lockpick, service_sorter, packet_detective,
 *   troubleshooting_sequence, acronym_blitz, cloud_architect
 */
export function MatchGame({ payload, responses, onChange }: MatchGameProps) {
  return (
    <View>
      {payload.items.map((item, idx) => {
        const options = shuffleStable([item.answer, ...(item.distractors ?? [])], item.id);
        const selected = responses[item.id];
        return (
          <View key={item.id} style={styles.item}>
            <Text style={styles.itemNumber}>Item {idx + 1}</Text>
            <Text style={styles.prompt}>{item.prompt}</Text>
            {options.map((opt) => {
              const isSelected = selected === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => onChange(item.id, opt)}
                  style={[styles.option, isSelected && styles.optionSelected]}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

/** Stable shuffle so options don't reshuffle on every render. */
function shuffleStable<T>(arr: T[], seed: string): T[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    h = (h * 1664525 + 1013904223) | 0;
    const j = ((h >>> 0) % (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

const styles = StyleSheet.create({
  item: { marginBottom: 20, padding: 14, backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1 },
  itemNumber: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  prompt: { color: theme.colors.text, fontSize: 14, marginBottom: 10, lineHeight: 20 },
  option: { padding: 10, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 6 },
  optionSelected: { borderColor: theme.colors.gold, backgroundColor: theme.colors.bg },
  optionText: { color: theme.colors.text, fontSize: 13 },
  optionTextSelected: { color: theme.colors.gold, fontWeight: '600' },
});
