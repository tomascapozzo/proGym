import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  colors: any;
  onConfirm: () => void;
  onClose: () => void;
};

export default function DiscardSessionModal({ visible, colors, onConfirm, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" presentationStyle="overFullScreen">
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.75)",
          justifyContent: "center",
          padding: 32,
        }}
        onPress={onClose}
      >
        <Pressable>
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 24,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#7F1D1D",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 22 }}>!</Text>
            </View>

            <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
              Descartar sesión
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 14, lineHeight: 21, marginBottom: 28 }}>
              Se perderá todo el progreso de esta sesión.
            </Text>

            <TouchableOpacity
              onPress={onConfirm}
              style={{
                backgroundColor: colors.error,
                borderRadius: 12,
                padding: 15,
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "white", fontWeight: "700", fontSize: 15 }}>Descartar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              style={{
                borderRadius: 12,
                padding: 15,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.textMuted, fontWeight: "600", fontSize: 15 }}>
                Seguir entrenando
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
