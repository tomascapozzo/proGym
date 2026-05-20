"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ClipboardList, BarChart2, Settings, LogOut } from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard",     icon: LayoutDashboard },
  { href: "/team",      label: "Equipo",         icon: Users           },
  { href: "/routines",  label: "Rutinas",        icon: ClipboardList   },
  { href: "/analytics", label: "Analítica",      icon: BarChart2       },
  { href: "/settings",  label: "Configuración",  icon: Settings        },
];

interface SidebarProps {
  coachName?: string;
  teamName?: string;
}

export default function Sidebar({ coachName = "Coach", teamName = "Mi Equipo" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", background: "var(--pg-card)", borderRight: "1px solid var(--pg-border)" }}>

      {/* Brand */}
      <div style={{ padding: "16px", borderBottom: "1px solid var(--pg-border)" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--pg-text)", letterSpacing: "-0.3px" }}>
          proGym <span style={{ color: "var(--pg-accent)" }}>Coach</span>
        </div>
        <div style={{ fontSize: 10, color: "var(--pg-muted)", marginTop: 2 }}>{teamName}</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
        <div style={{ fontSize: 8, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.15)", padding: "0 16px", marginBottom: 4, marginTop: 6 }}>
          Principal
        </div>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "7px 16px",
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              textDecoration: "none",
              color: active ? "var(--pg-text)" : "var(--pg-muted)",
              background: active ? "rgba(110,231,183,0.06)" : "transparent",
              borderLeft: `2px solid ${active ? "var(--pg-accent)" : "transparent"}`,
              transition: "color 0.1s, background 0.1s",
            }}>
              <Icon size={14} style={{ color: active ? "var(--pg-accent)" : "var(--pg-muted)", flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--pg-border)", display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--pg-accent-bg)", border: "1px solid rgba(110,231,183,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--pg-accent)", flexShrink: 0 }}>
          {coachName.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{coachName}</div>
          <div style={{ fontSize: 9, color: "var(--pg-muted)" }}>Entrenador</div>
        </div>
        <LogOut size={12} style={{ color: "var(--pg-muted)", cursor: "pointer", flexShrink: 0 }} />
      </div>
    </aside>
  );
}
