import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────

type LoggedSet = {
  reps: number;
  weight: number;
  rpe?: number | null;
};

type LoggedExercise = {
  exercise_id: string | null;
  exercise_name: string;
  sets: LoggedSet[];
};

type WorkoutLog = {
  id: string;
  created_at: string;
  duration_seconds?: number | null;
  notes?: string | null;
  exercises: LoggedExercise[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h ${String(m).padStart(2, "0")}min`;
  }
  if (m > 0) return `${m}min ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function formatHour(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function totalSets(log: WorkoutLog): number {
  return log.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
}

function totalVolume(log: WorkoutLog): number {
  return log.exercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets.reduce((s, set) => s + (set.reps ?? 0) * (set.weight ?? 0), 0),
    0,
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useFocusEffect(
    useCallback(() => {
      if (user) fetchLogs();
    }, [user]),
  );

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("workout_logs")
      .select("id, created_at, duration_seconds, notes, exercises")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setLogs((data as WorkoutLog[]) ?? []);
    setLoading(false);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: Platform.OS === "ios" ? 60 : 40,
          paddingBottom: 40,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 26,
            fontWeight: "bold",
            marginBottom: 4,
          }}
        >
          Historial
        </Text>
        <Text style={{ color: colors.textMuted, marginBottom: 24 }}>
          Tus entrenamientos registrados
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
          logs.map((log) => {
            const sets = totalSets(log);
            const vol = totalVolume(log);
            const isExpanded = !!expanded[log.id];

            return (
              <View
                key={log.id}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 14,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: isExpanded ? colors.accent : colors.border,
                  overflow: "hidden",
                }}
              >
                {/* ── Summary row ── */}
                <TouchableOpacity
                  onPress={() => toggleExpand(log.id)}
                  activeOpacity={0.75}
                  style={{ padding: 16 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      {/* Date */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Text
                          style={{
                            color: colors.text,
                            fontWeight: "700",
                            fontSize: 15,
                            textTransform: "capitalize",
                          }}
                        >
                          {formatDate(log.created_at)}
                        </Text>
                        <Text
                          style={{ color: colors.textDisabled, fontSize: 12 }}
                        >
                          {formatHour(log.created_at)}
                        </Text>
                      </View>

                      {/* Stats pills */}
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 8,
                          marginTop: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <StatPill
                          label={`${log.exercises.length} ejercicio${log.exercises.length !== 1 ? "s" : ""}`}
                          color="#6EE7B7"
                        />
                        <StatPill
                          label={`${sets} serie${sets !== 1 ? "s" : ""}`}
                          color="#6EE7B7"
                        />
                        {log.duration_seconds ? (
                          <StatPill
                            label={formatTime(log.duration_seconds)}
                            color="#2563EB"
                          />
                        ) : null}
                        {vol > 0 ? (
                          <StatPill
                            label={`${vol.toLocaleString("es-AR")} kg`}
                            color="#7C3AED"
                          />
                        ) : null}
                      </View>

                      {/* Notes */}
                      {log.notes ? (
                        <Text
                          style={{
                            color: "#888",
                            fontSize: 12,
                            marginTop: 8,
                            fontStyle: "italic",
                          }}
                          numberOfLines={isExpanded ? undefined : 1}
                        >
                          "{log.notes}"
                        </Text>
                      ) : null}
                    </View>

                    {/* Expand chevron */}
                    <Text
                      style={{
                        color: isExpanded ? colors.accent : colors.textDisabled,
                        fontSize: 16,
                        marginLeft: 12,
                        marginTop: 2,
                      }}
                    >
                      {isExpanded ? "▲" : "▼"}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* ── Expanded: exercise detail ── */}
                {isExpanded && (
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      paddingHorizontal: 16,
                      paddingBottom: 16,
                      paddingTop: 12,
                    }}
                  >
                    {log.exercises.map((ex, exIdx) => (
                      <View
                        key={exIdx}
                        style={{
                          marginBottom:
                            exIdx < log.exercises.length - 1 ? 14 : 0,
                        }}
                      >
                        {/* Exercise name */}
                        <Text
                          style={{
                            color: colors.text,
                            fontWeight: "600",
                            fontSize: 13,
                            marginBottom: 6,
                          }}
                        >
                          {ex.exercise_name}
                        </Text>

                        {/* Sets */}
                        {ex.sets.map((set, sIdx) => (
                          <View
                            key={sIdx}
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              paddingVertical: 5,
                              paddingHorizontal: 10,
                              backgroundColor: colors.setRowBg,
                              borderRadius: 8,
                              marginBottom: 4,
                            }}
                          >
                            <Text
                              style={{
                                color: colors.textDisabled,
                                fontSize: 12,
                                width: 24,
                              }}
                            >
                              {sIdx + 1}
                            </Text>
                            <Text
                              style={{
                                color: colors.textMuted,
                                fontSize: 13,
                                flex: 1,
                              }}
                            >
                              {set.reps > 0
                                ? `${set.reps} rep${set.reps !== 1 ? "s" : ""}`
                                : "—"}
                              {set.weight > 0 ? ` · ${set.weight} kg` : ""}
                            </Text>
                            {set.rpe != null && (
                              <Text
                                style={{
                                  color: colors.textDisabled,
                                  fontSize: 11,
                                  fontStyle: "italic",
                                }}
                              >
                                RPE {set.rpe}
                              </Text>
                            )}
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// ─── StatPill ─────────────────────────────────────────────────────────────────

function StatPill({ label, color }: { label: string; color: string }) {
  return (
    <View
      style={{
        backgroundColor: `${color}18`,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: `${color}40`,
      }}
    >
      <Text style={{ color, fontSize: 11, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}
