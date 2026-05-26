"use client";

import { useState } from "react";
import type { TagConfig } from "@/types";

const PALETTE = [
  "#6EE7B7", // teal (accent)
  "#4ADE80", // green
  "#0EA5E9", // blue
  "#A78BFA", // purple
  "#F59E0B", // amber
  "#EF4444", // red
  "#F97316", // orange
  "#E879F9", // pink
  "#94A3B8", // slate
];

export const DEFAULT_TAG_CONFIGS: TagConfig[] = [
  { key: 1, label: "Ataque",         color: "#4ADE80", clipBefore: 5, clipAfter: 5 },
  { key: 2, label: "Defensa",        color: "#0EA5E9", clipBefore: 5, clipAfter: 5 },
  { key: 3, label: "Gol / Anotación",color: "#6EE7B7", clipBefore: 8, clipAfter: 5 },
  { key: 4, label: "Falta",          color: "#EF4444", clipBefore: 5, clipAfter: 5 },
  { key: 5, label: "Pelota parada",  color: "#A78BFA", clipBefore: 3, clipAfter: 8 },
  { key: 6, label: "Contragolpe",    color: "#F59E0B", clipBefore: 5, clipAfter: 8 },
  { key: 7, label: "Sustitución",    color: "#F97316", clipBefore: 3, clipAfter: 5 },
  { key: 8, label: "Ocasión",        color: "#E879F9", clipBefore: 5, clipAfter: 5 },
  { key: 9, label: "Personalizado",  color: "#94A3B8", clipBefore: 5, clipAfter: 5 },
  { key: 0, label: "Personalizado 2",color: "#6EE7B7", clipBefore: 5, clipAfter: 5 },
];

interface Props {
  configs: TagConfig[];
  onChange: (configs: TagConfig[]) => void;
}

export default function TagSetupPanel({ configs, onChange }: Props) {
  const [expandedKey, setExpandedKey] = useState<number | null>(null);

  const update = (key: number, patch: Partial<TagConfig>) => {
    onChange(configs.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--pg-muted)" }}>
          Configurar teclas
        </span>
        <button
          onClick={() => onChange(DEFAULT_TAG_CONFIGS)}
          style={{
            fontSize: 10,
            color: "var(--pg-muted)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          Restablecer
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {configs.map((cfg) => {
          const expanded = expandedKey === cfg.key;
          return (
            <div
              key={cfg.key}
              style={{
                borderRadius: 7,
                background: "var(--pg-bg)",
                border: "1px solid var(--pg-border)",
                overflow: "hidden",
              }}
            >
              {/* Main row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                }}
              >
                {/* Key badge */}
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 5,
                    background: cfg.color + "20",
                    border: `1px solid ${cfg.color}55`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    color: cfg.color,
                    flexShrink: 0,
                  }}
                >
                  {cfg.key}
                </span>

                {/* Label input */}
                <input
                  value={cfg.label}
                  onChange={(e) => update(cfg.key, { label: e.target.value })}
                  maxLength={24}
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    fontSize: 12,
                    color: "var(--pg-text)",
                    fontWeight: 500,
                    minWidth: 0,
                  }}
                />

                {/* Expand toggle (shows color + clip duration) */}
                <button
                  onClick={() => setExpandedKey(expanded ? null : cfg.key)}
                  title="Configurar clip y color"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: cfg.color,
                    border: expanded ? "2px solid rgba(255,255,255,0.7)" : "2px solid transparent",
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0,
                  }}
                />
              </div>

              {/* Expanded panel: color swatches + clip duration */}
              {expanded && (
                <div
                  style={{
                    padding: "8px 8px 10px",
                    borderTop: "1px solid var(--pg-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {/* Color swatches */}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => update(cfg.key, { color: c })}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: c,
                          border: cfg.color === c ? "2px solid #fff" : "2px solid transparent",
                          cursor: "pointer",
                          padding: 0,
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>

                  {/* Clip duration */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 10, color: "var(--pg-muted)", flexShrink: 0 }}>Clip</span>
                    <label style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--pg-muted)" }}>
                      −
                      <input
                        type="number"
                        min={0}
                        max={120}
                        step={1}
                        value={cfg.clipBefore}
                        onChange={(e) => update(cfg.key, { clipBefore: Math.max(0, parseInt(e.target.value) || 0) })}
                        style={{
                          width: 40,
                          background: "var(--pg-card)",
                          border: "1px solid var(--pg-border)",
                          borderRadius: 4,
                          padding: "2px 4px",
                          fontSize: 11,
                          color: "var(--pg-text)",
                          outline: "none",
                          textAlign: "center",
                        }}
                      />
                      s
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--pg-muted)" }}>
                      +
                      <input
                        type="number"
                        min={0}
                        max={120}
                        step={1}
                        value={cfg.clipAfter}
                        onChange={(e) => update(cfg.key, { clipAfter: Math.max(0, parseInt(e.target.value) || 0) })}
                        style={{
                          width: 40,
                          background: "var(--pg-card)",
                          border: "1px solid var(--pg-border)",
                          borderRadius: 4,
                          padding: "2px 4px",
                          fontSize: 11,
                          color: "var(--pg-text)",
                          outline: "none",
                          textAlign: "center",
                        }}
                      />
                      s
                    </label>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 10, color: "var(--pg-disabled)", marginTop: 8, lineHeight: 1.5 }}>
        Presiona 0–9 para etiquetar. Espacio pausa/reanuda. Flechas adelantan/retroceden 5s. Clic en el circulo de color para configurar el clip.
      </p>
    </div>
  );
}
