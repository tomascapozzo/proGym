import DayPreviewModal from "@/components/train/DayPreviewModal";
import RoutineCreatorModal from "@/components/train/RoutineCreatorModal";
import RoutineDetailSheet from "@/components/train/RoutineDetailSheet";
import CustomModal from "@/components/ui/custom/customModal";
import ExercisePicker from "@/components/ui/custom/ExercisePicker";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { useRoutineCreator } from "@/hooks/useRoutineCreator";
import { useSharedRoutines } from "@/hooks/useSharedRoutines";
import { supabase } from "@/lib/supabase";
import {
  getNextDay,
  ROUTINE_TYPE_LABELS,
  type Routine,
  type RoutineDay,
} from "@/types/routine";
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

export default function TrainScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loadingRoutines, setLoadingRoutines] = useState(true);
  const [showPast, setShowPast] = useState(false);

  const [detailRoutine, setDetailRoutine] = useState<Routine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Routine | null>(null);

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

  const { syncSharedRoutines } = useSharedRoutines();
  const routineCreator = useRoutineCreator(fetchRoutines);

  const fetchRoutines = async () => {
    setLoadingRoutines(true);
    await syncSharedRoutines();
    const { data } = await supabase
      .from("routine_enrollments")
      .select(
        "id, status, progress, source_share_id, enrolled_at, routine:routines!routine_id(id, data, type, created_at)",
      )
      .eq("user_id", user!.id)
      .order("enrolled_at", { ascending: false });

    type EnrollmentRow = {
      id: string;
      status: string;
      progress: { completed_days: number[]; skipped_days?: number[] };
      source_share_id: string | null;
      enrolled_at: string;
      routine: {
        id: string;
        data: { nombre: string; dias: any[] };
        type: string;
        created_at: string;
      } | null;
    };

    const mapped: Routine[] = ((data ?? []) as unknown as EnrollmentRow[])
      .filter((e) => e.routine !== null)
      .map((e) => ({
        id: e.routine!.id,
        enrollment_id: e.id,
        type: e.routine!.type as Routine["type"],
        status: e.status as Routine["status"],
        progress: e.progress,
        data: e.routine!.data as Routine["data"],
        created_at: e.routine!.created_at,
        source_share_id: e.source_share_id,
      }));

    setRoutines(mapped);
    setLoadingRoutines(false);
  };

  // ─── Routine grouping ──────────────────────────────────────────────────────

  const activePersonal = routines.filter(
    (r) => !r.source_share_id && r.status === "active",
  );
  const pendingPersonal = routines.filter(
    (r) => !r.source_share_id && r.status === "pending_restart",
  );
  const pastPersonal = routines.filter(
    (r) => !r.source_share_id && r.status === "past",
  );
  const activeClub = routines.filter(
    (r) => !!r.source_share_id && r.status === "active",
  );
  const pendingClub = routines.filter(
    (r) => !!r.source_share_id && r.status === "pending_restart",
  );

  // Primary: personal active first, then club active, then pending
  const primaryRoutine =
    activePersonal[0] ??
    activeClub[0] ??
    pendingPersonal[0] ??
    pendingClub[0] ??
    null;
  const isClubRoutine = !!primaryRoutine?.source_share_id;

  // ─── Session actions ───────────────────────────────────────────────────────

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
        enrollmentId: previewRoutine.enrollment_id,
        routineType: previewRoutine.type,
        completedDays: JSON.stringify(
          previewRoutine.progress?.completed_days ?? [],
        ),
        totalDays: String(previewRoutine.data.dias.length),
        rpePrompt: previewRoutine.data.rpe_prompt ?? "sesion",
      },
    });
  };

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const restartRoutine = async (routine: Routine) => {
    await supabase
      .from("routine_enrollments")
      .update({ status: "active", progress: { completed_days: [] } })
      .eq("id", routine.enrollment_id);
    fetchRoutines();
  };

  const archiveRoutine = async (routine: Routine) => {
    await supabase
      .from("routine_enrollments")
      .update({ status: "past" })
      .eq("id", routine.enrollment_id);
    fetchRoutines();
  };

  const deleteRoutine = (routine: Routine) => setDeleteTarget(routine);

  const confirmDeleteRoutine = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.source_share_id) {
      await supabase
        .from("routine_enrollments")
        .delete()
        .eq("id", deleteTarget.enrollment_id);
    } else {
      await supabase.from("routines").delete().eq("id", deleteTarget.id);
    }
    if (detailRoutine?.id === deleteTarget.id) setDetailRoutine(null);
    setDeleteTarget(null);
    fetchRoutines();
  };

  const skipDay = async (routine: Routine, dayIndex: number) => {
    const skipped = routine.progress?.skipped_days ?? [];
    if (skipped.includes(dayIndex)) return;
    const newProgress = { ...routine.progress, skipped_days: [...skipped, dayIndex] };
    await supabase
      .from("routine_enrollments")
      .update({ progress: newProgress })
      .eq("id", routine.enrollment_id);
    if (detailRoutine?.id === routine.id)
      setDetailRoutine({ ...routine, progress: newProgress });
    fetchRoutines();
  };

  const unskipDay = async (routine: Routine, dayIndex: number) => {
    const skipped = routine.progress?.skipped_days ?? [];
    const newProgress = {
      ...routine.progress,
      skipped_days: skipped.filter((i) => i !== dayIndex),
    };
    await supabase
      .from("routine_enrollments")
      .update({ progress: newProgress })
      .eq("id", routine.enrollment_id);
    if (detailRoutine?.id === routine.id)
      setDetailRoutine({ ...routine, progress: newProgress });
    fetchRoutines();
  };

  // ─── Hero card ─────────────────────────────────────────────────────────────

  const renderHero = () => {
    if (loadingRoutines) {
      return (
        <View style={{ alignItems: "center", paddingVertical: 60 }}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      );
    }

    if (!primaryRoutine) {
      return (
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 28,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            gap: 10,
          }}
        >
          <Ionicons name="barbell-outline" size={36} color={colors.textMuted} />
          <Text
            style={{
              color: colors.text,
              fontWeight: "700",
              fontSize: 16,
              textAlign: "center",
            }}
          >
            Sin rutina activa
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 13,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Tu coach aún no asignó una rutina.{"\n"}Podés crear la tuya abajo.
          </Text>
        </View>
      );
    }

    const next = getNextDay(primaryRoutine);
    const completed = primaryRoutine.progress?.completed_days ?? [];
    const total = primaryRoutine.data.dias.length;
    const typeColor = colors.routineColors[primaryRoutine.type];
    const isPending = primaryRoutine.status === "pending_restart";
    const allDone = !isPending && !next;

    return (
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        }}
      >
        {/* Club badge */}
        {isClubRoutine && (
          <View
            style={{
              backgroundColor: colors.blue + "18",
              paddingHorizontal: 16,
              paddingVertical: 8,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              borderBottomWidth: 1,
              borderBottomColor: colors.blue + "30",
            }}
          >
            <Ionicons name="people" size={13} color={colors.blue} />
            <Text
              style={{
                color: colors.blue,
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 0.5,
              }}
            >
              RUTINA DE TU CLUB
            </Text>
          </View>
        )}

        <View style={{ padding: 20 }}>
          {/* Type badge + name */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <View
              style={{
                backgroundColor: typeColor + "22",
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 3,
              }}
            >
              <Text
                style={{
                  color: typeColor,
                  fontSize: 10,
                  fontWeight: "700",
                  letterSpacing: 1,
                }}
              >
                {ROUTINE_TYPE_LABELS[primaryRoutine.type]}
              </Text>
            </View>
          </View>

          <Text
            style={{
              color: colors.text,
              fontSize: 22,
              fontWeight: "800",
              letterSpacing: -0.5,
              marginBottom: 16,
            }}
          >
            {primaryRoutine.data.nombre}
          </Text>

          {/* Progress bar */}
          {total > 1 && (
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                  Progreso
                </Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 11,
                    fontWeight: "600",
                  }}
                >
                  {completed.length}/{total} días
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 4 }}>
                {Array.from({ length: total }, (_, i) => {
                  const doneList = primaryRoutine.progress?.completed_days ?? [];
                  const skipList = primaryRoutine.progress?.skipped_days ?? [];
                  const isDone = doneList.includes(i);
                  const isSkipped = skipList.includes(i);
                  const isNext = next && i === next.index;
                  return (
                    <View
                      key={i}
                      style={{
                        flex: 1,
                        height: 5,
                        borderRadius: 3,
                        backgroundColor: isDone
                          ? typeColor
                          : isSkipped
                          ? colors.textMuted + "30"
                          : isNext
                          ? typeColor + "45"
                          : colors.border,
                      }}
                    />
                  );
                })}
              </View>
            </View>
          )}

          {/* State: pending restart */}
          {isPending ? (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 14,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 16,
                alignItems: "center",
                gap: 8,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontWeight: "700",
                  fontSize: 15,
                  textAlign: "center",
                }}
              >
                Semana completada
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                ¡Buen trabajo! Reiniciá cuando estés listo.
              </Text>
              <TouchableOpacity
                onPress={() => restartRoutine(primaryRoutine)}
                style={{
                  backgroundColor: typeColor + "20",
                  borderRadius: 10,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  marginTop: 4,
                }}
              >
                <Text
                  style={{ color: typeColor, fontWeight: "700", fontSize: 14 }}
                >
                  Reiniciar rutina
                </Text>
              </TouchableOpacity>
            </View>

          /* State: all days done */
          ) : allDone ? (
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 14,
                padding: 16,
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 16,
                alignItems: "center",
                gap: 6,
              }}
            >
              <Text
                style={{ color: colors.text, fontWeight: "700", fontSize: 15 }}
              >
                Rutina completada
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: 13,
                  textAlign: "center",
                }}
              >
                Completaste todos los días.
              </Text>
            </View>

          /* State: next day ready */
          ) : next ? (
            <>
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 14,
                  padding: 16,
                  borderWidth: 1,
                  borderColor: next.isSkippedFallback
                    ? colors.routineColors.skipped + "44"
                    : typeColor + "33",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 10,
                    fontWeight: "700",
                    letterSpacing: 0.8,
                    marginBottom: 4,
                  }}
                >
                  {next.isSkippedFallback ? "DÍA PENDIENTE" : "SIGUIENTE"}
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontWeight: "700",
                    fontSize: 17,
                    marginBottom: 2,
                  }}
                >
                  {next.day.dia || next.day.enfoque}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>
                  {[
                    next.day.enfoque !== next.day.dia ? next.day.enfoque : null,
                    next.day.ejercicios?.length > 0
                      ? `${next.day.ejercicios.length} ejercicio${next.day.ejercicios.length !== 1 ? "s" : ""}`
                      : null,
                    (next.day.circuitos ?? []).length > 0
                      ? `${next.day.circuitos.length} circuito${next.day.circuitos.length !== 1 ? "s" : ""}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => startDay(primaryRoutine, next.day, next.index)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: typeColor,
                  borderRadius: 14,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "800",
                    fontSize: 16,
                    letterSpacing: 0.3,
                  }}
                >
                  Empezar entrenamiento
                </Text>
              </TouchableOpacity>
            </>
          ) : null}

          {/* Detail link */}
          <TouchableOpacity
            onPress={() => setDetailRoutine(primaryRoutine)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              paddingVertical: 4,
            }}
          >
            <Text
              style={{
                color: colors.textMuted,
                fontSize: 13,
                fontWeight: "600",
              }}
            >
              Ver detalle completo
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ─── Past routines (compact, collapsible) ─────────────────────────────────

  const renderPastSection = () => {
    if (pastPersonal.length === 0) return null;
    return (
      <View style={{ marginTop: 28 }}>
        <TouchableOpacity
          onPress={() => setShowPast((v) => !v)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              color: colors.textMuted,
              fontSize: 12,
              letterSpacing: 1,
              fontWeight: "600",
            }}
          >
            RUTINAS PASADAS ({pastPersonal.length})
          </Text>
          <Ionicons
            name={showPast ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.textMuted}
          />
        </TouchableOpacity>

        {showPast &&
          pastPersonal.map((r) => (
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
                <Text
                  style={{
                    color: colors.textMuted,
                    fontWeight: "600",
                    fontSize: 14,
                  }}
                >
                  {r.data.nombre}
                </Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 11,
                    marginTop: 2,
                    opacity: 0.6,
                  }}
                >
                  {r.data.dias.length} días · {ROUTINE_TYPE_LABELS[r.type]}
                </Text>
              </View>
              <TouchableOpacity onPress={() => restartRoutine(r)}>
                <Text
                  style={{
                    color: colors.accent,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  Reiniciar
                </Text>
              </TouchableOpacity>
            </View>
          ))}
      </View>
    );
  };

  // ─── Main render ───────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 40,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 26,
            fontWeight: "800",
            letterSpacing: -0.5,
            marginBottom: 4,
          }}
        >
          Entrenar
        </Text>
        <Text
          style={{ color: colors.textMuted, fontSize: 14, marginBottom: 24 }}
        >
          Tu rutina de hoy
        </Text>

        {renderHero()}
        {renderPastSection()}

        {/* Create own routine */}
        <TouchableOpacity
          onPress={routineCreator.openCreateRoutine}
          style={{
            marginTop: 28,
            backgroundColor: colors.card,
            borderRadius: 14,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.accent + "20",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="add" size={20} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ color: colors.text, fontWeight: "600", fontSize: 14 }}
            >
              Crear rutina propia
            </Text>
            <Text
              style={{ color: colors.textMuted, fontSize: 12, marginTop: 1 }}
            >
              Diseñá tu plan con días y ejercicios
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>

      {/* ── MODALS ── */}
      <RoutineDetailSheet
        routine={detailRoutine}
        onClose={() => setDetailRoutine(null)}
        onStartDay={(day, idx) => {
          const r = detailRoutine!;
          setDetailRoutine(null);
          setTimeout(() => startDay(r, day, idx), 350);
        }}
        onSkipDay={(idx) => {
          if (detailRoutine) skipDay(detailRoutine, idx);
        }}
        onUnskipDay={(idx) => {
          if (detailRoutine) unskipDay(detailRoutine, idx);
        }}
        onDelete={() => {
          if (detailRoutine) deleteRoutine(detailRoutine);
        }}
      />

      <DayPreviewModal
        visible={dayPreviewVisible}
        previewDay={previewDay}
        onClose={() => {
          setDayPreviewVisible(false);
          setPreviewDay(null);
        }}
        onStartSession={() => setConfirmVisible(true)}
        confirmVisible={confirmVisible}
        onConfirmStart={doStartSession}
        onCancelConfirm={() => setConfirmVisible(false)}
      />

      <RoutineCreatorModal {...routineCreator} />

      <ExercisePicker
        visible={routineCreator.exPickerVisible}
        onClose={() => routineCreator.setExPickerVisible(false)}
        onSelect={routineCreator.pickExercise}
        onSelectMultiple={routineCreator.pickExercises}
        multiSelect
        library={routineCreator.library}
        loading={routineCreator.loadingLibrary}
        title="Elegir ejercicios"
      />
      <ExercisePicker
        visible={routineCreator.circuitExPickerVisible}
        onClose={() => routineCreator.setCircuitExPickerVisible(false)}
        onSelect={routineCreator.pickCircuitExercise}
        onSelectMultiple={routineCreator.pickCircuitExercises}
        multiSelect
        library={routineCreator.library}
        loading={routineCreator.loadingLibrary}
        title="Elegir ejercicios para circuito"
      />

      <CustomModal
        visible={!!deleteTarget}
        title="Eliminar rutina"
        message={`¿Seguro que querés eliminar "${deleteTarget?.data.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        confirmColor={colors.error}
        confirmTextColor="white"
        onConfirm={confirmDeleteRoutine}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}
