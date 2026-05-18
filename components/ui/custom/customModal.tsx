import { useTheme } from "@/context/theme-context";
import React from "react";
import {
    ActivityIndicator,
    Modal,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmColor?: string;
  confirmTextColor?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function CustomModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancelar",
  confirmColor,
  confirmTextColor,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const { colors } = useTheme();
  const resolvedConfirmColor = confirmColor ?? colors.accent;
  const textColor = confirmTextColor ?? colors.accentText;

  return (
    <Modal visible={visible} transparent animationType="fade" presentationStyle="overFullScreen">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.85)",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 28,
            width: "100%",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 14,
              marginBottom: 24,
              lineHeight: 20,
            }}
          >
            {message}
          </Text>

          <TouchableOpacity
            onPress={onConfirm}
            disabled={loading}
            style={{
              backgroundColor: resolvedConfirmColor,
              borderRadius: 12,
              padding: 14,
              alignItems: "center",
              marginBottom: 10,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color={textColor} size="small" />
            ) : (
              <Text
                style={{ color: textColor, fontWeight: "700", fontSize: 15 }}
              >
                {confirmLabel}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCancel}
            style={{
              borderRadius: 12,
              padding: 14,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textMuted, fontWeight: "600", fontSize: 15 }}>
              {cancelLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
