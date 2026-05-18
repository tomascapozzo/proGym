"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Dashboard",   icon: LayoutDashboard },
  { href: "/team",       label: "Equipo",       icon: Users           },
  { href: "/routines",   label: "Rutinas",      icon: ClipboardList   },
  { href: "/analytics",  label: "Analítica",    icon: BarChart2       },
  { href: "/settings",   label: "Configuración",icon: Settings        },
] as const;

interface SidebarProps {
  coachName?: string;
  teamName?: string;
}

export default function Sidebar({ coachName = "Coach", teamName = "Mi Equipo" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        width: 215,
        flexShrink: 0,
        background: "var(--pg-card)",
        borderRight: "1px solid var(--pg-border)",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px 18px", borderBottom: "1px solid var(--pg-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--pg-accent-bg)", border: "1px solid rgba(110,231,183,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "var(--pg-accent)" }}>
            PG
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "var(--pg-text)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
              proGym <span style={{ color: "var(--pg-accent)" }}>Coach</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--pg-muted)", letterSpacing: "0.5px", marginTop: 1 }}>{teamName}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto" }}>
        <div style={{ fontSize: 9, letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.18)", padding: "0 8px", marginBottom: 6, marginTop: 8 }}>
          Principal
        </div>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 10px",
                borderRadius: 9,
                marginBottom: 1,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
                transition: "all 0.15s",
                background: active ? "var(--pg-accent-bg)" : "transparent",
                border: active ? "1px solid rgba(110,231,183,0.2)" : "1px solid transparent",
                color: active ? "var(--pg-accent)" : "var(--pg-muted)",
              }}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid var(--pg-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 9, cursor: "pointer" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--pg-accent-bg)", border: "1px solid rgba(110,231,183,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "var(--pg-accent)", flexShrink: 0 }}>
            {coachName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--pg-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{coachName}</div>
            <div style={{ fontSize: 10, color: "var(--pg-muted)" }}>Entrenador</div>
          </div>
          <LogOut size={13} style={{ color: "var(--pg-muted)", flexShrink: 0 }} />
        </div>
      </div>
    </aside>
  );
}
