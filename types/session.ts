export type SetEntry = { reps: string; weight: string; rpe: string; done: boolean; plannedReps?: string; plannedWeight?: string };

export type SessionExercise = {
  exercise_id?: string;
  exercise_name: string;
  target?: string;
  restSeconds?: number;
  sets: SetEntry[];
  trackingMode?: "simple" | "detailed";
  circuitId?: string;
  circuitName?: string;
  archived?: boolean;
};

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
