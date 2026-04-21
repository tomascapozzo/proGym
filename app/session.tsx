import type { LibraryExercise } from "@/components/ui/custom/ExercisePicker";
import ExercisePicker from "@/components/ui/custom/ExercisePicker";
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
import React, { useEffect, useRef, useState } from "react";
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
          reps: "",
          weight: resolvePeso(pesoArray?.[i] ?? ej.peso, ej.nombre, oneRm) ?? "",
          rpe: "",
          done: false,
        })),
      };
    });

    const circuitExercises: SessionExercise[] = (day.circuitos ?? []).flatMap((circ: any) =>
      (circ.ejercicios ?? []).map((cEx: any) => {
        const pesoArray: string[] | undefined = Array.isArray(cEx.peso) ? cEx.peso : undefined;
        const repsDisplay = Array.isArray(cEx.reps) ? cEx.reps.join("/") : cEx.reps;
        const firstWeight = resolvePeso(pesoArray?.[0] ?? cEx.peso, cEx.nombre, oneRm);
        const prefix = circ.nombre ? `${circ.nombre} - ` : "";
        const targetParts = [`${circ.rondas} rondas × ${repsDisplay}`];
        if (firstWeight) targetParts.push(`${firstWeight} kg`);
        return {
          exercise_name: `${prefix}${cEx.nombre}`,
          target: targetParts.join(" · "),
          restSeconds: parseDescanso(circ.descanso ?? ""),
          sets: Array.from({ length: circ.rondas }, (_, i) => ({
            reps: "",
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

  const initializedRef = useRef(false);

  // ── On mount: start session in context if not already active ──────────────
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (!session.isActive) {
      const title =
        params.type === "routine" && params.dayData
          ? (JSON.parse(params.dayData) as any).dia
          : "Sesión libre";
      const exercises = buildInitialExercises(params, profile?.one_rm);
      session.startSession(title, params, exercises);
    }
  }, []);

  // ── Exercise picker (free session) ────────────────────────────────────────
  const openAddExercise = async () => {
    if (library.length === 0) {
      setLoadingLib(true);
      const { data } = await supabase
        .from("exercises")
        .select("id, name, muscle_group, movement_pattern, equipment")
        .order("muscle_group")
        .order("name");
      setLibrary(data ?? []);
      setLoadingLib(false);
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
        return { exercise_id: ex.exercise_id ?? null, exercise_name: ex.exercise_name, sets };
      })
      .filter((ex) => ex.sets.length > 0);

    if (loggedExercises.length > 0) {
      await supabase.from("workout_logs").insert({
        user_id: user.id,
        exercises: loggedExercises,
        duration_seconds: elapsed,
        notes: sessionNotes.trim() || null,
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
          {session.sessionExercises.map((ex, exIdx) => (
            <ExerciseCard
              key={exIdx}
              ex={ex}
              exIdx={exIdx}
              globalMode={session.trackingMode}
              colors={colors}
              onUpdateSet={session.updateSet}
              onToggleDone={session.toggleDone}
              onAddSet={session.addSet}
              onRemoveSet={session.removeSet}
              onRemoveExercise={session.removeExercise}
              onToggleMode={session.toggleExerciseMode}
            />
          ))}

          {session.sessionParams.type === "free" && (
            <TouchableOpacity
              onPress={openAddExercise}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderStyle: "dashed",
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
