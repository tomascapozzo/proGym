import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import type { Routine, RoutineDay } from "@/types/routine";
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
  { text: "No cuentes los días, haz que los días cuenten.", author: "Muhammad Ali" },
  { text: "El cuerpo logra lo que la mente cree.", author: "Jim Evans" },
  { text: "La disciplina es el puente entre metas y logros.", author: "Jim Rohn" },
  { text: "El dolor que sientes hoy será la fuerza que sentirás mañana.", author: "" },
  { text: "El éxito no viene de lo que haces de vez en cuando, sino de lo que haces consistentemente.", author: "Marie Forleo" },
  { text: "No se trata de ser mejor que los demás, sino de ser mejor que ayer.", author: "" },
  { text: "Cada entrenamiento es un paso más hacia tu mejor versión.", author: "" },
  { text: "La fuerza no viene de lo que puedes hacer, sino de superar lo que creías que no podías.", author: "Rikki Rogers" },
  { text: "Tu único competidor eres tú de ayer.", author: "" },
  { text: "Haz hoy lo que tu yo de mañana te agradecerá.", author: "" },
];

// ─── Helpers (kept in sync with train.tsx) ───────────────────────────────────
function getNextDay(
  routine: Routine,
): { day: RoutineDay; index: number; isSkippedFallback: boolean } | null {
  const completed = routine.progress?.completed_days ?? [];
  const skipped = routine.progress?.skipped_days ?? [];

  // First: first non-completed, non-skipped day
  for (let i = 0; i < routine.data.dias.length; i++) {
    if (!completed.includes(i) && !skipped.includes(i))
      return { day: routine.data.dias[i], index: i, isSkippedFallback: false };
  }
  // Fallback: all remaining days are skipped — show first skipped so routine isn't stuck
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>

        {/* ── GREETING ── */}
        <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 16 }}>
          Bienvenido,
        </Text>
        <Text style={{ color: colors.text, fontSize: 28, fontWeight: "bold", marginBottom: 24 }}>
          {firstName} 👋
        </Text>

        {/* ── MOTIVATIONAL QUOTE ── */}
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 18,
            marginBottom: 28,
            borderLeftWidth: 3,
            borderLeftColor: colors.accent,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 14, lineHeight: 22, fontStyle: "italic" }}>
            "{quote.text}"
          </Text>
          {quote.author ? (
            <Text style={{ color: colors.accent, fontSize: 12, marginTop: 8 }}>
              — {quote.author}
            </Text>
          ) : null}
        </View>

        {/* ── TODAY'S WORKOUT ── */}
        <Text
          style={{ color: colors.textMuted, fontSize: 12, letterSpacing: 1, marginBottom: 10 }}
        >
          HOY
        </Text>

        {loadingRoutine ? (
          <ActivityIndicator
            color={colors.accent}
            style={{ marginBottom: 28, alignSelf: "flex-start" }}
          />
        ) : !routine ? (
          // No active routine
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 28,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.textMuted, textAlign: "center", lineHeight: 22 }}>
              No tenés una rutina activa.{"\n"}
              <Text style={{ color: colors.accent }} onPress={() => router.push("/(tabs)/train")}>
                Creá una en Entrenar
              </Text>{" "}
              para empezar.
            </Text>
          </View>
        ) : nextDay ? (
          // Active routine with a pending day
          <TouchableOpacity
            onPress={startSession}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.accentBgAlt,
              borderRadius: 16,
              padding: 20,
              marginBottom: 28,
              borderWidth: 1,
              borderColor: nextDay.isSkippedFallback ? "#F59E0B" : colors.accent,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              {nextDay.isSkippedFallback && (
                <View
                  style={{
                    backgroundColor: "#F59E0B22",
                    borderRadius: 4,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    alignSelf: "flex-start",
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ color: "#F59E0B", fontSize: 9, fontWeight: "700", letterSpacing: 0.5 }}>
                    DÍA SALTADO
                  </Text>
                </View>
              )}
              <Text
                style={{
                  color: nextDay.isSkippedFallback ? "#F59E0B" : colors.accent,
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                {nextDay.day.dia}
              </Text>
              <Text
                style={{ color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: 4 }}
              >
                {nextDay.day.enfoque}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                {nextDay.day.ejercicios.length} ejercicios ·{" "}
                {(routine.progress?.completed_days?.length ?? 0) + 1}/{routine.data.dias.length} días
              </Text>
            </View>
            <View
              style={{
                backgroundColor: nextDay.isSkippedFallback ? "#F59E0B" : colors.accent,
                borderRadius: 22,
                width: 44,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.accentText, fontWeight: "700", fontSize: 18 }}>▶</Text>
            </View>
          </TouchableOpacity>
        ) : (
          // All days done — routine is pending restart or complete
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 20,
              marginBottom: 28,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 28 }}>🎉</Text>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>
              {routine.type === "daily" ? "¡Sesión completada!" : "¡Semana completada!"}
            </Text>
            <Text style={{ color: colors.textMuted, textAlign: "center", fontSize: 13 }}>
              {routine.type === "daily"
                ? "Creá una nueva rutina cuando estés listo."
                : "Vas a poder reiniciar la rutina desde la pestaña Entrenar."}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/train")}>
              <Text style={{ color: colors.accent, fontWeight: "600" }}>
                Ir a Entrenar →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── COMING SOON: IA ── */}
        <Text
          style={{ color: colors.textMuted, fontSize: 12, letterSpacing: 1, marginBottom: 10 }}
        >
          PRÓXIMAMENTE
        </Text>
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 18,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
            opacity: 0.7,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Text style={{ fontSize: 20 }}>✦</Text>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}>
              Rutina generada por IA
            </Text>
          </View>
          <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 20 }}>
            Pronto podrás pedirle a proGym que arme una rutina personalizada según tu perfil,
            objetivos y equipamiento.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}
