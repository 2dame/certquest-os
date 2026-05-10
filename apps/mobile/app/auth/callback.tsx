import { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { theme } from '../../lib/theme';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ token_hash?: string; type?: string }>();

  useEffect(() => {
    const { token_hash, type } = params;
    if (!token_hash || !type) {
      router.replace('/login');
      return;
    }

    supabase.auth
      .verifyOtp({ token_hash, type: type as 'email' })
      .then(({ error }) => {
        if (error) {
          router.replace('/login');
        } else {
          router.replace('/(tabs)');
        }
      });
  }, [params.token_hash, params.type]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={theme.colors.gold} />
      <Text style={{ color: theme.colors.textMuted, marginTop: 16, fontSize: 13 }}>Signing in…</Text>
    </View>
  );
}
