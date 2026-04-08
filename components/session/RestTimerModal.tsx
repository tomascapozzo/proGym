import { formatTime } from "@/types/session";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

const REST_PRESETS = [30, 60, 90, 120];

type Props = {
  visible: boolean;
  restRemaining: number;
  restRunning: boolean;
  colors: any;
  onStart: (seconds: number) => void;
  onSkip: () => void;
  onAdjust: (delta: number) => void;
};

export default function RestTimerModal({
  visible,
  restRemaining,
  restRunning,
  colors,
  onStart,
  onSkip,
  onAdjust,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        onPress={onSkip}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.88)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Pressable>
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 24,
              padding: 28,
              alignItems: "center",
              width: 320,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 1, marginBottom: 16 }}>
              DESCANSO
            </Text>

            {/* Preset buttons */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 20, width: "100%" }}>
              {REST_PRESETS.map((s) => {
                const active = restRemaining === s && restRunning;
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => onStart(s)}
                    style={{
                      flex: 1,
                      paddingVertical: 9,
                      backgroundColor: active ? colors.accentBgAlt : colors.surface,
                      borderRadius: 10,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: active ? "#6EE7B7" : "#2A3547",
                    }}
                  >
                    <Text
                      style={{
                        color: active ? "#6EE7B7" : "#888",
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      {s < 60 ? `${s}s` : `${s / 60}min`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Countdown */}
            <Text
              style={{
                color: restRunning ? (restRemaining <= 5 ? "#EF4444" : "#6EE7B7") : "#888",
                fontSize: 72,
                fontWeight: "700",
                fontVariant: ["tabular-nums"],
                minWidth: 160,
                textAlign: "center",
              }}
            >
              {formatTime(restRemaining)}
            </Text>

            {/* Adjust buttons */}
            <View style={{ flexDirection: "row", gap: 16, marginTop: 20, marginBottom: 8 }}>
              <TouchableOpacity
                onPress={() => onAdjust(-15)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: colors.surface,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#2A3547",
                }}
              >
                <Text style={{ color: colors.textMuted, fontWeight: "700", fontSize: 14 }}>−15s</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onAdjust(15)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: colors.surface,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#2A3547",
                }}
              >
                <Text style={{ color: colors.textMuted, fontWeight: "700", fontSize: 14 }}>+15s</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={onSkip} style={{ padding: 10, marginTop: 8 }}>
              <Text style={{ color: colors.error, fontWeight: "600" }}>Saltar descanso</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
