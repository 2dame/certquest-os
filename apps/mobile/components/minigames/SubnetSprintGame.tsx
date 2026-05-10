import { View, Text, TextInput, StyleSheet } from 'react-native';
import type { MiniGamePayload } from '@certquest/minigames';
import { theme } from '../../lib/theme';

export function SubnetSprintGame({ payload, responses, onChange }: {
  payload: MiniGamePayload;
  responses: Record<string, string>;
  onChange: (id: string, v: string) => void;
}) {
  return (
    <View>
      <Text style={styles.intro}>Type your answer. Speed counts. Accuracy counts more.</Text>
      {payload.items.map((item, idx) => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.itemNum}>Q{idx + 1}</Text>
          <Text style={styles.prompt}>{item.prompt}</Text>
          <TextInput
            value={responses[item.id] ?? ''}
            onChangeText={(v) => onChange(item.id, v)}
            placeholder="Your answer..."
            placeholderTextColor={theme.colors.textDim}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { color: theme.colors.textDim, fontSize: 13, marginBottom: 16, fontStyle: 'italic' },
  item: { marginBottom: 16, padding: 14, backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1 },
  itemNum: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  prompt: { color: theme.colors.text, fontSize: 14, marginBottom: 10 },
  input: { color: theme.colors.text, fontSize: 14, padding: 10, borderColor: theme.colors.border, borderWidth: 1, fontFamily: 'Courier' },
});
