import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import type { Club, ClubInvitation, InvitationPreview } from "@/types/club";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Picker data ──────────────────────────────────────────────────────────────

const pickerData: Record<string, { title: string; options: string[] }> = {
  posicion: {
    title: "Posicion",
    options: [
      "Primera linea",
      "Segunda linea",
      "Ala",
      "Octavo",
      "Medio-scrum",
      "Apertura",
      "Centro",
      "Wing",
      "Fullback",
    ],
  },
  edad: {
    title: "Edad",
    options: [
      "16 – 20 años",
      "21 – 25 años",
      "26 – 30 años",
      "31 – 35 años",
      "36 – 40 años",
      "41 – 45 años",
      "46+ años",
    ],
  },
};

const INV_ERROR_MESSAGES: Record<string, string> = {
  invalid_code: "Codigo invalido. Verifica que este bien escrito.",
  expired: "Este codigo ya vencio. Pedile uno nuevo al coach.",
  max_uses_reached: "Este codigo alcanzo el limite de usos.",
  already_member: "Ya sos miembro de un club.",
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { user, clubMembership, refreshProfile } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<"invitation" | "anamnesis">(
    clubMembership ? "anamnesis" : "invitation",
  );

  // ── Invitation step state ──────────────────────────────────────────────────
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [invError, setInvError] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingJoin, setLoadingJoin] = useState(false);

  // ── Anamnesis step state ───────────────────────────────────────────────────
  const [values, setValues] = useState<Record<string, string>>({});
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [gimnasio, setGimnasio] = useState<"club" | "otro" | "">("");
  const [lesionesActuales, setLesionesActuales] = useState(false);
  const [lesionesDesc, setLesionesDesc] = useState("");
  const [lesionesPrevias, setLesionesPrevias] = useState<{ lesion: string; anio: string }[]>([]);
  const [currentPicker, setCurrentPicker] = useState<string | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [formError, setFormError] = useState("");

  // ── Invitation handlers ────────────────────────────────────────────────────

  const handlePreview = async () => {
    if (!code.trim()) return;
    setInvError(null);
    setLoadingPreview(true);

    const trimmed = code.trim().toUpperCase();
    const { data, error: qErr } = await supabase
      .from("club_invitations")
      .select("*, club:clubs(*), target_group:club_groups(name)")
      .eq("code", trimmed)
      .eq("status", "active")
      .maybeSingle();

    setLoadingPreview(false);

    if (qErr || !data) { setInvError("invalid_code"); return; }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setInvError("expired"); return; }
    if (data.max_uses != null && data.uses_count >= data.max_uses) { setInvError("max_uses_reached"); return; }

    setPreview({
      invitation: data as ClubInvitation,
      club: data.club as Club,
      targetGroupName: data.target_group?.name ?? null,
    });
  };

  const handleConfirmJoin = async () => {
    if (!preview) return;
    setLoadingJoin(true);

    const { data, error: rpcErr } = await supabase.rpc("redeem_club_invitation", {
      p_code: code.trim().toUpperCase(),
    });

    setLoadingJoin(false);

    if (rpcErr) { setInvError(rpcErr.message); setPreview(null); return; }
    if (data?.error) { setInvError(data.error as string); setPreview(null); return; }

    setStep("anamnesis");
  };

  // ── Anamnesis handlers ─────────────────────────────────────────────────────

  const addLesionPrevia = () =>
    setLesionesPrevias((prev) => [...prev, { lesion: "", anio: "" }]);

  const updateLesionPrevia = (idx: number, field: "lesion" | "anio", val: string) =>
    setLesionesPrevias((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item)),
    );

  const removeLesionPrevia = (idx: number) =>
    setLesionesPrevias((prev) => prev.filter((_, i) => i !== idx));

  const handleContinue = async () => {
    if (!user) return;
    setFormError("");
    setLoadingForm(true);

    const { error: err } = await supabase.from("profiles").upsert({
      id: user.id,
      position: values.posicion ?? null,
      edad: values.edad ?? null,
      peso: peso.trim() || null,
      altura: altura.trim() || null,
      gimnasio: gimnasio || null,
      lesiones: lesionesActuales ? (lesionesDesc.trim() || null) : null,
      lesiones_previas: lesionesPrevias.filter((l) => l.lesion.trim()),
      onboarding_completed: true,
    });

    setLoadingForm(false);

    if (err) {
      setFormError("Error guardando los datos. Intentá de nuevo.");
      return;
    }

    await refreshProfile();
    router.replace("/(tabs)");
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const roleLabel = preview?.invitation.role === "coach" ? "Coach" : "Jugador";
  const roleColor = preview?.invitation.role === "coach" ? colors.blue : colors.accent;

  const fieldCard = {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  };

  const inputStyle = {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 14,
  };

  // ── Invitation step ────────────────────────────────────────────────────────

  if (step === "invitation") {
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
            PASO 1 DE 2
          </Text>
          <Text style={{ color: colors.text, fontSize: 26, fontWeight: "bold", marginBottom: 8 }}>
            Unite a tu club
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 14, marginBottom: 36, lineHeight: 20 }}>
            Ingresa el codigo de invitacion que te compartio tu coach para comenzar.
          </Text>

          {!preview ? (
            <>
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: invError ? colors.error : colors.border,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  marginBottom: invError ? 8 : 20,
                }}
              >
                <TextInput
                  value={code}
                  onChangeText={(t) => { setCode(t.toUpperCase()); setInvError(null); }}
                  placeholder="Ej: PLAYER-AB3X7K"
                  placeholderTextColor={colors.textMuted}
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

              {invError ? (
                <Text style={{ color: colors.error, fontSize: 13, marginBottom: 16 }}>
                  {INV_ERROR_MESSAGES[invError] ?? invError}
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
                  <ActivityIndicator color={colors.accentText} />
                ) : (
                  <Text style={{ color: colors.accentText, fontSize: 15, fontWeight: "700" }}>
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
                        backgroundColor: colors.surface,
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

              {invError ? (
                <Text style={{ color: colors.error, fontSize: 13, marginBottom: 12 }}>
                  {INV_ERROR_MESSAGES[invError] ?? invError}
                </Text>
              ) : null}

              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => { setPreview(null); setInvError(null); }}
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
                  onPress={handleConfirmJoin}
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
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Anamnesis step ─────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: insets.top + 16,
          paddingBottom: 48,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: colors.accent, fontSize: 12, letterSpacing: 1, marginBottom: 8 }}>
          PASO 2 DE 2
        </Text>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: "bold", marginTop: 6 }}>
          Contanos sobre vos
        </Text>
        <Text style={{ color: colors.textMuted, marginBottom: 28 }}>
          Esto ayuda a tu coach a personalizar tu plan
        </Text>

        {/* ── POSICIÓN ── */}
        <TouchableOpacity
          onPress={() => setCurrentPicker("posicion")}
          style={fieldCard}
        >
          <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>
            POSICIÓN
          </Text>
          <Text style={{ color: values.posicion ? colors.text : colors.textDisabled, fontSize: 15 }}>
            {values.posicion || "Seleccionar"}
          </Text>
        </TouchableOpacity>

        {/* ── EDAD ── */}
        <TouchableOpacity
          onPress={() => setCurrentPicker("edad")}
          style={fieldCard}
        >
          <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 0.5, marginBottom: 4 }}>
            EDAD
          </Text>
          <Text style={{ color: values.edad ? colors.text : colors.textDisabled, fontSize: 15 }}>
            {values.edad || "Seleccionar"}
          </Text>
        </TouchableOpacity>

        {/* ── PESO / ALTURA ── */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <TextInput
              placeholder="Peso (kg)"
              placeholderTextColor={colors.textDisabled}
              keyboardType="numeric"
              value={peso}
              onChangeText={setPeso}
              style={[inputStyle, { marginBottom: 0 }]}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextInput
              placeholder="Altura (cm)"
              placeholderTextColor={colors.textDisabled}
              keyboardType="numeric"
              value={altura}
              onChangeText={setAltura}
              style={[inputStyle, { marginBottom: 0 }]}
            />
          </View>
        </View>

        {/* ── GIMNASIO ── */}
        <View style={[fieldCard, { marginTop: 0 }]}>
          <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 0.5, marginBottom: 10 }}>
            GIMNASIO
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {(["club", "otro"] as const).map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setGimnasio(opt)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: gimnasio === opt ? colors.accent : colors.surface,
                  borderWidth: 1,
                  borderColor: gimnasio === opt ? colors.accent : colors.border,
                }}
              >
                <Text
                  style={{
                    color: gimnasio === opt ? colors.accentText : colors.textMuted,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {opt === "club" ? "Club" : "Otro"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── LESIONES ACTUALES ── */}
        <View style={fieldCard}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 0.5 }}>
              LESIONES ACTUALES
            </Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {([false, true] as const).map((val) => (
                <TouchableOpacity
                  key={String(val)}
                  onPress={() => setLesionesActuales(val)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    borderRadius: 8,
                    backgroundColor: lesionesActuales === val ? colors.accent : colors.surface,
                    borderWidth: 1,
                    borderColor: lesionesActuales === val ? colors.accent : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: lesionesActuales === val ? colors.accentText : colors.textMuted,
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    {val ? "Sí" : "No"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {lesionesActuales && (
            <TextInput
              placeholder="Describí la lesión..."
              placeholderTextColor={colors.textDisabled}
              value={lesionesDesc}
              onChangeText={setLesionesDesc}
              multiline
              style={{
                marginTop: 12,
                backgroundColor: colors.surface,
                borderRadius: 10,
                padding: 12,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
                minHeight: 72,
                fontSize: 14,
              }}
            />
          )}
        </View>

        {/* ── LESIONES PREVIAS ── */}
        <View style={fieldCard}>
          <Text style={{ color: colors.textMuted, fontSize: 11, letterSpacing: 0.5, marginBottom: 12 }}>
            LESIONES PREVIAS
          </Text>

          {lesionesPrevias.map((item, idx) => (
            <View key={idx} style={{ flexDirection: "row", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <TextInput
                placeholder="Lesión"
                placeholderTextColor={colors.textDisabled}
                value={item.lesion}
                onChangeText={(v) => updateLesionPrevia(idx, "lesion", v)}
                style={{
                  flex: 2,
                  backgroundColor: colors.surface,
                  borderRadius: 10,
                  padding: 10,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                  fontSize: 14,
                }}
              />
              <TextInput
                placeholder="Año"
                placeholderTextColor={colors.textDisabled}
                value={item.anio}
                onChangeText={(v) => updateLesionPrevia(idx, "anio", v)}
                keyboardType="numeric"
                maxLength={4}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 10,
                  padding: 10,
                  color: colors.text,
                  borderWidth: 1,
                  borderColor: colors.border,
                  fontSize: 14,
                  textAlign: "center",
                }}
              />
              <TouchableOpacity onPress={() => removeLesionPrevia(idx)} style={{ padding: 4 }}>
                <Text style={{ color: colors.error, fontSize: 20, lineHeight: 22 }}>×</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            onPress={addLesionPrevia}
            style={{
              paddingVertical: 10,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              marginTop: lesionesPrevias.length > 0 ? 4 : 0,
            }}
          >
            <Text style={{ color: colors.accent, fontWeight: "600", fontSize: 13 }}>
              + Agregar lesión
            </Text>
          </TouchableOpacity>
        </View>

        {formError ? (
          <Text style={{ color: colors.error, textAlign: "center", marginBottom: 12 }}>
            {formError}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleContinue}
          disabled={loadingForm}
          style={{
            backgroundColor: colors.accent,
            padding: 18,
            borderRadius: 14,
            alignItems: "center",
            opacity: loadingForm ? 0.7 : 1,
            marginTop: 8,
          }}
        >
          {loadingForm ? (
            <ActivityIndicator color={colors.accentText} />
          ) : (
            <Text style={{ color: colors.accentText, fontWeight: "600", fontSize: 16 }}>
              Continuar
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* PICKER MODAL */}
      <Modal
        visible={!!currentPicker}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
      >
        <Pressable
          onPress={() => setCurrentPicker(null)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
        >
          <Pressable>
            <View
              style={{
                backgroundColor: colors.card,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 16,
                maxHeight: 400,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 16, marginBottom: 10, fontWeight: "600" }}>
                {currentPicker && pickerData[currentPicker].title}
              </Text>
              <FlatList
                data={currentPicker ? pickerData[currentPicker].options : []}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = currentPicker ? values[currentPicker] === item : false;
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        if (currentPicker) {
                          setValues((prev) => ({ ...prev, [currentPicker]: item }));
                          setCurrentPicker(null);
                        }
                      }}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        backgroundColor: isSelected ? colors.accent + "22" : "transparent",
                      }}
                    >
                      <Text style={{ color: isSelected ? colors.accent : colors.text }}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
              <TouchableOpacity onPress={() => setCurrentPicker(null)}>
                <Text style={{ color: colors.accent, textAlign: "right", marginTop: 10, fontWeight: "600" }}>
                  Listo
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
