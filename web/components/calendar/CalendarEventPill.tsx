"use client";

import { CalendarEvent, SquadColor } from "@/types";
import { SQUAD_COLOR_MAP } from "@/components/squads/SquadChip";
import { MOCK_SQUADS } from "@/lib/mockData";

interface CalendarEventPillProps {
  event: CalendarEvent;
  compact?: boolean;
  onClick?: () => void;
}

function getPrimaryColor(event: CalendarEvent): string {
  const firstSquadId = event.squadIds[0];
  const squad = MOCK_SQUADS.find(s => s.id === firstSquadId);
  const color: SquadColor = squad?.color ?? "blue";
  return SQUAD_COLOR_MAP[color];
}

export default function CalendarEventPill({ event, compact = true, onClick }: CalendarEventPillProps) {
  const color = getPrimaryColor(event);
  const isGame = event.type === "partido";

  if (compact) {
    return (
      <div
        onClick={e => { e.stopPropagation(); onClick?.(); }}
        title={event.title}
        style={{
          borderLeft: `2px solid ${color}`,
          background: isGame ? `${color}33` : `${color}18`,
          borderRadius: 3,
          padding: "1px 5px",
          fontSize: 9,
          fontWeight: 600,
          color,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          cursor: "pointer",
        }}
      >
        {isGame ? "v " : ""}{event.title}
      </div>
    );
  }

  // Week view — taller pill with time
  const start = new Date(event.startsAt);
  const timeStr = start.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      onClick={e => { e.stopPropagation(); onClick?.(); }}
      style={{
        borderLeft: `2px solid ${color}`,
        background: isGame ? `${color}33` : `${color}18`,
        borderRadius: 4,
        padding: "3px 6px",
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {isGame ? "v " : ""}{event.title}
      </div>
      <div style={{ fontSize: 8, color: "var(--pg-muted)", marginTop: 1 }}>{timeStr}</div>
    </div>
  );
}
