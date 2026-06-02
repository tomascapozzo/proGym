import type { SessionExercise } from "@/types/session";

export type RenderGroup =
  | { kind: "exercise"; exIdx: number }
  | { kind: "circuit"; circuitId: string; circuitName: string; exIndices: number[] };

export function buildRenderGroups(exercises: SessionExercise[]): RenderGroup[] {
  const groups: RenderGroup[] = [];
  const seen = new Set<string>();
  exercises.forEach((ex, i) => {
    if (ex.archived) return;
    if (!ex.circuitId) {
      groups.push({ kind: "exercise", exIdx: i });
    } else if (!seen.has(ex.circuitId)) {
      seen.add(ex.circuitId);
      const exIndices = exercises
        .map((e, idx) => (!e.archived && e.circuitId === ex.circuitId ? idx : -1))
        .filter((idx) => idx !== -1);
      groups.push({ kind: "circuit", circuitId: ex.circuitId, circuitName: ex.circuitName ?? "Superset", exIndices });
    }
  });
  return groups;
}
