import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentMembership } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Topbar from "@/components/dashboard/Topbar";
import type { RoutineDay } from "@/types/routine";

const TYPE_LABELS: Record<string, string> = { daily: "Diaria", weekly: "Semanal", monthly: "Mensual" };
const TYPE_COLOR: Record<string, string>  = { daily: "var(--pg-blue)", weekly: "var(--pg-accent)", monthly: "var(--pg-purple)" };
const TYPE_BG: Record<string, string>     = { daily: "rgba(14,165,233,0.12)", weekly: "rgba(212,168,83,0.12)", monthly: "rgba(167,139,250,0.12)" };

const STATUS_LABELS: Record<string, string> = { active: "Activa", past: "Finalizada", pending_restart: "Completada" };

function formatDuration(s: number | null) {
  if (!s) return null;
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${m % 60}m`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });
}

type Props = { params: Promise<{ id: string }> };

export default async function RoutineDetailPage({ params }: Props) {
  const { id } = await params;
  const { user, membership, club } = await getCurrentMembership();
  if (!user) redirect("/auth/login");
  if (!membership || !club) redirect("/club/new");

  const supabase = await createClient();

  const { data: routine } = await supabase
    .from("routines")
    .select("id, user_id, data, type, status, progress, created_at")
    .eq("id", id)
    .single();

  if (!routine) notFound();

  type RoutineData = { nombre: string; dias: RoutineDay[] };
  const data = routine.data as RoutineData;
  const dias = data.dias ?? [];

  // Owner profile
  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("name, username")
    .eq("id", routine.user_id)
    .single();

  // Recent sessions using this routine
  const { data: sessionsRaw } = await supabase
    .from("workout_logs")
    .select("id, created_at, duration_seconds, routine_day_index, routine_day_name, exercises")
    .eq("routine_id", id)
    .order("created_at", { ascending: false })
    .limit(15);

  const sessions = (sessionsRaw ?? []).map(s => ({
    id: s.id,
    date: formatDate(s.created_at),
    dayName: s.routine_day_name ?? `Día ${(s.routine_day_index ?? 0) + 1}`,
    duration: formatDuration(s.duration_seconds),
    exercises: Array.isArray(s.exercises) ? (s.exercises as unknown[]).length : 0,
  }));

  const progress = routine.progress as { completed_days: number[]; skipped_days?: number[] } | null;
  const completedDays = progress?.completed_days ?? [];

  const EX_COL = "28px 1fr 60px 72px 60px";

  return (
    <>
      <Topbar
        title={data.nombre || "Rutina"}
        back={{ href: "/routines", label: "Rutinas" }}
        actions={
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: TYPE_BG[routine.type], color: TYPE_COLOR[routine.type] }}>
              {TYPE_LABELS[routine.type] ?? routine.type}
            </span>
            <span style={{ fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: "rgba(74,222,128,0.12)", color: "var(--pg-green)" }}>
              {STATUS_LABELS[routine.status] ?? routine.status}
            </span>
            {ownerProfile && (
              <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>
                {ownerProfile.name || ownerProfile.username}
              </span>
            )}
          </div>
        }
      />

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 280px", overflow: "hidden" }}>

        {/* Left: days and exercises */}
        <div style={{ overflowY: "auto", padding: "16px 12px 16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {dias.map((day, i) => {
            const isDone = completedDays.includes(i);
            return (
              <div key={i} style={{ background: "var(--pg-card)", border: `1px solid ${isDone ? "rgba(74,222,128,0.2)" : "var(--pg-border)"}`, borderRadius: 8, overflow: "hidden" }}>
                <div style={{ padding: "9px 14px", borderBottom: "1px solid var(--pg-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>{day.dia || `Día ${i + 1}`}</span>
                    {day.enfoque && (
                      <span style={{ fontSize: 10, color: "var(--pg-muted)", marginLeft: 8 }}>{day.enfoque}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>
                      {(day.ejercicios?.length ?? 0) + (day.circuitos?.reduce((s, c) => s + (c.ejercicios?.length ?? 0), 0) ?? 0)} ejercicios
                    </span>
                    {isDone && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 4, background: "rgba(74,222,128,0.15)", color: "var(--pg-green)" }}>
                        Completado
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct exercises */}
                {(day.ejercicios?.length ?? 0) > 0 && (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: EX_COL, padding: "5px 14px", borderBottom: "1px solid var(--pg-border)", background: "rgba(0,0,0,0.2)" }}>
                      {["#", "Ejercicio", "Series", "Reps", "Descanso"].map(h => (
                        <span key={h} style={{ fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>{h}</span>
                      ))}
                    </div>
                    {day.ejercicios!.map((ex, j) => (
                      <div key={j} className="pg-row" style={{ display: "grid", gridTemplateColumns: EX_COL, padding: "7px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "var(--pg-disabled)", fontVariantNumeric: "tabular-nums" }}>{j + 1}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--pg-text)" }}>{ex.nombre}</span>
                        <span style={{ fontSize: 11, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{ex.series}</span>
                        <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>{ex.reps?.join(" / ") || "—"}</span>
                        <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>{ex.descanso}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Circuits */}
                {day.circuitos?.map((circuit, ci) => (
                  <div key={ci}>
                    <div style={{ padding: "7px 14px", background: "rgba(0,0,0,0.15)", borderBottom: "1px solid var(--pg-border)", display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "var(--pg-blue)" }}>{circuit.nombre || `Circuito ${ci + 1}`}</span>
                      <span style={{ fontSize: 9, color: "var(--pg-muted)" }}>{circuit.rondas} rondas · {circuit.descanso} descanso</span>
                    </div>
                    {circuit.ejercicios?.map((ex, ei) => (
                      <div key={ei} className="pg-row" style={{ display: "grid", gridTemplateColumns: EX_COL, padding: "7px 14px 7px 28px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: "var(--pg-disabled)", fontVariantNumeric: "tabular-nums" }}>{ei + 1}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--pg-text)" }}>{ex.nombre}</span>
                        <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>—</span>
                        <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>{ex.reps?.join(" / ") || "—"}</span>
                        <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>—</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}

          {dias.length === 0 && (
            <div style={{ padding: 28, textAlign: "center", fontSize: 12, color: "var(--pg-muted)" }}>Esta rutina no tiene días configurados.</div>
          )}
        </div>

        {/* Right: sessions using this routine */}
        <div style={{ borderLeft: "1px solid var(--pg-border)", overflowY: "auto", padding: "16px 20px 16px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--pg-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>Sesiones registradas</span>
              <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{sessions.length}</span>
            </div>
            {sessions.map(s => (
              <div key={s.id} className="pg-row" style={{ padding: "9px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: "var(--pg-text)" }}>{s.dayName}</span>
                  {s.duration && <span style={{ fontSize: 10, color: "var(--pg-accent)", fontVariantNumeric: "tabular-nums" }}>{s.duration}</span>}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                  <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{s.date}</span>
                  <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{s.exercises} ej.</span>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div style={{ padding: "20px 12px", textAlign: "center", fontSize: 11, color: "var(--pg-disabled)" }}>
                Sin sesiones registradas aún.
              </div>
            )}
          </div>

          {/* Progress summary */}
          {dias.length > 0 && (
            <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "11px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)", marginBottom: 8 }}>Progreso</div>
              <div style={{ display: "flex", gap: 3, marginBottom: 7 }}>
                {dias.map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 4, background: completedDays.includes(i) ? "var(--pg-accent)" : "var(--pg-surface)", borderRadius: 2 }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{completedDays.length} de {dias.length} días</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--pg-accent)", fontVariantNumeric: "tabular-nums" }}>
                  {dias.length > 0 ? Math.round((completedDays.length / dias.length) * 100) : 0}%
                </span>
              </div>
            </div>
          )}

          <Link
            href="/routines"
            style={{ fontSize: 10, color: "var(--pg-muted)", textDecoration: "none", textAlign: "center" }}
          >
            ← Volver a rutinas
          </Link>
        </div>
      </div>
    </>
  );
}
