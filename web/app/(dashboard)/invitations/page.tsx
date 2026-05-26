import { redirect } from "next/navigation";
import Topbar from "@/components/dashboard/Topbar";
import InvitationCard from "@/components/club/InvitationCard";
import GenerateCodeForm from "@/components/club/GenerateCodeForm";
import { getCurrentMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ClubInvitationWithGroup } from "@/types/club";

export default async function InvitationsPage() {
  const { user, membership, club } = await getCurrentMembership();
  if (!user) redirect("/auth/login");
  if (!membership || !club) redirect("/club/new");

  const isStaff = membership.role === "admin" || membership.role === "coach";
  const supabase = await createClient();

  const { data: invitationsRaw } = await supabase
    .from("club_invitations")
    .select("*, target_group:club_groups(id, name)")
    .eq("club_id", club.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  const { data: groupsRaw } = await supabase
    .from("club_groups")
    .select("id, name")
    .eq("club_id", club.id)
    .order("name");

  const invitations = (invitationsRaw ?? []) as unknown as ClubInvitationWithGroup[];
  const groups = (groupsRaw ?? []) as { id: string; name: string }[];

  const coachCodes = invitations.filter(i => i.role === "coach");
  const playerCodes = invitations.filter(i => i.role === "player");

  return (
    <>
      <Topbar
        title="Invitaciones"
        subtitle={`${invitations.length} ${invitations.length === 1 ? "código activo" : "códigos activos"}`}
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 28 }}>

        {!isStaff && (
          <div style={{
            background: "var(--pg-card)",
            border: "1px solid var(--pg-border)",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 12,
            color: "var(--pg-muted)",
          }}>
            Solo los administradores y entrenadores pueden generar o revocar códigos.
          </div>
        )}

        {/* Coaches section */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--pg-text)", margin: 0 }}>Entrenadores</h2>
              <div style={{ fontSize: 11, color: "var(--pg-muted)", marginTop: 2 }}>
                Los códigos de coach otorgan permisos de staff al canjearse.
              </div>
            </div>
            {isStaff && <GenerateCodeForm clubId={club.id} role="coach" />}
          </div>

          {coachCodes.length === 0 ? (
            <EmptyState text="Sin códigos de coach activos." />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {coachCodes.map(inv => (
                <InvitationCard key={inv.id} invitation={inv} canRevoke={isStaff} />
              ))}
            </div>
          )}
        </section>

        {/* Players section */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--pg-text)", margin: 0 }}>Jugadores</h2>
              <div style={{ fontSize: 11, color: "var(--pg-muted)", marginTop: 2 }}>
                Opcionalmente asociá el código a un plantel para que se agreguen automáticamente.
              </div>
            </div>
            {isStaff && <GenerateCodeForm clubId={club.id} role="player" groups={groups} />}
          </div>

          {playerCodes.length === 0 ? (
            <EmptyState text="Sin códigos de jugador activos." />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {playerCodes.map(inv => (
                <InvitationCard key={inv.id} invitation={inv} canRevoke={isStaff} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{
      background: "var(--pg-card)",
      border: "1px dashed var(--pg-border)",
      borderRadius: 10,
      padding: "20px",
      textAlign: "center",
      fontSize: 12,
      color: "var(--pg-muted)",
    }}>
      {text}
    </div>
  );
}
