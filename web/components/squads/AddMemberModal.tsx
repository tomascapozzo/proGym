"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import { TeamPlayer } from "@/types";

interface AddMemberModalProps {
  visible: boolean;
  allPlayers: TeamPlayer[];
  existingIds: string[];
  onAdd: (playerIds: string[]) => void;
  onClose: () => void;
}

export default function AddMemberModal({ visible, allPlayers, existingIds, onAdd, onClose }: AddMemberModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  if (!visible) return null;

  const available = allPlayers.filter(p =>
    !existingIds.includes(p.id) &&
    p.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleAdd = () => {
    onAdd(selected);
    setSelected([]);
    setSearch("");
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 12, width: "100%", maxWidth: 400, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid var(--pg-border)", flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-text)" }}>Agregar jugadores</span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--pg-muted)", padding: 4, borderRadius: 5 }}>
            <X size={14} />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--pg-border)", flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--pg-muted)" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar jugador..."
              autoFocus
              style={{ width: "100%", background: "var(--pg-surface)", border: "1px solid var(--pg-border)", borderRadius: 7, padding: "7px 10px 7px 28px", fontSize: 12, color: "var(--pg-text)", outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {available.length === 0 && (
            <div style={{ padding: "28px", textAlign: "center", fontSize: 12, color: "var(--pg-muted)" }}>
              {search ? "Sin resultados" : "Todos los jugadores ya están en este plantel"}
            </div>
          )}
          {available.map(p => {
            const isSelected = selected.includes(p.id);
            const init = p.fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <button
                key={p.id}
                onClick={() => toggle(p.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 18px",
                  background: isSelected ? "rgba(212,168,83,0.06)" : "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--pg-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "var(--pg-muted)", flexShrink: 0 }}>{init}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--pg-text)" }}>{p.fullName}</div>
                  <div style={{ fontSize: 10, color: "var(--pg-muted)" }}>{p.position ?? "Sin posición"}{p.jerseyNumber != null ? ` · #${p.jerseyNumber}` : ""}</div>
                </div>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `1.5px solid ${isSelected ? "var(--pg-accent)" : "var(--pg-border)"}`, background: isSelected ? "var(--pg-accent)" : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isSelected && <span style={{ color: "var(--pg-accent-text)", fontSize: 9, fontWeight: 900 }}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderTop: "1px solid var(--pg-border)", flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>
            {selected.length > 0 ? `${selected.length} seleccionado${selected.length > 1 ? "s" : ""}` : "Ninguno seleccionado"}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={{ padding: "7px 12px", borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: "pointer", background: "transparent", border: "1px solid var(--pg-border)", color: "var(--pg-muted)" }}>
              Cancelar
            </button>
            <button onClick={handleAdd} disabled={selected.length === 0} style={{ padding: "7px 14px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: selected.length > 0 ? "pointer" : "not-allowed", background: "var(--pg-accent)", border: "none", color: "var(--pg-accent-text)", opacity: selected.length > 0 ? 1 : 0.5 }}>
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
