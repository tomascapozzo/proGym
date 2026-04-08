// ─── Shared routine types ─────────────────────────────────────────────────────

export type RoutineDayExercise = {
  nombre: string;
  series: number;
  reps: string;
  descanso: string;
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

export type Routine = {
  id: string;
  data: { nombre: string; dias: RoutineDay[] };
  created_at: string;
};

export const DEFAULT_EXERCISE: RoutineDayExercise = {
  nombre: "",
  series: 3,
  reps: "10",
  descanso: "60s",
};
