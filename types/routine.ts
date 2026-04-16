// ─── Shared routine types ─────────────────────────────────────────────────────

export type RoutineDayExercise = {
  nombre: string;
  series: number;
  reps: string;
  descanso: string;
  // Optional target weight: fixed kg (e.g. "80") or % of 1RM (e.g. "75%")
  peso?: string;
};

export type RoutineCircuit = {
  nombre: string;
  rondas: number;
  descanso: string;
  ejercicios: { nombre: string; reps: string }[];
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
  reps: "10",
  descanso: "60s",
};
