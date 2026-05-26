"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Squad, SquadColor } from "@/types";
import { SQUAD_COLOR_MAP } from "./SquadChip";

const COLORS: SquadColor[] = ["blue", "green", "red", "amber", "purple", "pink", "orange", "teal"];

interface CreateSquadModalProps {
  visible: boolean;
  initial?: Squad | null;
  onSave: (data: { name: string; color: SquadColor; description: string | null }) => void;
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

export default function CreateSquadModal({ visible, initial, onSave, onClose }: CreateSquadModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState<SquadColor>("blue");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initial) {
      setName(initial.name);
      setColor(initial.color);
      setDescription(initial.description ?? "");
    } else {
      setName("");
      setColor("blue");
      setDescription("");
    }
  }, [initial, visible]);

  if (!visible) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, description: description.trim() || null });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 12, width: "100%", maxWidth: 420, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--pg-border)" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-text)" }}>
            {initial ? "Editar plantel" : "Nuevo plantel"}
          </span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--pg-muted)", padding: 4, borderRadius: 5 }}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: 14 }}>

          <div>
            <label style={{ fontSize: 10, color: "var(--pg-muted)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Nombre *
            </label>
            <input
              style={inputStyle}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Primera XV"
              autoFocus
            />
          </div>

          <div>
            <label style={{ fontSize: 10, color: "var(--pg-muted)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Color
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8 }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    borderRadius: 6,
                    background: SQUAD_COLOR_MAP[c],
                    border: color === c ? "2px solid var(--pg-text)" : "2px solid transparent",
                    cursor: "pointer",
                    opacity: color === c ? 1 : 0.6,
                    transition: "all 0.1s",
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 10, color: "var(--pg-muted)", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Descripción (opcional)
            </label>
            <textarea
              style={{ ...inputStyle, resize: "none", height: 64, lineHeight: 1.4 }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Categoría, división, notas..."
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 18px", borderTop: "1px solid var(--pg-border)" }}>
          <button onClick={onClose} style={{ padding: "7px 14px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", background: "transparent", border: "1px solid var(--pg-border)", color: "var(--pg-muted)" }}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={!name.trim()} style={{ padding: "7px 14px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: name.trim() ? "pointer" : "not-allowed", background: "var(--pg-accent)", border: "none", color: "var(--pg-accent-text)", opacity: name.trim() ? 1 : 0.5 }}>
            {initial ? "Guardar cambios" : "Crear plantel"}
          </button>
        </div>
      </div>
    </div>
  );
}
