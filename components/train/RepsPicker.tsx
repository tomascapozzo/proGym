import { useTheme } from "@/context/theme-context";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Tab = "reps" | "rango" | "tiempo";

const TABS: { id: Tab; label: string }[] = [
  { id: "reps", label: "Reps" },
  { id: "rango", label: "Rango" },
  { id: "tiempo", label: "Tiempo" },
];

const OPTIONS: Record<Tab, string[]> = {
  reps: [
    "Fallo",
    "AMRAP",
    ...Array.from({ length: 30 }, (_, i) => String(i + 1)),
  ],
  rango: [
    "1-3", "2-4", "3-5", "4-6", "5-7", "5-8",
    "6-8", "6-10", "8-10", "8-12", "10-12",
    "10-15", "12-15", "15-20", "20-25", "20-30",
  ],
  tiempo: [
    "10s", "15s", "20s", "25s", "30s", "40s",
    "45s", "60s", "75s", "90s", "2min", "3min",
  ],
};

function tabForValue(value: string): Tab {
  if (/\d+(s|min)$/.test(value)) return "tiempo";
  if (/-/.test(value)) return "rango";
  return "reps";
}

interface RepsPickerProps {
  value: string;
  onChange(v: string): void;
  triggerWidth?: number;
}

export default function RepsPicker({ value, onChange, triggerWidth }: RepsPickerProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("reps");

  const handleOpen = () => {
    setTab(tabForValue(value));
    setOpen(true);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleOpen}
        style={{
          backgroundColor: colors.accent,
          borderRadius: 8,
          paddingVertical: 8,
          paddingHorizontal: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          alignSelf: triggerWidth ? undefined : "flex-start",
          width: triggerWidth,
        }}
      >
        <Text style={{ color: colors.accentText, fontSize: 12, fontWeight: "700" }}>
          {value || "—"}
        </Text>
        <Text style={{ color: colors.accentText, fontSize: 9 }}>▼</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" presentationStyle="overFullScreen">
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
          onPress={() => setOpen(false)}
        >
          <Pressable>
            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: colors.border,
                maxHeight: 440,
              }}
            >
              {/* Handle */}
              <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 12 }}>
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.border,
                  }}
                />
              </View>

              {/* Tabs */}
              <View
                style={{
                  flexDirection: "row",
                  marginHorizontal: 20,
                  marginBottom: 8,
                  backgroundColor: colors.surface,
                  borderRadius: 10,
                  padding: 3,
                }}
              >
                {TABS.map(({ id, label }) => {
                  const active = tab === id;
                  return (
                    <TouchableOpacity
                      key={id}
                      onPress={() => setTab(id)}
                      style={{
                        flex: 1,
                        paddingVertical: 7,
                        borderRadius: 8,
                        alignItems: "center",
                        backgroundColor: active ? colors.card : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: active ? colors.text : colors.textMuted,
                          fontSize: 13,
                          fontWeight: active ? "700" : "400",
                        }}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <ScrollView>
                {OPTIONS[tab].map((opt) => {
                  const active = value === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => { onChange(opt); setOpen(false); }}
                      style={{
                        paddingVertical: 15,
                        paddingHorizontal: 24,
                        backgroundColor: active ? colors.accentBg : "transparent",
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          color: active ? colors.accent : colors.text,
                          fontSize: 17,
                          fontWeight: active ? "700" : "400",
                        }}
                      >
                        {opt}
                      </Text>
                      {active && <Text style={{ color: colors.accent, fontSize: 16 }}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: Platform.OS === "ios" ? 34 : 16 }} />
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
