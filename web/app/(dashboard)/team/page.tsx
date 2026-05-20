"use client";

import { useState } from "react";
import Link from "next/link";
import Topbar from "@/components/dashboard/Topbar";
import { FormSquares, AcwrBadge, acwrBg, acwrColor, acwrLabel, complianceColor } from "@/components/dashboard/PlayerBadges";

type F = (boolean | null)[];
type Status = "ok" | "risk" | "caution" | "low";
type Filter = "all" | "risk" | "caution" | "low";

const PLAYERS: {
  id: number; init: string; name: string; pos: string; jersey: number;
  acwr: number; compliance: number; rpe: number; sessions: number; total: number;
  form: F; status: Status;
}[] = [
  { id: 1,  init: "MG", name: "Martín García",    pos: "Pilar",    jersey: 1,  acwr: 1.1, compliance: 100, rpe: 6.8, sessions: 5, total: 5, form: [true,true,true,true,true]    as F, status: "ok"      },
  { id: 2,  init: "RL", name: "Rodrigo López",    pos: "Hooker",   jersey: 2,  acwr: 1.6, compliance: 60,  rpe: 8.9, sessions: 3, total: 5, form: [true,false,true,false,false]  as F, status: "risk"    },
  { id: 3,  init: "NF", name: "Nicolás Ferreyra", pos: "Segunda",  jersey: 4,  acwr: 0.9, compliance: 100, rpe: 7.1, sessions: 5, total: 5, form: [true,true,true,true,true]    as F, status: "ok"      },
  { id: 4,  init: "PA", name: "Pedro Acosta",     pos: "Ala",      jersey: 6,  acwr: 1.4, compliance: 80,  rpe: 8.2, sessions: 4, total: 5, form: [true,true,false,true,true]   as F, status: "caution" },
  { id: 5,  init: "JM", name: "Javier Morales",   pos: "Apertura", jersey: 10, acwr: 0.7, compliance: 40,  rpe: 5.4, sessions: 2, total: 5, form: [false,true,false,false,true] as F, status: "low"     },
  { id: 6,  init: "CR", name: "Carlos Rodríguez", pos: "Centro",   jersey: 12, acwr: 1.2, compliance: 100, rpe: 7.5, sessions: 5, total: 5, form: [true,true,true,true,true]    as F, status: "ok"      },
  { id: 7,  init: "LT", name: "Lucas Torres",     pos: "Ala",      jersey: 11, acwr: 1.1, compliance: 100, rpe: 6.9, sessions: 5, total: 5, form: [true,true,true,true,true]    as F, status: "ok"      },
  { id: 8,  init: "FM", name: "Felipe Méndez",    pos: "Wing",     jersey: 14, acwr: 1.3, compliance: 80,  rpe: 7.8, sessions: 4, total: 5, form: [true,false,true,true,true]   as F, status: "caution" },
  { id: 9,  init: "GT", name: "Gonzalo Torres",   pos: "Medio",    jersey: 9,  acwr: 1.0, compliance: 100, rpe: 7.0, sessions: 5, total: 5, form: [true,true,true,true,true]    as F, status: "ok"      },
  { id: 10, init: "SR", name: "Santiago Ramos",   pos: "Pilar",    jersey: 3,  acwr: 1.5, compliance: 60,  rpe: 8.5, sessions: 3, total: 5, form: [true,false,false,true,false]  as F, status: "caution" },
];

const FILTER_TABS: { key: Filter; label: string; accentColor?: string }[] = [
  { key: "all",     label: "Todos"       },
  { key: "risk",    label: "En riesgo",   accentColor: "var(--pg-red)"   },
  { key: "caution", label: "Precaución",  accentColor: "var(--pg-amber)" },
  { key: "low",     label: "Bajo",        accentColor: "var(--pg-blue)"  },
];

const FILTER_BGS: Record<string, string> = {
  risk:    "rgba(239,68,68,0.15)",
  caution: "rgba(245,158,11,0.15)",
  low:     "rgba(14,165,233,0.15)",
};

const COL = "28px 1fr 80px 54px 110px 58px 46px 68px 76px";
const HEADERS = ["", "Jugador", "Posición", "Forma", "Cumplimiento", "ACWR", "RPE", "Sesiones", "Estado"];

export default function TeamPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all" ? PLAYERS : PLAYERS.filter(p => p.status === filter);
  const counts: Record<Filter, number> = {
    all:     PLAYERS.length,
    risk:    PLAYERS.filter(p => p.status === "risk").length,
    caution: PLAYERS.filter(p => p.status === "caution").length,
    low:     PLAYERS.filter(p => p.status === "low").length,
  };

  return (
    <>
      <Topbar
        title="Equipo"
        subtitle={`${PLAYERS.length} jugadores registrados`}
        actions={
          <button style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "var(--pg-accent)", border: "none", color: "var(--pg-accent-text)" }}>
            + Invitar jugador
          </button>
        }
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Filter tabs */}
        <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--pg-border)", padding: "0 20px", background: "var(--pg-card)", flexShrink: 0 }}>
          {FILTER_TABS.map(tab => {
            const active = filter === tab.key;
            const count = counts[tab.key];
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
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginBottom: -1,
                transition: "color 0.1s",
              }}>
                {tab.label}
                {tab.key !== "all" && count > 0 && (
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 10, background: FILTER_BGS[tab.key], color: tab.accentColor }}>
                    {count}
                  </span>
                )}
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
            {filtered.map(p => (
              <Link key={p.id} href={`/team/${p.id}`} className="pg-row" style={{
                display: "grid",
                gridTemplateColumns: COL,
                padding: "8px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.03)",
                alignItems: "center",
                textDecoration: "none",
              }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--pg-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "var(--pg-muted)" }}>{p.init}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--pg-text)" }}>{p.name}</div>
                  <div style={{ fontSize: 9, color: "var(--pg-disabled)" }}>#{p.jersey}</div>
                </div>
                <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>{p.pos}</span>
                <FormSquares form={p.form} />
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ flex: 1, height: 3, background: "var(--pg-surface)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p.compliance}%`, background: complianceColor(p.compliance), borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 10, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums", minWidth: 26, textAlign: "right" }}>{p.compliance}%</span>
                </div>
                <AcwrBadge acwr={p.acwr} />
                <span style={{ fontSize: 11, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{p.rpe.toFixed(1)}</span>
                <span style={{ fontSize: 11, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{p.sessions}/{p.total}</span>
                <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: acwrBg(p.acwr), color: acwrColor(p.acwr) }}>
                  {acwrLabel(p.acwr)}
                </span>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: "28px", textAlign: "center", fontSize: 12, color: "var(--pg-muted)" }}>
                Sin jugadores en esta categoría
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
