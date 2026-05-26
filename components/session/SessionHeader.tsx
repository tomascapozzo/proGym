import { formatTime } from "@/types/session";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  dayTitle: string;
  completedSets: number;
  elapsed: number;
  saving: boolean;
  colors: any;
  onFinish: () => void;
  onMinimize: () => void;
  onCancel: () => void;
};

export default function SessionHeader({
  dayTitle,
  completedSets,
  elapsed,
  saving,
  colors,
  onFinish,
  onMinimize,
  onCancel,
}: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: colors.bg,
        borderBottomWidth: 1,
        borderBottomColor: colors.tabBorder,
      }}
    >
      {/* Minimize pill */}
      <TouchableOpacity
        onPress={onMinimize}
        style={{
          alignSelf: "center",
          marginBottom: 14,
          paddingHorizontal: 20,
          paddingVertical: 6,
          borderRadius: 20,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <View
          style={{
            width: 28,
            height: 3,
            borderRadius: 2,
            backgroundColor: colors.textMuted,
          }}
        />
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>Minimizar</Text>
      </TouchableOpacity>

      {/* Main header row */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View>
          <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 1 }}>
            ENTRENANDO
          </Text>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: "700", marginTop: 2 }}>
            {dayTitle}
          </Text>
          {completedSets > 0 && (
            <Text style={{ color: colors.accent, fontSize: 11, marginTop: 2 }}>
              {completedSets} serie{completedSets !== 1 ? "s" : ""} completada
              {completedSets !== 1 ? "s" : ""}
            </Text>
          )}
          <TouchableOpacity
            onPress={onCancel}
            disabled={saving}
            hitSlop={{ top: 6, bottom: 6, left: 0, right: 16 }}
            style={{ marginTop: 6 }}
          >
            <Text style={{ color: colors.error, fontSize: 12 }}>Descartar sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              color: colors.accent,
              fontSize: 24,
              fontWeight: "700",
              fontVariant: ["tabular-nums"],
            }}
          >
            {formatTime(elapsed)}
          </Text>
          <TouchableOpacity
            onPress={onFinish}
            disabled={saving}
            style={{
              backgroundColor: "#EF4444",
              paddingHorizontal: 16,
              paddingVertical: 7,
              borderRadius: 8,
              marginTop: 6,
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={{ color: "white", fontWeight: "700", fontSize: 13 }}>
                Terminar
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
