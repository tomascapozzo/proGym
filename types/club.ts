// ─── Club types ───────────────────────────────────────────────────────────────

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
  profile: {
    name: string;
    username: string;
  };
}

export interface ClubGroup {
  id: string;
  club_id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
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

// Returned by previewInvitation before the user confirms joining
export interface InvitationPreview {
  invitation: ClubInvitation;
  club: Club;
  targetGroupName: string | null;
}
