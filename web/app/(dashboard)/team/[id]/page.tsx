"use client";

import { use, useState } from "react";
import Topbar from "@/components/dashboard/Topbar";
import { AcwrBadge, acwrColor, acwrLabel, complianceColor } from "@/components/dashboard/PlayerBadges";

type F = (boolean | null)[];
type ContentTab = "resumen" | "lesiones" | "wellness";

const PLAYERS = [
  { id: 1,  init: "MG", name: "Martín García",    pos: "Pilar",    jersey: 1,  acwr: 1.1, compliance: 100, rpe: 6.8, sessions: 5, total: 5 },
  { id: 2,  init: "RL", name: "Rodrigo López",    pos: "Hooker",   jersey: 2,  acwr: 1.6, compliance: 60,  rpe: 8.9, sessions: 3, total: 5 },
  { id: 3,  init: "NF", name: "Nicolás Ferreyra", pos: "Segunda",  jersey: 4,  acwr: 0.9, compliance: 100, rpe: 7.1, sessions: 5, total: 5 },
  { id: 4,  init: "PA", name: "Pedro Acosta",     pos: "Ala",      jersey: 6,  acwr: 1.4, compliance: 80,  rpe: 8.2, sessions: 4, total: 5 },
  { id: 5,  init: "JM", name: "Javier Morales",   pos: "Apertura", jersey: 10, acwr: 0.7, compliance: 40,  rpe: 5.4, sessions: 2, total: 5 },
  { id: 6,  init: "CR", name: "Carlos Rodríguez", pos: "Centro",   jersey: 12, acwr: 1.2, compliance: 100, rpe: 7.5, sessions: 5, total: 5 },
  { id: 7,  init: "LT", name: "Lucas Torres",     pos: "Ala",      jersey: 11, acwr: 1.1, compliance: 100, rpe: 6.9, sessions: 5, total: 5 },
  { id: 8,  init: "FM", name: "Felipe Méndez",    pos: "Wing",     jersey: 14, acwr: 1.3, compliance: 80,  rpe: 7.8, sessions: 4, total: 5 },
  { id: 9,  init: "GT", name: "Gonzalo Torres",   pos: "Medio",    jersey: 9,  acwr: 1.0, compliance: 100, rpe: 7.0, sessions: 5, total: 5 },
  { id: 10, init: "SR", name: "Santiago Ramos",   pos: "Pilar",    jersey: 3,  acwr: 1.5, compliance: 60,  rpe: 8.5, sessions: 3, total: 5 },
];

const WEEKLY_LOAD = [
  { week: "Sem 13", load: 2100, acwr: 0.8 },
  { week: "Sem 14", load: 2800, acwr: 0.9 },
  { week: "Sem 15", load: 3200, acwr: 1.0 },
  { week: "Sem 16", load: 3600, acwr: 1.1 },
  { week: "Sem 17", load: 3900, acwr: 1.2 },
  { week: "Sem 18", load: 4200, acwr: 1.4 },
  { week: "Sem 19", load: 3100, acwr: 1.1 },
  { week: "Sem 20", load: 3200, acwr: 1.1 },
];

const RECENT_SESSIONS = [
  { date: "Mar 13 may", name: "Fuerza Sem 20",  exercises: 7, completed: 7, rpe: 7.2, duration: "54 min" },
  { date: "Jue 08 may", name: "Velocidad",       exercises: 6, completed: 6, rpe: 6.8, duration: "48 min" },
  { date: "Mar 06 may", name: "Fuerza Sem 19",  exercises: 7, completed: 6, rpe: 7.5, duration: "52 min" },
  { date: "Jue 01 may", name: "Recuperación",    exercises: 5, completed: 5, rpe: 5.2, duration: "35 min" },
  { date: "Mar 29 abr", name: "Fuerza Sem 18",  exercises: 7, completed: 7, rpe: 8.1, duration: "58 min" },
  { date: "Jue 24 abr", name: "Potencia",        exercises: 4, completed: 4, rpe: 8.4, duration: "44 min" },
];

const INJURIES = [
  { date: "12 mar 2026", type: "Distensión muscular", zone: "Isquiotibial derecho", days: 7,  status: "recovered" },
  { date: "05 ene 2026", type: "Esguince",            zone: "Tobillo izquierdo",    days: 14, status: "recovered" },
  { date: "20 oct 2025", type: "Contractura",         zone: "Lumbar",               days: 3,  status: "recovered" },
  { date: "08 sep 2025", type: "Contusión",           zone: "Rodilla derecha",      days: 2,  status: "recovered" },
];

