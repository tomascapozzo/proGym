import Link from "next/link";
import { Bell, ChevronLeft } from "lucide-react";

interface TopbarProps {
  title: React.ReactNode;
  subtitle?: string;
  back?: { href: string; label: string };
  actions?: React.ReactNode;
}

export default function Topbar({ title, subtitle, back, actions }: TopbarProps) {
  return (
    <header style={{
      height: 56,
      borderBottom: "1px solid var(--pg-border)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
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
          <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px", lineHeight: 1.2 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: "var(--pg-muted)", marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {actions}
        <button style={{
          width: 32, height: 32, borderRadius: 8,
          background: "var(--pg-surface)",
          border: "1px solid var(--pg-border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: "var(--pg-muted)",
        }}>
          <Bell size={13} />
        </button>
      </div>
    </header>
  );
}
