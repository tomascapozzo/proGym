import DayPreviewModal from "@/components/train/DayPreviewModal";
import RoutineCreatorModal from "@/components/train/RoutineCreatorModal";
import RoutineDetailSheet from "@/components/train/RoutineDetailSheet";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { useRoutineCreator } from "@/hooks/useRoutineCreator";
import { supabase } from "@/lib/supabase";
import { ROUTINE_TYPE_LABELS, type Routine, type RoutineDay } from "@/types/routine";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getNextDay(routine: Routine): { day: RoutineDay; index: number; isSkippedFallback: boolean } | null {
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function TrainScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loadingRoutines, setLoadingRoutines] = useState(true);
  const [showPast, setShowPast] = useState(false);

  // Full routine detail sheet
  const [detailRoutine, setDetailRoutine] = useState<Routine | null>(null);

  // Session start flow
  const [previewDay, setPreviewDay] = useState<RoutineDay | null>(null);
  const [previewDayIndex, setPreviewDayIndex] = useState(0);
  const [previewRoutine, setPreviewRoutine] = useState<Routine | null>(null);
  const [dayPreviewVisible, setDayPreviewVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) fetchRoutines();
    }, [user]),
  );

  const fetchRoutines = async () => {
    setLoadingRoutines(true);
    const { data } = await supabase
      .from("routines")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setRoutines((data as Routine[]) ?? []);
    setLoadingRoutines(false);
  };

  const routineCreator = useRoutineCreator(fetchRoutines);

  // ─── Group routines ───────────────────────────────────────────────────────

  const activeRoutines = routines.filter((r) => r.status === "active");
  const pendingRoutines = routines.filter((r) => r.status === "pending_restart");
  const pastRoutines = routines.filter((r) => r.status === "past");

  // ─── Session start actions ────────────────────────────────────────────────

  // Called from the ▶ button — skips day preview, goes straight to confirm
  const startDay = (routine: Routine, day: RoutineDay, dayIndex: number) => {
    setPreviewRoutine(routine);
    setPreviewDay(day);
    setPreviewDayIndex(dayIndex);
    setConfirmVisible(true);
  };

  const doStartSession = () => {
    if (!previewDay || !previewRoutine) return;
    setConfirmVisible(false);
    setDayPreviewVisible(false);
    setPreviewDay(null);
    router.push({
      pathname: "/session",
      params: {
        type: "routine",
        dayData: JSON.stringify(previewDay),
        dayIndex: String(previewDayIndex),
        routineId: previewRoutine.id,
        routineType: previewRoutine.type,
        completedDays: JSON.stringify(previewRoutine.progress?.completed_days ?? []),
        totalDays: String(previewRoutine.data.dias.length),
      },
    });
  };

  const restartRoutine = async (routine: Routine) => {
    await supabase
      .from("routines")
      .update({ status: "active", progress: { completed_days: [] } })
      .eq("id", routine.id);
    fetchRoutines();
  };

  const archiveRoutine = async (routine: Routine) => {
    await supabase
      .from("routines")
      .update({ status: "past" })
      .eq("id", routine.id);
    fetchRoutines();
  };

  const skipDay = async (routine: Routine, dayIndex: number) => {
    const skipped = routine.progress?.skipped_days ?? [];
    if (skipped.includes(dayIndex)) return;
    const newProgress = { ...routine.progress, skipped_days: [...skipped, dayIndex] };
    await supabase.from("routines").update({ progress: newProgress }).eq("id", routine.id);
    if (detailRoutine?.id === routine.id) setDetailRoutine({ ...routine, progress: newProgress });
    fetchRoutines();
  };

  const unskipDay = async (routine: Routine, dayIndex: number) => {
    const skipped = routine.progress?.skipped_days ?? [];
    const newProgress = { ...routine.progress, skipped_days: skipped.filter((i) => i !== dayIndex) };
    await supabase.from("routines").update({ progress: newProgress }).eq("id", routine.id);
    if (detailRoutine?.id === routine.id) setDetailRoutine({ ...routine, progress: newProgress });
    fetchRoutines();
  };

  // ─── Render helpers ───────────────────────────────────────────────────────

  const renderActiveRoutine = (routine: Routine) => {
    const next = getNextDay(routine);
    if (!next) return null;
    const completed = routine.progress?.completed_days ?? [];
    const total = routine.data.dias.length;
    const typeColor = colors.routineColors[routine.type];

    return (
      <TouchableOpacity
        key={routine.id}
        onPress={() => setDetailRoutine(routine)}
        activeOpacity={0.85}
        style={{
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {/* Routine header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 }}>
          <View
            style={{
              backgroundColor: typeColor + "22",
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text style={{ color: typeColor, fontSize: 10, fontWeight: "700", letterSpacing: 1 }}>
              {ROUTINE_TYPE_LABELS[routine.type]}
            </Text>
          </View>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15, flex: 1 }}>
            {routine.data.nombre}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {completed.length}/{total}
          </Text>
        </View>

        {/* Next day row */}
        <Pressable
          onPress={(e) => { e.stopPropagation?.(); startDay(routine, next.day, next.index); }}
          style={({ pressed }) => ({
            backgroundColor: pressed ? typeColor + "22" : colors.surface ?? colors.bg,
            borderRadius: 12,
            padding: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderWidth: 1,
            borderColor: next.isSkippedFallback ? colors.routineColors.skipped + "44" : typeColor + "44",
          })}
        >
          <View>
            <Text style={{ color: colors.textMuted, fontSize: 10, marginBottom: 2 }}>
              {next.isSkippedFallback ? "DÍA PENDIENTE" : "SIGUIENTE DÍA"}
            </Text>
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>
              {next.day.dia}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
              {next.day.enfoque} · {next.day.ejercicios.length} ejercicios
            </Text>
          </View>
          <View
            style={{
              backgroundColor: next.isSkippedFallback ? colors.routineColors.skipped : typeColor,
              borderRadius: 20,
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#000", fontSize: 14, fontWeight: "700" }}>▶</Text>
          </View>
        </Pressable>

        {/* Skip link — only when there's a proper next day (not a skipped fallback) */}
        {!next.isSkippedFallback && (
          <TouchableOpacity
            onPress={() => skipDay(routine, next.index)}
            style={{ alignSelf: "flex-end", marginTop: 8, padding: 4 }}
          >
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>Saltar este día →</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderPendingRoutine = (routine: Routine) => (
    <View
      key={routine.id}
      style={{
        backgroundColor: colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4, gap: 8 }}>
        <View
          style={{
            backgroundColor: colors.routineColors.done + "22",
            borderRadius: 6,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text style={{ color: colors.routineColors.done, fontSize: 10, fontWeight: "700", letterSpacing: 1 }}>
            SEMANA COMPLETA
          </Text>
        </View>
      </View>
      <Text style={{ color: colors.text, fontWeight: "700", fontSize: 15, marginBottom: 12 }}>
        {routine.data.nombre}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: 13, marginBottom: 14 }}>
        Completaste todos los días. ¿Qué querés hacer?
      </Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          onPress={() => restartRoutine(routine)}
          style={{
            flex: 1,
            backgroundColor: colors.accentBg,
            borderRadius: 10,
            padding: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.accent,
          }}
        >
          <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 13 }}>
            Reiniciar
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>
            Próxima semana
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => archiveRoutine(routine)}
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 10,
            padding: 12,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.textMuted, fontWeight: "600", fontSize: 13 }}>
            Archivar
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2, opacity: 0.7 }}>
            Mover a pasadas
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* HEADER */}
        <Text
          style={{
            color: colors.text,
            fontSize: 26,
            fontWeight: "bold",
            marginTop: 16,
            marginBottom: 4,
          }}
        >
          Entrenar
        </Text>
        <Text style={{ color: colors.textMuted, marginBottom: 28 }}>
          ¿Cómo vas a entrenar hoy?
        </Text>

        {/* ── ACTIVE ROUTINES ── */}
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 12,
            letterSpacing: 1,
            marginBottom: 10,
          }}
        >
          RUTINAS ACTIVAS
        </Text>

        {loadingRoutines ? (
          <ActivityIndicator
            color={colors.accent}
            style={{ marginBottom: 24, alignSelf: "flex-start" }}
          />
        ) : activeRoutines.length === 0 && pendingRoutines.length === 0 ? (
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
              No tenés rutinas activas.{"\n"}Creá una abajo para empezar.
            </Text>
          </View>
        ) : (
          <View style={{ marginBottom: 8 }}>
            {activeRoutines.map(renderActiveRoutine)}
            {pendingRoutines.map(renderPendingRoutine)}
          </View>
        )}

        {/* ── PAST ROUTINES ── */}
        {pastRoutines.length > 0 && (
          <>
            <TouchableOpacity
              onPress={() => setShowPast((v) => !v)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
                marginTop: 4,
              }}
            >
              <Text style={{ color: colors.textMuted, fontSize: 12, letterSpacing: 1 }}>
                RUTINAS PASADAS ({pastRoutines.length})
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {showPast ? "▲" : "▼"}
              </Text>
            </TouchableOpacity>
            {showPast && (
              <View style={{ marginBottom: 20 }}>
                {pastRoutines.map((r) => (
                  <View
                    key={r.id}
                    style={{
                      backgroundColor: colors.card,
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.textMuted, fontWeight: "600", fontSize: 14 }}>
                        {r.data.nombre}
                      </Text>
                      <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2, opacity: 0.6 }}>
                        {r.data.dias.length} días · {ROUTINE_TYPE_LABELS[r.type]}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => restartRoutine(r)}>
                      <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "600" }}>
                        Reiniciar
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* ── CREATE ROUTINE ── */}
        <Text
          style={{
            color: colors.textMuted,
            fontSize: 12,
            letterSpacing: 1,
            marginBottom: 10,
          }}
        >
          CREAR RUTINA
        </Text>
        <TouchableOpacity
          onPress={routineCreator.openCreateRoutine}
          style={{
            backgroundColor: colors.card,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.accentBgAlt,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.accent, fontSize: 20, fontWeight: "700" }}>+</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "600", fontSize: 15 }}>
              Armar rutina
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
              Armá tu propia rutina con días y ejercicios
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* ── MODALS ── */}
      <RoutineDetailSheet
        routine={detailRoutine}
        onClose={() => setDetailRoutine(null)}
        onStartDay={(day, idx) => {
          const routine = detailRoutine!;
          setDetailRoutine(null);
          startDay(routine, day, idx);
        }}
        onSkipDay={(idx) => { if (detailRoutine) skipDay(detailRoutine, idx); }}
        onUnskipDay={(idx) => { if (detailRoutine) unskipDay(detailRoutine, idx); }}
      />

      <DayPreviewModal
        visible={dayPreviewVisible}
        previewDay={previewDay}
        onClose={() => { setDayPreviewVisible(false); setPreviewDay(null); }}
        onStartSession={() => setConfirmVisible(true)}
        confirmVisible={confirmVisible}
        onConfirmStart={doStartSession}
        onCancelConfirm={() => setConfirmVisible(false)}
      />

      <RoutineCreatorModal {...routineCreator} />
    </View>
  );
}
