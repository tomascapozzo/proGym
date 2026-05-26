import { supabase } from "@/lib/supabase";
import type {
  Club,
  ClubGroup,
  ClubInvitation,
  ClubMemberWithProfile,
  ClubMember,
  InvitationPreview,
} from "@/types/club";
import { useCallback, useEffect, useState } from "react";

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useClub(userId: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<ClubMember | null>(null);
  const [club, setClub] = useState<Club | null>(null);
  const [groups, setGroups] = useState<ClubGroup[]>([]);
  const [members, setMembers] = useState<ClubMemberWithProfile[]>([]);
  const [invitations, setInvitations] = useState<ClubInvitation[]>([]);
  const [myGroups, setMyGroups] = useState<ClubGroup[]>([]);

  const isStaff =
    membership?.role === "admin" || membership?.role === "coach";

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // 1. Get membership
      const { data: mem } = await supabase
        .from("club_members")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      setMembership(mem ?? null);

      if (!mem) {
        setClub(null);
        setGroups([]);
        setMembers([]);
        setInvitations([]);
        setMyGroups([]);
        return;
      }

      // 2. Club details
      const { data: clubData } = await supabase
        .from("clubs")
        .select("*")
        .eq("id", mem.club_id)
        .single();
      setClub(clubData ?? null);

      // 3. Groups
      const { data: groupsData } = await supabase
        .from("club_groups")
        .select("*")
        .eq("club_id", mem.club_id)
        .order("created_at");
      setGroups(groupsData ?? []);

      // 4. Staff-only: all members + active invitations
      if (mem.role === "admin" || mem.role === "coach") {
        const { data: membersData } = await supabase
          .from("club_members")
          .select("*, profile:profiles(name, username)")
          .eq("club_id", mem.club_id)
          .order("joined_at");
        setMembers((membersData as ClubMemberWithProfile[]) ?? []);

        const { data: invsData } = await supabase
          .from("club_invitations")
          .select("*")
          .eq("club_id", mem.club_id)
          .eq("status", "active")
          .order("created_at");
        setInvitations(invsData ?? []);
      }

      // 5. Player: groups this user belongs to
      if (mem.role === "player") {
        const { data: myGroupMems } = await supabase
          .from("club_group_members")
          .select("group_id")
          .eq("user_id", userId);
        const myGroupIds = (myGroupMems ?? []).map((r) => r.group_id);
        setMyGroups(
          (groupsData ?? []).filter((g) => myGroupIds.includes(g.id)),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Preview invitation (before joining) ───────────────────────────────────
  const previewInvitation = async (
    code: string,
  ): Promise<InvitationPreview | { error: string }> => {
    const trimmed = code.trim().toUpperCase();

    const { data, error } = await supabase
      .from("club_invitations")
      .select("*, club:clubs(*), target_group:club_groups(name)")
      .eq("code", trimmed)
      .eq("status", "active")
      .maybeSingle();

    if (error || !data) return { error: "invalid_code" };

    // Client-side expiry check
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { error: "expired" };
    }
    if (data.max_uses != null && data.uses_count >= data.max_uses) {
      return { error: "max_uses_reached" };
    }

    return {
      invitation: data as ClubInvitation,
      club: data.club as Club,
      targetGroupName: data.target_group?.name ?? null,
    };
  };

  // ── Redeem invitation ─────────────────────────────────────────────────────
  const redeemInvitation = async (
    code: string,
  ): Promise<{ error?: string }> => {
    const { data, error } = await supabase.rpc("redeem_club_invitation", {
      p_code: code.trim().toUpperCase(),
    });
    if (error) return { error: error.message };
    if (data?.error) return { error: data.error as string };
    await refresh();
    return {};
  };

  // ── Revoke invitation ─────────────────────────────────────────────────────
  const revokeInvitation = async (id: string): Promise<void> => {
    await supabase
      .from("club_invitations")
      .update({ status: "revoked" })
      .eq("id", id);
    setInvitations((prev) => prev.filter((inv) => inv.id !== id));
  };

  return {
    loading,
    membership,
    club,
    groups,
    members,
    invitations,
    myGroups,
    isStaff,
    refresh,
    previewInvitation,
    redeemInvitation,
    revokeInvitation,
  };
}
