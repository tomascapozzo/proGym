import type { LibraryExercise } from "@/components/ui/custom/ExercisePicker";
import ExercisePicker from "@/components/ui/custom/ExercisePicker";
import CircuitGroupCard from "@/components/session/CircuitGroupCard";
import DiscardSessionModal from "@/components/session/DiscardSessionModal";
import ExerciseCard from "@/components/session/ExerciseCard";
import FinishSessionModal from "@/components/session/FinishSessionModal";
import RestTimerModal from "@/components/session/RestTimerModal";
import RpePromptModal from "@/components/session/RpePromptModal";
import SessionHeader from "@/components/session/SessionHeader";
import TrackingModeToggle from "@/components/session/TrackingModeToggle";
import { useAuth } from "@/context/auth-context";
import { useSession } from "@/context/session-context";
import { useTheme } from "@/context/theme-context";
import { buildRenderGroups } from "@/lib/session-utils";
import { supabase } from "@/lib/supabase";
import type { SessionExercise } from "@/types/session";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Resolve a peso string to a kg number, or undefined if not set.
 *  "75%"  → oneRm[exerciseName] * 0.75, rounded to nearest 0.5 kg
 *  "80"   → 80
 */
function resolvePeso(
  peso: string | undefined,
  exerciseName: string,
  oneRm: Record<string, number> | undefined,
): string | undefined {
  if (!peso || !peso.trim()) return undefined;
  const pct = peso.trim().match(/^(\d+(?:\.\d+)?)%$/);
  if (pct) {
    const rm = oneRm?.[exerciseName];
    if (!rm) return undefined;
    const resolved = Math.round((rm * parseFloat(pct[1])) / 100 / 0.5) * 0.5;
    return String(resolved);
  }
  const fixed = parseFloat(peso.trim());
  if (!isNaN(fixed)) return String(fixed);
  return undefined;
}

function parseDescanso(s: string): number {
  if (!s) return 60;
  const t = s.toLowerCase().trim();
  const colonMatch = t.match(/^(\d+):(\d{2})$/);
  if (colonMatch) return parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]);
  const minMatch = t.match(/(\d+(?:\.\d+)?)\s*min/);
  if (minMatch) return Math.round(parseFloat(minMatch[1]) * 60);
  const secMatch = t.match(/(\d+(?:\.\d+)?)\s*s(?:eg|ec)?/);
  if (secMatch) return Math.round(parseFloat(secMatch[1]));
  const numMatch = t.match(/^(\d+)$/);
  if (numMatch) return parseInt(numMatch[1]);
  return 60;
}

