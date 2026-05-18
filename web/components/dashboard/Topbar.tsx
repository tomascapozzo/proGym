import { Bell } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header
      style={{
        height: 56,
        borderBottom: "1px solid var(--pg-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        flexShrink: 0,
        background: "var(--pg-card)",
      }}
    >
      <div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--pg-text)", letterSpacing: "-0.4px", lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "var(--pg-muted)", marginTop: 1 }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {actions}
        <button style={{ width: 34, height: 34, borderRadius: 8, background: "var(--pg-surface)", border: "1px solid var(--pg-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--pg-muted)" }}>
          <Bell size={15} />
        </button>
      </div>
    </header>
  );
}
