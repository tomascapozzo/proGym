"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { InvitationRole } from "@/types/club";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(role: InvitationRole): string {
  const prefix = role === "coach" ? "COACH" : "PLAYER";
  const suffix = Array.from({ length: 6 }, () =>
    CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]
  ).join("");
  return `${prefix}-${suffix}`;
}

export async function generateInvitation(
  clubId: string,
  role: InvitationRole,
  targetGroupId?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada." };

  const { error } = await supabase.from("club_invitations").insert({
    club_id: clubId,
    created_by: user.id,
    code: generateCode(role),
    role,
    target_group_id: role === "player" ? targetGroupId ?? null : null,
    status: "active",
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/invitations");
  return { ok: true };
}

export async function revokeInvitation(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("club_invitations")
    .update({ status: "revoked" })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/invitations");
  return { ok: true };
}