// sleep/mood: higher = better. fatigue/soreness/stress: lower = better (invert=true)
const WELLNESS = [
  { date: "Mar 13 may", sleep: 4, fatigue: 2, soreness: 3, stress: 2, mood: 4, note: "Me sentí bien, un poco cargado de piernas al final." },
  { date: "Lun 12 may", sleep: 3, fatigue: 3, soreness: 3, stress: 3, mood: 3, note: "" },
  { date: "Dom 11 may", sleep: 5, fatigue: 1, soreness: 2, stress: 2, mood: 5, note: "Descansé bien el fin de semana." },
  { date: "Vie 09 may", sleep: 4, fatigue: 3, soreness: 4, stress: 2, mood: 3, note: "Piernas pesadas post-velocidad." },
  { date: "Jue 08 may", sleep: 3, fatigue: 4, soreness: 4, stress: 3, mood: 3, note: "" },
  { date: "Mar 06 may", sleep: 4, fatigue: 2, soreness: 3, stress: 1, mood: 5, note: "Muy buena sesión hoy." },
  { date: "Lun 05 may", sleep: 5, fatigue: 1, soreness: 1, stress: 1, mood: 5, note: "" },
];

const SESSION_NOTES = [
  { date: "Mar 13 may", session: "Fuerza Sem 20", rpe: 7.2, note: "Sentí fatiga en los últimos sets de press. Calentamiento bien." },
  { date: "Jue 08 may", session: "Velocidad",      rpe: 6.8, note: "Buena sesión, ritmo controlado durante todo el entrenamiento." },
  { date: "Mar 06 may", session: "Fuerza Sem 19",  rpe: 7.5, note: "No pude completar el ejercicio 7, molestia leve en el hombro derecho." },
  { date: "Jue 01 may", session: "Recuperación",   rpe: 5.2, note: "Sesión tranquila, bien." },
  { date: "Mar 29 abr", session: "Fuerza Sem 18",  rpe: 8.1, note: "Máximos en sentadilla, todo OK." },
];

const CONTENT_TABS: { key: ContentTab; label: string }[] = [
  { key: "resumen",  label: "Resumen"         },
  { key: "lesiones", label: "Lesiones"         },
  { key: "wellness", label: "Notas & Bienestar"},
];

const SESSION_COL = "100px 1fr 80px 46px 64px";
const SESSION_HEADERS = ["Fecha", "Rutina", "Ejercicios", "RPE", "Duración"];
const INJURY_COL = "110px 1fr 1fr 80px 90px";
const INJURY_HEADERS = ["Fecha", "Tipo", "Zona", "Días", "Estado"];

// Colored rating dots: 5 small squares filled/empty based on value
function RatingDots({ value, invert = false }: { value: number; invert?: boolean }) {
  function color(idx: number) {
    if (idx >= value) return "var(--pg-surface)";
    const effective = invert ? 6 - value : value;
    if (effective >= 4) return "var(--pg-green)";
    if (effective === 3) return "var(--pg-amber)";
    return "var(--pg-red)";
  }
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: 2, background: color(i) }} />
      ))}
    </div>
  );
}

type Props = { params: Promise<{ id: string }> };

