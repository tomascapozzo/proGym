"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { CalendarEvent, Squad } from "@/types";
import SquadChip from "@/components/squads/SquadChip";

interface CreateEventModalProps {
  visible: boolean;
  initial?: { date?: Date } | null;
  squads: Squad[];
  onSave: (event: Omit<CalendarEvent, "id">) => void;
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--pg-surface)",
  border: "1px solid var(--pg-border)",
  borderRadius: 7,
  padding: "8px 10px",
  fontSize: 12,
  color: "var(--pg-text)",
  outline: "none",
  boxSizing: "border-box",
};

function dateToInputValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function timeToInput(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function CreateEventModal({ visible, initial, squads, onSave, onClose }: CreateEventModalProps) {
  const [type, setType] = useState<"entrenamiento" | "partido">("entrenamiento");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [selectedSquads, setSelectedSquads] = useState<string[]>([]);
  const [opponent, setOpponent] = useState("");
  const [location, setLocation] = useState<"local" | "visitante">("local");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (visible) {
      const d = initial?.date ?? new Date();
      setDate(dateToInputValue(d));
      setStartTime(initial?.date ? timeToInput(d) : "09:00");
      setEndTime(initial?.date ? timeToInput(new Date(d.getTime() + 2 * 3600000)) : "11:00");
      setType("entrenamiento");
      setTitle("");
      setSelectedSquads([]);
      setOpponent("");
      setLocation("local");
      setDescription("");
    }
  }, [visible, initial]);

  if (!visible) return null;

  const toggleSquad = (id: string) =>
    setSelectedSquads(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSave = () => {
    if (!title.trim() || !date) return;
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const [y, mo, d] = date.split("-").map(Number);
    const startsAt = new Date(y, mo - 1, d, sh, sm).toISOString();
    const endsAt = new Date(y, mo - 1, d, eh, em).toISOString();
    onSave({
      type,
      title: title.trim(),
      description: description.trim() || null,
      startsAt,
      endsAt,
      opponent: type === "partido" ? (opponent.trim() || null) : null,
      location: type === "partido" ? location : null,
      squadIds: selectedSquads,
    });
  };

  const typeBtn = (t: "entrenamiento" | "partido", label: string) => (
    <button
      onClick={() => setType(t)}
      style={{
        flex: 1,
        padding: "7px 0",
        borderRadius: 7,
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        border: `1px solid ${type === t ? "var(--pg-accent)" : "var(--pg-border)"}`,
        background: type === t ? "rgba(212,168,83,0.12)" : "transparent",
        color: type === t ? "var(--pg-accent)" : "var(--pg-muted)",
        transition: "all 0.1s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 12, width: "100%", maxWidth: 460, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--pg-border)", flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-text)" }}>Nuevo evento</span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--pg-muted)", padding: 4, borderRadius: 5 }}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Type */}
          <div>
            <label style={{ fontSize: 10, color: "var(--pg-muted)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Tipo</label>
            <div style={{ display: "flex", gap: 8 }}>
              {typeBtn("entrenamiento", "Entrenamiento")}
              {typeBtn("partido", "Partido")}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ fontSize: 10, color: "var(--pg-muted)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Título *</label>
            <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder={type === "partido" ? "Ej: vs Alumni AC" : "Ej: Entrenamiento táctico"} autoFocus />
          </div>

          {/* Date + Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div>
              <label style={{ fontSize: 10, color: "var(--pg-muted)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Fecha *</label>
              <input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "var(--pg-muted)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Inicio</label>
              <input type="time" style={inputStyle} value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: "var(--pg-muted)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Fin</label>
              <input type="time" style={inputStyle} value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>

          {/* Squads */}
          {squads.length > 0 && (
            <div>
              <label style={{ fontSize: 10, color: "var(--pg-muted)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Planteles</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {squads.map(s => (
                  <SquadChip
                    key={s.id}
                    squad={s}
                    active={selectedSquads.includes(s.id)}
                    onClick={() => toggleSquad(s.id)}
                    size="md"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Partido section */}
          {type === "partido" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "12px", background: "var(--pg-surface)", borderRadius: 8, border: "1px solid var(--pg-border)" }}>
              <div>
                <label style={{ fontSize: 10, color: "var(--pg-muted)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Rival</label>
                <input style={inputStyle} value={opponent} onChange={e => setOpponent(e.target.value)} placeholder="Nombre del club rival" />
              </div>
              <div>
                <label style={{ fontSize: 10, color: "var(--pg-muted)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Cancha</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["local", "visitante"] as const).map(loc => (
                    <button
                      key={loc}
                      onClick={() => setLocation(loc)}
                      style={{
                        flex: 1,
                        padding: "6px 0",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        border: `1px solid ${location === loc ? "var(--pg-accent)" : "var(--pg-border)"}`,
                        background: location === loc ? "rgba(212,168,83,0.12)" : "transparent",
                        color: location === loc ? "var(--pg-accent)" : "var(--pg-muted)",
                        transition: "all 0.1s",
                        textTransform: "capitalize",
                      }}
                    >
                      {loc === "local" ? "Local" : "Visitante"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label style={{ fontSize: 10, color: "var(--pg-muted)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>Descripción (opcional)</label>
            <textarea style={{ ...inputStyle, resize: "none", height: 56, lineHeight: 1.4 }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Notas adicionales..." />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 18px", borderTop: "1px solid var(--pg-border)", flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "7px 14px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", background: "transparent", border: "1px solid var(--pg-border)", color: "var(--pg-muted)" }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!title.trim() || !date} style={{ padding: "7px 14px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: title.trim() && date ? "pointer" : "not-allowed", background: "var(--pg-accent)", border: "none", color: "var(--pg-accent-text)", opacity: title.trim() && date ? 1 : 0.5 }}>
            Crear evento
          </button>
        </div>
      </div>
    </div>
  );
}
