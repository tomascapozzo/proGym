import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import type { Club, ClubMember } from "@/types/club";

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentMembership(): Promise<{
  user: User | null;
  membership: ClubMember | null;
  club: Club | null;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, membership: null, club: null };

  const { data: membership } = await supabase
    .from("club_members")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) return { user, membership: null, club: null };

  const { data: club } = await supabase
    .from("clubs")
    .select("*")
    .eq("id", membership.club_id)
    .single();

  return {
    user,
    membership: membership as ClubMember,
    club: (club ?? null) as Club | null,
  };
}
