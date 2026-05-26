"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { VideoTag, VideoClip } from "@/types";

function fmt(s: number) {
  if (!isFinite(s) || s < 0) return "00:00";
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

function parseMmSs(str: string): number {
  const parts = str.trim().split(":");
  if (parts.length === 2) {
    return (parseInt(parts[0]) || 0) * 60 + (parseFloat(parts[1]) || 0);
  }
  return parseFloat(str) || 0;
}

interface Props {
  tags: VideoTag[];
  duration: number;
  currentTime: number;
  onSave: (clip: Omit<VideoClip, "id">) => void;
  onClose: () => void;
}

export default function ClipModal({ tags, duration, currentTime, onSave, onClose }: Props) {
  const [name, setName] = useState("Clip");
  const [startStr, setStartStr] = useState(fmt(currentTime));
  const [endStr, setEndStr] = useState(fmt(Math.min(duration, currentTime + 30)));

  const startTime = parseMmSs(startStr);
  const endTime = parseMmSs(endStr);
  const clipDuration = Math.max(0, endTime - startTime);
  const valid = name.trim().length > 0 && endTime > startTime && startTime >= 0 && endTime <= duration + 0.1;

  const sorted = [...tags].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--pg-card)",
          border: "1px solid var(--pg-border)",
          borderRadius: 12,
          padding: 24,
          width: 380,
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "var(--pg-text)" }}>Crear clip</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--pg-muted)", display: "flex", padding: 2 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Name */}
        <label style={{ display: "block", marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-muted)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: 5 }}>
            Nombre del clip
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              background: "var(--pg-bg)",
              border: "1px solid var(--pg-border)",
              borderRadius: 7,
              padding: "8px 12px",
              fontSize: 13,
              color: "var(--pg-text)",
              outline: "none",
            }}
          />
        </label>

        {/* Start time */}
        <label style={{ display: "block", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-muted)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: 5 }}>
            Inicio (MM:SS)
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={startStr}
              onChange={(e) => setStartStr(e.target.value)}
              placeholder="00:00"
              style={{
                flex: 1,
                background: "var(--pg-bg)",
                border: "1px solid var(--pg-border)",
                borderRadius: 7,
                padding: "8px 12px",
                fontSize: 13,
                color: "var(--pg-text)",
                outline: "none",
                fontVariantNumeric: "tabular-nums",
              }}
            />
            {sorted.length > 0 && (
              <select
                onChange={(e) => setStartStr(fmt(parseFloat(e.target.value)))}
                defaultValue=""
                style={{
                  background: "var(--pg-bg)",
                  border: "1px solid var(--pg-border)",
                  borderRadius: 7,
                  padding: "6px 8px",
                  fontSize: 12,
                  color: "var(--pg-muted)",
                  cursor: "pointer",
                }}
              >
                <option value="" disabled>Desde etiqueta</option>
                {sorted.map((t) => (
                  <option key={t.id} value={t.timestamp}>
                    {fmt(t.timestamp)} — {t.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </label>

        {/* End time */}
        <label style={{ display: "block", marginBottom: 16 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-muted)", textTransform: "uppercase", letterSpacing: "0.8px", display: "block", marginBottom: 5 }}>
            Fin (MM:SS)
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={endStr}
              onChange={(e) => setEndStr(e.target.value)}
              placeholder="00:30"
              style={{
                flex: 1,
                background: "var(--pg-bg)",
                border: "1px solid var(--pg-border)",
                borderRadius: 7,
                padding: "8px 12px",
                fontSize: 13,
                color: "var(--pg-text)",
                outline: "none",
                fontVariantNumeric: "tabular-nums",
              }}
            />
            {sorted.length > 0 && (
              <select
                onChange={(e) => setEndStr(fmt(parseFloat(e.target.value)))}
                defaultValue=""
                style={{
                  background: "var(--pg-bg)",
                  border: "1px solid var(--pg-border)",
                  borderRadius: 7,
                  padding: "6px 8px",
                  fontSize: 12,
                  color: "var(--pg-muted)",
                  cursor: "pointer",
                }}
              >
                <option value="" disabled>Desde etiqueta</option>
                {sorted.map((t) => (
                  <option key={t.id} value={t.timestamp}>
                    {fmt(t.timestamp)} — {t.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </label>

        {/* Duration info */}
        <div
          style={{
            background: "var(--pg-bg)",
            border: "1px solid var(--pg-border)",
            borderRadius: 7,
            padding: "8px 12px",
            marginBottom: 18,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--pg-muted)" }}>Duración del clip</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: valid ? "var(--pg-accent)" : "var(--pg-red)", fontVariantNumeric: "tabular-nums" }}>
            {fmt(clipDuration)}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "9px",
              borderRadius: 8,
              border: "1px solid var(--pg-border)",
              background: "transparent",
              color: "var(--pg-muted)",
              fontSize: 13,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (!valid) return;
              onSave({ name: name.trim(), startTime, endTime });
              onClose();
            }}
            disabled={!valid}
            style={{
              flex: 2,
              padding: "9px",
              borderRadius: 8,
              border: "none",
              background: valid ? "var(--pg-accent)" : "var(--pg-disabled)",
              color: valid ? "var(--pg-accent-text)" : "rgba(255,255,255,0.3)",
              fontSize: 13,
              cursor: valid ? "pointer" : "not-allowed",
              fontWeight: 700,
            }}
          >
            Guardar clip
          </button>
        </div>
      </div>
    </div>
  );
}
