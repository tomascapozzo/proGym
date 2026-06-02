import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import type {
  ClubForm,
  ClubFormQuestion,
  OneRmOptions,
  ScaleOptions,
} from "@/types/forms";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FormScreen() {
  const { distributionId } = useLocalSearchParams<{ distributionId: string }>();
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [form, setForm] = useState<ClubForm | null>(null);
  const [questions, setQuestions] = useState<ClubFormQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPickerQuestion, setCurrentPickerQuestion] = useState<ClubFormQuestion | null>(null);

  useEffect(() => {
    if (distributionId && user) fetchForm();
  }, [distributionId, user]);

  const fetchForm = async () => {
    setLoading(true);

    const { data: dist, error: distErr } = await supabase
      .from("club_form_distributions")
      .select("id, form_id, due_at, form:club_forms!form_id(*)")
      .eq("id", distributionId)
      .single();

    if (distErr || !dist) {
      setError("No se encontro el formulario.");
      setLoading(false);
      return;
    }

    setForm(dist.form as unknown as ClubForm);

    const { data: qs } = await supabase
      .from("club_form_questions")
      .select("*")
      .eq("form_id", dist.form_id)
      .order("order_index");

    setQuestions((qs as ClubFormQuestion[]) ?? []);

    // Pre-fill existing answers if the player already started
    const { data: existingResponse } = await supabase
      .from("club_form_responses")
      .select("id, submitted_at")
      .eq("distribution_id", distributionId)
      .eq("user_id", user!.id)
      .maybeSingle();

    if (existingResponse?.id) {
      const { data: existingAnswers } = await supabase
        .from("club_form_answers")
        .select("question_id, answer_text, answer_number, answer_options")
        .eq("response_id", existingResponse.id);

      if (existingAnswers) {
        const prefilled: Record<string, string | number | string[]> = {};
        for (const a of existingAnswers) {
          if (a.answer_text !== null) prefilled[a.question_id] = a.answer_text;
          else if (a.answer_number !== null) prefilled[a.question_id] = a.answer_number;
          else if (a.answer_options !== null) prefilled[a.question_id] = (a.answer_options as string[])[0] ?? "";
        }
        setAnswers(prefilled);
      }
    }

    setLoading(false);
  };

  const setAnswer = (questionId: string, value: string | number | string[]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!user || !form) return;
    setError(null);

    const missing = questions.filter(
      (q) =>
        q.required &&
        (answers[q.id] === undefined || answers[q.id] === "" || answers[q.id] === null),
    );
    if (missing.length > 0) {
      setError("Por favor completá todas las preguntas requeridas.");
      return;
    }

    setSubmitting(true);

    const { data: response, error: respErr } = await supabase
      .from("club_form_responses")
      .upsert(
        {
          distribution_id: distributionId,
          form_id: form.id,
          user_id: user.id,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: "distribution_id,user_id" },
      )
      .select("id")
      .single();

    if (respErr || !response) {
      setError("Error al enviar el formulario. Intentá de nuevo.");
      setSubmitting(false);
      return;
    }

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
            ? val !== undefined && val !== "" ? Number(val) : null
            : null,
        answer_options:
          q.type === "multiple_choice"
            ? val !== undefined ? [String(val)] : null
            : null,
      };
    });

    const { error: answersErr } = await supabase
      .from("club_form_answers")
      .upsert(answerRows, { onConflict: "response_id,question_id" });

    setSubmitting(false);

    if (answersErr) {
      setError("Error al guardar las respuestas. Intentá de nuevo.");
      return;
    }

    router.back();
  };

  // ── Question renderer ──────────────────────────────────────────────────────

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

  const renderQuestion = (q: ClubFormQuestion) => {
    switch (q.type) {
      case "text":
        return (
          <View key={q.id} style={fieldCard}>
            <Text style={labelStyle}>{q.question_text.toUpperCase()}</Text>
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
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={[labelStyle, { marginBottom: 0, flex: 1 }]}>
                {q.question_text.toUpperCase()}
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
                      backgroundColor: answers[q.id] === val ? colors.accent : colors.surface,
                      borderWidth: 1,
                      borderColor: answers[q.id] === val ? colors.accent : colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: answers[q.id] === val ? colors.accentText : colors.textMuted,
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
            <Text style={labelStyle}>{q.question_text.toUpperCase()}</Text>
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
            <Text style={labelStyle}>{q.question_text.toUpperCase()}</Text>
            {(opts.min_label || opts.max_label) && (
              <View
                style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>{opts.min_label}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>{opts.max_label}</Text>
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
                        answers[q.id] === n ? colors.accentText : colors.textMuted,
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
        const label = opts?.exercise_name
          ? `${q.question_text.toUpperCase()} — ${opts.exercise_name}`
          : q.question_text.toUpperCase();
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

  // ── Loading / error states ─────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!form) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center", padding: 32 }}>
        <Text style={{ color: colors.textMuted, textAlign: "center" }}>
          {error ?? "No se encontro el formulario."}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.accent, fontWeight: "600" }}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.bg,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 17, fontWeight: "700", flex: 1 }} numberOfLines={1}>
          {form.title}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {questions.map((q) => renderQuestion(q))}

        {error ? (
          <Text style={{ color: colors.error, textAlign: "center", marginBottom: 12 }}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          style={{
            backgroundColor: colors.accent,
            padding: 18,
            borderRadius: 14,
            alignItems: "center",
            opacity: submitting ? 0.7 : 1,
            marginTop: 8,
          }}
        >
          {submitting ? (
            <ActivityIndicator color={colors.accentText} />
          ) : (
            <Text style={{ color: colors.accentText, fontWeight: "600", fontSize: 16 }}>
              Enviar
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* PICKER MODAL for multiple_choice questions */}
      <Modal
        visible={!!currentPickerQuestion}
        transparent
        animationType="slide"
        presentationStyle="overFullScreen"
      >
        <Pressable
          onPress={() => setCurrentPickerQuestion(null)}
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
                {currentPickerQuestion?.question_text}
              </Text>
              <FlatList
                data={
                  currentPickerQuestion
                    ? (currentPickerQuestion.options as string[]) ?? []
                    : []
                }
                keyExtractor={(item) => item}
                renderItem={({ item }) => {
                  const isSelected =
                    currentPickerQuestion
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
              <TouchableOpacity onPress={() => setCurrentPickerQuestion(null)}>
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