export default function PlayerDetailPage({ params }: Props) {
  const { id } = use(params);
  const player = PLAYERS.find(p => p.id === Number(id)) ?? PLAYERS[0];
  const [tab, setTab] = useState<ContentTab>("resumen");

  const maxLoad = Math.max(...WEEKLY_LOAD.map(w => w.load));

  const statCards = [
    { label: "ACWR",          value: player.acwr.toFixed(1),             color: acwrColor(player.acwr),             sub: acwrLabel(player.acwr) },
    { label: "Cumplimiento",  value: `${player.compliance}%`,            color: complianceColor(player.compliance), sub: "esta semana"          },
    { label: "RPE promedio",  value: player.rpe.toFixed(1),              color: "var(--pg-text)",                   sub: "de escala 10"         },
    { label: "Sesiones",      value: `${player.sessions}/${player.total}`,color: "var(--pg-text)",                  sub: "esta semana"          },
  ];

  return (
    <>
      <Topbar
        title={player.name}
        subtitle={`#${player.jersey} · ${player.pos}`}
        back={{ href: "/team", label: "Equipo" }}
        actions={
          <button style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", background: "var(--pg-surface)", border: "1px solid var(--pg-border)", color: "var(--pg-muted)" }}>
            Ver historial
          </button>
        }
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Stat strip — always visible */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, padding: "14px 20px", borderBottom: "1px solid var(--pg-border)", flexShrink: 0, background: "var(--pg-bg)" }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--pg-muted)", marginBottom: 4, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.8px", color: s.color, fontVariantNumeric: "tabular-nums" }}>{s.value}</div>
              <div style={{ fontSize: 10, color: "var(--pg-disabled)", marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--pg-border)", padding: "0 20px", background: "var(--pg-card)", flexShrink: 0 }}>
          {CONTENT_TABS.map(t => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: "10px 16px",
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--pg-text)" : "var(--pg-muted)",
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${active ? "var(--pg-accent)" : "transparent"}`,
                cursor: "pointer",
                marginBottom: -1,
                transition: "color 0.1s",
              }}>
                {t.label}
                {t.key === "lesiones" && INJURIES.length > 0 && (
                  <span style={{ marginLeft: 5, fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 10, background: "rgba(136,136,136,0.15)", color: "var(--pg-muted)" }}>
                    {INJURIES.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: "auto" }}>

          {/* ── RESUMEN ── */}
          {tab === "resumen" && (
            <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 256px", gap: 10, minHeight: "100%" }}>

              {/* Left: load chart + sessions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

                {/* Load chart */}
                <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>Carga semanal — últimas 8 semanas</span>
                    <div style={{ display: "flex", gap: 12 }}>
                      {[["var(--pg-green)", "Óptimo"], ["var(--pg-amber)", "Precaución"], ["var(--pg-red)", "Riesgo"]].map(([c, l]) => (
                        <span key={l as string} style={{ fontSize: 9, color: "var(--pg-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 7, height: 7, borderRadius: 2, background: c as string, display: "inline-block" }} />{l}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 5, height: 68, alignItems: "flex-end" }}>
                    {WEEKLY_LOAD.map(w => (
                      <div key={w.week} style={{ flex: 1, height: Math.max(3, Math.round((w.load / maxLoad) * 68)), background: acwrColor(w.acwr), borderRadius: "2px 2px 0 0", opacity: 0.75 }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 5, marginTop: 5 }}>
                    {WEEKLY_LOAD.map((w, i) => (
                      <div key={w.week} style={{ flex: 1, textAlign: "center", fontSize: 8, color: i === WEEKLY_LOAD.length - 1 ? "var(--pg-accent)" : "var(--pg-disabled)" }}>{w.week}</div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 5, marginTop: 3 }}>
                    {WEEKLY_LOAD.map(w => (
                      <div key={w.week} style={{ flex: 1, textAlign: "center", fontSize: 8, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: acwrColor(w.acwr) }}>{w.acwr.toFixed(1)}</div>
                    ))}
                  </div>
                </div>

                {/* Sessions */}
                <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--pg-border)" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>Sesiones recientes</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: SESSION_COL, padding: "5px 14px", borderBottom: "1px solid var(--pg-border)", background: "rgba(0,0,0,0.2)" }}>
                    {SESSION_HEADERS.map(h => <span key={h} style={{ fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>{h}</span>)}
                  </div>
                  {RECENT_SESSIONS.map((s, i) => (
                    <div key={i} className="pg-row" style={{ display: "grid", gridTemplateColumns: SESSION_COL, padding: "7px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center", cursor: "default" }}>
                      <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{s.date}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--pg-text)" }}>{s.name}</span>
                      <span style={{ fontSize: 11, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{s.completed}/{s.exercises}</span>
                      <span style={{ fontSize: 11, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{s.rpe.toFixed(1)}</span>
                      <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{s.duration}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--pg-accent-bg)", border: "1px solid rgba(110,231,183,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "var(--pg-accent)", flexShrink: 0 }}>{player.init}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-text)" }}>{player.name}</div>
                      <div style={{ fontSize: 11, color: "var(--pg-muted)", marginTop: 2 }}>{player.pos} · #{player.jersey}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <AcwrBadge acwr={player.acwr} />
                    <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{acwrLabel(player.acwr)}</span>
                  </div>
                </div>

                <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--pg-border)" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>Rutina activa</span>
                  </div>
                  <div style={{ padding: "11px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-text)", marginBottom: 2 }}>Fuerza — Semana 20</div>
                    <div style={{ fontSize: 10, color: "var(--pg-muted)", marginBottom: 10 }}>Semanal · 4 días</div>
                    <div style={{ display: "flex", gap: 3, marginBottom: 7 }}>
                      {[true, true, true, false].map((done, i) => (
                        <div key={i} style={{ flex: 1, height: 4, background: done ? "var(--pg-accent)" : "var(--pg-surface)", borderRadius: 2 }} />
                      ))}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--pg-accent)", fontWeight: 600 }}>3 de 4 días completados</div>
                  </div>
                </div>

                <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--pg-border)" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>Temporada 2026</span>
                  </div>
                  <div style={{ padding: "11px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { label: "Sesiones totales",      value: "38"    },
                      { label: "Cumplimiento promedio", value: "84%"   },
                      { label: "RPE promedio",           value: "7.2"   },
                      { label: "Carga total (UA)",       value: "41.2k" },
                      { label: "Rutinas completadas",    value: "7"     },
                    ].map(s => (
                      <div key={s.label} style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{s.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--pg-text)", fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── LESIONES ── */}
          {tab === "lesiones" && (
            <div style={{ padding: "16px 20px" }}>
              {INJURIES.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", fontSize: 12, color: "var(--pg-muted)" }}>Sin lesiones registradas</div>
              ) : (
                <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ padding: "9px 16px", borderBottom: "1px solid var(--pg-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>Historial de lesiones</span>
                    <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{INJURIES.length} registros</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: INJURY_COL, padding: "5px 16px", borderBottom: "1px solid var(--pg-border)", background: "rgba(0,0,0,0.2)" }}>
                    {INJURY_HEADERS.map(h => <span key={h} style={{ fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>{h}</span>)}
                  </div>
                  {INJURIES.map((inj, i) => (
                    <div key={i} className="pg-row" style={{ display: "grid", gridTemplateColumns: INJURY_COL, padding: "9px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center", cursor: "default" }}>
                      <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{inj.date}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--pg-text)" }}>{inj.type}</span>
                      <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>{inj.zone}</span>
                      <span style={{ fontSize: 11, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{inj.days}d</span>
                      <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 4, display: "inline-block", width: "fit-content",
                        background: inj.status === "active" ? "rgba(239,68,68,0.12)" : "rgba(136,136,136,0.12)",
                        color: inj.status === "active" ? "var(--pg-red)" : "var(--pg-muted)",
                      }}>
                        {inj.status === "active" ? "Activa" : "Recuperado"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── NOTAS & BIENESTAR ── */}
          {tab === "wellness" && (
            <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 10, minHeight: "100%" }}>

              {/* Left: wellness table */}
              <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, overflow: "hidden", alignSelf: "start" }}>
                <div style={{ padding: "9px 14px", borderBottom: "1px solid var(--pg-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>Bienestar diario</span>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[["var(--pg-green)", "Bien"], ["var(--pg-amber)", "Regular"], ["var(--pg-red)", "Mal"]].map(([c, l]) => (
                      <span key={l as string} style={{ fontSize: 9, color: "var(--pg-muted)", display: "flex", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 2, background: c as string, display: "inline-block" }} />{l}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Header */}
                <div style={{ display: "grid", gridTemplateColumns: "90px 80px 80px 80px 80px 80px 1fr", padding: "5px 14px", borderBottom: "1px solid var(--pg-border)", background: "rgba(0,0,0,0.2)" }}>
                  {["Fecha", "Sueño", "Fatiga", "Dolor", "Estres", "Animo", "Nota"].map(h => (
                    <span key={h} style={{ fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>{h}</span>
                  ))}
                </div>
                {WELLNESS.map((w, i) => (
                  <div key={i} className="pg-row" style={{ display: "grid", gridTemplateColumns: "90px 80px 80px 80px 80px 80px 1fr", padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center", cursor: "default" }}>
                    <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{w.date}</span>
                    <RatingDots value={w.sleep}    invert={false} />
                    <RatingDots value={w.fatigue}  invert={true}  />
                    <RatingDots value={w.soreness} invert={true}  />
                    <RatingDots value={w.stress}   invert={true}  />
                    <RatingDots value={w.mood}     invert={false} />
                    <span style={{ fontSize: 10, color: w.note ? "var(--pg-muted)" : "var(--pg-disabled)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {w.note || "—"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Right: session notes */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, alignSelf: "start" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)", padding: "0 2px" }}>Notas de sesion</div>
                {SESSION_NOTES.map((n, i) => (
                  <div key={i} style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "11px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>{n.session}</div>
                        <div style={{ fontSize: 9, color: "var(--pg-muted)", marginTop: 2 }}>{n.date}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: "rgba(110,231,183,0.1)", color: "var(--pg-accent)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                        RPE {n.rpe.toFixed(1)}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--pg-muted)", lineHeight: 1.5 }}>{n.note}</div>
                  </div>
                ))}
                {SESSION_NOTES.length === 0 && (
                  <div style={{ fontSize: 12, color: "var(--pg-disabled)", padding: "20px 0" }}>Sin notas registradas</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
