"use client";

import { useState } from "react";
import { X, Trash2, Pencil } from "lucide-react";
import { CalendarEvent, Squad, SquadColor } from "@/types";
import { SQUAD_COLOR_MAP } from "@/components/squads/SquadChip";

interface EventDetailModalProps {
  visible: boolean;
  event: CalendarEvent | null;
  squads: Squad[];
  onDelete: (id: string) => void;
  onClose: () => void;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-AR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export default function EventDetailModal({ visible, event, squads, onDelete, onClose }: EventDetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!visible || !event) return null;

  const eventSquads = squads.filter(s => event.squadIds.includes(s.id));
  const isGame = event.type === "partido";

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    onDelete(event.id);
    setConfirmDelete(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 12, width: "100%", maxWidth: 400, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--pg-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 10, background: isGame ? "rgba(239,68,68,0.15)" : "rgba(212,168,83,0.12)", color: isGame ? "var(--pg-red)" : "var(--pg-accent)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {isGame ? "Partido" : "Entrenamiento"}
            </span>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--pg-muted)", padding: 4, borderRadius: 5 }}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--pg-text)", letterSpacing: "-0.3px" }}>{event.title}</div>

          {/* Date/time */}
          <div style={{ fontSize: 11, color: "var(--pg-muted)" }}>
            {formatDateTime(event.startsAt)}
            {event.endsAt && ` — ${formatTime(event.endsAt)}`}
          </div>

          {/* Partido details */}
          {isGame && (event.opponent || event.location) && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {event.opponent && (
                <div style={{ fontSize: 11, color: "var(--pg-muted)" }}>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, textTransform: "uppercase", letterSpacing: "1px" }}>Rival </span>
                  {event.opponent}
                </div>
              )}
              {event.location && (
                <div style={{ fontSize: 11, color: "var(--pg-muted)" }}>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, textTransform: "uppercase", letterSpacing: "1px" }}>Cancha </span>
                  {event.location === "local" ? "Local" : "Visitante"}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div style={{ fontSize: 11, color: "var(--pg-muted)", lineHeight: 1.5, padding: "8px 10px", background: "var(--pg-surface)", borderRadius: 6 }}>
              {event.description}
            </div>
          )}

          {/* Squads */}
          {eventSquads.length > 0 && (
            <div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6 }}>Planteles</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {eventSquads.map(s => {
                  const color = SQUAD_COLOR_MAP[s.color as SquadColor];
                  return (
                    <span key={s.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 10, border: `1px solid ${color}`, fontSize: 10, color, fontWeight: 600 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />
                      {s.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderTop: "1px solid var(--pg-border)" }}>
          <button
            onClick={handleDelete}
            style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", background: confirmDelete ? "rgba(239,68,68,0.15)" : "transparent", border: `1px solid ${confirmDelete ? "var(--pg-red)" : "var(--pg-border)"}`, color: confirmDelete ? "var(--pg-red)" : "var(--pg-muted)", transition: "all 0.15s" }}
          >
            <Trash2 size={11} />
            {confirmDelete ? "Confirmar" : "Eliminar"}
          </button>
          <button onClick={onClose} style={{ padding: "6px 14px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", background: "var(--pg-surface)", border: "1px solid var(--pg-border)", color: "var(--pg-text)" }}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
