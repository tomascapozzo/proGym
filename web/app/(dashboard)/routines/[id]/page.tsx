"use client";

import { use, useState } from "react";
import Topbar from "@/components/dashboard/Topbar";

type F = (boolean | null)[];

const ROUTINE = {
  name: "Fuerza — Semana 20",
  type: "weekly",
  days: [
    {
      label: "Día 1 — Tren superior",
      exercises: [
        { n: 1, name: "Press de banca",  sets: 4, reps: "8-10", rest: "90s"  },
        { n: 2, name: "Remo con barra",  sets: 4, reps: "10",   rest: "60s"  },
        { n: 3, name: "Press militar",   sets: 3, reps: "8",    rest: "90s"  },
        { n: 4, name: "Pull-ups",        sets: 3, reps: "Máx",  rest: "90s"  },
        { n: 5, name: "Curl de bíceps",  sets: 3, reps: "12",   rest: "60s"  },
        { n: 6, name: "Tríceps polea",   sets: 3, reps: "12",   rest: "60s"  },
      ],
    },
    {
      label: "Día 2 — Tren inferior",
      exercises: [
        { n: 1, name: "Sentadilla",        sets: 5, reps: "5",   rest: "2min" },
        { n: 2, name: "Peso muerto",       sets: 4, reps: "6",   rest: "2min" },
        { n: 3, name: "Prensa de pierna",  sets: 3, reps: "12",  rest: "90s"  },
        { n: 4, name: "Extensión cuáds",   sets: 3, reps: "15",  rest: "60s"  },
        { n: 5, name: "Curl femoral",      sets: 3, reps: "12",  rest: "60s"  },
        { n: 6, name: "Pantorrillas",      sets: 4, reps: "20",  rest: "45s"  },
      ],
    },
    {
      label: "Día 3 — Potencia",
      exercises: [
        { n: 1, name: "Hang clean",       sets: 5, reps: "3",   rest: "2min" },
        { n: 2, name: "Salto al cajón",   sets: 4, reps: "5",   rest: "90s"  },
        { n: 3, name: "Sprint 20m",       sets: 6, reps: "1",   rest: "2min" },
        { n: 4, name: "Lanzamiento MB",   sets: 3, reps: "8",   rest: "60s"  },
      ],
    },
    {
      label: "Día 4 — Recuperación",
      exercises: [
        { n: 1, name: "Foam rolling",     sets: 1, reps: "10min", rest: "—"   },
        { n: 2, name: "Estiramientos",    sets: 1, reps: "15min", rest: "—"   },
        { n: 3, name: "Movilidad",        sets: 3, reps: "8",     rest: "30s" },
      ],
    },
  ],
};

const ASSIGNED: { init: string; name: string; days: F }[] = [
  { init: "MG", name: "M. García",    days: [true,  true,  true,  false] as F },
  { init: "RL", name: "R. López",     days: [true,  false, true,  null]  as F },
  { init: "NF", name: "N. Ferreyra",  days: [true,  true,  true,  false] as F },
  { init: "PA", name: "P. Acosta",    days: [true,  true,  null,  null]  as F },
  { init: "JM", name: "J. Morales",   days: [false, true,  false, null]  as F },
  { init: "CR", name: "C. Rodríguez", days: [true,  true,  true,  false] as F },
  { init: "LT", name: "L. Torres",    days: [true,  true,  true,  null]  as F },
  { init: "FM", name: "F. Méndez",    days: [true,  false, null,  null]  as F },
];

const TYPE_LABELS: Record<string, string> = { daily: "Diaria", weekly: "Semanal", monthly: "Mensual" };
const TYPE_COLOR: Record<string, string>  = { daily: "var(--pg-blue)", weekly: "var(--pg-accent)", monthly: "var(--pg-purple)" };
const TYPE_BG: Record<string, string>     = { daily: "rgba(14,165,233,0.12)", weekly: "rgba(110,231,183,0.12)", monthly: "rgba(167,139,250,0.12)" };

const EX_COL = "28px 1fr 60px 72px 60px";
const EX_HEADERS = ["#", "Ejercicio", "Series", "Reps", "Descanso"];

type Props = { params: Promise<{ id: string }> };

