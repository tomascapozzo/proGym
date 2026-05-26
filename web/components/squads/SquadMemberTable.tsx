"use client";

import { Trash2 } from "lucide-react";
import { TeamPlayer } from "@/types";
import { FormSquares, AcwrBadge, complianceColor } from "@/components/dashboard/PlayerBadges";

const COL = "28px 1fr 80px 54px 110px 58px 36px";
const HEADERS = ["", "Jugador", "Posición", "Forma", "Cumplimiento", "ACWR", ""];

interface SquadMemberTableProps {
  members: TeamPlayer[];
  onRemove: (id: string) => void;
}

export default function SquadMemberTable({ members, onRemove }: SquadMemberTableProps) {
  return (
    <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: COL, padding: "6px 16px", borderBottom: "1px solid var(--pg-border)", background: "rgba(0,0,0,0.2)" }}>
        {HEADERS.map((h, i) => (
          <span key={i} style={{ fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>{h}</span>
        ))}
      </div>

      {members.map(p => (
        <div key={p.id} style={{ display: "grid", gridTemplateColumns: COL, padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)", alignItems: "center" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--pg-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "var(--pg-muted)" }}>
            {p.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--pg-text)" }}>{p.fullName}</div>
            {p.jerseyNumber != null && <div style={{ fontSize: 9, color: "var(--pg-disabled)" }}>#{p.jerseyNumber}</div>}
          </div>
          <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>{p.position ?? "—"}</span>
          <FormSquares form={[true, true, null, true, null]} />
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ flex: 1, height: 3, background: "var(--pg-surface)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${p.weeklyAssigned > 0 ? p.weeklyCompliance / p.weeklyAssigned * 100 : 0}%`, background: complianceColor(p.weeklyAssigned > 0 ? p.weeklyCompliance / p.weeklyAssigned * 100 : 0), borderRadius: 2 }} />
            </div>
            <span style={{ fontSize: 10, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums", minWidth: 26, textAlign: "right" }}>
              {p.weeklyAssigned > 0 ? Math.round(p.weeklyCompliance / p.weeklyAssigned * 100) : 0}%
            </span>
          </div>
          <AcwrBadge acwr={p.acwr} />
          <button
            onClick={() => onRemove(p.id)}
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--pg-muted)", padding: 4, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
            title="Quitar del plantel"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}

      {members.length === 0 && (
        <div style={{ padding: "28px", textAlign: "center", fontSize: 12, color: "var(--pg-muted)" }}>
          No hay jugadores en este plantel todavía
        </div>
      )}
    </div>
  );
}
