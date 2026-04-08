import type { LibraryExercise } from "@/components/ui/custom/ExercisePicker";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import {
  DEFAULT_EXERCISE,
  type Routine,
  type RoutineCircuit,
  type RoutineDay,
  type RoutineDayExercise,
} from "@/types/routine";

export function useRoutineCreator(onSaved: () => void) {
  const { user } = useAuth();

  // Exercise library
  const [library, setLibrary] = useState<LibraryExercise[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  // Routine creation modal
  const [createVisible, setCreateVisible] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newDays, setNewDays] = useState<RoutineDay[]>([]);
  const [editingDayIdx, setEditingDayIdx] = useState<number | null>(null);
  const [savingRoutine, setSavingRoutine] = useState(false);

  // Exercise picker for routine creation
  const [exPickerVisible, setExPickerVisible] = useState(false);
  const [exPickerDayIdx, setExPickerDayIdx] = useState(0);

  // Circuit exercise picker
  const [circuitExPickerVisible, setCircuitExPickerVisible] = useState(false);
  const [circuitExPickerTarget, setCircuitExPickerTarget] = useState<{
    dayIdx: number;
    circIdx: number;
  } | null>(null);

  // ─── Library ─────────────────────────────────────────────────────────────

  const ensureLibrary = async () => {
    if (library.length === 0) {
      setLoadingLibrary(true);
      const { data } = await supabase
        .from("exercises")
        .select("id, name, muscle_group, movement_pattern, equipment")
        .order("muscle_group")
        .order("name");
      setLibrary(data ?? []);
      setLoadingLibrary(false);
    }
  };

  // ─── Routine creation ─────────────────────────────────────────────────────

  const openCreateRoutine = () => {
    setNewRoutineName("");
    setNewDays([]);
    setEditingDayIdx(null);
    setCreateVisible(true);
  };

  const closeCreateRoutine = () => setCreateVisible(false);

  const addDay = () => {
    setNewDays((prev) => [
      ...prev,
      { dia: `Día ${prev.length + 1}`, enfoque: "", ejercicios: [] },
    ]);
    setEditingDayIdx(newDays.length);
  };

  const updateDay = (dayIdx: number, field: "dia" | "enfoque", value: string) => {
    setNewDays((prev) => {
      const updated = [...prev];
      updated[dayIdx] = { ...updated[dayIdx], [field]: value };
      return updated;
    });
  };

  const removeDay = (dayIdx: number) => {
    setNewDays((prev) => prev.filter((_, i) => i !== dayIdx));
    if (editingDayIdx === dayIdx) setEditingDayIdx(null);
    else if (editingDayIdx !== null && editingDayIdx > dayIdx)
      setEditingDayIdx(editingDayIdx - 1);
  };

  const addExerciseToDay = (dayIdx: number, name: string) => {
    setNewDays((prev) => {
      const updated = [...prev];
      updated[dayIdx] = {
        ...updated[dayIdx],
        ejercicios: [
          ...updated[dayIdx].ejercicios,
          { ...DEFAULT_EXERCISE, nombre: name },
        ],
      };
      return updated;
    });
  };

  const updateExercise = (
    dayIdx: number,
    exIdx: number,
    field: keyof RoutineDayExercise,
    value: string | number,
  ) => {
    setNewDays((prev) => {
      const updated = [...prev];
      const ejercicios = [...updated[dayIdx].ejercicios];
      ejercicios[exIdx] = { ...ejercicios[exIdx], [field]: value };
      updated[dayIdx] = { ...updated[dayIdx], ejercicios };
      return updated;
    });
  };

  const removeExercise = (dayIdx: number, exIdx: number) => {
    setNewDays((prev) => {
      const updated = [...prev];
      updated[dayIdx] = {
        ...updated[dayIdx],
        ejercicios: updated[dayIdx].ejercicios.filter((_, i) => i !== exIdx),
      };
      return updated;
    });
  };

  const openExPickerForDay = async (dayIdx: number) => {
    await ensureLibrary();
    setExPickerDayIdx(dayIdx);
    setExPickerVisible(true);
  };

  const pickExercise = (ex: LibraryExercise) => {
    addExerciseToDay(exPickerDayIdx, ex.name);
    setExPickerVisible(false);
  };

  const pickExercises = (exercises: LibraryExercise[]) => {
    exercises.forEach((ex) => addExerciseToDay(exPickerDayIdx, ex.name));
    setExPickerVisible(false);
  };

  // ─── Circuit creation ─────────────────────────────────────────────────────

  const addCircuit = (dayIdx: number) => {
    setNewDays((prev) => {
      const updated = [...prev];
      const day = updated[dayIdx];
      updated[dayIdx] = {
        ...day,
        circuitos: [
          ...(day.circuitos ?? []),
          { nombre: "", rondas: 3, descanso: "90s", ejercicios: [] },
        ],
      };
      return updated;
    });
  };

  const updateCircuit = (
    dayIdx: number,
    circIdx: number,
    field: keyof RoutineCircuit,
    value: string | number,
  ) => {
    setNewDays((prev) => {
      const updated = [...prev];
      const circuitos = [...(updated[dayIdx].circuitos ?? [])];
      circuitos[circIdx] = { ...circuitos[circIdx], [field]: value };
      updated[dayIdx] = { ...updated[dayIdx], circuitos };
      return updated;
    });
  };

  const removeCircuit = (dayIdx: number, circIdx: number) => {
    setNewDays((prev) => {
      const updated = [...prev];
      updated[dayIdx] = {
        ...updated[dayIdx],
        circuitos: (updated[dayIdx].circuitos ?? []).filter((_, i) => i !== circIdx),
      };
      return updated;
    });
  };

  const addExToCircuit = (dayIdx: number, circIdx: number, name: string) => {
    setNewDays((prev) => {
      const updated = [...prev];
      const circuitos = [...(updated[dayIdx].circuitos ?? [])];
      circuitos[circIdx] = {
        ...circuitos[circIdx],
        ejercicios: [...circuitos[circIdx].ejercicios, { nombre: name, reps: "10" }],
      };
      updated[dayIdx] = { ...updated[dayIdx], circuitos };
      return updated;
    });
  };

  const updateCircuitEx = (
    dayIdx: number,
    circIdx: number,
    exIdx: number,
    field: "nombre" | "reps",
    value: string,
  ) => {
    setNewDays((prev) => {
      const updated = [...prev];
      const circuitos = [...(updated[dayIdx].circuitos ?? [])];
      const ejercicios = [...circuitos[circIdx].ejercicios];
      ejercicios[exIdx] = { ...ejercicios[exIdx], [field]: value };
      circuitos[circIdx] = { ...circuitos[circIdx], ejercicios };
      updated[dayIdx] = { ...updated[dayIdx], circuitos };
      return updated;
    });
  };

  const removeCircuitEx = (dayIdx: number, circIdx: number, exIdx: number) => {
    setNewDays((prev) => {
      const updated = [...prev];
      const circuitos = [...(updated[dayIdx].circuitos ?? [])];
      circuitos[circIdx] = {
        ...circuitos[circIdx],
        ejercicios: circuitos[circIdx].ejercicios.filter((_, i) => i !== exIdx),
      };
      updated[dayIdx] = { ...updated[dayIdx], circuitos };
      return updated;
    });
  };

  const moveCircuitEx = (
    dayIdx: number,
    circIdx: number,
    exIdx: number,
    direction: "up" | "down",
  ) => {
    setNewDays((prev) => {
      const updated = [...prev];
      const circuitos = [...(updated[dayIdx].circuitos ?? [])];
      const ejercicios = [...circuitos[circIdx].ejercicios];
      const targetIdx = direction === "up" ? exIdx - 1 : exIdx + 1;
      if (targetIdx < 0 || targetIdx >= ejercicios.length) return prev;
      [ejercicios[exIdx], ejercicios[targetIdx]] = [
        ejercicios[targetIdx],
        ejercicios[exIdx],
      ];
      circuitos[circIdx] = { ...circuitos[circIdx], ejercicios };
      updated[dayIdx] = { ...updated[dayIdx], circuitos };
      return updated;
    });
  };

  const openCircuitExPicker = async (dayIdx: number, circIdx: number) => {
    await ensureLibrary();
    setCircuitExPickerTarget({ dayIdx, circIdx });
    setCircuitExPickerVisible(true);
  };

  const pickCircuitExercise = (ex: LibraryExercise) => {
    if (circuitExPickerTarget) {
      addExToCircuit(circuitExPickerTarget.dayIdx, circuitExPickerTarget.circIdx, ex.name);
    }
    setCircuitExPickerVisible(false);
  };

  // ─── Save ─────────────────────────────────────────────────────────────────

  const saveRoutine = async () => {
    if (!user || !newRoutineName.trim() || newDays.length === 0) return;
    const hasContent = newDays.some(
      (d) => d.ejercicios.length > 0 || (d.circuitos ?? []).length > 0,
    );
    if (!hasContent) return;
    setSavingRoutine(true);
    await supabase.from("routines").insert({
      user_id: user.id,
      data: { nombre: newRoutineName.trim(), dias: newDays },
    });
    setSavingRoutine(false);
    setCreateVisible(false);
    onSaved();
  };

  return {
    // library
    library,
    loadingLibrary,
    // modal visibility
    createVisible,
    // routine form state
    newRoutineName,
    setNewRoutineName,
    newDays,
    editingDayIdx,
    setEditingDayIdx,
    savingRoutine,
    // exercise picker
    exPickerVisible,
    setExPickerVisible,
    circuitExPickerVisible,
    setCircuitExPickerVisible,
    // handlers
    openCreateRoutine,
    closeCreateRoutine,
    addDay,
    updateDay,
    removeDay,
    updateExercise,
    removeExercise,
    openExPickerForDay,
    pickExercise,
    pickExercises,
    addCircuit,
    updateCircuit,
    removeCircuit,
    updateCircuitEx,
    removeCircuitEx,
    moveCircuitEx,
    openCircuitExPicker,
    pickCircuitExercise,
    saveRoutine,
  };
}
