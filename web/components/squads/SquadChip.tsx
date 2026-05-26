"use client";

import { SquadColor, Squad } from "@/types";

export const SQUAD_COLOR_MAP: Record<SquadColor, string> = {
  red:    "var(--pg-red)",
  amber:  "var(--pg-amber)",
  blue:   "var(--pg-blue)",
  green:  "var(--pg-green)",
  purple: "var(--pg-purple, #a78bfa)",
  pink:   "var(--pg-pink, #f472b6)",
  orange: "var(--pg-orange, #fb923c)",
  teal:   "var(--pg-teal, #2dd4bf)",
};

interface SquadChipProps {
  squad: Pick<Squad, "id" | "name" | "color">;
  active?: boolean;
  onClick?: () => void;
  size?: "sm" | "md";
}

export default function SquadChip({ squad, active = false, onClick, size = "sm" }: SquadChipProps) {
  const color = SQUAD_COLOR_MAP[squad.color];
  const pad = size === "md" ? "4px 12px" : "3px 9px";
  const fs = size === "md" ? 11 : 10;

  return (
    <button
      onClick={onClick}
      style={{
        padding: pad,
        borderRadius: 12,
        fontSize: fs,
        fontWeight: active ? 700 : 500,
        border: `1px solid ${color}`,
        background: active ? `${color.startsWith("var") ? color : color}1A` : "transparent",
        color: active ? color : "var(--pg-muted)",
        cursor: onClick ? "pointer" : "default",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        transition: "all 0.1s",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {squad.name}
    </button>
  );
}

/** Dot-only chip without label, for compact displays */
export function SquadDot({ color }: { color: SquadColor }) {
  return (
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: SQUAD_COLOR_MAP[color], flexShrink: 0, display: "inline-block" }} />
  );
}
