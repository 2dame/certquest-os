import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { theme } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }));
  const setActiveCert = useStore((s) => s.setActiveCert);

  useEffect(() => {
    // Check for an existing session on mount.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      } else {
        const meta = session.user?.user_metadata;
        if (meta?.activeCertId) setActiveCert(meta.activeCertId as string);
      }
    });

    // Listen for auth state changes (sign-in after OTP, sign-out, token refresh).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const meta = session.user?.user_metadata;
        if (meta?.activeCertId) setActiveCert(meta.activeCertId as string);
        router.replace('/(tabs)');
      }
      if (event === 'SIGNED_OUT') {
        router.replace('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.bg },
            headerTintColor: theme.colors.text,
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: theme.colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
          <Stack.Screen name="lesson/[id]" options={{ title: 'Lesson' }} />
          <Stack.Screen name="quiz/[id]" options={{ title: 'Quiz' }} />
          <Stack.Screen name="review" options={{ title: 'Flashcard Review' }} />
          <Stack.Screen name="boss/[id]" options={{ title: 'Boss Battle' }} />
          <Stack.Screen name="quest/[id]" options={{ title: 'Side Quest' }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
