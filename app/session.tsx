import type { LibraryExercise } from "@/components/ui/custom/ExercisePicker";
import ExercisePicker from "@/components/ui/custom/ExercisePicker";
import ExerciseCard from "@/components/session/ExerciseCard";
import FinishSessionModal from "@/components/session/FinishSessionModal";
import RestTimerModal from "@/components/session/RestTimerModal";
import SessionHeader from "@/components/session/SessionHeader";
import TrackingModeToggle from "@/components/session/TrackingModeToggle";
import { useAuth } from "@/context/auth-context";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import type { SessionExercise } from "@/types/session";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function buildInitialExercises(params: {
  type?: string;
  dayData?: string;
  exercises?: string;
}): SessionExercise[] {
  if (params.type === "routine" && params.dayData) {
    const day = JSON.parse(params.dayData);
    return (day.ejercicios ?? []).map((ej: any) => ({
      exercise_name: ej.nombre,
      target: `${ej.series} × ${ej.reps}`,
      restSeconds: parseDescanso(ej.descanso ?? ""),
      sets: Array.from({ length: ej.series }, () => ({ reps: "", weight: "", rpe: "", done: false })),
    }));
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
  const { user } = useAuth();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ type: string; dayData?: string; exercises?: string }>();

  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>(() => buildInitialExercises(params));
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");
  const [trackingMode, setTrackingMode] = useState<"simple" | "detailed">("detailed");

  // Rest timer
  const [restVisible, setRestVisible] = useState(false);
  const [restRemaining, setRestRemaining] = useState(60);
  const [restRunning, setRestRunning] = useState(false);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Add-exercise picker (free sessions)
  const [addPickerVisible, setAddPickerVisible] = useState(false);
  const [library, setLibrary] = useState<LibraryExercise[]>([]);
  const [loadingLib, setLoadingLib] = useState(false);

  // ─── Timers ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (restRunning) {
      restIntervalRef.current = setInterval(() => {
        setRestRemaining((r) => {
          if (r <= 1) {
            setRestRunning(false);
            clearInterval(restIntervalRef.current!);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    } else {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    }
    return () => { if (restIntervalRef.current) clearInterval(restIntervalRef.current); };
  }, [restRunning]);

  // ─── Rest timer actions ───────────────────────────────────────────────────
  const startRest = (seconds: number) => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestRemaining(seconds);
    setRestRunning(true);
  };

  const skipRest = () => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestRunning(false);
    setRestRemaining(0);
    setRestVisible(false);
  };

  const autoStartRest = (seconds: number) => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestRemaining(seconds);
    setRestRunning(true);
    setRestVisible(true);
  };

  const adjustRest = (delta: number) => setRestRemaining((r) => Math.max(5, r + delta));

  // ─── Set management ───────────────────────────────────────────────────────
  const addSet = (exIdx: number) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      updated[exIdx] = { ...updated[exIdx], sets: [...updated[exIdx].sets, { reps: "", weight: "", rpe: "", done: false }] };
      return updated;
    });
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      updated[exIdx] = { ...updated[exIdx], sets: updated[exIdx].sets.filter((_, i) => i !== setIdx) };
      return updated;
    });
  };

  const removeExercise = (exIdx: number) => {
    setSessionExercises((prev) => prev.filter((_, i) => i !== exIdx));
  };

  const updateSet = (exIdx: number, setIdx: number, field: "reps" | "weight" | "rpe", value: string) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      updated[exIdx] = { ...updated[exIdx], sets };
      return updated;
    });
  };

  const toggleDone = (exIdx: number, setIdx: number) => {
    const wasAlreadyDone = sessionExercises[exIdx].sets[setIdx].done;
    setSessionExercises((prev) => {
      const updated = [...prev];
      const sets = [...updated[exIdx].sets];
      sets[setIdx] = { ...sets[setIdx], done: !sets[setIdx].done };
      updated[exIdx] = { ...updated[exIdx], sets };
      return updated;
    });
    if (!wasAlreadyDone) {
      autoStartRest(sessionExercises[exIdx].restSeconds ?? 60);
    }
  };

  const toggleExerciseMode = (exIdx: number) => {
    setSessionExercises((prev) => {
      const updated = [...prev];
      const cur = updated[exIdx].trackingMode;
      const cycle: (undefined | "simple" | "detailed")[] = [undefined, "simple", "detailed"];
      const idx = cycle.indexOf(cur);
      updated[exIdx] = { ...updated[exIdx], trackingMode: cycle[(idx + 1) % 3] };
      return updated;
    });
  };

  // ─── Exercise picker (free session) ──────────────────────────────────────
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
    if (!sessionExercises.find((e) => e.exercise_id === ex.id)) {
      setSessionExercises((prev) => [
        ...prev,
        { exercise_id: ex.id, exercise_name: ex.name, sets: [{ reps: "", weight: "", rpe: "", done: false }] },
      ]);
    }
    setAddPickerVisible(false);
  };

  // ─── Finish session ───────────────────────────────────────────────────────
  const finishSession = async () => {
    if (!user) return;
    setSaving(true);
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
    setSaving(false);
    router.replace("/(tabs)/train");
  };

  // ─── Derived ──────────────────────────────────────────────────────────────
  const dayTitle =
    params.type === "routine" && params.dayData
      ? (JSON.parse(params.dayData) as any).dia
      : "Sesión libre";

  const completedSets = sessionExercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.done).length, 0);
  const alreadyAddedIds = sessionExercises.map((e) => e.exercise_id).filter(Boolean) as string[];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <SessionHeader
        dayTitle={dayTitle}
        completedSets={completedSets}
        elapsed={elapsed}
        saving={saving}
        colors={colors}
        onFinish={() => setFinishModalVisible(true)}
      />

      <TrackingModeToggle trackingMode={trackingMode} colors={colors} onChange={setTrackingMode} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
          {sessionExercises.map((ex, exIdx) => (
            <ExerciseCard
              key={exIdx}
              ex={ex}
              exIdx={exIdx}
              globalMode={trackingMode}
              colors={colors}
              onUpdateSet={updateSet}
              onToggleDone={toggleDone}
              onAddSet={addSet}
              onRemoveSet={removeSet}
              onRemoveExercise={removeExercise}
              onToggleMode={toggleExerciseMode}
            />
          ))}

          {params.type === "free" && (
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
        completedSets={completedSets}
        elapsed={elapsed}
        sessionNotes={sessionNotes}
        setSessionNotes={setSessionNotes}
        saving={saving}
        colors={colors}
        onClose={() => setFinishModalVisible(false)}
        onFinish={() => { setFinishModalVisible(false); finishSession(); }}
      />

      <RestTimerModal
        visible={restVisible}
        restRemaining={restRemaining}
        restRunning={restRunning}
        colors={colors}
        onStart={startRest}
        onSkip={skipRest}
        onAdjust={adjustRest}
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
