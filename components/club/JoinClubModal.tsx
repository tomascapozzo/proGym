import { useTheme } from "@/context/theme-context";
import type { InvitationPreview } from "@/types/club";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onClose: () => void;
  onPreview: (code: string) => Promise<InvitationPreview | { error: string }>;
  onConfirm: (code: string) => Promise<{ error?: string }>;
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code: "Codigo invalido. Verifica que este bien escrito.",
  expired: "Este codigo ya vencio. Pedile uno nuevo al coach.",
  max_uses_reached: "Este codigo alcanzo el limite de usos.",
  already_member: "Ya sos miembro de un club.",
};

export default function JoinClubModal({ visible, onClose, onPreview, onConfirm }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  const reset = () => {
    setCode("");
    setPreview(null);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePreview = async () => {
    if (!code.trim()) return;
    setError(null);
    setLoadingPreview(true);
    const result = await onPreview(code);
    setLoadingPreview(false);
    if ("error" in result) {
      setError(result.error);
    } else {
      setPreview(result);
    }
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setLoadingJoin(true);
    const result = await onConfirm(code);
    setLoadingJoin(false);
    if (result.error) {
      setError(result.error);
      setPreview(null);
    } else {
      handleClose();
    }
  };

  const roleLabel = preview?.invitation.role === "coach" ? "Coach" : "Jugador";
  const roleColor = preview?.invitation.role === "coach" ? colors.blue : colors.accent;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 24,
              paddingTop: 24,
              paddingBottom: insets.bottom + 24,
              gap: 20,
            }}
          >
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: "800" }}>
                Unirse a un club
              </Text>
              <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Code input (hidden once preview is shown) */}
            {!preview && (
              <>
                <View
                  style={{
                    backgroundColor: colors.inputBg,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: error ? colors.error : colors.border,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                  }}
                >
                  <TextInput
                    value={code}
                    onChangeText={(t) => {
                      setCode(t.toUpperCase());
                      setError(null);
                    }}
                    placeholder="Ej: PLAYER-AB3X7K"
                    placeholderTextColor={colors.textDisabled}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    style={{
                      color: colors.text,
                      fontSize: 16,
                      fontWeight: "600",
                      letterSpacing: 1,
                    }}
                  />
                </View>

                {error && (
                  <Text style={{ color: colors.error, fontSize: 13, marginTop: -10 }}>
                    {ERROR_MESSAGES[error] ?? error}
                  </Text>
                )}

                <TouchableOpacity
                  onPress={handlePreview}
                  disabled={!code.trim() || loadingPreview}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: colors.accent,
                    borderRadius: 14,
                    paddingVertical: 16,
                    alignItems: "center",
                    opacity: !code.trim() || loadingPreview ? 0.5 : 1,
                  }}
                >
                  {loadingPreview ? (
                    <ActivityIndicator color={colors.accentText} />
                  ) : (
                    <Text style={{ color: colors.accentText, fontSize: 15, fontWeight: "700" }}>
                      Verificar codigo
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Club preview */}
            {preview && (
              <>
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 18,
                    gap: 12,
                  }}
                >
                  {/* Club name */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: colors.accent + "20",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Ionicons name="people" size={24} color={colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontSize: 17, fontWeight: "800" }}>
                        {preview.club.name}
                      </Text>
                      {preview.club.description && (
                        <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                          {preview.club.description}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Role + group */}
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                        backgroundColor: roleColor + "20",
                      }}
                    >
                      <Text style={{ color: roleColor, fontSize: 12, fontWeight: "700" }}>
                        {roleLabel}
                      </Text>
                    </View>
                    {preview.targetGroupName && (
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 8,
                          backgroundColor: colors.surface,
                          borderWidth: 1,
                          borderColor: colors.border,
                        }}
                      >
                        <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "600" }}>
                          {preview.targetGroupName}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {error && (
                  <Text style={{ color: colors.error, fontSize: 13 }}>
                    {ERROR_MESSAGES[error] ?? error}
                  </Text>
                )}

                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => { setPreview(null); setError(null); }}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      borderRadius: 14,
                      paddingVertical: 15,
                      alignItems: "center",
                      backgroundColor: colors.surface,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ color: colors.textMuted, fontSize: 15, fontWeight: "600" }}>
                      Volver
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleConfirm}
                    disabled={loadingJoin}
                    activeOpacity={0.85}
                    style={{
                      flex: 2,
                      backgroundColor: colors.accent,
                      borderRadius: 14,
                      paddingVertical: 15,
                      alignItems: "center",
                      opacity: loadingJoin ? 0.6 : 1,
                    }}
                  >
                    {loadingJoin ? (
                      <ActivityIndicator color={colors.accentText} />
                    ) : (
                      <Text style={{ color: colors.accentText, fontSize: 15, fontWeight: "700" }}>
                        Unirme a {preview.club.name}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
