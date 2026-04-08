import { formatTime } from "@/types/session";
import React from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  completedSets: number;
  elapsed: number;
  sessionNotes: string;
  setSessionNotes: (v: string) => void;
  saving: boolean;
  colors: any;
  onClose: () => void;
  onFinish: () => void;
};

export default function FinishSessionModal({
  visible,
  completedSets,
  elapsed,
  sessionNotes,
  setSessionNotes,
  saving,
  colors,
  onClose,
  onFinish,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
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
                padding: 28,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 4 }}>
                Finalizar sesión
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 20 }}>
                {completedSets} serie{completedSets !== 1 ? "s" : ""} completada
                {completedSets !== 1 ? "s" : ""} · {formatTime(elapsed)}
              </Text>

              <TextInput
                value={sessionNotes}
                onChangeText={setSessionNotes}
                placeholder="Notas opcionales (cómo te fue, qué mejorar...)"
                placeholderTextColor="#444"
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 10,
                  padding: 12,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 20,
                  minHeight: 80,
                  textAlignVertical: "top",
                  fontSize: 14,
                }}
              />

              <TouchableOpacity
                onPress={onFinish}
                disabled={saving}
                style={{
                  backgroundColor: "#EF4444",
                  borderRadius: 12,
                  padding: 14,
                  alignItems: "center",
                  marginBottom: 10,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>Terminar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={{
                  borderRadius: 12,
                  padding: 14,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.textMuted, fontWeight: "600", fontSize: 15 }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
