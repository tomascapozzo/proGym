import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/dashboard/Topbar";
import type { ClubRole } from "@/types/club";
import type { Routine } from "@/types/routine";

const ROLE_LABEL: Record<ClubRole, string> = { admin: "Admin", coach: "Coach", player: "Jugador" };
const ROLE_COLOR: Record<ClubRole, { bg: string; fg: string }> = {
  admin:  { bg: "var(--pg-red-bg)",    fg: "var(--pg-red)"    },
  coach:  { bg: "var(--pg-blue-bg)",   fg: "var(--pg-blue)"   },
  player: { bg: "var(--pg-accent-bg)", fg: "var(--pg-accent)" },
};

const NIVEL_LABELS: Record<string, string> = {
  principiante: "Principiante",
  intermedio:   "Intermedio",
  avanzado:     "Avanzado",
};

const TYPE_LABELS: Record<string, string> = { daily: "Diaria", weekly: "Semanal", monthly: "Mensual" };
const TYPE_COLOR: Record<string, string>  = { daily: "var(--pg-blue)", weekly: "var(--pg-accent)", monthly: "var(--pg-purple)" };
const TYPE_BG: Record<string, string>     = { daily: "rgba(14,165,233,0.12)", weekly: "rgba(212,168,83,0.12)", monthly: "rgba(167,139,250,0.12)" };

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatRelative(iso: string) {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return formatDate(iso);
}

