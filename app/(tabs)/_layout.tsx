import SessionMiniBar from "@/components/SessionMiniBar";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useTheme } from "@/context/theme-context";
import { Tabs } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textDisabled,
          tabBarStyle: { backgroundColor: colors.tabBg, borderTopColor: colors.tabBorder },
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="train"
          options={{
            title: "Entrenar",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="dumbbell.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen name="history" options={{ href: null }} />
        <Tabs.Screen name="progress" options={{ href: null }} />
        <Tabs.Screen name="social" options={{ href: null }} />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Perfil",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={26} name="person.fill" color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Persistent session mini bar — shown above the tab bar when a session is active */}
      <SessionMiniBar />
    </View>
  );
}