export default function RoutineDetailPage({ params }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id } = use(params);
  const [activeDay, setActiveDay] = useState(0);

  const day = ROUTINE.days[activeDay];

  function dayCompliance(dayIdx: number) {
    const assigned = ASSIGNED.filter(p => p.days[dayIdx] !== null);
    const done = assigned.filter(p => p.days[dayIdx] === true);
    return { done: done.length, total: assigned.length, pct: assigned.length > 0 ? Math.round((done.length / assigned.length) * 100) : 0 };
  }

  return (
    <>
      <Topbar
        title={ROUTINE.name}
        back={{ href: "/routines", label: "Rutinas" }}
        actions={
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: TYPE_BG[ROUTINE.type], color: TYPE_COLOR[ROUTINE.type] }}>
              {TYPE_LABELS[ROUTINE.type]}
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 8px", borderRadius: 4, background: "rgba(74,222,128,0.12)", color: "var(--pg-green)" }}>
              Activa
            </span>
            <button style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "var(--pg-accent)", border: "none", color: "var(--pg-accent-text)" }}>
              Asignar
            </button>
          </div>
        }
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Day tabs */}
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--pg-border)", padding: "0 20px", background: "var(--pg-card)", flexShrink: 0 }}>
          {ROUTINE.days.map((_, i) => {
            const active = i === activeDay;
            const { pct, total } = dayCompliance(i);
            return (
              <button key={i} onClick={() => setActiveDay(i)} style={{
                padding: "10px 16px",
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--pg-text)" : "var(--pg-muted)",
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${active ? "var(--pg-accent)" : "transparent"}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginBottom: -1,
                transition: "color 0.1s",
              }}>
                Día {i + 1}
                {total > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 10, background: pct >= 80 ? "rgba(74,222,128,0.15)" : "rgba(245,158,11,0.15)", color: pct >= 80 ? "var(--pg-green)" : "var(--pg-amber)" }}>
                    {pct}%
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Split content */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 272px", overflow: "hidden" }}>

          {/* Left: exercise table */}
          <div style={{ overflowY: "auto", padding: "16px 12px 16px 20px" }}>
            <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "9px 14px", borderBottom: "1px solid var(--pg-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>{day.label}</span>
                <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{day.exercises.length} ejercicios</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: EX_COL, padding: "5px 14px", borderBottom: "1px solid var(--pg-border)", background: "rgba(0,0,0,0.2)" }}>
                {EX_HEADERS.map(h => (
                  <span key={h} style={{ fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>{h}</span>
                ))}
              </div>
              {day.exercises.map(ex => (
                <div key={ex.n} className="pg-row" style={{ display: "grid", gridTemplateColumns: EX_COL, padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center", cursor: "default" }}>
                  <span style={{ fontSize: 10, color: "var(--pg-disabled)", fontVariantNumeric: "tabular-nums" }}>{ex.n}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--pg-text)" }}>{ex.name}</span>
                  <span style={{ fontSize: 11, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{ex.sets}</span>
                  <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>{ex.reps}</span>
                  <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>{ex.rest}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: assigned players */}
          <div style={{ borderLeft: "1px solid var(--pg-border)", overflowY: "auto", padding: "16px 20px 16px 12px", display: "flex", flexDirection: "column", gap: 10 }}>

            <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--pg-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>Jugadores asignados</span>
                <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{ASSIGNED.length}</span>
              </div>
              {ASSIGNED.map(p => {
                const status = p.days[activeDay];
                return (
                  <div key={p.name} className="pg-row" style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "default" }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--pg-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "var(--pg-muted)", flexShrink: 0 }}>
                      {p.init}
                    </div>
                    <span style={{ flex: 1, fontSize: 11, fontWeight: 500, color: "var(--pg-text)" }}>{p.name}</span>
                    <div style={{
                      width: 16, height: 16, borderRadius: 4,
                      background: status === null ? "var(--pg-surface)" : status ? "rgba(74,222,128,0.15)" : "rgba(239,68,68,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 700,
                      color: status === null ? "transparent" : status ? "var(--pg-green)" : "var(--pg-red)",
                    }}>
                      {status === true && "✓"}
                      {status === false && "✕"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Compliance summary */}
            <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "11px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)", marginBottom: 9 }}>Cumplimiento Día {activeDay + 1}</div>
              {(() => {
                const { done, total, pct } = dayCompliance(activeDay);
                return (
                  <>
                    <div style={{ height: 4, background: "var(--pg-surface)", borderRadius: 2, overflow: "hidden", marginBottom: 7 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "var(--pg-accent)" : "var(--pg-amber)", borderRadius: 2, transition: "width 0.3s" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{done} de {total} completado</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: pct >= 80 ? "var(--pg-accent)" : "var(--pg-amber)", fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
