import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import type { Club, ClubInvitation, InvitationPreview } from "@/types/club";
import type {
  ClubForm,
  ClubFormQuestion,
  OneRmOptions,
  ScaleOptions,
} from "@/types/forms";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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

const INV_ERROR_MESSAGES: Record<string, string> = {
  invalid_code: "Codigo invalido. Verifica que este bien escrito.",
  expired: "Este codigo ya vencio. Pedile uno nuevo al coach.",
  max_uses_reached: "Este codigo alcanzo el limite de usos.",
  already_member: "Ya sos miembro de un club.",
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const { user, profile, clubMembership, refreshProfile } = useAuth();
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
  const [anamnesisForm, setAnamnesisForm] = useState<ClubForm | null>(null);
  const [questions, setQuestions] = useState<ClubFormQuestion[]>([]);
  const [answers, setAnswers] = useState<
    Record<string, string | number | string[]>
  >({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [currentPickerQuestion, setCurrentPickerQuestion] =
    useState<ClubFormQuestion | null>(null);
  const [loadingForm, setLoadingForm] = useState(false);
  const [formError, setFormError] = useState("");

  // ── System fields (always shown, saved to profiles) ────────────────────────
  const [sysEdad, setSysEdad] = useState("");
  const [sysPeso, setSysPeso] = useState("");
  const [sysAltura, setSysAltura] = useState("");
  const [sysPosition, setSysPosition] = useState("");
  const [currentSysPicker, setCurrentSysPicker] = useState<
    "position" | null
  >(null);

  const POSITION_OPTIONS = [
    "Pilar",
    "Hooker",
    "Segunda linea",
    "Tercera linea",
    "Medio-scrum",
    "Apertura",
    "Centro",
    "Wing",
    "Fullback",
  ];

  useEffect(() => {
    const clubId = clubMembership?.club_id;
    if (step === "anamnesis" && clubId) {
      fetchAnamnesisForm(clubId);
    }
  }, [step, clubMembership?.club_id]);

  const fetchAnamnesisForm = async (clubId: string) => {
    setLoadingQuestions(true);

    const { data: form } = await supabase
      .from("club_forms")
      .select("*")
      .eq("club_id", clubId)
      .eq("template_type", "anamnesis")
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!form) {
      setLoadingQuestions(false);
      return;
    }

    setAnamnesisForm(form as ClubForm);

    const { data: qs } = await supabase
      .from("club_form_questions")
      .select("*")
      .eq("form_id", form.id)
      .order("order_index");

    setQuestions((qs as ClubFormQuestion[]) ?? []);
    setLoadingQuestions(false);
  };

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

    if (qErr || !data) {
      setInvError("invalid_code");
      return;
    }
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setInvError("expired");
      return;
    }
    if (data.max_uses != null && data.uses_count >= data.max_uses) {
      setInvError("max_uses_reached");
      return;
    }

    setPreview({
      invitation: data as ClubInvitation,
      club: data.club as Club,
      targetGroupName: data.target_group?.name ?? null,
    });
  };

  const handleConfirmJoin = async () => {
    if (!preview) return;
    setLoadingJoin(true);

    const { data, error: rpcErr } = await supabase.rpc(
      "redeem_club_invitation",
      {
        p_code: code.trim().toUpperCase(),
      },
    );

    setLoadingJoin(false);

    if (rpcErr) {
      setInvError(rpcErr.message);
      setPreview(null);
      return;
    }
    if (data?.error) {
      setInvError(data.error as string);
      setPreview(null);
      return;
    }

    await refreshProfile();
    setStep("anamnesis");
  };

  // ── Anamnesis handlers ─────────────────────────────────────────────────────

  const setAnswer = (questionId: string, value: string | number | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleContinue = async () => {
    if (!user) return;
    setFormError("");
    setLoadingForm(true);

    // Validate system fields (always required)
    if (!sysEdad || !sysPeso.trim() || !sysAltura.trim() || !sysPosition) {
      setFormError("Por favor completá todos los datos básicos del perfil.");
      setLoadingForm(false);
      return;
    }

    // Only validate questions that are currently visible
    const visibleQs = questions.filter((q) =>
      !q.depends_on_question_id ||
      answers[q.depends_on_question_id] === q.depends_on_answer,
    );
    const missing = visibleQs.filter(
      (q) =>
        q.required &&
        (answers[q.id] === undefined ||
          answers[q.id] === "" ||
          answers[q.id] === null),
    );
    if (missing.length > 0) {
      setFormError("Por favor completá todas las preguntas requeridas.");
      setLoadingForm(false);
      return;
    }

    // Save answers to club_form_answers if a distribution exists
    if (anamnesisForm && questions.length > 0) {
      const { data: dist } = await supabase
        .from("club_form_distributions")
        .select("id")
        .eq("target_user_id", user.id)
        .eq("form_id", anamnesisForm.id)
        .maybeSingle();

      if (dist) {
        const { data: response, error: respErr } = await supabase
          .from("club_form_responses")
          .upsert(
            {
              distribution_id: dist.id,
              form_id: anamnesisForm.id,
              user_id: user.id,
              submitted_at: new Date().toISOString(),
            },
            { onConflict: "distribution_id,user_id" },
          )
          .select("id")
          .single();

        if (!respErr && response) {
          const answerRows = questions.map((q) => {
            const val = answers[q.id];
            return {
              response_id: response.id,
              question_id: q.id,
              answer_text:
                q.type === "text" || q.type === "yes_no"
                  ? String(val ?? "") || null
                  : null,
              answer_number:
                q.type === "scale" || q.type === "one_rm"
                  ? val !== undefined && val !== ""
                    ? Number(val)
                    : null
                  : null,
              answer_options:
                q.type === "multiple_choice"
                  ? val !== undefined
                    ? [String(val)]
                    : null
                  : null,
            };
          });
          await supabase
            .from("club_form_answers")
            .upsert(answerRows, { onConflict: "response_id,question_id" });
        }
      }
    }

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        onboarding_completed: true,
        edad: sysEdad,
        peso: sysPeso.trim(),
        altura: sysAltura.trim(),
        position: sysPosition,
      })
      .eq("id", user.id);

    setLoadingForm(false);

    if (profileErr) {
      setFormError("Error guardando los datos. Intentá de nuevo.");
      return;
    }

    await refreshProfile();
    router.replace("/(tabs)");
  };

  // ── Question renderer ──────────────────────────────────────────────────────

  // Questions visible given current answers
  const visibleQuestions = questions.filter(
    (q) =>
      !q.depends_on_question_id ||
      answers[q.depends_on_question_id] === q.depends_on_answer,
  );

  const fieldCard = {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  };

  const labelStyle = {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 8,
  };

  // Returns the label text — asterisk appended for required questions
  // Use inside a <Text> that accepts nested <Text> children for coloring
  const questionLabel = (q: ClubFormQuestion) =>
    q.required ? (
      <>
        {q.question_text.toUpperCase()}
        {"  "}
        <Text style={{ color: colors.error ?? colors.accent, fontSize: 13 }}>*</Text>
      </>
    ) : (
      <>{q.question_text.toUpperCase()}</>
    );

  const renderQuestion = (q: ClubFormQuestion) => {
    switch (q.type) {
      case "text":
        return (
          <View key={q.id} style={fieldCard}>
            <Text style={labelStyle}>{questionLabel(q)}</Text>
            <TextInput
              placeholder="Escribí tu respuesta..."
              placeholderTextColor={colors.textDisabled}
              value={String(answers[q.id] ?? "")}
              onChangeText={(v) => setAnswer(q.id, v)}
              multiline
              style={{
                backgroundColor: colors.surface,
                borderRadius: 10,
                padding: 12,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
                minHeight: 60,
                fontSize: 14,
              }}
            />
          </View>
        );

      case "yes_no":
        return (
          <View key={q.id} style={fieldCard}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={[labelStyle, { marginBottom: 0, flex: 1 }]}>
                {questionLabel(q)}
              </Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {(["si", "no"] as const).map((val) => (
                  <TouchableOpacity
                    key={val}
                    onPress={() => setAnswer(q.id, val)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 8,
                      backgroundColor:
                        answers[q.id] === val ? colors.accent : colors.surface,
                      borderWidth: 1,
                      borderColor:
                        answers[q.id] === val ? colors.accent : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          answers[q.id] === val
                            ? colors.accentText
                            : colors.textMuted,
                        fontWeight: "600",
                        fontSize: 13,
                      }}
                    >
                      {val === "si" ? "Sí" : "No"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case "multiple_choice":
        return (
          <TouchableOpacity
            key={q.id}
            onPress={() => setCurrentPickerQuestion(q)}
            style={fieldCard}
          >
            <Text style={labelStyle}>{questionLabel(q)}</Text>
            <Text
              style={{
                color: answers[q.id] ? colors.text : colors.textDisabled,
                fontSize: 15,
              }}
            >
              {String(answers[q.id] ?? "Seleccionar")}
            </Text>
          </TouchableOpacity>
        );

      case "scale": {
        const opts = q.options as ScaleOptions;
        const range = Array.from(
          { length: opts.max - opts.min + 1 },
          (_, i) => opts.min + i,
        );
        return (
          <View key={q.id} style={fieldCard}>
            <Text style={labelStyle}>{questionLabel(q)}</Text>
            {(opts.min_label || opts.max_label) && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  {opts.min_label}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  {opts.max_label}
                </Text>
              </View>
            )}
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              {range.map((n) => (
                <TouchableOpacity
                  key={n}
                  onPress={() => setAnswer(q.id, n)}
                  style={{
                    flex: 1,
                    minWidth: 36,
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: "center",
                    backgroundColor:
                      answers[q.id] === n ? colors.accent : colors.surface,
                    borderWidth: 1,
                    borderColor:
                      answers[q.id] === n ? colors.accent : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color:
                        answers[q.id] === n
                          ? colors.accentText
                          : colors.textMuted,
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      }

      case "one_rm": {
        const opts = q.options as OneRmOptions | null;
        const exerciseSuffix = opts?.exercise_name ? ` — ${opts.exercise_name}` : "";
        const label = (
          <>
            {q.question_text.toUpperCase()}{exerciseSuffix}
            {q.required && (
              <>{"  "}<Text style={{ color: colors.error ?? colors.accent, fontSize: 13 }}>*</Text></>
            )}
          </>
        );
        return (
          <View key={q.id} style={fieldCard}>
            <Text style={labelStyle}>{label}</Text>
            <TextInput
              placeholder="kg"
              placeholderTextColor={colors.textDisabled}
              keyboardType="numeric"
              value={String(answers[q.id] ?? "")}
              onChangeText={(v) => setAnswer(q.id, v)}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 10,
                padding: 12,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
                fontSize: 15,
              }}
            />
          </View>
        );
      }

      default:
        return null;
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const roleLabel = preview?.invitation.role === "coach" ? "Coach" : "Jugador";
  const roleColor =
    preview?.invitation.role === "coach" ? colors.blue : colors.accent;

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
          <Text
            style={{
              color: colors.accent,
              fontSize: 12,
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            PASO 1 DE 2
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 26,
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            Unite a tu club
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 14,
              marginBottom: 36,
              lineHeight: 20,
            }}
          >
            Ingresa el codigo de invitacion que te compartio tu coach para
            comenzar.
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
                  onChangeText={(t) => {
                    setCode(t.toUpperCase());
                    setInvError(null);
                  }}
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
                <Text
                  style={{
                    color: colors.error,
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
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
                  <Text
                    style={{
                      color: colors.accentText,
                      fontSize: 15,
                      fontWeight: "700",
                    }}
                  >
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
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
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
                    <Text
                      style={{
                        color: colors.text,
                        fontSize: 17,
                        fontWeight: "800",
                      }}
                    >
                      {preview.club.name}
                    </Text>
                    {preview.club.description ? (
                      <Text
                        style={{
                          color: colors.textMuted,
                          fontSize: 12,
                          marginTop: 2,
                        }}
                      >
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
                    <Text
                      style={{
                        color: roleColor,
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
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
                      <Text
                        style={{
                          color: colors.textMuted,
                          fontSize: 12,
                          fontWeight: "600",
                        }}
                      >
                        {preview.targetGroupName}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {invError ? (
                <Text
                  style={{
                    color: colors.error,
                    fontSize: 13,
                    marginBottom: 12,
                  }}
                >
                  {INV_ERROR_MESSAGES[invError] ?? invError}
                </Text>
              ) : null}

              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => {
                    setPreview(null);
                    setInvError(null);
                  }}
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
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
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
                    <Text
                      style={{
                        color: colors.accentText,
                        fontSize: 15,
                        fontWeight: "700",
                      }}
                    >
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
        <Text
          style={{
            color: colors.accent,
            fontSize: 12,
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          PASO 2 DE 2
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: 26,
            fontWeight: "bold",
            marginTop: 6,
          }}
        >
          Contanos sobre vos
        </Text>
        <Text style={{ color: colors.textMuted, marginBottom: 28 }}>
          Esto ayuda a tu coach a personalizar tu plan
        </Text>

        {/* ── Mandatory profile fields (always shown) ────────────────── */}
        <Text
          style={{
            color: "rgba(255,255,255,0.15)",
            fontSize: 8,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          DATOS DEL PERFIL
        </Text>

        {/* Edad */}
        <View style={fieldCard}>
          <Text style={labelStyle}>EDAD</Text>
          <TextInput
            placeholder="años"
            placeholderTextColor={colors.textDisabled}
            keyboardType="numeric"
            value={sysEdad}
            onChangeText={setSysEdad}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 10,
              padding: 12,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
              fontSize: 15,
            }}
          />
        </View>

        {/* Altura */}
        <View style={fieldCard}>
          <Text style={labelStyle}>ALTURA</Text>
          <TextInput
            placeholder="cm"
            placeholderTextColor={colors.textDisabled}
            keyboardType="numeric"
            value={sysAltura}
            onChangeText={setSysAltura}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 10,
              padding: 12,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
              fontSize: 15,
            }}
          />
        </View>

        {/* Peso */}
        <View style={fieldCard}>
          <Text style={labelStyle}>PESO</Text>
          <TextInput
            placeholder="kg"
            placeholderTextColor={colors.textDisabled}
            keyboardType="numeric"
            value={sysPeso}
            onChangeText={setSysPeso}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 10,
              padding: 12,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
              fontSize: 15,
            }}
          />
        </View>

        {/* Posición */}
        <TouchableOpacity
          onPress={() => setCurrentSysPicker("position")}
          style={fieldCard}
        >
          <Text style={labelStyle}>POSICIÓN</Text>
          <Text
            style={{
              color: sysPosition ? colors.text : colors.textDisabled,
              fontSize: 15,
            }}
          >
            {sysPosition || "Seleccionar"}
          </Text>
        </TouchableOpacity>

        {/* ── Club custom questions ───────────────────────────────────── */}
        {questions.length > 0 && (
          <Text
            style={{
              color: "rgba(255,255,255,0.15)",
              fontSize: 8,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              marginBottom: 6,
              marginTop: 8,
            }}
          >
            PREGUNTAS DEL CLUB
          </Text>
        )}

        {loadingQuestions ? (
          <ActivityIndicator
            color={colors.accent}
            style={{ marginBottom: 24 }}
          />
        ) : (
          visibleQuestions.map((q) => renderQuestion(q))
        )}

        {formError ? (
          <Text
            style={{
              color: colors.error,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {formError}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleContinue}
          disabled={loadingForm || loadingQuestions}
          style={{
            backgroundColor: colors.accent,
            padding: 18,
            borderRadius: 14,
            alignItems: "center",
            opacity: loadingForm || loadingQuestions ? 0.7 : 1,
            marginTop: 8,
          }}
        >
          {loadingForm ? (
            <ActivityIndicator color={colors.accentText} />
          ) : (
            <Text
              style={{
                color: colors.accentText,
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              Continuar
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* SYSTEM PICKER MODAL (edad / position) */}
      <Modal
        visible={!!currentSysPicker}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
      >
        <Pressable
          onPress={() => setCurrentSysPicker(null)}
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
                Posición
              </Text>
              <FlatList
                data={POSITION_OPTIONS}
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = sysPosition === item;
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setSysPosition(item);
                        setCurrentSysPicker(null);
                      }}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        backgroundColor: isSelected
                          ? colors.accent + "22"
                          : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? colors.accent : colors.text,
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
              <TouchableOpacity onPress={() => setCurrentSysPicker(null)}>
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

      {/* PICKER MODAL for multiple_choice questions */}
      <Modal
        visible={!!currentPickerQuestion}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
      >
        <Pressable
          onPress={() => setCurrentPickerQuestion(null)}
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
                {currentPickerQuestion?.question_text}
              </Text>
              <FlatList
                data={
                  currentPickerQuestion
                    ? ((currentPickerQuestion.options as string[]) ?? [])
                    : []
                }
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected = currentPickerQuestion
                    ? answers[currentPickerQuestion.id] === item
                    : false;
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        if (currentPickerQuestion) {
                          setAnswer(currentPickerQuestion.id, item);
                          setCurrentPickerQuestion(null);
                        }
                      }}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        backgroundColor: isSelected
                          ? colors.accent + "22"
                          : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? colors.accent : colors.text,
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
              <TouchableOpacity onPress={() => setCurrentPickerQuestion(null)}>
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
