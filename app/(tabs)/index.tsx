import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
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
  {
    text: "No cuentes los días, haz que los días cuenten.",
    author: "Muhammad Ali",
  },
  { text: "El cuerpo logra lo que la mente cree.", author: "Jim Evans" },
  {
    text: "La disciplina es el puente entre metas y logros.",
    author: "Jim Rohn",
  },
  {
    text: "El dolor que sientes hoy será la fuerza que sentirás mañana.",
    author: "",
  },
  {
    text: "El éxito no viene de lo que haces de vez en cuando, sino de lo que haces consistentemente.",
    author: "Marie Forleo",
  },
  {
    text: "No se trata de ser mejor que los demás, sino de ser mejor que ayer.",
    author: "",
  },
  {
    text: "Cada entrenamiento es un paso más hacia tu mejor versión.",
    author: "",
  },
  {
    text: "La fuerza no viene de lo que puedes hacer, sino de superar lo que creías que no podías.",
    author: "Rikki Rogers",
  },
  { text: "Tu único competidor eres tú de ayer.", author: "" },
  { text: "Haz hoy lo que tu yo de mañana te agradecerá.", author: "" },
];

type RoutineDay = {
  dia: string;
  enfoque: string;
  ejercicios: {
    nombre: string;
    series: number;
    reps: string;
    descanso: string;
  }[];
};

type Routine = { id: string; data: { nombre: string; dias: RoutineDay[] }; created_at: string };

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { colors } = useTheme();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loadingRoutine, setLoadingRoutine] = useState(true);
  const [totalWorkouts, setTotalWorkouts] = useState(0);

  const quote = useMemo(() => {
    return QUOTES[new Date().getDate() % QUOTES.length];
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) fetchData();
    }, [user]),
  );

  const fetchData = async () => {
    setLoadingRoutine(true);
    const [routineRes, countRes] = await Promise.all([
      supabase
        .from("routines")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      supabase
        .from("workout_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id),
    ]);
    setRoutine(routineRes.data ?? null);
    setTotalWorkouts(countRes.count ?? 0);
    setLoadingRoutine(false);
  };

  // Cycle through routine days based on workout count
  const suggestedDay = useMemo((): {
    day: RoutineDay;
    index: number;
  } | null => {
    if (!routine) return null;
    const idx = totalWorkouts % routine.data.dias.length;
    return { day: routine.data.dias[idx], index: idx };
  }, [routine, totalWorkouts]);

  const startSuggestedSession = () => {
    if (!suggestedDay) return;
    router.push({
      pathname: "/session",
      params: {
        type: "routine",
        dayData: JSON.stringify(suggestedDay.day),
        dayIndex: String(suggestedDay.index),
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
        <Text
          style={{
            color: colors.text,
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 24,
          }}
        >
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
          <Text
            style={{
              color: colors.text,
              fontSize: 14,
              lineHeight: 22,
              fontStyle: "italic",
            }}
          >
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
          style={{
            color: colors.textMuted,
            fontSize: 12,
            letterSpacing: 1,
            marginBottom: 10,
          }}
        >
          HOY
        </Text>

        {loadingRoutine ? (
          <ActivityIndicator
            color={colors.accent}
            style={{ marginBottom: 28, alignSelf: "flex-start" }}
          />
        ) : suggestedDay ? (
          <TouchableOpacity
            onPress={startSuggestedSession}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.accentBgAlt,
              borderRadius: 16,
              padding: 20,
              marginBottom: 28,
              borderWidth: 1,
              borderColor: colors.accent,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: colors.accent, fontSize: 12, marginBottom: 4 }}
              >
                {suggestedDay.day.dia}
              </Text>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: "700",
                  marginBottom: 4,
                }}
              >
                {suggestedDay.day.enfoque}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                {suggestedDay.day.ejercicios.length} ejercicios
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.accent,
                borderRadius: 22,
                width: 44,
                height: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.accentText,
                  fontWeight: "700",
                  fontSize: 18,
                }}
              >
                ▶
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
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
            <Text style={{ color: colors.textMuted, textAlign: "center" }}>
              No tenés rutina aún.{"\n"}
              <Text
                style={{ color: colors.accent }}
                onPress={() => router.push("/(tabs)/train")}
              >
                Creá una en Entrenar
              </Text>{" "}
              para empezar.
            </Text>
          </View>
        )}

        {/* ── COMING SOON: IA ── */}
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 12,
            letterSpacing: 1,
            marginBottom: 10,
          }}
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
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 13,
              lineHeight: 20,
            }}
          >
            Pronto podrás pedirle a proGym que arme una rutina personalizada según tu perfil, objetivos y equipamiento.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
