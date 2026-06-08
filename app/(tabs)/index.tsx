import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { useClub } from "@/hooks/useClub";
import { supabase } from "@/lib/supabase";
import type { PendingDistribution } from "@/types/forms";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user, profile } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { membership: clubMembership } = useClub(user?.id);

  type SessionLog = {
    id: string;
    created_at: string;
    duration_seconds: number | null;
    routine_day_name: string | null;
    exercises: { exercise_name: string; sets: { reps: number; weight: number }[] }[];
  };

  const [loading, setLoading] = useState(true);

  const [pendingForms, setPendingForms] = useState<PendingDistribution[]>([]);
  const [weekSessions, setWeekSessions] = useState<number>(0);
  const [weekVolume, setWeekVolume] = useState<number>(0);
  const [weekDurationSec, setWeekDurationSec] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  // Last week review
  const [lastWeekSessions, setLastWeekSessions] = useState<number>(0);
  const [lastWeekVolume, setLastWeekVolume] = useState<number>(0);
  const [lastWeekDurationSec, setLastWeekDurationSec] = useState<number>(0);
  // Two weeks ago (for comparison)
  const [twoWeeksAgoSessions, setTwoWeeksAgoSessions] = useState<number>(0);
  const [twoWeeksAgoVolume, setTwoWeeksAgoVolume] = useState<number>(0);
  const [nextMatch, setNextMatch] = useState<{
    title: string;
    starts_at: string;
    opponent: string | null;
    location: string | null;
  } | null | undefined>(undefined);

  useFocusEffect(
    useCallback(() => {
      if (user) fetchData();
    }, [user]),
  );

  const fetchData = async () => {
    setLoading(true);

    // Date anchors
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);

    const lastMonday = new Date(monday);
    lastMonday.setDate(monday.getDate() - 7);

    const twoWeeksAgo = new Date(monday);
    twoWeeksAgo.setDate(monday.getDate() - 14);

    // 13 weeks back — enough for streak history
    const thirteenWeeksAgo = new Date(monday);
    thirteenWeeksAgo.setDate(monday.getDate() - 13 * 7);

    const [logsRes, formsRes, routineRes, matchRes] = await Promise.all([
      supabase
        .from("workout_logs")
        .select("id, created_at, duration_seconds, routine_day_name, exercises")
        .eq("user_id", user!.id)
        .gte("created_at", thirteenWeeksAgo.toISOString())
        .order("created_at", { ascending: false }),
      supabase
        .from("club_form_distributions")
        .select(
          "id, form_id, due_at, form:club_forms!form_id(id, title, status, template_type), responses:club_form_responses!distribution_id(submitted_at)",
        )
        .eq("target_type", "player")
        .eq("target_user_id", user!.id),
      // NOTE: clean_cycles is omitted until migration 031 is applied.
      // The streak uses completed_days.length only until then; add
      // "clean_cycles" back to the select once the migration runs.
      supabase
        .from("routine_enrollments")
        .select("id, status, progress, enrolled_at, source_share_id, routine:routines!routine_id(data)")
        .eq("user_id", user!.id)
        .order("enrolled_at", { ascending: false })
        .limit(30),
      supabase
        .from("club_events")
        .select("title, starts_at, opponent, location")
        .eq("type", "partido")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

    const logs = (logsRes.data ?? []) as SessionLog[];
    const weekLogs = logs.filter((l) => new Date(l.created_at) >= monday);
    const lastWeekLogs = logs.filter((l) => {
      const d = new Date(l.created_at);
      return d >= lastMonday && d < monday;
    });
    const twoWeeksAgoLogs = logs.filter((l) => {
      const d = new Date(l.created_at);
      return d >= twoWeeksAgo && d < lastMonday;
    });

    const computeVolume = (sessionLogs: SessionLog[]) =>
      sessionLogs.reduce(
        (total, l) =>
          total +
          (l.exercises ?? []).reduce(
            (exT, ex) =>
              exT +
              (ex.sets ?? []).reduce(
                (sT, s) => sT + (s.reps ?? 0) * (s.weight ?? 0),
                0,
              ),
            0,
          ),
        0,
      );

    // This week
    setWeekSessions(weekLogs.length);
    setWeekVolume(computeVolume(weekLogs));
    setWeekDurationSec(
      weekLogs.reduce((acc, l) => acc + (l.duration_seconds ?? 0), 0),
    );

    // Last week
    setLastWeekSessions(lastWeekLogs.length);
    setLastWeekVolume(computeVolume(lastWeekLogs));
    setLastWeekDurationSec(
      lastWeekLogs.reduce((acc, l) => acc + (l.duration_seconds ?? 0), 0),
    );

    // Two weeks ago (for comparison)
    setTwoWeeksAgoSessions(twoWeeksAgoLogs.length);
    setTwoWeeksAgoVolume(computeVolume(twoWeeksAgoLogs));

    // Streak: sessions completed since the last dirty enrollment, across ALL clean enrollments.
    //
    // "dirty" = any enrollment with explicit skipped_days.
    // Enrollments are ordered newest → oldest. The most recent dirty enrollment
    // marks the break point — everything enrolled before it is excluded.
    // Concurrent dirty enrollments (enrolled after the break point) are skipped
    // but don't stop the count, so a skip in routine A doesn't cancel sessions
    // in a concurrent clean routine B.
    //
    // Formula per clean enrollment: clean_cycles * total_days + completed_days.length
    type EnrollmentRow = {
      id: string;
      status: string;
      progress: { completed_days: number[]; skipped_days?: number[] };
      clean_cycles: number;
      enrolled_at: string;
      routine: { data: { dias: unknown[] } } | null;
    };
    const enrollments = (routineRes.data ?? []) as unknown as EnrollmentRow[];

    // Find the break point: most recent enrollment with skips (newest-first order)
    const dirtyIdx = enrollments.findIndex(
      (e) => (e.progress?.skipped_days?.length ?? 0) > 0,
    );
    const breakBeforeDate = dirtyIdx >= 0 ? enrollments[dirtyIdx].enrolled_at : null;

    let streakCount = 0;
    for (const e of enrollments) {
      // Exclude everything enrolled at or before the break point
      if (breakBeforeDate && e.enrolled_at <= breakBeforeDate) break;
      // Concurrent dirty enrollment — skip it but keep counting others
      if ((e.progress?.skipped_days?.length ?? 0) > 0) continue;
      const cleanCycles = e.clean_cycles ?? 0;
      const totalDays = e.routine?.data?.dias?.length ?? 1;
      const completed = e.progress?.completed_days?.length ?? 0;
      streakCount += cleanCycles * totalDays + completed;
    }
    setStreak(streakCount);

    setNextMatch(matchRes.data ?? null);

    const rawDist = formsRes.data ?? [];
    const pending = (rawDist as any[]).filter(
      (d) =>
        d.form?.template_type === "wellness" &&
        d.form?.status === "active" &&
        (!(d.responses as any[]).length ||
          (d.responses as any[])[0]?.submitted_at === null),
    );
    setPendingForms(pending as PendingDistribution[]);

    setLoading(false);
  };

  const firstName = profile?.name ?? "atleta";

  const prExercises = profile?.pr_exercises ?? [];
  const oneRm = profile?.one_rm ?? {};
  const topPrs = prExercises.filter((ex) => oneRm[ex] != null).slice(0, 3);

  const formatRelative = (iso: string) => {
    const d = new Date(iso);
    const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  };

  const formatVolume = (kg: number) => {
    if (kg === 0) return "—";
    if (kg >= 1000) return `${(kg / 1000).toFixed(1)}t`;
    return `${Math.round(kg)}`;
  };

  const formatDuration = (sec: number) => {
    if (sec === 0) return null;
    const m = Math.round(sec / 60);
    if (m < 60) return `${m} min`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 40,
        }}
      >
        {/* ── HEADER ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/profile")}
              activeOpacity={0.75}
              style={{
                width: 38, height: 38, borderRadius: 19,
                backgroundColor: colors.accent + "25",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 15 }}>
                {firstName[0]?.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: colors.textMuted, fontSize: 15, marginBottom: 2 }}>
            Bienvenido,
          </Text>
          <Text
            style={{
              color: colors.accent, fontSize: 40, fontWeight: "800",
              letterSpacing: -1,
            }}
          >
            {firstName}
          </Text>

          {/* ── PRÓXIMO PARTIDO / FECHA LIBRE ── */}
          {clubMembership !== null && nextMatch !== undefined && (
            <View style={{ marginTop: 16 }}>
              {nextMatch ? (
                <View
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 10,
                      fontWeight: "700",
                      letterSpacing: 1,
                      marginBottom: 8,
                    }}
                  >
                    PRÓXIMO PARTIDO
                  </Text>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 20,
                      fontWeight: "800",
                      letterSpacing: -0.5,
                      marginBottom: 8,
                    }}
                    numberOfLines={1}
                  >
                    {nextMatch.opponent ? `vs. ${nextMatch.opponent}` : nextMatch.title}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <View
                      style={{
                        backgroundColor: colors.surface,
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
                      <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                        {new Date(nextMatch.starts_at).toLocaleDateString("es-AR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </Text>
                    </View>
                    {nextMatch.location && (
                      <View
                        style={{
                          backgroundColor: colors.accent + "18",
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                        }}
                      >
                        <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "600" }}>
                          {nextMatch.location === "local" ? "Local" : "Visitante"}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : (
                <View
                  style={{
                    backgroundColor: colors.accentBg,
                    borderRadius: 16,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: colors.accent + "30",
                  }}
                >
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: 10,
                      fontWeight: "700",
                      letterSpacing: 1,
                      marginBottom: 6,
                    }}
                  >
                    ESTA SEMANA
                  </Text>
                  <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 18 }}>
                    Fecha libre
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>
                    Sin partido. Aprovecha para sumar entrenamientos.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* ── NO CLUB BANNER ── */}
        {clubMembership === null && (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/club")}
            activeOpacity={0.85}
            style={{
              marginHorizontal: 20, marginBottom: 20,
              backgroundColor: colors.accent + "12",
              borderRadius: 16, borderWidth: 1,
              borderColor: colors.accent + "35",
              padding: 16, flexDirection: "row", alignItems: "center", gap: 12,
            }}
          >
            <View
              style={{
                width: 38, height: 38, borderRadius: 10,
                backgroundColor: colors.accent + "20",
                alignItems: "center", justifyContent: "center",
              }}
            >
              <Ionicons name="people-outline" size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>
                Unite a tu club
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 1 }}>
                Ingresa el código que te dio tu coach
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </TouchableOpacity>
        )}

        {/* ── STATS ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
          {loading ? (
            <ActivityIndicator color={colors.accent} style={{ alignSelf: "flex-start" }} />
          ) : (
            <>
              {/* Weekly summary row */}
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>

                {/* Sessions + week-over-week delta */}
                <View
                  style={{
                    flex: 1, backgroundColor: colors.card, borderRadius: 14,
                    padding: 14, borderWidth: 1, borderColor: colors.border,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
                    <Text
                      style={{
                        color: colors.accent, fontSize: 28, fontWeight: "800",
                        letterSpacing: -1, lineHeight: 32,
                      }}
                    >
                      {weekSessions}
                    </Text>
                    {(() => {
                      const delta = weekSessions - lastWeekSessions;
                      if (delta === 0 || lastWeekSessions === 0) return null;
                      const up = delta > 0;
                      return (
                        <Text
                          style={{
                            fontSize: 11, fontWeight: "700", marginBottom: 4,
                            color: up ? colors.green ?? "#4CAF50" : colors.error ?? "#E53935",
                          }}
                        >
                          {up ? "↑" : "↓"}{Math.abs(delta)}
                        </Text>
                      );
                    })()}
                  </View>
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 3 }}>
                    sesiones esta semana
                  </Text>
                  {lastWeekSessions > 0 && (
                    <Text style={{ color: colors.textMuted, fontSize: 10, marginTop: 1, opacity: 0.6 }}>
                      {lastWeekSessions} la semana pasada
                    </Text>
                  )}
                </View>

                {/* Volume */}
                <View
                  style={{
                    flex: 1, backgroundColor: colors.card, borderRadius: 14,
                    padding: 14, borderWidth: 1, borderColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text, fontSize: weekVolume >= 1000 ? 22 : 28,
                      fontWeight: "800", letterSpacing: -1, lineHeight: 32,
                    }}
                  >
                    {formatVolume(weekVolume)}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 3 }}>
                    {weekVolume >= 1000 ? "toneladas esta sem." : "kg levantados"}
                  </Text>
                </View>

                {/* Streak */}
                <View
                  style={{
                    flex: 1, backgroundColor: colors.card, borderRadius: 14,
                    padding: 14, borderWidth: 1,
                    borderColor: streak > 0 ? (colors.accent + "40") : colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 28, fontWeight: "800", letterSpacing: -1, lineHeight: 32,
                      color: streak > 0 ? colors.accent : colors.textMuted,
                    }}
                  >
                    {streak}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 3 }}>
                    racha activa
                  </Text>
                </View>
              </View>

              {/* Past week review */}
              {lastWeekSessions === 0 ? (
                /* No sessions last week — friendly nudge */
                <View
                  style={{
                    backgroundColor: colors.card, borderRadius: 16,
                    borderWidth: 1, borderColor: colors.border,
                    padding: 18, gap: 8,
                  }}
                >
                  <Text
                    style={{
                      color: colors.textMuted, fontSize: 10,
                      fontWeight: "700", letterSpacing: 0.8,
                    }}
                  >
                    SEMANA PASADA
                  </Text>
                  <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700" }}>
                    No registraste sesiones
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 13, lineHeight: 19 }}>
                    ¿Tuviste algún inconveniente? Si necesitás ajustar la rutina, comentáselo a tu coach.
                  </Text>
                </View>
              ) : (
                /* Sessions exist — show review */
                <View
                  style={{
                    backgroundColor: colors.card, borderRadius: 16,
                    borderWidth: 1, borderColor: colors.border,
                    overflow: "hidden",
                  }}
                >
                  {/* Header */}
                  <View
                    style={{
                      paddingHorizontal: 16, paddingVertical: 12,
                      borderBottomWidth: 1, borderBottomColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textMuted, fontSize: 10,
                        fontWeight: "700", letterSpacing: 0.8,
                      }}
                    >
                      SEMANA PASADA
                    </Text>
                  </View>

                  {/* Stats rows */}
                  <View style={{ padding: 16, gap: 10 }}>
                    {/* Sessions */}
                    {(() => {
                      const delta = lastWeekSessions - twoWeeksAgoSessions;
                      const up = delta > 0;
                      return (
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                          <Text style={{ color: colors.textMuted, fontSize: 13 }}>Sesiones</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            {twoWeeksAgoSessions > 0 && delta !== 0 && (
                              <Text style={{
                                fontSize: 11, fontWeight: "700",
                                color: up ? colors.green ?? "#4CAF50" : colors.error ?? "#E53935",
                              }}>
                                {up ? "↑" : "↓"}{Math.abs(delta)} vs anterior
                              </Text>
                            )}
                            <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700", minWidth: 24, textAlign: "right" }}>
                              {lastWeekSessions}
                            </Text>
                          </View>
                        </View>
                      );
                    })()}

                    {/* Volume */}
                    {lastWeekVolume > 0 && (() => {
                      const delta = lastWeekVolume - twoWeeksAgoVolume;
                      const up = delta > 0;
                      const pct = twoWeeksAgoVolume > 0
                        ? Math.round(Math.abs(delta) / twoWeeksAgoVolume * 100)
                        : 0;
                      return (
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                          <Text style={{ color: colors.textMuted, fontSize: 13 }}>Volumen</Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            {twoWeeksAgoVolume > 0 && pct > 0 && (
                              <Text style={{
                                fontSize: 11, fontWeight: "700",
                                color: up ? colors.green ?? "#4CAF50" : colors.error ?? "#E53935",
                              }}>
                                {up ? "↑" : "↓"}{pct}% vs anterior
                              </Text>
                            )}
                            <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700" }}>
                              {formatVolume(lastWeekVolume)} kg
                            </Text>
                          </View>
                        </View>
                      );
                    })()}

                    {/* Duration */}
                    {lastWeekDurationSec > 0 && (
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={{ color: colors.textMuted, fontSize: 13 }}>Tiempo total</Text>
                        <Text style={{ color: colors.text, fontSize: 15, fontWeight: "700" }}>
                          {formatDuration(lastWeekDurationSec)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* ── FORMULARIOS PENDIENTES ── */}
        {pendingForms.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
            <Text
              style={{
                color: colors.text, fontSize: 16, fontWeight: "700", marginBottom: 12,
              }}
            >
              Formularios pendientes
            </Text>
            {pendingForms.map((dist) => (
              <TouchableOpacity
                key={dist.id}
                onPress={() =>
                  router.push({ pathname: "/form", params: { distributionId: dist.id } })
                }
                activeOpacity={0.85}
                style={{
                  backgroundColor: colors.card, borderRadius: 16,
                  padding: 16, borderWidth: 1, borderColor: colors.border,
                  flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10,
                }}
              >
                <View
                  style={{
                    width: 42, height: 42, borderRadius: 12,
                    backgroundColor: colors.surface,
                    alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Ionicons name="document-text-outline" size={20} color={colors.textMuted} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "700", fontSize: 14 }}>
                    {dist.form.title}
                  </Text>
                  {dist.due_at && (
                    <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 1 }}>
                      Vence {new Date(dist.due_at).toLocaleDateString("es-AR")}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.accent} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── PR'S ACTUALES ── */}
        {topPrs.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginBottom: 28 }}>
            <View
              style={{
                flexDirection: "row", justifyContent: "space-between",
                alignItems: "center", marginBottom: 14,
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
                    backgroundColor: colors.card, borderRadius: 14,
                    padding: 14, borderWidth: 1, borderColor: colors.border,
                    flexDirection: "row", alignItems: "center", gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 48, height: 48, borderRadius: 10,
                      backgroundColor: colors.surface,
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Ionicons name="barbell-outline" size={22} color={colors.textMuted} />
                  </View>
                  <Text
                    style={{
                      flex: 1, color: colors.text,
                      fontWeight: "600", fontSize: 15,
                    }}
                    numberOfLines={1}
                  >
                    {ex}
                  </Text>
                  <Text
                    style={{
                      color: colors.text, fontWeight: "700",
                      fontSize: 15, marginRight: 8,
                    }}
                  >
                    {oneRm[ex]} kg
                  </Text>
                  <View
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      backgroundColor: colors.accent + "18",
                      alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Ionicons name="trending-up" size={16} color={colors.accent} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
