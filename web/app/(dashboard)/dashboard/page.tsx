import Topbar from "@/components/dashboard/Topbar";

const KPI_CARDS = [
  { label: "Jugadores activos", value: "18",  delta: "+2 esta semana",    dot: "var(--pg-green)"  },
  { label: "Cumplimiento",       value: "76%", delta: "+4% vs semana ant", dot: "var(--pg-accent)" },
  { label: "En riesgo (ACWR)",   value: "2",   delta: "1 en alerta",       dot: "var(--pg-red)"    },
  { label: "Sesiones esta semana",value: "43", delta: "de 56 asignadas",   dot: "var(--pg-blue)"   },
  { label: "Carga promedio",     value: "3.2k",delta: "UA esta semana",    dot: "var(--pg-purple)" },
];

const PLAYERS = [
  { init: "MG", name: "M. García",   pos: "Pilar",     acwr: 1.1, compliance: 100, status: "green"  },
  { init: "RL", name: "R. López",    pos: "Hooker",    acwr: 1.6, compliance: 60,  status: "red"    },
  { init: "NF", name: "N. Ferreyra", pos: "Segunda",   acwr: 0.9, compliance: 100, status: "green"  },
  { init: "PA", name: "P. Acosta",   pos: "Ala",       acwr: 1.4, compliance: 80,  status: "amber"  },
  { init: "JM", name: "J. Morales",  pos: "Apertura",  acwr: 0.7, compliance: 40,  status: "blue"   },
  { init: "CR", name: "C. Rodríguez",pos: "Centro",    acwr: 1.2, compliance: 100, status: "green"  },
];

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  green: { background: "rgba(74,222,128,0.13)",  color: "var(--pg-green)"  },
  red:   { background: "rgba(239,68,68,0.13)",   color: "var(--pg-red)"    },
  amber: { background: "rgba(245,158,11,0.13)",  color: "var(--pg-amber)"  },
  blue:  { background: "rgba(14,165,233,0.13)",  color: "var(--pg-blue)"   },
};

const ALERTS = [
  { color: "var(--pg-red)",   name: "R. López",   msg: "ACWR 1.6 — riesgo de lesión elevado",   time: "hace 2h"  },
  { color: "var(--pg-amber)", name: "P. Acosta",  msg: "ACWR 1.4 — carga por encima del umbral", time: "hace 5h"  },
  { color: "var(--pg-blue)",  name: "J. Morales", msg: "Cumplimiento < 50% — solo 2/5 sesiones", time: "hace 1d"  },
];

export default function DashboardPage() {
  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Semana 20 · 12–18 mayo 2026"
        actions={
          <button style={{ padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", background: "var(--pg-accent)", border: "none", color: "var(--pg-accent-text)" }}>
            + Nueva rutina
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
          {KPI_CARDS.map(k => (
            <div key={k.label} style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 11, padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: "var(--pg-muted)", textTransform: "uppercase", letterSpacing: "0.3px" }}>{k.label}</span>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: k.dot, display: "inline-block" }} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.8px", color: "var(--pg-text)" }}>{k.value}</div>
              <div style={{ fontSize: 10, color: "var(--pg-muted)", marginTop: 2 }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 14, flex: 1, minHeight: 0 }}>

          {/* Player table */}
          <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 11, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--pg-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--pg-text)" }}>Plantel — semana actual</span>
              <a href="/team" style={{ fontSize: 10, color: "var(--pg-accent)", textDecoration: "none" }}>Ver todo →</a>
            </div>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 70px", padding: "8px 14px", borderBottom: "1px solid var(--pg-border)" }}>
              {["Jugador", "Posición", "Carga", "Cumpl.", "ACWR"].map(h => (
                <span key={h} style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>{h}</span>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {PLAYERS.map(p => (
                <div key={p.name} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 70px", padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--pg-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--pg-muted)", flexShrink: 0 }}>{p.init}</div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "var(--pg-text)" }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>{p.pos}</span>
                  <div style={{ height: 4, background: "var(--pg-surface)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${p.compliance}%`, background: "var(--pg-accent)", borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>{p.compliance}%</span>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 100, textAlign: "center", ...STATUS_STYLE[p.status] }}>
                    {p.acwr.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 11, overflow: "hidden" }}>
            <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--pg-border)" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--pg-text)" }}>Alertas activas</span>
            </div>
            {ALERTS.map(a => (
              <div key={a.name} style={{ display: "flex", gap: 8, padding: "10px 12px", borderBottom: "1px solid var(--pg-border)", cursor: "pointer" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, flexShrink: 0, marginTop: 4 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--pg-text)" }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: "var(--pg-muted)", marginTop: 2, lineHeight: 1.4 }}>{a.msg}</div>
                  <div style={{ fontSize: 9, color: a.color, marginTop: 3 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
