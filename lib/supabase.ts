import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import "react-native-url-polyfill/auto";

const keychainOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key, keychainOptions),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value, keychainOptions),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key, keychainOptions),
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