function buildInitialExercises(
  params: { type?: string; dayData?: string; exercises?: string },
  oneRm?: Record<string, number>,
  lastWeights?: Record<string, number>,
): SessionExercise[] {
  const fallbackWeight = (name: string) =>
    lastWeights?.[name] !== undefined ? String(lastWeights[name]) : "";

  if (params.type === "routine" && params.dayData) {
    const day = JSON.parse(params.dayData);

    const regularExercises: SessionExercise[] = (day.ejercicios ?? []).map((ej: any) => {
      const pesoArray: string[] | undefined = Array.isArray(ej.peso) ? ej.peso : undefined;
      const repsDisplay = Array.isArray(ej.reps) ? ej.reps.join("/") : ej.reps;
      const firstWeight = resolvePeso(pesoArray?.[0] ?? ej.peso, ej.nombre, oneRm) ?? fallbackWeight(ej.nombre);
      const targetParts = [`${ej.series} × ${repsDisplay}`];
      if (firstWeight) targetParts.push(`${firstWeight} kg`);
      return {
        exercise_name: ej.nombre,
        target: targetParts.join(" · "),
        restSeconds: parseDescanso(ej.descanso ?? ""),
        sets: Array.from({ length: ej.series }, (_, i) => {
          const pReps = ej.reps?.[i] !== undefined ? String(ej.reps[i]) : undefined;
          const pWeight = (resolvePeso(pesoArray?.[i] ?? ej.peso, ej.nombre, oneRm) ?? fallbackWeight(ej.nombre)) || undefined;
          return { reps: "", weight: "", ...(pReps ? { plannedReps: pReps } : {}), ...(pWeight ? { plannedWeight: pWeight } : {}), rpe: "", done: false };
        }),
      };
    });

    const circuitExercises: SessionExercise[] = (day.circuitos ?? []).flatMap((circ: any, circIdx: number) =>
      (circ.ejercicios ?? []).map((cEx: any) => {
        const pesoArray: string[] | undefined = Array.isArray(cEx.peso) ? cEx.peso : undefined;
        const repsDisplay = Array.isArray(cEx.reps) ? cEx.reps.join("/") : cEx.reps;
        const firstWeight = resolvePeso(pesoArray?.[0] ?? cEx.peso, cEx.nombre, oneRm) ?? fallbackWeight(cEx.nombre);
        const targetParts = [repsDisplay + " reps"];
        if (firstWeight) targetParts.push(`${firstWeight} kg`);
        return {
          exercise_name: cEx.nombre,
          target: targetParts.join(" · "),
          restSeconds: parseDescanso(circ.descanso ?? ""),
          circuitId: `circuit_${circIdx}`,
          circuitName: circ.nombre || `Superset ${circIdx + 1}`,
          sets: Array.from({ length: circ.rondas }, (_, i) => {
            const pReps = cEx.reps?.[i] !== undefined ? String(cEx.reps[i]) : undefined;
            const pWeight = (resolvePeso(pesoArray?.[i] ?? cEx.peso, cEx.nombre, oneRm) ?? fallbackWeight(cEx.nombre)) || undefined;
            return { reps: "", weight: "", ...(pReps ? { plannedReps: pReps } : {}), ...(pWeight ? { plannedWeight: pWeight } : {}), rpe: "", done: false };
          }),
        };
      }),
    );

    return [...regularExercises, ...circuitExercises];
  }
  if (params.type === "free" && params.exercises) {
    return (JSON.parse(params.exercises) as LibraryExercise[]).map((ex) => {
      const pWeight = fallbackWeight(ex.name);
      return {
        exercise_id: ex.id,
        exercise_name: ex.name,
        sets: [{ reps: "", weight: "", ...(pWeight ? { plannedWeight: pWeight } : {}), rpe: "", done: false }],
      };
    });
  }
  return [];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SessionScreen() {
  const { user, profile } = useAuth();
  const { colors } = useTheme();
  const session = useSession();
  const params = useLocalSearchParams<{
    type: string;
    dayData?: string;
    exercises?: string;
    dayIndex?: string;
    routineId?: string;
    enrollmentId?: string;
    routineType?: string;
    completedDays?: string;
    totalDays?: string;
    rpePrompt?: string;
  }>();

  const rpePrompt = params.rpePrompt ?? "sesion";

  const [sessionReady, setSessionReady] = useState(false);

  // UI-only state (doesn't need to survive navigation)
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [sessionRpe, setSessionRpe] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [discardModalVisible, setDiscardModalVisible] = useState(false);
  const [addPickerVisible, setAddPickerVisible] = useState(false);
  const [replacePickerVisible, setReplacePickerVisible] = useState(false);
  const [replaceExIdx, setReplaceExIdx] = useState<number | null>(null);
  const [library, setLibrary] = useState<LibraryExercise[]>([]);
  const [loadingLib, setLoadingLib] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // ── On mount: start session once restoration check completes ─────────────
  useEffect(() => {
    if (session.isRestoring) return;
    if (session.isActive) {
      setSessionReady(true);
      return;
    }
    const init = async () => {
      const title =
        params.type === "routine" && params.dayData
          ? (JSON.parse(params.dayData) as any).dia
          : "Sesión libre";

      let lastWeights: Record<string, number> = {};
      if (user) {
        const { data } = await supabase
          .from("workout_logs")
          .select("exercises")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30);
        if (data) {
          for (const log of data) {
            for (const ex of (log.exercises ?? [])) {
              if (lastWeights[ex.exercise_name] === undefined) {
                const lastSet = [...(ex.sets ?? [])].reverse().find((s: any) => s.weight > 0);
                if (lastSet) lastWeights[ex.exercise_name] = lastSet.weight;
              }
            }
          }
        }
      }

      const exercises = buildInitialExercises(params, profile?.one_rm, lastWeights);
      session.startSession(title, { ...params, rpePrompt }, exercises);
      setSessionReady(true);
    };
    init();
  }, [session.isRestoring]);

  // ── Exercise picker (free session) ────────────────────────────────────────
  const openAddExercise = async () => {
    if (library.length === 0) {
      setLoadingLib(true);
      const { data, error } = await supabase
        .from("exercises")
        .select("id, name, muscle_group, movement_pattern, equipment")
        .order("muscle_group")
        .order("name");
      setLoadingLib(false);
      if (error || !data) return;
      setLibrary(data);
    }
    setAddPickerVisible(true);
  };

  const addExerciseToSession = (ex: LibraryExercise) => {
    if (!session.sessionExercises.find((e) => e.exercise_id === ex.id)) {
      session.setSessionExercises((prev) => [
        ...prev,
        { exercise_id: ex.id, exercise_name: ex.name, sets: [{ reps: "", weight: "", rpe: "", done: false }] },
      ]);
    }
    setAddPickerVisible(false);
  };

  const openReplaceExercise = async (exIdx: number) => {
    setReplaceExIdx(exIdx);
    if (library.length === 0) {
      setLoadingLib(true);
      const { data, error } = await supabase
        .from("exercises")
        .select("id, name, muscle_group, movement_pattern, equipment")
        .order("muscle_group")
        .order("name");
      setLoadingLib(false);
      if (error || !data) return;
      setLibrary(data);
    }
    setReplacePickerVisible(true);
  };

  const replaceExerciseInSession = (ex: LibraryExercise) => {
    if (replaceExIdx !== null) {
      session.replaceExercise(replaceExIdx, ex.id, ex.name);
    }
    setReplacePickerVisible(false);
    setReplaceExIdx(null);
  };

  // ── Finish session ────────────────────────────────────────────────────────
  const finishSession = async () => {
    if (!user) return;
    setSaving(true);
    const { sessionExercises, elapsed, trackingMode, sessionParams } = session;

    const { data: libraryRows } = await supabase.from("exercises").select("id, name");
    const exerciseIdByName = new Map<string, string>(
      (libraryRows ?? []).map((r: { id: string; name: string }) => [r.name, r.id]),
    );

    const loggedExercises = sessionExercises
      .map((ex) => {
        const mode = ex.trackingMode ?? trackingMode;
        const sets =
          mode === "simple"
            ? ex.sets.filter((s) => s.done && !s.skipped).map(() => ({ reps: 0, weight: 0 }))
            : ex.sets
                .filter((s) => s.reps !== "" || s.weight !== "")
                .map((s) => ({
                  reps: parseFloat(s.reps) || 0,
                  weight: parseFloat(s.weight) || 0,
                  ...(s.rpe !== "" ? { rpe: parseFloat(s.rpe) || null } : {}),
                }));
        const resolvedId = ex.exercise_id ?? exerciseIdByName.get(ex.exercise_name) ?? null;
        return { exercise_id: resolvedId, exercise_name: ex.exercise_name, sets };
      })
      .filter((ex) => ex.sets.length > 0);

    if (loggedExercises.length > 0) {
      const routineDayName = sessionParams.dayData
        ? (JSON.parse(sessionParams.dayData) as any).dia ?? null
        : null;
      const sessionRpeValue = sessionParams.rpePrompt === "sesion" || !sessionParams.rpePrompt ? sessionRpe : null;
      let { error: insertError } = await supabase.from("workout_logs").insert({
        user_id: user.id,
        exercises: loggedExercises,
        duration_seconds: elapsed,
        notes: sessionNotes.trim() || null,
        rpe: sessionRpeValue,
        routine_id: sessionParams.routineId ?? null,
        routine_day_index: sessionParams.dayIndex ? parseInt(sessionParams.dayIndex) : null,
        routine_day_name: routineDayName,
      });
      if (insertError?.code === "23503" && insertError.message.includes("routine_id")) {
        ({ error: insertError } = await supabase.from("workout_logs").insert({
          user_id: user.id,
          exercises: loggedExercises,
          duration_seconds: elapsed,
          notes: sessionNotes.trim() || null,
          rpe: sessionRpeValue,
          routine_id: null,
          routine_day_index: null,
          routine_day_name: routineDayName,
        }));
      }
      if (insertError) {
        setSaving(false);
        Alert.alert("Error al guardar", insertError.message);
        return;
      }
    }

    if (sessionParams.enrollmentId && sessionParams.routineType) {
      const dayIndex = parseInt(sessionParams.dayIndex ?? "0");
      const completedDays: number[] = JSON.parse(sessionParams.completedDays ?? "[]");
      const totalDays = parseInt(sessionParams.totalDays ?? "1");

      const newCompleted = completedDays.includes(dayIndex)
        ? completedDays
        : [...completedDays, dayIndex];
      const allDone = newCompleted.length >= totalDays;

      let newStatus = "active";
      let newProgress: { completed_days: number[] } = { completed_days: newCompleted };

      if (allDone) {
        if (sessionParams.routineType === "daily") {
          newStatus = "past";
        } else if (sessionParams.routineType === "weekly") {
          newStatus = "pending_restart";
        } else if (sessionParams.routineType === "monthly") {
          newProgress = { completed_days: [] };
        }
      }

      await supabase
        .from("routine_enrollments")
        .update({ status: newStatus, progress: newProgress })
        .eq("id", sessionParams.enrollmentId);
    }

    setSaving(false);
    session.clearSession();
    router.replace("/(tabs)/train");
  };

  // ── RPE handlers ─────────────────────────────────────────────────────────
  const handleRpeSubmit = (value: number) => {
    if (!session.pendingRpe) return;
    const { setIdx, affectedExIndices } = session.pendingRpe;
    affectedExIndices.forEach((exIdx) => {
      session.updateSet(exIdx, setIdx, "rpe", String(value));
    });
    session.clearPendingRpe();
  };

  // ── Minimize: go back to tabs while keeping session alive in context ───────
  const handleMinimize = () => {
    router.replace("/(tabs)");
  };

  // ── Cancel: discard session without saving ────────────────────────────────
  const handleCancel = () => setDiscardModalVisible(true);

  const handleDiscardConfirm = () => {
    setDiscardModalVisible(false);
    session.clearSession();
    router.replace("/(tabs)/train");
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const renderGroups = useMemo(
    () => buildRenderGroups(session.sessionExercises),
    [session.sessionExercises],
  );

  const currentCircuitId = useMemo(() => {
    for (const group of renderGroups) {
      if (group.kind !== "circuit") continue;
      const hasUndone = group.exIndices.some((idx) =>
        session.sessionExercises[idx]?.sets.some((s) => !s.done && !s.skipped),
      );
      if (hasUndone) return group.circuitId;
    }
    return null;
  }, [renderGroups, session.sessionExercises]);

  const [manuallyExpanded, setManuallyExpanded] = useState<Set<string>>(new Set());

  const isCircuitCollapsed = (circuitId: string) =>
    circuitId !== currentCircuitId && !manuallyExpanded.has(circuitId);

  const toggleCircuit = (circuitId: string) => {
    setManuallyExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(circuitId)) next.delete(circuitId);
      else next.add(circuitId);
      return next;
    });
  };

  const alreadyAddedIds = session.sessionExercises
    .map((e) => e.exercise_id)
    .filter(Boolean) as string[];

  // ─── Render ───────────────────────────────────────────────────────────────
  if (!sessionReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SessionHeader
        dayTitle={session.sessionTitle}
        completedSets={session.completedSets}
        elapsed={session.elapsed}
        saving={saving}
        colors={colors}
        onFinish={() => setFinishModalVisible(true)}
        onMinimize={handleMinimize}
        onCancel={handleCancel}
      />

      <TrackingModeToggle
        trackingMode={session.trackingMode}
        colors={colors}
        onChange={session.setTrackingMode}
      />

      <TouchableOpacity
        onPress={() => setIsReordering((v) => !v)}
        style={{
          alignSelf: "flex-end",
          paddingHorizontal: 16,
          paddingVertical: 6,
        }}
      >
        <Text style={{ color: isReordering ? colors.accent : colors.textMuted, fontSize: 13, fontWeight: isReordering ? "700" : "400" }}>
          {isReordering ? "Listo" : "Reordenar"}
        </Text>
      </TouchableOpacity>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {renderGroups.map((group, groupIdx, allGroups) => {
            if (group.kind === "circuit") {
              const circuitExercises = group.exIndices.map((idx) => session.sessionExercises[idx]);
              const circuitIndex = allGroups.slice(0, groupIdx + 1).filter((g) => g.kind === "circuit").length - 1;
              return (
                <CircuitGroupCard
                  key={`circuit_${group.circuitId}`}
                  exercises={circuitExercises}
                  exIndices={group.exIndices}
                  circuitName={group.circuitName}
                  circuitIndex={circuitIndex}
                  globalMode={session.trackingMode}
                  colors={colors}
                  onUpdateSet={session.updateSet}
                  onFillDown={session.fillDown}
                  onToggleDone={session.toggleDone}
                  onSkipSet={session.skipSet}
                  onAddRound={() => group.exIndices.forEach((idx) => session.addSet(idx))}
                  onRemoveRound={(roundIdx) => group.exIndices.forEach((idx) => session.removeSet(idx, roundIdx))}
                  onReplaceExercise={openReplaceExercise}
                  isReordering={isReordering}
                  canMoveUp={groupIdx > 0}
                  canMoveDown={groupIdx < allGroups.length - 1}
                  onMoveUp={() => session.reorderGroup(groupIdx, "up")}
                  onMoveDown={() => session.reorderGroup(groupIdx, "down")}
                  onMoveExerciseUp={(liveExIdx) => session.reorderCircuitExercise(group.circuitId, liveExIdx, "up")}
                  onMoveExerciseDown={(liveExIdx) => session.reorderCircuitExercise(group.circuitId, liveExIdx, "down")}
                  collapsed={isCircuitCollapsed(group.circuitId)}
                  onToggleCollapse={() => toggleCircuit(group.circuitId)}
                />
              );
            }
            const ex = session.sessionExercises[group.exIdx];
            return (
              <ExerciseCard
                key={`ex_${group.exIdx}`}
                ex={ex}
                exIdx={group.exIdx}
                globalMode={session.trackingMode}
                colors={colors}
                onUpdateSet={session.updateSet}
                onFillDown={session.fillDown}
                onToggleDone={session.toggleDone}
                onSkipSet={session.skipSet}
                onAddSet={session.addSet}
                onRemoveSet={session.removeSet}
                onRemoveExercise={session.removeExercise}
                onReplaceExercise={openReplaceExercise}
                onToggleMode={session.toggleExerciseMode}
                isReordering={isReordering}
                canMoveUp={groupIdx > 0}
                canMoveDown={groupIdx < allGroups.length - 1}
                onMoveUp={() => session.reorderGroup(groupIdx, "up")}
                onMoveDown={() => session.reorderGroup(groupIdx, "down")}
              />
            );
          })}

          {session.sessionParams.type === "free" && (
            <TouchableOpacity
              onPress={openAddExercise}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderStyle: "solid",
                borderRadius: 14,
                padding: 16,
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ color: colors.accent, fontWeight: "600" }}>+ Agregar ejercicio</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <FinishSessionModal
        visible={finishModalVisible}
        completedSets={session.completedSets}
        elapsed={session.elapsed}
        sessionNotes={sessionNotes}
        setSessionNotes={setSessionNotes}
        showRpeInput={rpePrompt === "sesion"}
        sessionRpe={sessionRpe}
        setSessionRpe={setSessionRpe}
        saving={saving}
        colors={colors}
        onClose={() => setFinishModalVisible(false)}
        onFinish={() => { setFinishModalVisible(false); finishSession(); }}
      />

      <RestTimerModal
        visible={session.restVisible}
        restRemaining={session.restRemaining}
        restRunning={session.restRunning}
        colors={colors}
        onStart={session.startRest}
        onSkip={session.skipRest}
        onAdjust={session.adjustRest}
      />

      <DiscardSessionModal
        visible={discardModalVisible}
        colors={colors}
        onConfirm={handleDiscardConfirm}
        onClose={() => setDiscardModalVisible(false)}
      />

      <RpePromptModal
        visible={session.pendingRpe !== null}
        colors={colors}
        onSubmit={handleRpeSubmit}
        onDismiss={session.clearPendingRpe}
      />

      <ExercisePicker
        visible={addPickerVisible}
        onClose={() => setAddPickerVisible(false)}
        onSelect={addExerciseToSession}
        library={library}
        loading={loadingLib}
        alreadyAdded={alreadyAddedIds}
      />

      <ExercisePicker
        visible={replacePickerVisible}
        onClose={() => { setReplacePickerVisible(false); setReplaceExIdx(null); }}
        onSelect={replaceExerciseInSession}
        library={library}
        loading={loadingLib}
        alreadyAdded={[]}
      />
    </View>
  );
}
