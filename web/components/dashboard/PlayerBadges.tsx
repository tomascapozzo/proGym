// Shared FM-style player status components — usable in server and client components

export function acwrColor(acwr: number): string {
  if (acwr > 1.5) return "var(--pg-red)";
  if (acwr > 1.2) return "var(--pg-amber)";
  if (acwr < 0.8) return "var(--pg-blue)";
  return "var(--pg-green)";
}

export function acwrBg(acwr: number): string {
  if (acwr > 1.5) return "rgba(239,68,68,0.12)";
  if (acwr > 1.2) return "rgba(245,158,11,0.12)";
  if (acwr < 0.8) return "rgba(14,165,233,0.12)";
  return "rgba(74,222,128,0.12)";
}

export function acwrLabel(acwr: number): string {
  if (acwr > 1.5) return "Riesgo";
  if (acwr > 1.2) return "Precaución";
  if (acwr < 0.8) return "Bajo";
  return "Óptimo";
}

export function complianceColor(pct: number): string {
  if (pct >= 80) return "var(--pg-accent)";
  if (pct >= 50) return "var(--pg-amber)";
  return "var(--pg-red)";
}

/** 5 small squares showing recent session completion: true=done, false=missed, null=not assigned */
export function FormSquares({ form }: { form: (boolean | null)[] }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {form.map((v, i) => (
        <div
          key={i}
          style={{
            width: 8, height: 8, borderRadius: 2,
            background: v === null ? "var(--pg-surface)" : v ? "var(--pg-green)" : "var(--pg-red)",
          }}
        />
      ))}
    </div>
  );
}

/** ACWR as a small colored number badge */
export function AcwrBadge({ acwr }: { acwr: number | null }) {
  if (acwr === null) {
    return (
      <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "var(--pg-surface)", color: "var(--pg-muted)" }}>
        —
      </span>
    );
  }
  return (
    <span style={{
      display: "inline-block",
      padding: "1px 7px",
      borderRadius: 4,
      fontSize: 10,
      fontWeight: 700,
      fontVariantNumeric: "tabular-nums",
      background: acwrBg(acwr),
      color: acwrColor(acwr),
      letterSpacing: "0.2px",
    }}>
      {acwr.toFixed(1)}
    </span>
  );
}
