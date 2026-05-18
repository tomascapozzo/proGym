import type { LibraryExercise } from "@/components/ui/custom/ExercisePicker";
import ExercisePicker from "@/components/ui/custom/ExercisePicker";
import CircuitGroupCard from "@/components/session/CircuitGroupCard";
import ExerciseCard from "@/components/session/ExerciseCard";
import FinishSessionModal from "@/components/session/FinishSessionModal";
import RestTimerModal from "@/components/session/RestTimerModal";
import SessionHeader from "@/components/session/SessionHeader";
import TrackingModeToggle from "@/components/session/TrackingModeToggle";
import { useAuth } from "@/context/auth-context";
import { useSession } from "@/context/session-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import type { SessionExercise } from "@/types/session";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

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
): SessionExercise[] {
  if (params.type === "routine" && params.dayData) {
    const day = JSON.parse(params.dayData);

    const regularExercises: SessionExercise[] = (day.ejercicios ?? []).map((ej: any) => {
      const pesoArray: string[] | undefined = Array.isArray(ej.peso) ? ej.peso : undefined;
      const repsDisplay = Array.isArray(ej.reps) ? ej.reps.join("/") : ej.reps;
      const firstWeight = resolvePeso(pesoArray?.[0] ?? ej.peso, ej.nombre, oneRm);
      const targetParts = [`${ej.series} × ${repsDisplay}`];
      if (firstWeight) targetParts.push(`${firstWeight} kg`);
      return {
        exercise_name: ej.nombre,
        target: targetParts.join(" · "),
        restSeconds: parseDescanso(ej.descanso ?? ""),
        sets: Array.from({ length: ej.series }, (_, i) => ({
          reps: ej.reps?.[i] ?? "",
          weight: resolvePeso(pesoArray?.[i] ?? ej.peso, ej.nombre, oneRm) ?? "",
          rpe: "",
          done: false,
        })),
      };
    });

    const circuitExercises: SessionExercise[] = (day.circuitos ?? []).flatMap((circ: any, circIdx: number) =>
      (circ.ejercicios ?? []).map((cEx: any) => {
        const pesoArray: string[] | undefined = Array.isArray(cEx.peso) ? cEx.peso : undefined;
        const repsDisplay = Array.isArray(cEx.reps) ? cEx.reps.join("/") : cEx.reps;
        const firstWeight = resolvePeso(pesoArray?.[0] ?? cEx.peso, cEx.nombre, oneRm);
        const targetParts = [repsDisplay + " reps"];
        if (firstWeight) targetParts.push(`${firstWeight} kg`);
        return {
          exercise_name: cEx.nombre,
          target: targetParts.join(" · "),
          restSeconds: parseDescanso(circ.descanso ?? ""),
          circuitId: `circuit_${circIdx}`,
          circuitName: circ.nombre || `Superset ${circIdx + 1}`,
          sets: Array.from({ length: circ.rondas }, (_, i) => ({
            reps: cEx.reps?.[i] ?? "",
            weight: resolvePeso(pesoArray?.[i] ?? cEx.peso, cEx.nombre, oneRm) ?? "",
            rpe: "",
            done: false,
          })),
        };
      }),
    );

    return [...regularExercises, ...circuitExercises];
  }
  if (params.type === "free" && params.exercises) {
    return (JSON.parse(params.exercises) as LibraryExercise[]).map((ex) => ({
      exercise_id: ex.id,
      exercise_name: ex.name,
      sets: [{ reps: "", weight: "", rpe: "", done: false }],
    }));
  }
  return [];
}

// ─── Render grouping ──────────────────────────────────────────────────────────

type RenderGroup =
  | { kind: "exercise"; exIdx: number }
  | { kind: "circuit"; circuitId: string; circuitName: string; exIndices: number[] };

