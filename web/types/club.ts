export type ClubRole = "admin" | "coach" | "player";
export type MemberStatus = "active" | "suspended";
export type InvitationStatus = "active" | "expired" | "revoked";
export type InvitationRole = "coach" | "player";

export interface Club {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_by: string;
  created_at: string;
}

export interface ClubMember {
  id: string;
  club_id: string;
  user_id: string;
  role: ClubRole;
  status: MemberStatus;
  joined_at: string;
}

export interface ClubMemberWithProfile extends ClubMember {
  profile: { id: string; name: string; username: string };
}

export interface ClubGroup {
  id: string;
  club_id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  member_count?: number;
}

export interface ClubInvitation {
  id: string;
  club_id: string;
  created_by: string;
  code: string;
  role: InvitationRole;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  target_group_id: string | null;
  status: InvitationStatus;
  created_at: string;
}

export interface ClubInvitationWithGroup extends ClubInvitation {
  target_group: { id: string; name: string } | null;
}

export interface RedeemInvitationResult {
  success?: boolean;
  error?: "invalid_code" | "expired" | "max_uses_reached" | "already_member";
  club_id?: string;
  club_name?: string;
  role?: ClubRole;
}
