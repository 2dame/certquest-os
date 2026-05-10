import { useState } from 'react';
import { Text, View, TextInput, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '../lib/theme';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function sendLink() {
    if (!email.includes('@')) {
      Alert.alert('Enter a valid email.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'certquest://auth/callback' },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Sign in failed', error.message);
      return;
    }
    setSent(true);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1, justifyContent: 'center', padding: theme.space(6) }}>
        <Text style={{ color: theme.colors.gold, fontSize: 11, letterSpacing: 3 }}>CERTQUEST OS</Text>
        <Text style={{ color: theme.colors.text, fontSize: 36, fontWeight: '700', marginTop: 16 }}>
          Welcome back, recruit.
        </Text>
        <Text style={{ color: theme.colors.textMuted, marginTop: 12, lineHeight: 22 }}>
          Enter your email and we'll send you a magic link to sign in.
        </Text>

        {sent ? (
          <View style={{ marginTop: theme.space(8) }}>
            <Text style={{ color: theme.colors.gold, letterSpacing: 1, fontSize: 11 }}>LINK SENT</Text>
            <Text style={{ color: theme.colors.text, marginTop: 12, lineHeight: 22 }}>
              Check {email} and tap the link to finish signing in.
            </Text>
            <Pressable
              onPress={() => router.replace('/(tabs)')}
              style={{ backgroundColor: theme.colors.gold, padding: theme.space(4), marginTop: theme.space(6) }}
            >
              <Text style={{ color: theme.colors.bg, textAlign: 'center', fontWeight: '700', letterSpacing: 1 }}>
                CONTINUE
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.textDim}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
                padding: 14,
                marginTop: theme.space(6),
              }}
            />
            <Pressable
              onPress={sendLink}
              disabled={loading}
              style={{
                backgroundColor: loading ? theme.colors.border : theme.colors.gold,
                padding: theme.space(4),
                marginTop: theme.space(3),
              }}
            >
              <Text style={{ color: theme.colors.bg, textAlign: 'center', fontWeight: '700', letterSpacing: 1 }}>
                {loading ? 'SENDING...' : 'SEND LINK'}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
