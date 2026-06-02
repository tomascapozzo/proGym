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
  showRpeInput?: boolean;
  sessionRpe: number | null;
  setSessionRpe: (v: number | null) => void;
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
  showRpeInput = false,
  sessionRpe,
  setSessionRpe,
  saving,
  colors,
  onClose,
  onFinish,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" presentationStyle="overFullScreen">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.75)",
            justifyContent: "flex-end",
          }}
          onPress={onClose}
        >
          <Pressable>
            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingHorizontal: 24,
                paddingTop: 12,
                paddingBottom: 36,
                borderTopWidth: 1,
                borderColor: colors.border,
              }}
            >
              {/* Handle */}
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border,
                  alignSelf: "center",
                  marginBottom: 24,
                }}
              />

              <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700", marginBottom: 20 }}>
                Finalizar sesión
              </Text>

              {/* Stats row */}
              <View
                style={{
                  flexDirection: "row",
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  marginBottom: 20,
                  overflow: "hidden",
                }}
              >
                <View style={{ flex: 1, alignItems: "center", paddingVertical: 16 }}>
                  <Text style={{ color: colors.accent, fontSize: 26, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
                    {completedSets}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 0.8, marginTop: 3 }}>
                    SERIES
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: colors.border, marginVertical: 12 }} />
                <View style={{ flex: 1, alignItems: "center", paddingVertical: 16 }}>
                  <Text style={{ color: colors.accent, fontSize: 26, fontWeight: "700", fontVariant: ["tabular-nums"] }}>
                    {formatTime(elapsed)}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 0.8, marginTop: 3 }}>
                    TIEMPO
                  </Text>
                </View>
              </View>

              {/* RPE (sesion mode) */}
              {showRpeInput && (
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12, letterSpacing: 0.6, marginBottom: 8 }}>
                    ESFUERZO PERCIBIDO (RPE)
                  </Text>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <TouchableOpacity
                        key={n}
                        onPress={() => setSessionRpe(sessionRpe === n ? null : n)}
                        style={{
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 10,
                          backgroundColor: sessionRpe === n ? colors.accent : colors.surface,
                          alignItems: "center",
                          borderWidth: 1,
                          borderColor: sessionRpe === n ? colors.accent : colors.border,
                        }}
                      >
                        <Text
                          style={{
                            color: sessionRpe === n ? colors.accentText : colors.text,
                            fontSize: 13,
                            fontWeight: "600",
                          }}
                        >
                          {n}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Notes */}
              <Text style={{ color: colors.textMuted, fontSize: 12, letterSpacing: 0.6, marginBottom: 8 }}>
                NOTAS
              </Text>
              <TextInput
                value={sessionNotes}
                onChangeText={setSessionNotes}
                placeholder="¿Cómo te fue? ¿Qué mejorar?"
                placeholderTextColor={colors.textDisabled}
                multiline
                numberOfLines={3}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 14,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                  marginBottom: 24,
                  minHeight: 80,
                  textAlignVertical: "top",
                  fontSize: 14,
                  lineHeight: 20,
                }}
              />

              {/* Actions */}
              <TouchableOpacity
                onPress={onFinish}
                disabled={saving}
                style={{
                  backgroundColor: colors.accent,
                  borderRadius: 14,
                  padding: 16,
                  alignItems: "center",
                  marginBottom: 10,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? (
                  <ActivityIndicator color={colors.accentText} size="small" />
                ) : (
                  <Text style={{ color: colors.accentText, fontWeight: "700", fontSize: 16 }}>
                    Guardar y terminar
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onClose}
                style={{
                  borderRadius: 14,
                  padding: 16,
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
      </KeyboardAvoidingView>
    </Modal>
  );
}
