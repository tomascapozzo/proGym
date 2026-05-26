"use client";

import { useRef, useState } from "react";
import type { VideoTag, VideoClip } from "@/types";

function fmt(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

interface Props {
  duration: number;
  currentTime: number;
  tags: VideoTag[];
  clips: VideoClip[];
  onSeek: (t: number) => void;
}

export default function TagTimeline({ duration, currentTime, tags, clips, onSeek }: Props) {
  const barRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{ tag: VideoTag; x: number } | null>(null);

  const pct = (t: number) => (duration > 0 ? Math.min(100, (t / duration) * 100) : 0);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barRef.current || duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(Math.max(0, Math.min(duration, ratio * duration)));
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--pg-muted)", marginBottom: 6, fontWeight: 700 }}>
        Línea de tiempo
      </div>

      <div
        ref={barRef}
        onClick={handleBarClick}
        style={{
          position: "relative",
          height: 36,
          background: "var(--pg-surface)",
          borderRadius: 6,
          cursor: "pointer",
          border: "1px solid var(--pg-border)",
          overflow: "visible",
        }}
      >
        {/* Track */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 4,
            transform: "translateY(-50%)",
            background: "var(--pg-border)",
            borderRadius: 2,
          }}
        />

        {/* Played progress */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            width: `${pct(currentTime)}%`,
            height: 4,
            transform: "translateY(-50%)",
            background: "rgba(212,168,83,0.35)",
            borderRadius: 2,
            pointerEvents: "none",
          }}
        />

        {/* Clip ranges */}
        {clips.map((clip) => (
          <div
            key={clip.id}
            style={{
              position: "absolute",
              top: "50%",
              left: `${pct(clip.startTime)}%`,
              width: `${pct(clip.endTime) - pct(clip.startTime)}%`,
              height: 8,
              transform: "translateY(-50%)",
              background: "rgba(167,139,250,0.3)",
              border: "1px solid rgba(167,139,250,0.5)",
              borderRadius: 2,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Tag markers */}
        {tags.map((tag) => (
          <div
            key={tag.id}
            onMouseEnter={(e) => {
              const rect = barRef.current?.getBoundingClientRect();
              if (!rect) return;
              setTooltip({ tag, x: e.clientX - rect.left });
            }}
            onMouseLeave={() => setTooltip(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSeek(tag.timestamp);
            }}
            style={{
              position: "absolute",
              top: "50%",
              left: `${pct(tag.timestamp)}%`,
              transform: "translate(-50%, -50%)",
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: tag.color,
              border: "2px solid var(--pg-card)",
              cursor: "pointer",
              zIndex: 2,
              flexShrink: 0,
            }}
          />
        ))}

        {/* Playhead */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${pct(currentTime)}%`,
            width: 2,
            background: "var(--pg-accent)",
            borderRadius: 1,
            pointerEvents: "none",
            zIndex: 3,
          }}
        />

        {/* Tooltip */}
        {tooltip && (
          <div
            style={{
              position: "absolute",
              bottom: "calc(100% + 6px)",
              left: tooltip.x,
              transform: "translateX(-50%)",
              background: "var(--pg-card)",
              border: `1px solid ${tooltip.tag.color}55`,
              borderRadius: 6,
              padding: "4px 10px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: tooltip.tag.color,
                marginRight: 6,
                verticalAlign: "middle",
              }}
            />
            <span style={{ fontSize: 11, color: "var(--pg-text)", fontWeight: 600 }}>
              {tooltip.tag.label}
            </span>
            <span style={{ fontSize: 11, color: "var(--pg-muted)", marginLeft: 6 }}>
              {fmt(tooltip.tag.timestamp)}
            </span>
          </div>
        )}
      </div>

      {/* Duration labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        <span style={{ fontSize: 9, color: "var(--pg-disabled)" }}>00:00</span>
        <span style={{ fontSize: 9, color: "var(--pg-disabled)" }}>{fmt(duration)}</span>
      </div>
    </div>
  );
}
