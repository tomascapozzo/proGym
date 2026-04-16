import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SCREEN_WIDTH = Dimensions.get("window").width;

// ─── Types ────────────────────────────────────────────────────────────────────

type WorkoutLog = {
  id: string;
  created_at: string;
  exercises: {
    exercise_name: string;
    sets: { reps: number; weight: number }[];
  }[];
};

type BarData = { label: string; value: number };

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({
  data,
  maxVal,
  barColor,
  labelColor,
  height = 120,
  unit = "",
}: {
  data: BarData[];
  maxVal: number;
  barColor: string;
  labelColor: string;
  height?: number;
  unit?: string;
}) {
  if (data.length === 0) return null;
  const chartW = SCREEN_WIDTH - 40 - 32;
  const gap = 4;
  const barW = Math.floor((chartW - gap * (data.length - 1)) / data.length);

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap }}>
      {data.map((item, i) => {
        const barH =
          maxVal > 0
            ? Math.max(2, Math.round((item.value / maxVal) * height))
            : 2;
        const isEmpty = item.value === 0;
        return (
          <View key={i} style={{ width: barW, alignItems: "center" }}>
            {item.value > 0 && (
              <Text
                style={{
                  color: barColor,
                  fontSize: 8,
                  marginBottom: 2,
                  fontWeight: "700",
                }}
              >
                {item.value}
                {unit}
              </Text>
            )}
            <View
              style={{
                width: barW,
                height: barH,
                backgroundColor: isEmpty ? `${barColor}28` : barColor,
                borderRadius: 4,
              }}
            />
            <Text
              style={{
                color: labelColor,
                fontSize: 8,
                marginTop: 4,
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeeklyData(logs: WorkoutLog[]): BarData[] {
  const result: BarData[] = [];
  const now = new Date();

  for (let w = 7; w >= 0; w--) {
    const refDate = new Date(now);
    refDate.setDate(now.getDate() - w * 7);
    const day = refDate.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(refDate);
    monday.setDate(refDate.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);

    const count = logs.filter((log) => {
      const d = new Date(log.created_at);
      return d >= monday && d < nextMonday;
    }).length;

    result.push({
      label: `${monday.getDate()}/${monday.getMonth() + 1}`,
      value: count,
    });
  }

  return result;
}

function getExerciseProgression(
  logs: WorkoutLog[],
  exerciseName: string
): BarData[] {
  const sessions: BarData[] = [];

  logs
    .filter((log) =>
      log.exercises.some((ex) => ex.exercise_name === exerciseName)
    )
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    .slice(-10)
    .forEach((log) => {
      const ex = log.exercises.find((e) => e.exercise_name === exerciseName);
      if (!ex) return;
      const maxW = Math.max(...ex.sets.map((s) => Number(s.weight) || 0));
      if (maxW <= 0) return;
      const d = new Date(log.created_at);
      sessions.push({
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        value: maxW,
      });
    });

  return sessions;
}

function getExercisesWithWeight(logs: WorkoutLog[]): string[] {
  const names = new Set<string>();
  logs.forEach((log) =>
    log.exercises.forEach((ex) => {
      if (ex.sets?.some((s) => Number(s.weight) > 0)) {
        names.add(ex.exercise_name);
      }
    })
  );
  return Array.from(names).sort();
}

function getMaxWeight(logs: WorkoutLog[], exerciseName: string): number {
  let max = 0;
  logs.forEach((log) =>
    log.exercises.forEach((ex) => {
      if (ex.exercise_name !== exerciseName) return;
      ex.sets?.forEach((s) => {
        const w = Number(s.weight) || 0;
        if (w > max) max = w;
      });
    })
  );
  return max;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) fetchLogs();
    }, [user])
  );

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("workout_logs")
      .select("id, created_at, exercises")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: true });
    if (data) setLogs(data as WorkoutLog[]);
    setLoading(false);
  };

  const weeklyData = getWeeklyData(logs);
  const weeklyMax = Math.max(...weeklyData.map((d) => d.value), 1);
  const weeklyAvg = (
    weeklyData.reduce((s, d) => s + d.value, 0) / weeklyData.length
  ).toFixed(1);

  const exerciseNames = getExercisesWithWeight(logs);

  const progressionData = selectedExercise
    ? getExerciseProgression(logs, selectedExercise)
    : [];
  const progressionMax = Math.max(...progressionData.map((d) => d.value), 1);

  const prDelta =
    progressionData.length >= 2
      ? (
          ((progressionData[progressionData.length - 1].value -
            progressionData[0].value) /
            progressionData[0].value) *
          100
        ).toFixed(0)
      : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: Platform.OS === "ios" ? 60 : 40,
          paddingBottom: 40,
        }}
      >
        {/* ── HEADER ── */}
        <Text
          style={{
            color: colors.text,
            fontSize: 26,
            fontWeight: "bold",
            marginBottom: 4,
          }}
        >
          Progreso
        </Text>
        <Text style={{ color: colors.textMuted, marginBottom: 28 }}>
          Tu evolución a lo largo del tiempo
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
        ) : logs.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 32,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 14,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Todavía no tenés entrenamientos registrados.{"\n"}
              ¡Completá tu primera sesión!
            </Text>
          </View>
        ) : (
          <>
            {/* ── FRECUENCIA SEMANAL ── */}
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 12,
                letterSpacing: 1,
                marginBottom: 10,
              }}
            >
              FRECUENCIA SEMANAL
            </Text>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 14,
                padding: 16,
                marginBottom: 28,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                  Últimas 8 semanas
                </Text>
                <View
                  style={{
                    backgroundColor: colors.accentBgAlt,
                    borderRadius: 20,
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                  }}
                >
                  <Text
                    style={{
                      color: colors.accent,
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {weeklyAvg} días/sem
                  </Text>
                </View>
              </View>
              <View style={{ height: 14 }} />
              <BarChart
                data={weeklyData}
                maxVal={weeklyMax}
                barColor={colors.accent}
                labelColor={colors.textMuted}
                height={120}
              />
            </View>

            {/* ── PROGRESIÓN DE PESO ── */}
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 12,
                letterSpacing: 1,
                marginBottom: 10,
              }}
            >
              PROGRESIÓN DE PESO
            </Text>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 14,
                padding: 16,
                marginBottom: 28,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                  Máximo por sesión · últimas 10
                </Text>
                {prDelta !== null && (
                  <View
                    style={{
                      backgroundColor:
                        Number(prDelta) >= 0
                          ? colors.accentBgAlt
                          : "transparent",
                      borderRadius: 20,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                    }}
                  >
                    <Text
                      style={{
                        color:
                          Number(prDelta) >= 0 ? colors.accent : colors.error,
                        fontSize: 11,
                        fontWeight: "700",
                      }}
                    >
                      {Number(prDelta) >= 0 ? "+" : ""}
                      {prDelta}%
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={() => setPickerVisible(true)}
                activeOpacity={0.75}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    flex: 1,
                    marginRight: 8,
                    color: selectedExercise
                      ? colors.text
                      : colors.textDisabled,
                  }}
                  numberOfLines={1}
                >
                  {selectedExercise ?? "Seleccionar ejercicio..."}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>▾</Text>
              </TouchableOpacity>

              {selectedExercise && progressionData.length === 0 && (
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 12,
                    textAlign: "center",
                    marginTop: 16,
                  }}
                >
                  Sin datos de peso registrados para este ejercicio.
                </Text>
              )}

              {selectedExercise && progressionData.length > 0 && (
                <View style={{ marginTop: 16 }}>
                  <BarChart
                    data={progressionData}
                    maxVal={progressionMax}
                    barColor={colors.accent}
                    labelColor={colors.textMuted}
                    height={120}
                    unit=" kg"
                  />
                </View>
              )}
            </View>

            {/* ── MÁXIMOS POR EJERCICIO ── */}
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 12,
                letterSpacing: 1,
                marginBottom: 10,
              }}
            >
              MÁXIMOS REGISTRADOS
            </Text>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: "hidden",
              }}
            >
              {exerciseNames.map((name, idx) => (
                <View
                  key={name}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderBottomWidth: idx < exerciseNames.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text
                    style={{ color: colors.text, fontSize: 13, flex: 1, marginRight: 12 }}
                    numberOfLines={1}
                  >
                    {name}
                  </Text>
                  <View
                    style={{
                      backgroundColor: colors.accentBgAlt,
                      borderRadius: 20,
                      paddingHorizontal: 10,
                      paddingVertical: 3,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.accent,
                        fontSize: 12,
                        fontWeight: "700",
                      }}
                    >
                      {getMaxWeight(logs, name)} kg
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* ── EXERCISE PICKER MODAL ── */}
      <Modal visible={pickerVisible} transparent animationType="slide">
        <Pressable
          onPress={() => setPickerVisible(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}
        >
          <Pressable>
            <View
              style={{
                backgroundColor: colors.surface,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                padding: 16,
                maxHeight: 440,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 10,
                }}
              >
                Seleccionar ejercicio
              </Text>
              <FlatList
                data={exerciseNames}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedExercise(item);
                      setPickerVisible(false);
                    }}
                    activeOpacity={0.75}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      backgroundColor:
                        selectedExercise === item
                          ? `${colors.accent}22`
                          : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color:
                          selectedExercise === item
                            ? colors.accent
                            : colors.text,
                      }}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity onPress={() => setPickerVisible(false)}>
                <Text
                  style={{
                    color: colors.accent,
                    textAlign: "right",
                    marginTop: 10,
                    fontWeight: "600",
                  }}
                >
                  Cerrar
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
