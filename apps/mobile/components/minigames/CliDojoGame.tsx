import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { MiniGamePayload } from '@certquest/minigames';
import { theme } from '../../lib/theme';

export function CliDojoGame({ payload, responses, onChange }: {
  payload: MiniGamePayload;
  responses: Record<string, string>;
  onChange: (id: string, v: string) => void;
}) {
  return (
    <View>
      <Text style={styles.intro}>Sensei Route is watching. Pick the correct command for each scenario.</Text>
      {payload.items.map((item, idx) => {
        const options = [item.answer, ...(item.distractors ?? [])];
        const selected = responses[item.id];
        return (
          <View key={item.id} style={styles.item}>
            <Text style={styles.scenario}>Scenario {idx + 1}</Text>
            <Text style={styles.prompt}>{item.prompt}</Text>
            {options.map((opt) => {
              const isSelected = selected === opt;
              return (
                <Pressable
                  key={opt}
                  onPress={() => onChange(item.id, opt)}
                  style={[styles.cmd, isSelected && styles.cmdSelected]}
                >
                  <Text style={[styles.prompt2, isSelected && { color: theme.colors.gold }]}>R1#</Text>
                  <Text style={[styles.cmdText, isSelected && styles.cmdTextSelected]}>{opt}</Text>
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { color: theme.colors.textDim, fontSize: 13, marginBottom: 16, fontStyle: 'italic' },
  item: { marginBottom: 18, padding: 14, backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1 },
  scenario: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  prompt: { color: theme.colors.text, fontSize: 14, marginBottom: 10 },
  cmd: { flexDirection: 'row', padding: 10, borderColor: theme.colors.border, borderWidth: 1, marginBottom: 6, backgroundColor: '#000' },
  cmdSelected: { borderColor: theme.colors.gold },
  prompt2: { color: theme.colors.textDim, fontFamily: 'Courier', fontSize: 12, marginRight: 6 },
  cmdText: { color: '#a0e0a0', fontFamily: 'Courier', fontSize: 12, flex: 1 },
  cmdTextSelected: { color: theme.colors.gold, fontWeight: '700' },
});
