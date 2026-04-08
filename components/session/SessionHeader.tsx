import { formatTime } from "@/types/session";
import React from "react";
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from "react-native";

type Props = {
  dayTitle: string;
  completedSets: number;
  elapsed: number;
  saving: boolean;
  colors: any;
  onFinish: () => void;
};

export default function SessionHeader({ dayTitle, completedSets, elapsed, saving, colors, onFinish }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: Platform.OS === "ios" ? 60 : 40,
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: colors.bg,
        borderBottomWidth: 1,
        borderBottomColor: colors.tabBorder,
      }}
    >
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
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>
              Terminar
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
