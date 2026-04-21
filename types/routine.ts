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
};

export const DEFAULT_EXERCISE: RoutineDayExercise = {
  nombre: "",
  series: 3,
  reps: ["", "", ""],
  descanso: "60s",
};
