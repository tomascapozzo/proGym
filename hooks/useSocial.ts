import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Period = "week" | "month" | "year";

export type LeaderboardEntry = {
  user_id: string;
  name: string;
  username: string;
  sessions: number;
};

export type Friend = {
  friendship_id: string;
  user_id: string;
  name: string;
  username: string;
  status: "pending" | "accepted";
  direction: "sent" | "received";
};

export type SocialGroup = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  member_count: number;
};

export type UserSearchResult = {
  id: string;
  name: string;
  username: string;
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSocial() {
  const { user } = useAuth();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [groups, setGroups] = useState<SocialGroup[]>([]);
  const [period, setPeriod] = useState<Period>("week");
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  // ─── Fetch helpers ──────────────────────────────────────────────────────

  const fetchLeaderboard = async (p: Period) => {
    setLeaderboardLoading(true);
    const { data } = await supabase.rpc("get_leaderboard", { p_period: p });
    setLeaderboard((data as LeaderboardEntry[]) ?? []);
    setLeaderboardLoading(false);
  };

  const fetchFriends = async () => {
    const { data } = await supabase
      .from("friendships")
      .select(
        "id, status, requester_id, addressee_id, " +
          "requester:profiles!requester_id(id, name, username), " +
          "addressee:profiles!addressee_id(id, name, username)",
      )
      .or(`requester_id.eq.${user!.id},addressee_id.eq.${user!.id}`);

    if (!data) return;

    const mapped: Friend[] = (data as any[]).map((row) => {
      const isSender = row.requester_id === user!.id;
      const other = isSender ? row.addressee : row.requester;
      return {
        friendship_id: row.id,
        user_id: other.id,
        name: other.name,
        username: other.username,
        status: row.status,
        direction: isSender ? "sent" : "received",
      };
    });

    setFriends(mapped);
  };

  const fetchGroups = async () => {
    const { data: memberRows } = await supabase
      .from("group_members")
      .select("group:groups(id, name, invite_code, created_by)")
      .eq("user_id", user!.id);

    if (!memberRows || memberRows.length === 0) {
      setGroups([]);
      return;
    }

    const groupIds = (memberRows as any[]).map((r) => r.group.id);

    const { data: countRows } = await supabase
      .from("group_members")
      .select("group_id")
      .in("group_id", groupIds);

    const countMap: Record<string, number> = {};
    (countRows ?? []).forEach((r: any) => {
      countMap[r.group_id] = (countMap[r.group_id] ?? 0) + 1;
    });

    setGroups(
      (memberRows as any[]).map((r) => ({
        ...r.group,
        member_count: countMap[r.group.id] ?? 1,
      })),
    );
  };

  // ─── Public: load all ───────────────────────────────────────────────────

  const refresh = async () => {
    setLoading(true);
    await Promise.all([fetchFriends(), fetchGroups(), fetchLeaderboard(period)]);
    setLoading(false);
  };

  // ─── Period ─────────────────────────────────────────────────────────────

  const changePeriod = (p: Period) => {
    setPeriod(p);
    fetchLeaderboard(p);
  };

  // ─── Friend actions ─────────────────────────────────────────────────────

  const searchUser = async (username: string): Promise<UserSearchResult | null> => {
    const { data } = await supabase
      .from("profiles")
      .select("id, name, username")
      .ilike("username", username.trim())
      .neq("id", user!.id)
      .maybeSingle();
    return (data as UserSearchResult | null) ?? null;
  };

  const sendFriendRequest = async (addresseeId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("friendships")
      .insert({ requester_id: user!.id, addressee_id: addresseeId });
    if (!error) await fetchFriends();
    return !error;
  };

  const acceptFriendRequest = async (friendshipId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);
    if (!error) {
      await fetchFriends();
      await fetchLeaderboard(period);
    }
    return !error;
  };

  const removeFriend = async (friendshipId: string): Promise<boolean> => {
    const { error } = await supabase.from("friendships").delete().eq("id", friendshipId);
    if (!error) {
      await fetchFriends();
      await fetchLeaderboard(period);
    }
    return !error;
  };

  // ─── Group actions ───────────────────────────────────────────────────────

  const createGroup = async (name: string): Promise<boolean> => {
    const invite_code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data, error } = await supabase
      .from("groups")
      .insert({ name: name.trim(), invite_code, created_by: user!.id })
      .select()
      .single();
    if (error || !data) return false;
    await supabase.from("group_members").insert({ group_id: data.id, user_id: user!.id });
    await fetchGroups();
    await fetchLeaderboard(period);
    return true;
  };

  // Returns the group name on success, null on failure
  const joinGroup = async (code: string): Promise<string | null> => {
    const { data: group } = await supabase
      .from("groups")
      .select("id, name")
      .eq("invite_code", code.trim().toUpperCase())
      .maybeSingle();
    if (!group) return null;
    const { error } = await supabase
      .from("group_members")
      .insert({ group_id: group.id, user_id: user!.id });
    if (error) return null;
    await fetchGroups();
    await fetchLeaderboard(period);
    return (group as any).name as string;
  };

  const leaveGroup = async (groupId: string): Promise<boolean> => {
    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", user!.id);
    if (!error) {
      await fetchGroups();
      await fetchLeaderboard(period);
    }
    return !error;
  };

  return {
    // State
    leaderboard,
    friends,
    groups,
    period,
    loading,
    leaderboardLoading,
    // Actions
    refresh,
    changePeriod,
    searchUser,
    sendFriendRequest,
    acceptFriendRequest,
    removeFriend,
    createGroup,
    joinGroup,
    leaveGroup,
  };
}
