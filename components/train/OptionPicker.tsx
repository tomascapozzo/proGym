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

interface OptionPickerProps {
  value: string;
  onChange(v: string): void;
  options: string[];
  title: string;
  triggerWidth?: number;
}

export default function OptionPicker({
  value,
  onChange,
  options,
  title,
  triggerWidth,
}: OptionPickerProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
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
                maxHeight: 380,
              }}
            >
              <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
                <View
                  style={{
                    width: 36,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: colors.border,
                    marginBottom: 12,
                  }}
                />
                <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 1 }}>
                  {title.toUpperCase()}
                </Text>
              </View>

              <ScrollView>
                {options.map((opt) => {
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
