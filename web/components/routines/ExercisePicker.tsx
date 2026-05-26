"use client";

import { useEffect, useState } from "react";
import type { LibraryExercise } from "@/types/routine";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectMultiple: (exercises: LibraryExercise[]) => void;
  library: LibraryExercise[];
  loading?: boolean;
  title?: string;
};

export default function ExercisePicker({
  visible,
  onClose,
  onSelectMultiple,
  library,
  loading = false,
  title = "Elegir ejercicios",
}: Props) {
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [equipFilter, setEquipFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filtered, setFiltered] = useState<LibraryExercise[]>(library);

  const muscleGroups = [...new Set(library.map((e) => e.muscle_group))].sort();
  const equipments = [...new Set(library.map((e) => e.equipment))].sort();

  useEffect(() => {
    let result = library;
    if (muscleFilter) result = result.filter((e) => e.muscle_group === muscleFilter);
    if (equipFilter) result = result.filter((e) => e.equipment === equipFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.muscle_group.toLowerCase().includes(q) ||
          e.movement_pattern.toLowerCase().includes(q),
      );
    }
    setFiltered(result);
  }, [search, muscleFilter, equipFilter, library]);

  const reset = () => {
    setSearch("");
    setMuscleFilter("");
    setEquipFilter("");
    setSelected(new Set());
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirm = () => {
    const exercises = library.filter((e) => selected.has(e.id));
    reset();
    onSelectMultiple(exercises);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: "var(--pg-card)",
          borderRadius: 14,
          border: "1px solid var(--pg-border)",
          width: "min(640px, 95vw)",
          height: "min(680px, 90vh)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid var(--pg-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--pg-text)" }}>{title}</span>
          <button
            onClick={handleClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pg-muted)", fontSize: 14 }}
          >
            Cerrar
          </button>
        </div>

        {/* Filters */}
        <div style={{ padding: "12px 20px 10px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o músculo..."
            style={{
              background: "var(--pg-surface)",
              border: "1px solid var(--pg-border)",
              borderRadius: 8,
              padding: "9px 12px",
              color: "var(--pg-text)",
              fontSize: 13,
              outline: "none",
              width: "100%",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={muscleFilter}
              onChange={(e) => setMuscleFilter(e.target.value)}
              style={{
                flex: 1,
                background: "var(--pg-surface)",
                border: "1px solid var(--pg-border)",
                borderRadius: 8,
                padding: "7px 10px",
                color: muscleFilter ? "var(--pg-accent)" : "var(--pg-muted)",
                fontSize: 12,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">Músculo</option>
              {muscleGroups.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select
              value={equipFilter}
              onChange={(e) => setEquipFilter(e.target.value)}
              style={{
                flex: 1,
                background: "var(--pg-surface)",
                border: "1px solid var(--pg-border)",
                borderRadius: 8,
                padding: "7px 10px",
                color: equipFilter ? "var(--pg-accent)" : "var(--pg-muted)",
                fontSize: 12,
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="">Equipamiento</option>
              {equipments.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          {(muscleFilter || equipFilter || search.trim()) && (
            <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", paddingTop: 40, color: "var(--pg-muted)", fontSize: 13 }}>
              Cargando...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", paddingTop: 40, color: "var(--pg-muted)", fontSize: 13 }}>
              No se encontraron ejercicios
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selected.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 20px",
                    background: isSelected ? "var(--pg-accent-bg)" : "transparent",
                    border: "none",
                    borderBottom: "1px solid var(--pg-border)",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 5,
                      flexShrink: 0,
                      background: isSelected ? "var(--pg-accent)" : "var(--pg-surface)",
                      border: `1px solid ${isSelected ? "var(--pg-accent)" : "var(--pg-border)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {isSelected && (
                      <span style={{ color: "var(--pg-accent-text)", fontSize: 11, fontWeight: 700 }}>
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: isSelected ? "var(--pg-accent)" : "var(--pg-text)",
                      }}
                    >
                      {item.name}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--pg-muted)", marginTop: 2 }}>
                      {item.muscle_group} · {item.movement_pattern} · {item.equipment}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--pg-border)", flexShrink: 0 }}>
          <button
            onClick={confirm}
            disabled={selected.size === 0}
            style={{
              width: "100%",
              padding: "11px 0",
              borderRadius: 10,
              border: "none",
              background: selected.size > 0 ? "var(--pg-accent)" : "var(--pg-surface)",
              color: selected.size > 0 ? "var(--pg-accent-text)" : "var(--pg-muted)",
              fontWeight: 700,
              fontSize: 14,
              cursor: selected.size > 0 ? "pointer" : "default",
            }}
          >
            {selected.size > 0
              ? `Agregar ${selected.size} ejercicio${selected.size !== 1 ? "s" : ""}`
              : "Seleccioná ejercicios"}
          </button>
        </div>
      </div>
    </div>
  );
}
