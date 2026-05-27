import { supabase } from "@/lib/supabase";
import type { RoutineType } from "@/types/routine";
import { useCallback, useEffect, useState } from "react";

export interface AvailableShare {
  id: string;
  shared_by: string;
  routine: {
    id: string;
    data: { nombre: string; dias: any[] };
    type: RoutineType;
  };
}

export function useSharedRoutines(userId: string | undefined) {
  const [availableShares, setAvailableShares] = useState<AvailableShare[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [sharesResult, copiesResult] = await Promise.all([
        supabase
          .from("routine_shares")
          .select("id, shared_by, routine:routines!routine_id(id, data, type)"),
        supabase
          .from("routines")
          .select("source_share_id")
          .eq("user_id", userId)
          .not("source_share_id", "is", null),
      ]);

      const copiedShareIds = new Set(
        (copiesResult.data ?? []).map((r) => r.source_share_id as string),
      );

      const available = ((sharesResult.data ?? []) as AvailableShare[]).filter(
        (s) => !copiedShareIds.has(s.id),
      );

      setAvailableShares(available);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const acceptShare = async (
    shareId: string,
    routineData: { nombre: string; dias: any[] },
    routineType: RoutineType,
  ) => {
    const { data, error } = await supabase
      .from("routines")
      .insert({
        user_id: userId,
        data: routineData,
        type: routineType,
        status: "active",
        progress: { completed_days: [] },
        source_share_id: shareId,
      })
      .select()
      .single();

    if (error) throw error;

    // Remove the share from availableShares immediately
    setAvailableShares((prev) => prev.filter((s) => s.id !== shareId));

    return data;
  };

  return { availableShares, loading, refresh, acceptShare };
}