function buildRenderGroups(exercises: SessionExercise[]): RenderGroup[] {
  const groups: RenderGroup[] = [];
  const seen = new Set<string>();
  exercises.forEach((ex, i) => {
    if (!ex.circuitId) {
      groups.push({ kind: "exercise", exIdx: i });
    } else if (!seen.has(ex.circuitId)) {
      seen.add(ex.circuitId);
      const exIndices = exercises.map((e, idx) => (e.circuitId === ex.circuitId ? idx : -1)).filter((idx) => idx !== -1);
      groups.push({ kind: "circuit", circuitId: ex.circuitId, circuitName: ex.circuitName ?? "Superset", exIndices });
    }
  });
  return groups;
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
    routineType?: string;
    completedDays?: string;
    totalDays?: string;
  }>();

  // UI-only state (doesn't need to survive navigation)
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [addPickerVisible, setAddPickerVisible] = useState(false);
  const [library, setLibrary] = useState<LibraryExercise[]>([]);
  const [loadingLib, setLoadingLib] = useState(false);

  // ── On mount: start session once restoration check completes ─────────────
  useEffect(() => {
    if (session.isRestoring) return;
    if (!session.isActive) {
      const title =
        params.type === "routine" && params.dayData
          ? (JSON.parse(params.dayData) as any).dia
          : "Sesión libre";
      const exercises = buildInitialExercises(params, profile?.one_rm);
      session.startSession(title, params, exercises);
    }
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
            ? ex.sets.filter((s) => s.done).map(() => ({ reps: 0, weight: 0 }))
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
      await supabase.from("workout_logs").insert({
        user_id: user.id,
        exercises: loggedExercises,
        duration_seconds: elapsed,
        notes: sessionNotes.trim() || null,
        routine_id: sessionParams.routineId ?? null,
        routine_day_index: sessionParams.dayIndex ? parseInt(sessionParams.dayIndex) : null,
        routine_day_name: routineDayName,
      });
    }

    if (sessionParams.routineId && sessionParams.routineType) {
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
        .from("routines")
        .update({ status: newStatus, progress: newProgress })
        .eq("id", sessionParams.routineId);
    }

    setSaving(false);
    session.clearSession();
    router.replace("/(tabs)/train");
  };

  // ── Minimize: go back to tabs while keeping session alive in context ───────
  const handleMinimize = () => {
    router.replace("/(tabs)");
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const alreadyAddedIds = session.sessionExercises
    .map((e) => e.exercise_id)
    .filter(Boolean) as string[];

  // ─── Render ───────────────────────────────────────────────────────────────
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
      />

      <TrackingModeToggle
        trackingMode={session.trackingMode}
        colors={colors}
        onChange={session.setTrackingMode}
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {buildRenderGroups(session.sessionExercises).map((group) => {
            if (group.kind === "circuit") {
              const circuitExercises = group.exIndices.map((idx) => session.sessionExercises[idx]);
              return (
                <CircuitGroupCard
                  key={`circuit_${group.circuitId}`}
                  exercises={circuitExercises}
                  exIndices={group.exIndices}
                  circuitName={group.circuitName}
                  globalMode={session.trackingMode}
                  colors={colors}
                  onUpdateSet={session.updateSet}
                  onToggleDone={session.toggleDone}
                  onAddRound={() => group.exIndices.forEach((idx) => session.addSet(idx))}
                  onRemoveRound={(roundIdx) => group.exIndices.forEach((idx) => session.removeSet(idx, roundIdx))}
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
                onToggleDone={session.toggleDone}
                onAddSet={session.addSet}
                onRemoveSet={session.removeSet}
                onRemoveExercise={session.removeExercise}
                onToggleMode={session.toggleExerciseMode}
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

      <ExercisePicker
        visible={addPickerVisible}
        onClose={() => setAddPickerVisible(false)}
        onSelect={addExerciseToSession}
        library={library}
        loading={loadingLib}
        alreadyAdded={alreadyAddedIds}
      />
    </View>
  );
}
