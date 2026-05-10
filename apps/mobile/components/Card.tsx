import { View, type ViewStyle } from 'react-native';
import { theme } from '../lib/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.bgCard,
          borderColor: theme.colors.border,
          borderWidth: 1,
          padding: theme.space(4),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
