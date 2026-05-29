import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export function useSharedRoutines() {
  const { user } = useAuth();

  // Syncs routine_enrollments with the current routine_shares targeting this player:
  //  - Creates enrollments for shares that don't have one yet.
  //  - Backfills source_share_id on enrollments created without it (web dashboard bug).
  //  - Archives (status → "past") any club enrollment whose share no longer exists,
  //    so a replaced routine doesn't stay active alongside the new one.
  const syncSharedRoutines = async (): Promise<void> => {
    if (!user) return;

    const { data: groupRows } = await supabase
      .from("club_group_members")
      .select("group_id")
      .eq("user_id", user.id);
    const groupIds = (groupRows ?? []).map((g: { group_id: string }) => g.group_id);

    const { data: directShares } = await supabase
      .from("routine_shares")
      .select("id, routine_id")
      .eq("target_type", "player")
      .eq("target_user_id", user.id);

    let groupShares: { id: string; routine_id: string }[] = [];
    if (groupIds.length > 0) {
      const { data } = await supabase
        .from("routine_shares")
        .select("id, routine_id")
        .eq("target_type", "group")
        .in("target_group_id", groupIds);
      groupShares = (data ?? []) as { id: string; routine_id: string }[];
    }

    const allShares = [
      ...((directShares ?? []) as { id: string; routine_id: string }[]),
      ...groupShares,
    ];
    const validShareIds = new Set(allShares.map((s) => s.id));

    if (allShares.length > 0) {
      // Upsert without ignoreDuplicates so that on conflict we update source_share_id.
      // Only source_share_id is in the SET clause (status and progress are omitted,
      // so they are untouched on existing rows and use column defaults on new inserts).
      await supabase.from("routine_enrollments").upsert(
        allShares.map((share) => ({
          routine_id: share.routine_id,
          user_id: user.id,
          source_share_id: share.id,
        })),
        { onConflict: "routine_id,user_id" },
      );
    }

    // Archive active club enrollments whose share was deleted or replaced
    const { data: activeClubEnrollments } = await supabase
      .from("routine_enrollments")
      .select("id, source_share_id")
      .eq("user_id", user.id)
      .not("source_share_id", "is", null)
      .eq("status", "active");

    const staleIds = (
      (activeClubEnrollments ?? []) as { id: string; source_share_id: string }[]
    )
      .filter((e) => !validShareIds.has(e.source_share_id))
      .map((e) => e.id);

    if (staleIds.length > 0) {
      await supabase
        .from("routine_enrollments")
        .update({ status: "past" })
        .in("id", staleIds);
    }

    // Reactivate any enrollment whose share still exists but status fell to past/pending_restart
    if (validShareIds.size > 0) {
      await supabase
        .from("routine_enrollments")
        .update({ status: "active" })
        .eq("user_id", user.id)
        .in("source_share_id", [...validShareIds])
        .neq("status", "active");
    }
  };

  return { syncSharedRoutines };
}
