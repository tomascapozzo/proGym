import Link from "next/link";
import { Bell, ChevronLeft } from "lucide-react";

interface TopbarProps {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, back, actions }: TopbarProps) {
  return (
    <header style={{
      height: 52,
      borderBottom: "1px solid var(--pg-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 20px",
      flexShrink: 0,
      background: "var(--pg-card)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {back && (
          <>
            <Link href={back.href} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--pg-muted)", textDecoration: "none", fontWeight: 500 }}>
              <ChevronLeft size={12} />
              {back.label}
            </Link>
            <span style={{ color: "var(--pg-border)", fontSize: 16, lineHeight: 1, userSelect: "none" }}>/</span>
          </>
        )}
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--pg-text)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 10, color: "var(--pg-muted)", marginTop: 1, letterSpacing: "0.1px" }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {actions}
        <button style={{ width: 32, height: 32, borderRadius: 7, background: "var(--pg-surface)", border: "1px solid var(--pg-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--pg-muted)" }}>
          <Bell size={13} />
        </button>
      </div>
    </header>
  );
}
