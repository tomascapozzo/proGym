import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import type { Club, ClubInvitation, InvitationPreview } from "@/types/club";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code: "Codigo invalido. Verifica que este bien escrito.",
  expired: "Este codigo ya vencio. Pedile uno nuevo al coach.",
  max_uses_reached: "Este codigo alcanzo el limite de usos.",
  already_member: "Ya sos miembro de un club.",
};

export default function JoinClubScreen() {
  const { colors } = useTheme();
  const { refreshClubMembership, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  const handlePreview = async () => {
    if (!code.trim()) return;
    setError(null);
    setLoadingPreview(true);

    const trimmed = code.trim().toUpperCase();
    const { data, error: qErr } = await supabase
      .from("club_invitations")
      .select("*, club:clubs(*), target_group:club_groups(name)")
      .eq("code", trimmed)
      .eq("status", "active")
      .maybeSingle();

    setLoadingPreview(false);

    if (qErr || !data) {
      setError("invalid_code");
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setError("expired");
      return;
    }
    if (data.max_uses != null && data.uses_count >= data.max_uses) {
      setError("max_uses_reached");
      return;
    }

    setPreview({
      invitation: data as ClubInvitation,
      club: data.club as Club,
      targetGroupName: data.target_group?.name ?? null,
    });
  };

  const handleConfirm = async () => {
    if (!preview) return;
    setLoadingJoin(true);

    const { data, error: rpcErr } = await supabase.rpc("redeem_club_invitation", {
      p_code: code.trim().toUpperCase(),
    });

    setLoadingJoin(false);

    if (rpcErr) {
      setError(rpcErr.message);
      setPreview(null);
      return;
    }
    if (data?.error) {
      setError(data.error as string);
      setPreview(null);
      return;
    }

    await refreshClubMembership();
    // Root layout effect will redirect to /(tabs) once clubMembership is set
  };

  const roleLabel = preview?.invitation.role === "coach" ? "Coach" : "Jugador";
  const roleColor = preview?.invitation.role === "coach" ? colors.blue : colors.accent;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: colors.accent, fontSize: 12, letterSpacing: 1, marginBottom: 8 }}>
          ACCESO AL CLUB
        </Text>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: "bold", marginBottom: 8 }}>
          Unite a tu club
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 36, lineHeight: 20 }}>
          Ingresa el codigo de invitacion que te compartio tu coach para acceder a la app.
        </Text>

        {!preview ? (
          <>
            <View
              style={{
                backgroundColor: colors.inputBg ?? colors.card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: error ? colors.error : colors.border,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: error ? 8 : 20,
              }}
            >
              <TextInput
                value={code}
                onChangeText={(t) => {
                  setCode(t.toUpperCase());
                  setError(null);
                }}
                placeholder="Ej: PLAYER-AB3X7K"
                placeholderTextColor={colors.textDisabled ?? colors.textMuted}
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

            {error ? (
              <Text style={{ color: colors.error, fontSize: 13, marginBottom: 16 }}>
                {ERROR_MESSAGES[error] ?? error}
              </Text>
            ) : null}

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
                <ActivityIndicator color={colors.accentText ?? "white"} />
              ) : (
                <Text style={{ color: colors.accentText ?? "white", fontSize: 15, fontWeight: "700" }}>
                  Verificar codigo
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 18,
                marginBottom: 20,
                gap: 12,
              }}
            >
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
                  {preview.club.description ? (
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                      {preview.club.description}
                    </Text>
                  ) : null}
                </View>
              </View>

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
                {preview.targetGroupName ? (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                      backgroundColor: colors.surface ?? colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "600" }}>
                      {preview.targetGroupName}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {error ? (
              <Text style={{ color: colors.error, fontSize: 13, marginBottom: 12 }}>
                {ERROR_MESSAGES[error] ?? error}
              </Text>
            ) : null}

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => { setPreview(null); setError(null); }}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  paddingVertical: 15,
                  alignItems: "center",
                  backgroundColor: colors.card,
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
                  <ActivityIndicator color={colors.accentText ?? "white"} />
                ) : (
                  <Text style={{ color: colors.accentText ?? "white", fontSize: 15, fontWeight: "700" }}>
                    Unirme a {preview.club.name}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
        <TouchableOpacity
          onPress={signOut}
          style={{ alignItems: "center", marginTop: 32 }}
        >
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            Cerrar sesión
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
