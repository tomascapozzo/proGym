"use client";

import { useState } from "react";
import Link from "next/link";
import Topbar from "@/components/dashboard/Topbar";

const ROUTINES = [
  { id: 1, name: "Fuerza — Semana 20",      type: "weekly",  days: 4, exercises: 28, assigned: 18, status: "active", compliance: 76 },
  { id: 2, name: "Velocidad y potencia",     type: "weekly",  days: 3, exercises: 18, assigned: 12, status: "active", compliance: 83 },
  { id: 3, name: "Recuperación activa",      type: "daily",   days: 1, exercises: 8,  assigned: 18, status: "active", compliance: 90 },
  { id: 4, name: "Core y estabilidad",       type: "daily",   days: 1, exercises: 12, assigned: 8,  status: "active", compliance: 70 },
  { id: 5, name: "Pliometría",               type: "weekly",  days: 3, exercises: 22, assigned: 10, status: "draft",  compliance: 0  },
  { id: 6, name: "Pretemporada — Bloque 1",  type: "monthly", days: 5, exercises: 40, assigned: 18, status: "past",   compliance: 88 },
];

const TYPE_LABELS: Record<string, string> = { daily: "Diaria",  weekly: "Semanal",  monthly: "Mensual"    };
const TYPE_COLOR: Record<string, string>  = { daily: "var(--pg-blue)", weekly: "var(--pg-accent)", monthly: "var(--pg-purple)" };
const TYPE_BG: Record<string, string>     = { daily: "rgba(14,165,233,0.12)", weekly: "rgba(110,231,183,0.12)", monthly: "rgba(167,139,250,0.12)" };

const STATUS_LABELS: Record<string, string> = { active: "Activa", past: "Finalizada", draft: "Borrador" };
const STATUS_COLOR: Record<string, string>  = { active: "var(--pg-green)", past: "var(--pg-muted)", draft: "var(--pg-purple)" };
const STATUS_BG: Record<string, string>     = { active: "rgba(74,222,128,0.12)", past: "rgba(136,136,136,0.12)", draft: "rgba(167,139,250,0.12)" };

type StatusFilter = "all" | "active" | "draft" | "past";
const TABS: { key: StatusFilter; label: string }[] = [
  { key: "all",    label: "Todas"       },
  { key: "active", label: "Activa"      },
  { key: "draft",  label: "Borrador"    },
  { key: "past",   label: "Finalizada"  },
];

const COL = "1fr 90px 46px 72px 90px 110px 90px";
const HEADERS = ["Nombre", "Tipo", "Días", "Ejercicios", "Asignados", "Cumplimiento", "Estado"];

function complianceBarColor(pct: number) {
  if (pct >= 80) return "var(--pg-accent)";
  if (pct >= 60) return "var(--pg-amber)";
  return "var(--pg-red)";
}

export default function RoutinesPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const filtered = filter === "all" ? ROUTINES : ROUTINES.filter(r => r.status === filter);
  const activeCount = ROUTINES.filter(r => r.status === "active").length;

  return (
    <>
      <Topbar
        title="Rutinas"
        subtitle={`${activeCount} rutinas activas`}
        actions={
          <button style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "var(--pg-accent)", border: "none", color: "var(--pg-accent-text)" }}>
            + Crear rutina
          </button>
        }
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Filter tabs */}
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--pg-border)", padding: "0 20px", background: "var(--pg-card)", flexShrink: 0 }}>
          {TABS.map(tab => {
            const active = filter === tab.key;
            return (
              <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
                padding: "10px 14px",
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
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: COL, padding: "6px 16px", borderBottom: "1px solid var(--pg-border)", background: "rgba(0,0,0,0.2)" }}>
              {HEADERS.map(h => (
                <span key={h} style={{ fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>{h}</span>
              ))}
            </div>
            {filtered.map(r => (
              <div key={r.id} className="pg-row" style={{ display: "grid", gridTemplateColumns: COL, padding: "9px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center" }}>
                <Link href={`/routines/${r.id}`} style={{ fontSize: 12, fontWeight: 600, color: "var(--pg-text)", textDecoration: "none" }}>
                  {r.name}
                </Link>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: TYPE_BG[r.type], color: TYPE_COLOR[r.type], display: "inline-block", width: "fit-content" }}>
                  {TYPE_LABELS[r.type]}
                </span>
                <span style={{ fontSize: 11, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{r.days}</span>
                <span style={{ fontSize: 11, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{r.exercises}</span>
                <span style={{ fontSize: 11, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{r.assigned}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {r.status !== "draft" ? (
                    <>
                      <div style={{ flex: 1, height: 3, background: "var(--pg-surface)", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${r.compliance}%`, background: complianceBarColor(r.compliance), borderRadius: 2 }} />
                      </div>
                      <span style={{ fontSize: 10, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{r.compliance}%</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 10, color: "var(--pg-disabled)" }}>—</span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: STATUS_BG[r.status], color: STATUS_COLOR[r.status] }}>
                    {STATUS_LABELS[r.status]}
                  </span>
                  <Link href={`/routines/${r.id}`} style={{ fontSize: 9, color: "var(--pg-accent)", textDecoration: "none" }}>Ver →</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
