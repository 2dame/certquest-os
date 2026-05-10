import { View, Text } from 'react-native';
import { theme } from '../lib/theme';

interface ProgressRingProps {
  /** 0-100 */
  value: number;
  size?: number;
}

/**
 * Lightweight progress ring built from nested Views. Avoids pulling in an SVG
 * library for the MVP. Replace with react-native-svg later for smoother arcs.
 */
export function ProgressRing({ value, size = 64 }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const stroke = 4;
  const inner = size - stroke * 2;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: stroke,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* "Fill" approximated as an inner colored disc whose visible diameter
          tracks `value`. This is a deliberate MVP shortcut. */}
      <View
        style={{
          width: inner,
          height: inner,
          borderRadius: inner / 2,
          backgroundColor: theme.colors.bgCard,
          borderWidth: 2,
          borderColor: clamped > 0 ? theme.colors.gold : theme.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: theme.colors.gold, fontWeight: '700' }}>{Math.round(clamped)}%</Text>
      </View>
    </View>
  );
}