function formatDuration(s: number | null) {
  if (!s) return null;
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

type Props = { params: Promise<{ id: string }> };

export default async function PlayerDetailPage({ params }: Props) {
  const { id } = await params;
  const { user, membership, club } = await getCurrentMembership();
  if (!user) redirect("/auth/login");
  if (!membership || !club) redirect("/club/new");

  const supabase = await createClient();

  // club_member record — verify it belongs to our club
  const { data: member } = await supabase
    .from("club_members")
    .select("id, user_id, role, status, joined_at")
    .eq("id", id)
    .eq("club_id", club.id)
    .single();

  if (!member) notFound();

  type MemberRow = { id: string; user_id: string; role: ClubRole; status: string; joined_at: string };
  const m = member as unknown as MemberRow;

  // Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, username, edad, nivel, objetivo, equipamiento, lesiones, pr_exercises")
    .eq("id", m.user_id)
    .single();

  // Recent sessions (requires coaches_read_member_logs policy)
  const { data: sessionsRaw } = await supabase
    .from("workout_logs")
    .select("id, created_at, duration_seconds, routine_id, routine_day_name, exercises, notes")
    .eq("user_id", m.user_id)
    .order("created_at", { ascending: false })
    .limit(20);

  const sessions = (sessionsRaw ?? []).map(s => ({
    id:          s.id,
    date:        formatDate(s.created_at),
    relDate:     formatRelative(s.created_at),
    dayName:     s.routine_day_name ?? null,
    duration:    formatDuration(s.duration_seconds),
    exercises:   Array.isArray(s.exercises) ? (s.exercises as unknown[]).length : 0,
    notes:       s.notes ?? null,
    hasRoutine:  !!s.routine_id,
  }));

  // Active routines (requires coaches_read_member_routines policy)
  const { data: routinesRaw } = await supabase
    .from("routines")
    .select("id, data, type, status, progress")
    .eq("user_id", m.user_id)
    .in("status", ["active", "pending_restart"])
    .order("created_at", { ascending: false });

  type DBRoutine = { id: string; data: unknown; type: string; status: string; progress: unknown };
  const activeRoutines = (routinesRaw ?? []).map((r: DBRoutine) => {
    const data = r.data as Routine["data"];
    const progress = r.progress as Routine["progress"];
    return {
      id:            r.id,
      name:          data.nombre,
      type:          r.type as Routine["type"],
      status:        r.status as Routine["status"],
      daysCount:     data.dias?.length ?? 0,
      completedDays: progress?.completed_days ?? [],
    };
  });

  const name = profile?.name?.trim() || "Sin nombre";
  const roleColor = ROLE_COLOR[m.role];

  const SESSION_COL = "90px 1fr 60px 70px";

  return (
    <>
      <Topbar
        title={name}
        back={{ href: "/team", label: "Equipo" }}
        actions={
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: roleColor.bg, color: roleColor.fg, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {ROLE_LABEL[m.role]}
            </span>
            <span style={{ fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: m.status === "suspended" ? "var(--pg-amber-bg)" : "rgba(74,222,128,0.12)", color: m.status === "suspended" ? "var(--pg-amber)" : "var(--pg-green)" }}>
              {m.status === "suspended" ? "Suspendido" : "Activo"}
            </span>
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 280px", gap: 12, alignItems: "start" }}>

          {/* Left: sessions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Quick stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {[
                { label: "Sesiones totales", value: sessions.length.toString(), color: "var(--pg-text)" },
                { label: "Última sesión",    value: sessions[0] ? sessions[0].relDate : "—", color: "var(--pg-text)" },
                { label: "Se unió",          value: formatDate(m.joined_at), color: "var(--pg-muted)" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--pg-muted)", marginBottom: 4, fontWeight: 500 }}>{s.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
                </div>
              ))}
            </div>

            {/* Sessions table */}
            <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--pg-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>Sesiones recientes</span>
                <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{sessions.length}</span>
              </div>
              {sessions.length > 0 ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: SESSION_COL, padding: "5px 14px", borderBottom: "1px solid var(--pg-border)", background: "rgba(0,0,0,0.2)" }}>
                    {["Fecha", "Rutina / Sesión libre", "Ejerc.", "Duración"].map(h => (
                      <span key={h} style={{ fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>{h}</span>
                    ))}
                  </div>
                  {sessions.map(s => (
                    <div key={s.id} className="pg-row" style={{ display: "grid", gridTemplateColumns: SESSION_COL, padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{s.date}</span>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--pg-text)" }}>
                          {s.dayName ?? (s.hasRoutine ? "Rutina" : "Sesión libre")}
                        </span>
                        {s.notes && (
                          <div style={{ fontSize: 10, color: "var(--pg-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {s.notes}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{s.exercises}</span>
                      <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{s.duration ?? "—"}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ padding: "28px", textAlign: "center", fontSize: 12, color: "var(--pg-muted)" }}>
                  Sin sesiones registradas aún.
                </div>
              )}
            </div>
          </div>

          {/* Right: profile + active routines */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Profile card */}
            <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--pg-accent-bg)", border: "1px solid rgba(212,168,83,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "var(--pg-accent)", flexShrink: 0 }}>
                  {initials(name)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-text)" }}>{name}</div>
                  {profile?.username && (
                    <div style={{ fontSize: 11, color: "var(--pg-muted)", marginTop: 2 }}>@{profile.username}</div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "Edad",    value: profile?.edad       },
                  { label: "Nivel",   value: profile?.nivel ? (NIVEL_LABELS[profile.nivel] ?? profile.nivel) : null },
                  { label: "Equipo",  value: profile?.equipamiento },
                  { label: "Lesiones",value: profile?.lesiones   },
                ].filter(r => r.value).map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "var(--pg-muted)", flexShrink: 0 }}>{r.label}</span>
                    <span style={{ fontSize: 10, color: "var(--pg-text)", textAlign: "right" }}>{r.value}</span>
                  </div>
                ))}
                {profile?.objetivo && profile.objetivo.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "var(--pg-muted)", flexShrink: 0 }}>Objetivos</span>
                    <span style={{ fontSize: 10, color: "var(--pg-text)", textAlign: "right" }}>{profile.objetivo.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Active routines */}
            {activeRoutines.length > 0 && (
              <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--pg-border)" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>
                    Rutina{activeRoutines.length > 1 ? "s" : ""} activa{activeRoutines.length > 1 ? "s" : ""}
                  </span>
                </div>
                {activeRoutines.map(r => (
                  <Link key={r.id} href={`/routines/${r.id}`} style={{ display: "block", padding: "11px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)", textDecoration: "none" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--pg-text)" }}>{r.name}</div>
                      <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 3, background: TYPE_BG[r.type], color: TYPE_COLOR[r.type], flexShrink: 0, marginLeft: 6 }}>
                        {TYPE_LABELS[r.type]}
                      </span>
                    </div>
                    {r.daysCount > 0 && (
                      <>
                        <div style={{ display: "flex", gap: 3, marginBottom: 5 }}>
                          {Array.from({ length: r.daysCount }, (_, i) => (
                            <div key={i} style={{ flex: 1, height: 3, background: r.completedDays.includes(i) ? "var(--pg-accent)" : "var(--pg-surface)", borderRadius: 2 }} />
                          ))}
                        </div>
                        <div style={{ fontSize: 10, color: "var(--pg-muted)" }}>
                          {r.completedDays.length} de {r.daysCount} días completados
                        </div>
                      </>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {activeRoutines.length === 0 && (
              <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "16px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "var(--pg-disabled)" }}>Sin rutinas activas</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
