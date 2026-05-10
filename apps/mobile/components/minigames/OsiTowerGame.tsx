import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { MiniGamePayload } from '@certquest/minigames';
import { theme } from '../../lib/theme';

const LAYERS = ['L1 Physical', 'L2 Data Link', 'L3 Network', 'L4 Transport', 'L5 Session', 'L6 Presentation', 'L7 Application'];

export function OsiTowerGame({ payload, responses, onChange }: {
  payload: MiniGamePayload;
  responses: Record<string, string>;
  onChange: (id: string, v: string) => void;
}) {
  return (
    <View>
      <Text style={styles.intro}>Assign each item to its OSI layer.</Text>
      {payload.items.map((item, idx) => {
        const selected = responses[item.id];
        return (
          <View key={item.id} style={styles.item}>
            <Text style={styles.itemNum}>Item {idx + 1}</Text>
            <Text style={styles.prompt}>{item.prompt}</Text>
            <View style={styles.layerGrid}>
              {LAYERS.map((layer) => {
                const isSelected = selected === layer;
                return (
                  <Pressable
                    key={layer}
                    onPress={() => onChange(item.id, layer)}
                    style={[styles.layer, isSelected && styles.layerSelected]}
                  >
                    <Text style={[styles.layerText, isSelected && styles.layerTextSelected]}>{layer}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { color: theme.colors.textDim, fontSize: 13, marginBottom: 16, fontStyle: 'italic' },
  item: { marginBottom: 18, padding: 12, backgroundColor: theme.colors.bgElevated, borderColor: theme.colors.border, borderWidth: 1 },
  itemNum: { color: theme.colors.gold, fontSize: 11, letterSpacing: 1, marginBottom: 4 },
  prompt: { color: theme.colors.text, fontSize: 14, marginBottom: 10 },
  layerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  layer: { paddingHorizontal: 10, paddingVertical: 6, borderColor: theme.colors.border, borderWidth: 1 },
  layerSelected: { borderColor: theme.colors.gold, backgroundColor: theme.colors.bg },
  layerText: { color: theme.colors.textDim, fontSize: 11 },
  layerTextSelected: { color: theme.colors.gold, fontWeight: '700' },
});
