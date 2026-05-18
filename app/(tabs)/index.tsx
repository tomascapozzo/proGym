import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import type { Routine, RoutineDay } from "@/types/routine";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Motivational quotes ─────────────────────────────────────────────────────
const QUOTES = [
  "No cuentes los días, haz que los días cuenten.",
  "El cuerpo logra lo que la mente cree.",
  "La disciplina es el puente entre metas y logros.",
  "El dolor que sientes hoy será la fuerza que sentirás mañana.",
  "No se trata de ser mejor que los demás, sino de ser mejor que ayer.",
  "Cada entrenamiento es un paso más hacia tu mejor versión.",
  "La fuerza no viene de lo que puedes hacer, sino de superar lo que creías que no podías.",
  "Tu único competidor eres tú de ayer.",
  "Haz hoy lo que tu yo de mañana te agradecerá.",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getNextDay(
  routine: Routine,
): { day: RoutineDay; index: number; isSkippedFallback: boolean } | null {
  const completed = routine.progress?.completed_days ?? [];
  const skipped = routine.progress?.skipped_days ?? [];

  for (let i = 0; i < routine.data.dias.length; i++) {
    if (!completed.includes(i) && !skipped.includes(i))
      return { day: routine.data.dias[i], index: i, isSkippedFallback: false };
  }
  for (let i = 0; i < routine.data.dias.length; i++) {
    if (!completed.includes(i))
      return { day: routine.data.dias[i], index: i, isSkippedFallback: true };
  }
  return null;
}

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { colors } = useTheme();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loadingRoutine, setLoadingRoutine] = useState(true);

  const quote = useMemo(() => QUOTES[new Date().getDate() % QUOTES.length], []);

  useFocusEffect(
    useCallback(() => {
      if (user) fetchData();
    }, [user]),
  );

  const fetchData = async () => {
    setLoadingRoutine(true);
    const { data } = await supabase
      .from("routines")
      .select("*")
      .eq("user_id", user!.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    setRoutine(data ?? null);
    setLoadingRoutine(false);
  };

  const nextDay = useMemo(() => {
    if (!routine) return null;
    return getNextDay(routine);
  }, [routine]);

  const startSession = () => {
    if (!nextDay || !routine) return;
    router.push({
      pathname: "/session",
      params: {
        type: "routine",
        dayData: JSON.stringify(nextDay.day),
        dayIndex: String(nextDay.index),
        routineId: routine.id,
        routineType: routine.type,
        completedDays: JSON.stringify(routine.progress?.completed_days ?? []),
        totalDays: String(routine.data.dias.length),
      },
    });
  };

  const firstName = profile?.name?.split(" ")[0] ?? "atleta";
  const completedCount = routine?.progress?.completed_days?.length ?? 0;
  const totalDays = routine?.data?.dias?.length ?? 1;
  const completionPct = Math.round((completedCount / totalDays) * 100);
  const accentColor = nextDay?.isSkippedFallback
    ? colors.routineColors.skipped
    : colors.accent;

  // Exercise count for the upcoming day
  const exerciseCount = nextDay
    ? (nextDay.day.ejercicios?.length ?? 0) +
      (nextDay.day.circuitos?.reduce(
        (sum, c) => sum + (c.ejercicios?.length ?? 0),
        0,
      ) ?? 0)
    : 0;

  // PR data — show up to 3 tracked exercises that have a recorded 1RM
  const prExercises = profile?.pr_exercises ?? [];
  const oneRm = profile?.one_rm ?? {};
  const topPrs = prExercises.filter((ex) => oneRm[ex] != null).slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── HEADER ── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24 }}>
          {/* Nav row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                backgroundColor: colors.accent + "18",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="fitness-outline" size={20} color={colors.accent} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="notifications-outline" size={18} color={colors.textMuted} />
              </View>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: colors.accent + "25",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 15 }}>
                  {firstName[0]?.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Greeting */}
          <Text style={{ color: colors.textMuted, fontSize: 15, marginBottom: 2 }}>
            Bienvenido,
          </Text>
          <Text
            style={{
              color: colors.accent,
              fontSize: 40,
              fontWeight: "800",
              letterSpacing: -1,
              marginBottom: 8,
            }}
          >
            {firstName}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            {quote}
          </Text>
        </View>

        {/* ── TODAY'S WORKOUT ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          {loadingRoutine ? (
            <ActivityIndicator color={colors.accent} style={{ alignSelf: "flex-start" }} />
          ) : !routine ? (
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.textMuted, textAlign: "center", lineHeight: 22 }}>
                No tenés una rutina activa.{"\n"}
                <Text
                  style={{ color: colors.accent }}
                  onPress={() => router.push("/(tabs)/train")}
                >
                  Creá una en Entrenar
                </Text>{" "}
                para empezar.
              </Text>
            </View>
          ) : nextDay ? (
            <TouchableOpacity
              onPress={startSession}
              activeOpacity={0.88}
              style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: accentColor + "40",
              }}
            >
              {/* Top row: icon + label + percentage */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 14,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      backgroundColor: accentColor + "20",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="flash" size={19} color={accentColor} />
                  </View>
                  <View>
                    {nextDay.isSkippedFallback && (
                      <Text
                        style={{
                          color: colors.routineColors.skipped,
                          fontSize: 9,
                          fontWeight: "700",
                          letterSpacing: 0.8,
                          marginBottom: 2,
                        }}
                      >
                        DÍA SALTADO
                      </Text>
                    )}
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
                      {completedCount > 0 ? "Continuar día" : "Empezar día"}
                    </Text>
                  </View>
                </View>

                {totalDays > 1 && (
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        color: accentColor,
                        fontSize: 24,
                        fontWeight: "800",
                        lineHeight: 28,
                      }}
                    >
                      {completionPct}%
                    </Text>
                    <Text style={{ color: colors.textMuted, fontSize: 10 }}>completado</Text>
                  </View>
                )}
              </View>

              {/* Focus label */}
              <Text
                style={{
                  color: accentColor,
                  fontSize: 15,
                  fontWeight: "600",
                  marginBottom: 4,
                }}
              >
                {nextDay.day.enfoque}
                {nextDay.day.dia ? ` • ${nextDay.day.dia}` : ""}
              </Text>

              {/* Subtitle */}
              <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 16 }}>
                {totalDays > 1
                  ? `${completedCount} de ${totalDays} días completados`
                  : exerciseCount > 0
                  ? `${exerciseCount} ejercicio${exerciseCount !== 1 ? "s" : ""}`
                  : "Listo para entrenar"}
              </Text>

              {/* Progress segments */}
              {totalDays > 1 && (
                <View style={{ flexDirection: "row", gap: 4 }}>
                  {Array.from({ length: totalDays }, (_, i) => {
                    const doneList = routine.progress?.completed_days ?? [];
                    const skipList = routine.progress?.skipped_days ?? [];
                    const isDone = doneList.includes(i);
                    const isSkippedDay = skipList.includes(i);
                    const isNext = i === nextDay.index;
                    return (
                      <View
                        key={i}
                        style={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: isDone
                            ? accentColor
                            : isSkippedDay
                            ? colors.textMuted + "30"
                            : isNext
                            ? accentColor + "45"
                            : colors.border,
                        }}
                      />
                    );
                  })}
                </View>
              )}
            </TouchableOpacity>
          ) : (
            // All days done
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border,
                gap: 10,
              }}
            >
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
                {routine.type === "daily" ? "Sesión completada" : "Semana completada"}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 20 }}>
                {routine.type === "daily"
                  ? "Creá una nueva rutina cuando estés listo."
                  : "Podés reiniciar la rutina desde la pestaña Entrenar."}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/train")}>
                <Text style={{ color: colors.accent, fontWeight: "600", fontSize: 13 }}>
                  Ir a Entrenar
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── PR'S ACTUALES ── */}
        {topPrs.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="trending-up" size={18} color={colors.textMuted} />
                <Text style={{ color: colors.text, fontSize: 16, fontWeight: "700" }}>
                  PR's actuales
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/profile")}
                style={{ flexDirection: "row", alignItems: "center", gap: 2 }}
              >
                <Text style={{ color: colors.accent, fontSize: 13, fontWeight: "600" }}>
                  Ver todos
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.accent} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10 }}>
              {topPrs.map((ex) => (
                <View
                  key={ex}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 14,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      backgroundColor: colors.surface,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="barbell-outline" size={22} color={colors.textMuted} />
                  </View>

                  <Text
                    style={{
                      flex: 1,
                      color: colors.text,
                      fontWeight: "600",
                      fontSize: 15,
                    }}
                    numberOfLines={1}
                  >
                    {ex}
                  </Text>

                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "700",
                      fontSize: 15,
                      marginRight: 8,
                    }}
                  >
                    {oneRm[ex]} kg
                  </Text>

                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      backgroundColor: colors.accent + "18",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="trending-up" size={16} color={colors.accent} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── CREAR TU RUTINA ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/train")}
            activeOpacity={0.85}
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 18,
              borderWidth: 1,
              borderColor: colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                backgroundColor: colors.surface,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="clipboard-outline" size={20} color={colors.textMuted} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>
                Crear tu rutina
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                Diseña tu plan personalizado
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ── AI COACH (PRÓXIMAMENTE) ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <View
            style={{
              borderRadius: 20,
              padding: 20,
              borderWidth: 1.5,
              borderColor: colors.accent + "55",
              backgroundColor: colors.card,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                backgroundColor: colors.accent + "15",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="hardware-chip-outline" size={26} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "800", fontSize: 18 }}>
                AI Coach
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
                Tu entrenador inteligente
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 1 }}>
                Planifica. Ajusta. Evoluciona.
              </Text>
            </View>
            <View
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.accent + "40",
                backgroundColor: colors.accent + "15",
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 12 }}>
                Próximamente
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
