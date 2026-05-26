import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/dashboard/Topbar";
import type { ClubRole } from "@/types/club";

type MemberRow = {
  id: string;
  user_id: string;
  role: ClubRole;
  status: string;
  profile: { name: string; username: string } | null;
};

const ROLE_LABEL: Record<ClubRole, string> = { admin: "Admin", coach: "Coach", player: "Jugador" };
const ROLE_COLOR: Record<ClubRole, { bg: string; fg: string }> = {
  admin:  { bg: "var(--pg-red-bg)",    fg: "var(--pg-red)"    },
  coach:  { bg: "var(--pg-blue-bg)",   fg: "var(--pg-blue)"   },
  player: { bg: "var(--pg-accent-bg)", fg: "var(--pg-accent)" },
};

const COL = "28px 1.5fr 80px 110px 90px 90px";
const HEADERS = ["", "Miembro", "Rol", "Sesiones/sem.", "Última sesión", "Estado"];
const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getMonday(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function initials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function formatRelative(iso: string) {
  const d = new Date(iso);
  const diffDays = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
}

function formatDuration(s: number | null) {
  if (!s) return null;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default async function DashboardPage() {
  const { user, membership, club } = await getCurrentMembership();
  if (!user) redirect("/auth/login");
  if (!membership || !club) redirect("/club/new");

  const supabase = await createClient();

  // ── Members ──────────────────────────────────────────────
  const { data: membersRaw } = await supabase
    .from("club_members")
    .select("id, user_id, role, status, profile:profiles(name, username)")
    .eq("club_id", club.id)
    .order("joined_at");

  const members = (membersRaw ?? []) as unknown as MemberRow[];
  const memberIds = members.map(m => m.user_id);
  const PLACEHOLDER_ID = "00000000-0000-0000-0000-000000000000";
  const queryIds = memberIds.length ? memberIds : [PLACEHOLDER_ID];

  // ── Sessions this week ────────────────────────────────────
  const weekStart = getMonday().toISOString();

  const { data: weekLogs } = await supabase
    .from("workout_logs")
    .select("user_id, created_at, duration_seconds")
    .in("user_id", queryIds)
    .gte("created_at", weekStart);

  const logs = weekLogs ?? [];

  // Per-user counts
  const sessionsThisWeek = new Map<string, number>();
  const sessionsByDay = new Map<number, number>(); // 0=Mon

  for (const log of logs) {
    sessionsThisWeek.set(log.user_id, (sessionsThisWeek.get(log.user_id) ?? 0) + 1);
    const dayIdx = (new Date(log.created_at).getDay() + 6) % 7;
    sessionsByDay.set(dayIdx, (sessionsByDay.get(dayIdx) ?? 0) + 1);
  }

  // Last session per user (all time)
  const { data: lastLogs } = await supabase
    .from("workout_logs")
    .select("user_id, created_at, duration_seconds")
    .in("user_id", queryIds)
    .order("created_at", { ascending: false });

  const lastSession = new Map<string, { at: string; duration: number | null }>();
  for (const log of (lastLogs ?? [])) {
    if (!lastSession.has(log.user_id)) {
      lastSession.set(log.user_id, { at: log.created_at, duration: log.duration_seconds });
    }
  }

  // ── KPIs ─────────────────────────────────────────────────
  const playerCount    = members.filter(m => m.role === "player").length;
  const totalThisWeek  = logs.length;
  const activeThisWeek = new Set(logs.map(l => l.user_id)).size;
  const totalAllTime   = (lastLogs ?? []).length;

  const kpis = [
    { label: "Jugadores",            value: playerCount.toString(),     delta: `${members.length} miembros en total`,            color: "var(--pg-accent)" },
    { label: "Sesiones esta semana", value: totalThisWeek.toString(),   delta: `${activeThisWeek} jugadores activos`,             color: "var(--pg-accent)" },
    { label: "Sesiones totales",     value: totalAllTime.toString(),    delta: "historial completo del club",                    color: "var(--pg-blue)"   },
    { label: "ACWR en riesgo",       value: "—",                       delta: "disponible con más datos",                       color: "var(--pg-red)"    },
  ];

  // ── Weekly activity bars ──────────────────────────────────
  const todayIdx = (new Date().getDay() + 6) % 7;
  const maxActivity = Math.max(1, ...Array.from(sessionsByDay.values()));
  const weeklyActivity = WEEK_DAYS.map((day, i) => ({
    day,
    count: sessionsByDay.get(i) ?? 0,
    today: i === todayIdx,
  }));

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle={club.name}
        actions={
          <Link
            href="/team"
            style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700, background: "var(--pg-accent)", color: "var(--pg-accent-text)", textDecoration: "none" }}
          >
            Ver equipo
          </Link>
        }
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "11px 14px" }}>
              <div style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--pg-muted)", marginBottom: 5, fontWeight: 500 }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-1px", color: k.color, fontVariantNumeric: "tabular-nums" }}>{k.value}</div>
              <div style={{ fontSize: 10, color: "var(--pg-disabled)", marginTop: 2 }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Main split */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 272px", gap: 10, flex: 1, minHeight: 0 }}>

          {/* Member table */}
          <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--pg-border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>Actividad esta semana</span>
              <Link href="/team" style={{ fontSize: 10, color: "var(--pg-accent)", textDecoration: "none" }}>Ver todo →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: COL, padding: "5px 14px", borderBottom: "1px solid var(--pg-border)", background: "rgba(0,0,0,0.2)", flexShrink: 0 }}>
              {HEADERS.map(h => (
                <span key={h} style={{ fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>{h}</span>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {members.map(m => {
                const name = m.profile?.name?.trim() || "Sin nombre";
                const count = sessionsThisWeek.get(m.user_id) ?? 0;
                const last = lastSession.get(m.user_id);
                const roleColor = ROLE_COLOR[m.role];

                return (
                  <Link
                    key={m.id}
                    href={`/team/${m.id}`}
                    className="pg-row"
                    style={{ display: "grid", gridTemplateColumns: COL, padding: "7px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center", textDecoration: "none" }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--pg-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "var(--pg-muted)" }}>
                      {initials(name)}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--pg-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: roleColor.bg, color: roleColor.fg, textTransform: "uppercase", letterSpacing: "0.5px", justifySelf: "start" }}>
                      {ROLE_LABEL[m.role]}
                    </span>
                    <span style={{ fontSize: 11, fontVariantNumeric: "tabular-nums", color: count > 0 ? "var(--pg-text)" : "var(--pg-disabled)" }}>
                      {count > 0 ? `${count} sesión${count !== 1 ? "es" : ""}` : "—"}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>
                      {last ? `${formatRelative(last.at)}${last.duration ? ` · ${formatDuration(last.duration)}` : ""}` : "—"}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: m.status === "suspended" ? "var(--pg-amber-bg)" : "rgba(74,222,128,0.12)", color: m.status === "suspended" ? "var(--pg-amber)" : "var(--pg-green)", justifySelf: "start" }}>
                      {m.status === "suspended" ? "Suspendido" : "Activo"}
                    </span>
                  </Link>
                );
              })}
              {members.length === 0 && (
                <div style={{ padding: 28, textAlign: "center", fontSize: 12, color: "var(--pg-muted)" }}>
                  Sin miembros aún. Invitá jugadores desde{" "}
                  <Link href="/invitations" style={{ color: "var(--pg-accent)", textDecoration: "none" }}>Invitaciones</Link>.
                </div>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Club summary */}
            <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "12px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-text)", marginBottom: 10 }}>{club.name}</div>
              {[
                { label: "Total miembros", value: members.length },
                { label: "Jugadores",      value: playerCount },
                { label: "Staff",          value: members.filter(m => m.role !== "player").length },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                  <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{r.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "var(--pg-text)", fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
                </div>
              ))}
            </div>

            {/* Weekly activity */}
            <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "10px 12px", flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)", marginBottom: 10 }}>Actividad — semana actual</div>
              {weeklyActivity.map(s => (
                <div key={s.day} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 9, color: s.today ? "var(--pg-accent)" : "var(--pg-muted)", width: 22, fontWeight: s.today ? 700 : 400 }}>{s.day}</span>
                  <div style={{ flex: 1, height: 4, background: "var(--pg-surface)", borderRadius: 2, overflow: "hidden" }}>
                    {s.count > 0 && (
                      <div style={{ height: "100%", width: `${(s.count / maxActivity) * 100}%`, background: s.today ? "var(--pg-accent)" : "rgba(212,168,83,0.4)", borderRadius: 2 }} />
                    )}
                  </div>
                  <span style={{ fontSize: 9, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums", width: 14, textAlign: "right" }}>
                    {s.count === 0 ? "—" : s.count}
                  </span>
                </div>
              ))}
              {totalThisWeek === 0 && (
                <div style={{ fontSize: 10, color: "var(--pg-disabled)", textAlign: "center", marginTop: 6 }}>Sin actividad esta semana</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
