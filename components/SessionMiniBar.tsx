import { useSession } from "@/context/session-context";
import { useTheme } from "@/context/theme-context";
import { formatTime } from "@/types/session";
import { router } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 49 : 56;

export default function SessionMiniBar() {
  const { isActive, sessionTitle, currentExerciseName, elapsed, restRemaining, restRunning } =
    useSession();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(120)).current;
  const wasActive = useRef(false);

  useEffect(() => {
    if (isActive && !wasActive.current) {
      // Slide in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 160,
      }).start();
    } else if (!isActive && wasActive.current) {
      // Slide out
      Animated.timing(slideAnim, {
        toValue: 120,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    wasActive.current = isActive;
  }, [isActive]);

  if (!isActive) return null;

  const bottomOffset = TAB_BAR_HEIGHT + insets.bottom;

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: bottomOffset + 8,
        transform: [{ translateY: slideAnim }],
        zIndex: 100,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 12,
      }}
    >
      <Pressable
        onPress={() => router.push("/session")}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.accent + "55",
          paddingVertical: 12,
          paddingHorizontal: 16,
          gap: 12,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        {/* Pulse dot */}
        <PulseDot color={colors.accent} />

        {/* Text info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{ color: colors.textMuted, fontSize: 10, letterSpacing: 0.8, marginBottom: 2 }}
            numberOfLines={1}
          >
            ENTRENANDO
          </Text>
          <Text
            style={{ color: colors.text, fontSize: 14, fontWeight: "700" }}
            numberOfLines={1}
          >
            {currentExerciseName || sessionTitle}
          </Text>
        </View>

        {/* Timer display */}
        <View style={{ alignItems: "flex-end", gap: 2 }}>
          {restRunning && restRemaining > 0 ? (
            <>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>DESCANSO</Text>
              <Text
                style={{
                  color: "#F59E0B",
                  fontSize: 16,
                  fontWeight: "700",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {formatTime(restRemaining)}
              </Text>
            </>
          ) : (
            <>
              <Text style={{ color: colors.textMuted, fontSize: 10 }}>TIEMPO</Text>
              <Text
                style={{
                  color: colors.accent,
                  fontSize: 16,
                  fontWeight: "700",
                  fontVariant: ["tabular-nums"],
                }}
              >
                {formatTime(elapsed)}
              </Text>
            </>
          )}
        </View>

        {/* Chevron */}
        <Text style={{ color: colors.textMuted, fontSize: 16 }}>›</Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Animated pulsing dot ───────────────────────────────────────────────────────
function PulseDot({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.4, duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.1, duration: 700, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 700, useNativeDriver: true }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={{ width: 20, height: 20, alignItems: "center", justifyContent: "center" }}>
      {/* Outer pulse ring */}
      <Animated.View
        style={{
          position: "absolute",
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
        }}
      />
      {/* Inner solid dot */}
      <View
        style={{
          width: 9,
          height: 9,
          borderRadius: 5,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
