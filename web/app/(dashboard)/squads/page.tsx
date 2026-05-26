import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import Topbar from "@/components/dashboard/Topbar";
import CreateGroupForm from "@/components/club/CreateGroupForm";
import { getCurrentMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

interface GroupRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count: { count: number }[];
}

export default async function SquadsPage() {
  const { user, membership, club } = await getCurrentMembership();
  if (!user) redirect("/auth/login");
  if (!membership || !club) redirect("/club/new");

  const isStaff = membership.role === "admin" || membership.role === "coach";
  const supabase = await createClient();

  const { data: groupsRaw } = await supabase
    .from("club_groups")
    .select("id, name, description, created_at, member_count:club_group_members(count)")
    .eq("club_id", club.id)
    .order("created_at");

  const groups = (groupsRaw ?? []) as unknown as GroupRow[];

  return (
    <>
      <Topbar
        title="Planteles"
        subtitle={`${groups.length} ${groups.length === 1 ? "plantel" : "planteles"}`}
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
        {isStaff && <CreateGroupForm />}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
          {groups.map(g => {
            const count = g.member_count?.[0]?.count ?? 0;
            return (
              <Link
                key={g.id}
                href={`/squads/${g.id}`}
                style={{
                  background: "var(--pg-card)",
                  border: "1px solid var(--pg-border)",
                  borderRadius: 10,
                  padding: "1rem",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minHeight: 110,
                  transition: "border-color 0.15s, background 0.15s",
                }}
                className="pg-row"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: "var(--pg-accent-bg)",
                    border: "1px solid rgba(212,168,83,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--pg-accent)",
                  }}>
                    <Users size={14} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--pg-text)" }}>
                    {g.name}
                  </div>
                </div>
                {g.description && (
                  <div style={{ fontSize: 11, color: "var(--pg-muted)", lineHeight: 1.4 }}>
                    {g.description}
                  </div>
                )}
                <div style={{ marginTop: "auto", fontSize: 10, color: "var(--pg-disabled)", letterSpacing: "1px", textTransform: "uppercase", fontWeight: 600 }}>
                  {count} {count === 1 ? "miembro" : "miembros"}
                </div>
              </Link>
            );
          })}

          {groups.length === 0 && (
            <div style={{
              gridColumn: "1 / -1",
              padding: 32,
              textAlign: "center",
              background: "var(--pg-card)",
              border: "1px solid var(--pg-border)",
              borderRadius: 10,
              fontSize: 12,
              color: "var(--pg-muted)",
            }}>
              Aún no hay planteles. {isStaff ? "Creá el primero para organizar a tu equipo." : "Pedile a un coach que cree uno."}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
