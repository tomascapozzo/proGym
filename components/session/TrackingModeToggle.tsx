import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  trackingMode: "simple" | "detailed";
  colors: any;
  onChange: (mode: "simple" | "detailed") => void;
};

export default function TrackingModeToggle({ trackingMode, colors, onChange }: Props) {
  return (
    <View
      style={{
        flexDirection: "row",
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 4,
        backgroundColor: colors.card,
        borderRadius: 20,
        padding: 3,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {(["simple", "detailed"] as const).map((mode) => (
        <TouchableOpacity
          key={mode}
          onPress={() => onChange(mode)}
          style={{
            flex: 1,
            paddingVertical: 9,
            borderRadius: 17,
            alignItems: "center",
            backgroundColor: trackingMode === mode ? "#6EE7B7" : "transparent",
          }}
        >
          <Text
            style={{
              color: trackingMode === mode ? "#0A0F1A" : "#555",
              fontWeight: "700",
              fontSize: 13,
            }}
          >
            {mode === "simple" ? "Vista rápida" : "Seguimiento"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
