// ─── Shared routine types ─────────────────────────────────────────────────────

export type ExerciseEntry = {
  nombre: string;
  reps: string[];
  peso?: string[];
};

export type RoutineDayExercise = ExerciseEntry & {
  series: number;
  descanso: string;
};

export type RoutineCircuit = {
  nombre: string;
  rondas: number;
  descanso: string;
  ejercicios: ExerciseEntry[];
};

export type RoutineDay = {
  dia: string;
  enfoque: string;
  ejercicios: RoutineDayExercise[];
  circuitos?: RoutineCircuit[];
};

export type RoutineType = "daily" | "weekly" | "monthly";
export type RoutineStatus = "active" | "past" | "pending_restart";

export const ROUTINE_TYPE_LABELS: Record<RoutineType, string> = {
  daily: "DIARIA",
  weekly: "SEMANAL",
  monthly: "MENSUAL",
};

export type RoutineProgress = {
  completed_days: number[];
  skipped_days?: number[];
};

export type Routine = {
  id: string;
  type: RoutineType;
  status: RoutineStatus;
  progress: RoutineProgress;
  data: { nombre: string; dias: RoutineDay[] };
  created_at: string;
  source_share_id?: string | null;
};

export function getNextDay(
  routine: Routine,
): { day: RoutineDay; index: number; isSkippedFallback: boolean } | null {
  const completed = routine.progress?.completed_days ?? [];
  const skipped = routine.progress?.skipped_days ?? [];
  for (let i = 0; i < routine.data.dias.length; i++) {
    if (!completed.includes(i) && !skipped.includes(i))
      return { day: routine.data.dias[i], index: i, isSkippedFallback: false };
  }
  for (let i = 0; i < routine.data.dias.length; i++) {
    if (!completed.includes(i))
      return { day: routine.data.dias[i], index: i, isSkippedFallback: true };
  }
  return null;
}

export const DEFAULT_EXERCISE: RoutineDayExercise = {
  nombre: "",
  series: 3,
  reps: ["", "", ""],
  descanso: "60s",
};
