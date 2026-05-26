"use client";

import { useState } from "react";
import Link from "next/link";

export interface RoutineRow {
  id: string;
  name: string;
  type: "daily" | "weekly" | "monthly";
  status: "active" | "past" | "pending_restart";
  daysCount: number;
  exercisesCount: number;
  ownerName: string;
}

const TYPE_LABELS: Record<string, string> = { daily: "Diaria", weekly: "Semanal", monthly: "Mensual" };
const TYPE_COLOR: Record<string, string>  = { daily: "var(--pg-blue)", weekly: "var(--pg-accent)", monthly: "var(--pg-purple)" };
const TYPE_BG: Record<string, string>     = { daily: "rgba(14,165,233,0.12)", weekly: "rgba(212,168,83,0.12)", monthly: "rgba(167,139,250,0.12)" };

const STATUS_LABELS: Record<string, string> = { active: "Activa", past: "Finalizada", pending_restart: "Completada" };
const STATUS_COLOR: Record<string, string>  = { active: "var(--pg-green)", past: "var(--pg-muted)", pending_restart: "var(--pg-blue)" };
const STATUS_BG: Record<string, string>     = { active: "rgba(74,222,128,0.12)", past: "rgba(136,136,136,0.12)", pending_restart: "rgba(14,165,233,0.12)" };

type Filter = "all" | "active" | "past";
const TABS: { key: Filter; label: string }[] = [
  { key: "all",    label: "Todas"      },
  { key: "active", label: "Activas"    },
  { key: "past",   label: "Finalizadas" },
];

const COL = "1fr 90px 46px 72px 1fr 90px";
const HEADERS = ["Nombre", "Tipo", "Días", "Ejercicios", "Jugador", "Estado"];

export default function RoutinesTable({ routines }: { routines: RoutineRow[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all"
    ? routines
    : filter === "active"
    ? routines.filter(r => r.status === "active")
    : routines.filter(r => r.status === "past" || r.status === "pending_restart");

  const activeCount = routines.filter(r => r.status === "active").length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--pg-border)", padding: "0 20px", background: "var(--pg-card)", flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: "var(--pg-muted)", marginRight: 12 }}>{activeCount} activas</span>
        {TABS.map(tab => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: "10px 14px",
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                color: active ? "var(--pg-text)" : "var(--pg-muted)",
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${active ? "var(--pg-accent)" : "transparent"}`,
                cursor: "pointer",
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

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
              <span style={{ fontSize: 11, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{r.daysCount}</span>
              <span style={{ fontSize: 11, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{r.exercisesCount}</span>
              <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>{r.ownerName}</span>
              <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: STATUS_BG[r.status], color: STATUS_COLOR[r.status], display: "inline-block", width: "fit-content" }}>
                {STATUS_LABELS[r.status]}
              </span>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: "28px", textAlign: "center", fontSize: 12, color: "var(--pg-muted)" }}>
              {routines.length === 0 ? "Los jugadores aún no tienen rutinas." : "Sin rutinas en esta categoría."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
