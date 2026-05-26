import Link from "next/link";
import { redirect } from "next/navigation";
import Topbar from "@/components/dashboard/Topbar";
import { getCurrentMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ClubRole } from "@/types/club";

const ROLE_LABEL: Record<ClubRole, string> = {
  admin: "Admin",
  coach: "Coach",
  player: "Jugador",
};

const ROLE_COLOR: Record<ClubRole, { bg: string; fg: string }> = {
  admin:  { bg: "var(--pg-red-bg)",    fg: "var(--pg-red)" },
  coach:  { bg: "var(--pg-blue-bg)",   fg: "var(--pg-blue)" },
  player: { bg: "var(--pg-accent-bg)", fg: "var(--pg-accent)" },
};

interface MemberRow {
  id: string;
  user_id: string;
  role: ClubRole;
  status: "active" | "suspended";
  joined_at: string;
  profile: { id: string; name: string; username: string } | null;
}

interface GroupMembershipRow {
  user_id: string;
  group: { id: string; name: string } | null;
}

const COL = "28px 1.5fr 0.9fr 70px 70px 1fr 100px";
const HEADERS = ["", "Miembro", "Usuario", "Rol", "Estado", "Planteles", "Se unió"];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

function initials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default async function TeamPage() {
  const { user, membership, club } = await getCurrentMembership();
  if (!user) redirect("/auth/login");
  if (!membership || !club) redirect("/club/new");

  const supabase = await createClient();

  const { data: membersRaw } = await supabase
    .from("club_members")
    .select("*, profile:profiles(id, name, username)")
    .eq("club_id", club.id)
    .order("joined_at");

  const members = (membersRaw ?? []) as unknown as MemberRow[];

  const { data: groupsRaw } = await supabase
    .from("club_groups")
    .select("id, name")
    .eq("club_id", club.id);

  const groupIds = (groupsRaw ?? []).map(g => g.id);

  let groupMemberships: GroupMembershipRow[] = [];
  if (groupIds.length > 0) {
    const { data: gmRaw } = await supabase
      .from("club_group_members")
      .select("user_id, group:club_groups(id, name)")
      .in("group_id", groupIds);
    groupMemberships = (gmRaw ?? []) as unknown as GroupMembershipRow[];
  }

  const groupsByUser = new Map<string, { id: string; name: string }[]>();
  for (const gm of groupMemberships) {
    if (!gm.group) continue;
    const list = groupsByUser.get(gm.user_id) ?? [];
    list.push(gm.group);
    groupsByUser.set(gm.user_id, list);
  }

  const isStaff = membership.role === "admin" || membership.role === "coach";

  return (
    <>
      <Topbar
        title="Equipo"
        subtitle={`${members.length} ${members.length === 1 ? "miembro" : "miembros"}`}
        actions={
          isStaff ? (
            <Link
              href="/invitations"
              style={{
                padding: "5px 12px",
                borderRadius: 7,
                fontSize: 11,
                fontWeight: 700,
                background: "var(--pg-accent)",
                color: "var(--pg-accent-text)",
                textDecoration: "none",
              }}
            >
              + Invitar miembro
            </Link>
          ) : null
        }
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: COL, padding: "8px 16px", borderBottom: "1px solid var(--pg-border)", background: "rgba(0,0,0,0.2)", gap: 10 }}>
            {HEADERS.map(h => (
              <span key={h} style={{ fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>{h}</span>
            ))}
          </div>

          {members.map(m => {
            const name = m.profile?.name?.trim() || "Sin nombre";
            const username = m.profile?.username || "—";
            const userGroups = groupsByUser.get(m.user_id) ?? [];
            const roleColor = ROLE_COLOR[m.role];
            const isSuspended = m.status === "suspended";

            return (
              <Link
                key={m.id}
                href={`/team/${m.id}`}
                className="pg-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: COL,
                  padding: "10px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  alignItems: "center",
                  gap: 10,
                  textDecoration: "none",
                }}
              >
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--pg-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "var(--pg-muted)" }}>
                  {initials(name)}
                </div>

                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--pg-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {name}
                </div>

                <div style={{ fontSize: 11, color: "var(--pg-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {username !== "—" ? `@${username}` : "—"}
                </div>

                <span style={{
                  justifySelf: "start",
                  fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                  background: roleColor.bg, color: roleColor.fg,
                  textTransform: "uppercase", letterSpacing: "0.5px",
                }}>
                  {ROLE_LABEL[m.role]}
                </span>

                <span style={{
                  justifySelf: "start",
                  fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
                  background: isSuspended ? "var(--pg-amber-bg)" : "var(--pg-green-bg)",
                  color: isSuspended ? "var(--pg-amber)" : "var(--pg-green)",
                  textTransform: "uppercase", letterSpacing: "0.5px",
                }}>
                  {isSuspended ? "Suspend." : "Activo"}
                </span>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {userGroups.length === 0 ? (
                    <span style={{ fontSize: 10, color: "var(--pg-disabled)" }}>—</span>
                  ) : (
                    userGroups.map(g => (
                      <Link
                        key={g.id}
                        href={`/squads/${g.id}`}
                        style={{
                          fontSize: 10, padding: "1px 6px", borderRadius: 4,
                          background: "var(--pg-surface)", color: "var(--pg-muted)",
                          textDecoration: "none",
                        }}
                      >
                        {g.name}
                      </Link>
                    ))
                  )}
                </div>

                <span style={{ fontSize: 10, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>
                  {formatDate(m.joined_at)}
                </span>
              </Link>
            );
          })}

          {members.length === 0 && (
            <div style={{ padding: 28, textAlign: "center", fontSize: 12, color: "var(--pg-muted)" }}>
              Aún no hay miembros en este club.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
