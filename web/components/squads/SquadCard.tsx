"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { Squad } from "@/types";
import { SQUAD_COLOR_MAP } from "./SquadChip";

interface SquadCardProps {
  squad: Squad;
  onEdit?: (squad: Squad) => void;
}

export default function SquadCard({ squad, onEdit }: SquadCardProps) {
  const color = SQUAD_COLOR_MAP[squad.color];

  return (
    <div style={{
      background: "var(--pg-card)",
      border: "1px solid var(--pg-border)",
      borderRadius: 10,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Color stripe */}
      <div style={{ height: 3, background: color, flexShrink: 0 }} />

      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-text)" }}>{squad.name}</div>
            <div style={{ fontSize: 10, color: "var(--pg-muted)", marginTop: 2 }}>
              {squad.memberCount} {squad.memberCount === 1 ? "jugador" : "jugadores"}
            </div>
          </div>
          {onEdit && (
            <button
              onClick={() => onEdit(squad)}
              style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: "var(--pg-muted)", borderRadius: 5, flexShrink: 0 }}
            >
              <Pencil size={12} />
            </button>
          )}
        </div>

        {squad.description && (
          <div style={{ fontSize: 10, color: "var(--pg-muted)", lineHeight: 1.4 }}>{squad.description}</div>
        )}

        <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px solid var(--pg-border)" }}>
          <Link href={`/squads/${squad.id}`} style={{ fontSize: 11, color, textDecoration: "none", fontWeight: 600 }}>
            Ver plantel →
          </Link>
        </div>
      </div>
    </div>
  );
}
