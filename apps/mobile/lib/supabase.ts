import { createSupabaseClient } from '@certquest/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const url = (Constants.expoConfig?.extra?.SUPABASE_URL as string) ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = (Constants.expoConfig?.extra?.SUPABASE_ANON_KEY as string) ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createSupabaseClient(
  { url, anonKey },
  { storage: AsyncStorage, detectSessionInUrl: false },
);
