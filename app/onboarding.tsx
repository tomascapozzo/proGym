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

const pickerData: Record<
  string,
  { title: string; options: string[]; multi?: boolean }
> = {
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
  profesion: {
    title: "Tipo de trabajo",
    options: ["Oficina", "Trabajo de pie", "Trabajo físico", "Mixto"],
  },
  disponibilidad: {
    title: "Días disponibles",
    options: [
      "1 día",
      "2 días",
      "3 días",
      "4 días",
      "5 días",
      "6 días",
      "7 días",
    ],
  },
  equipamiento: {
    title: "Equipamiento",
    options: ["Gimnasio completo", "Mancuernas", "Peso corporal", "Casa"],
  },
  nivel: {
    title: "Nivel",
    options: ["Sin experiencia", "1 año", "1–3 años", "3+ años"],
  },
  actualidad: {
    title: "Actualidad",
    options: ["Fuerza", "Running", "Ambos", "Nada"],
  },
  objetivo: {
    title: "Objetivos",
    multi: true,
    options: ["Perder grasa", "Ganar fuerza", "Rendimiento", "Salud"],
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

  // Start at anamnesis if the player already joined a club (e.g., app restarted
  // between the invitation step and completing the form)
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
  const [multiValues, setMultiValues] = useState<Record<string, string[]>>({});
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [lesiones, setLesiones] = useState("");
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

  const openPicker = (key: string) => setCurrentPicker(key);
  const closePicker = () => setCurrentPicker(null);

  const handleSelect = (key: string, option: string) => {
    const data = pickerData[key];
    if (data.multi) {
      const current = multiValues[key] || [];
      const updated = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      setMultiValues({ ...multiValues, [key]: updated });
    } else {
      setValues({ ...values, [key]: option });
      closePicker();
    }
  };

  const renderValue = (key: string) => {
    const data = pickerData[key];
    if (data.multi) {
      const val = multiValues[key] || [];
      if (val.length === 0) return "Seleccionar";
      if (val.length === 1) return val[0];
      return `${val.length} seleccionados`;
    }
    return values[key] || "Seleccionar";
  };

  const handleContinue = async () => {
    if (!user) return;
    setFormError("");
    setLoadingForm(true);

    const { error: err } = await supabase.from("profiles").upsert({
      id: user.id,
      position: values.posicion ?? null,
      edad: values.edad ?? null,
      profesion: values.profesion ?? null,
      disponibilidad: values.disponibilidad ?? null,
      equipamiento: values.equipamiento ?? null,
      nivel: values.nivel ?? null,
      actualidad: values.actualidad ?? null,
      objetivo: multiValues.objetivo ?? [],
      peso: peso.trim() || null,
      altura: altura.trim() || null,
      lesiones: lesiones.trim() || null,
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
                        backgroundColor: colors.surface ?? colors.bg,
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
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ── Anamnesis step ─────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: colors.accent, fontSize: 12, letterSpacing: 1, marginBottom: 8 }}>
          PASO 2 DE 2
        </Text>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: "bold", marginTop: 6 }}>
          Contanos sobre vos
        </Text>
        <Text style={{ color: colors.textMuted, marginBottom: 24 }}>
          Esto ayuda a personalizar tu plan
        </Text>

        {/* PICKER FIELDS */}
        {Object.keys(pickerData).map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => openPicker(key)}
            style={{
              backgroundColor: colors.card,
              padding: 16,
              borderRadius: 12,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 15 }}>
              {pickerData[key].title}
            </Text>
            <Text style={{ color: colors.accent, fontSize: 12, marginTop: 2 }}>
              {renderValue(key)}
            </Text>
          </TouchableOpacity>
        ))}

        {/* NUMERIC INPUTS */}
        <TextInput
          placeholder="Peso (kg)"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={peso}
          onChangeText={setPeso}
          style={{
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 12,
            color: colors.text,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        />

        <TextInput
          placeholder="Altura (cm)"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={altura}
          onChangeText={setAltura}
          style={{
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 12,
            color: colors.text,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        />

        <TextInput
          placeholder="Lesiones (opcional)"
          placeholderTextColor={colors.textMuted}
          value={lesiones}
          onChangeText={setLesiones}
          multiline
          style={{
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 12,
            color: colors.text,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        />

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
            marginBottom: 40,
          }}
        >
          {loadingForm ? (
            <ActivityIndicator color={colors.accentText ?? "white"} />
          ) : (
            <Text style={{ color: colors.accentText ?? "white", fontWeight: "600", fontSize: 16 }}>
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
          onPress={closePicker}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
          }}
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
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  marginBottom: 10,
                  fontWeight: "600",
                }}
              >
                {currentPicker && pickerData[currentPicker].title}
              </Text>

              <FlatList
                data={currentPicker ? pickerData[currentPicker].options : []}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = currentPicker
                    ? pickerData[currentPicker].multi
                      ? (multiValues[currentPicker] || []).includes(item)
                      : values[currentPicker] === item
                    : false;

                  return (
                    <TouchableOpacity
                      onPress={() =>
                        currentPicker && handleSelect(currentPicker, item)
                      }
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        backgroundColor: isSelected
                          ? colors.accent + "22"
                          : "transparent",
                      }}
                    >
                      <Text style={{ color: isSelected ? colors.accent : colors.text }}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />

              <TouchableOpacity onPress={closePicker}>
                <Text
                  style={{
                    color: colors.accent,
                    textAlign: "right",
                    marginTop: 10,
                    fontWeight: "600",
                  }}
                >
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
