"use client";

import { useRef, useState } from "react";
import { Trash2, Play } from "lucide-react";
import type { VideoTag } from "@/types";

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

interface Props {
  tags: VideoTag[];
  onDelete: (id: string) => void;
  onSeek: (t: number) => void;
  onUpdateTag?: (id: string, label: string) => void;
}

export default function TagsList({ tags, onDelete, onSeek, onUpdateTag }: Props) {
  const sorted = [...tags].sort((a, b) => a.timestamp - b.timestamp);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = (tag: VideoTag) => {
    if (!onUpdateTag) return;
    setEditingId(tag.id);
    setEditValue(tag.label);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commitEdit = () => {
    if (editingId && onUpdateTag && editValue.trim()) {
      onUpdateTag(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--pg-muted)", marginBottom: 8, flexShrink: 0 }}>
        Etiquetas ({tags.length})
      </div>

      {sorted.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--pg-disabled)",
            fontSize: 12,
            textAlign: "center",
            lineHeight: 1.6,
            padding: "0 12px",
          }}
        >
          Aún no hay etiquetas.
          <br />
          Presiona 0–9 durante la reproducción.
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 3 }}>
          {sorted.map((tag) => (
            <div
              key={tag.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                borderRadius: 7,
                background: "var(--pg-bg)",
                border: "1px solid var(--pg-border)",
              }}
            >
              {/* Color dot + key */}
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 5,
                  background: tag.color + "20",
                  border: `1px solid ${tag.color}55`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  color: tag.color,
                  flexShrink: 0,
                }}
              >
                {tag.tagKey}
              </div>

              {/* Label — editable on click */}
              {editingId === tag.id ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  maxLength={40}
                  style={{
                    flex: 1,
                    background: "var(--pg-card)",
                    border: "1px solid var(--pg-accent)",
                    borderRadius: 4,
                    padding: "2px 6px",
                    fontSize: 12,
                    color: "var(--pg-text)",
                    outline: "none",
                    minWidth: 0,
                  }}
                />
              ) : (
                <span
                  onClick={() => startEdit(tag)}
                  title={onUpdateTag ? "Clic para editar" : undefined}
                  style={{
                    flex: 1,
                    fontSize: 12,
                    fontWeight: 500,
                    color: "var(--pg-text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    cursor: onUpdateTag ? "text" : "default",
                  }}
                >
                  {tag.label}
                </span>
              )}

              {/* Timestamp */}
              <button
                onClick={() => onSeek(tag.timestamp)}
                title="Ir a este momento"
                style={{
                  fontSize: 11,
                  color: "var(--pg-accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontVariantNumeric: "tabular-nums",
                  flexShrink: 0,
                  padding: "2px 4px",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Play size={9} />
                {fmt(tag.timestamp)}
              </button>

              {/* Delete */}
              <button
                onClick={() => onDelete(tag.id)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--pg-disabled)",
                  display: "flex",
                  alignItems: "center",
                  padding: 2,
                  borderRadius: 4,
                  flexShrink: 0,
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
