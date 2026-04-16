import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "@/context/auth-context";
import { SessionProvider } from "@/context/session-context";
import { ThemeProvider as AppThemeProvider, useTheme } from "@/context/theme-context";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootNavigator() {
  const { isDark } = useTheme();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace("/(auth)/login");
    } else if (!profile || !profile.onboarding_completed) {
      router.replace("/onboarding");
    } else {
      router.replace("/(tabs)");
    }
  }, [session, profile, loading]);

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="session" options={{ headerShown: false }} />
        <Stack.Screen name="history" options={{ headerShown: false }} />
        <Stack.Screen name="progress" options={{ headerShown: false }} />
        <Stack.Screen name="social" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}
