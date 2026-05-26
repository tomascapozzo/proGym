"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Shield, Link2, CalendarDays, ClipboardList, BarChart2, Settings, LogOut, Video } from "lucide-react";
import { signOut } from "@/app/auth/actions";

const NAV = [
  { href: "/dashboard",       label: "Dashboard",        icon: LayoutDashboard },
  { href: "/team",            label: "Equipo",            icon: Users           },
  { href: "/squads",          label: "Planteles",         icon: Shield          },
  { href: "/invitations",     label: "Invitaciones",      icon: Link2           },
  { href: "/calendar",        label: "Calendario",        icon: CalendarDays    },
  { href: "/routines",        label: "Rutinas",           icon: ClipboardList   },
  { href: "/analytics",       label: "Analítica",         icon: BarChart2       },
  { href: "/video-analysis",  label: "Análisis de video", icon: Video           },
  { href: "/settings",        label: "Configuración",     icon: Settings        },
];

interface SidebarProps {
  coachName?: string;
  teamName?: string;
}

export default function Sidebar({ coachName = "Coach", teamName = "Mi Equipo" }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 215,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      background: "var(--pg-card)",
      borderRight: "1px solid var(--pg-border)",
      padding: "24px 0 16px",
      zIndex: 10,
    }}>

      {/* Brand */}
      <div style={{ padding: "0 18px 24px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: "var(--pg-accent-bg)",
          border: "1px solid rgba(212,168,83,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 800, color: "var(--pg-accent)", flexShrink: 0,
        }}>
          PG
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1.2 }}>
            proGym
          </div>
          <div style={{ fontSize: 9, color: "var(--pg-disabled)", letterSpacing: "1.5px", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {teamName}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 10px", overflowY: "auto" }}>
        <div style={{
          fontSize: 9, letterSpacing: "2px", textTransform: "uppercase",
          color: "rgba(255,255,255,0.18)", padding: "0 8px",
          marginBottom: 4,
        }}>
          Principal
        </div>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
              color: active ? "var(--pg-accent)" : "var(--pg-muted)",
              background: active ? "var(--pg-accent-bg)" : "transparent",
              border: `1px solid ${active ? "rgba(212,168,83,0.2)" : "transparent"}`,
              marginBottom: 1,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "var(--pg-c3)"; }}
            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <Icon size={15} style={{ color: active ? "var(--pg-accent)" : "var(--pg-muted)", flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "0 10px", borderTop: "1px solid var(--pg-border)", paddingTop: 14, marginTop: 8 }}>
        <form action={signOut} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 9 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--pg-accent-bg)",
            border: "1px solid rgba(212,168,83,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600, color: "var(--pg-accent)", flexShrink: 0,
          }}>
            {coachName.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {coachName}
            </div>
            <div style={{ fontSize: 10, color: "var(--pg-muted)" }}>Entrenador</div>
          </div>
          <button
            type="submit"
            title="Cerrar sesión"
            style={{
              background: "transparent",
              border: "none",
              padding: 4,
              cursor: "pointer",
              color: "var(--pg-muted)",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <LogOut size={12} />
          </button>
        </form>
      </div>
    </aside>
  );
}
