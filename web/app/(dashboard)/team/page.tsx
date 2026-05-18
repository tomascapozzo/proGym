import Topbar from "@/components/dashboard/Topbar";

const PLAYERS = [
  { init: "MG", name: "Martín García",    pos: "Pilar",     jersey: 1,  acwr: 1.1, compliance: 100, sessions: 5, status: "green",  rpe: 6.8 },
  { init: "RL", name: "Rodrigo López",    pos: "Hooker",    jersey: 2,  acwr: 1.6, compliance: 60,  sessions: 3, status: "red",    rpe: 8.9 },
  { init: "NF", name: "Nicolás Ferreyra", pos: "Segunda",   jersey: 4,  acwr: 0.9, compliance: 100, sessions: 5, status: "green",  rpe: 7.1 },
  { init: "PA", name: "Pedro Acosta",     pos: "Ala",       jersey: 6,  acwr: 1.4, compliance: 80,  sessions: 4, status: "amber",  rpe: 8.2 },
  { init: "JM", name: "Javier Morales",   pos: "Apertura",  jersey: 10, acwr: 0.7, compliance: 40,  sessions: 2, status: "blue",   rpe: 5.4 },
  { init: "CR", name: "Carlos Rodríguez", pos: "Centro",    jersey: 12, acwr: 1.2, compliance: 100, sessions: 5, status: "green",  rpe: 7.5 },
  { init: "LT", name: "Lucas Torres",     pos: "Ala",       jersey: 11, acwr: 1.1, compliance: 100, sessions: 5, status: "green",  rpe: 6.9 },
  { init: "FM", name: "Felipe Méndez",    pos: "Wing",      jersey: 14, acwr: 1.3, compliance: 80,  sessions: 4, status: "amber",  rpe: 7.8 },
];

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  green: { background: "rgba(74,222,128,0.13)",  color: "var(--pg-green)"  },
  red:   { background: "rgba(239,68,68,0.13)",   color: "var(--pg-red)"    },
  amber: { background: "rgba(245,158,11,0.13)",  color: "var(--pg-amber)"  },
  blue:  { background: "rgba(14,165,233,0.13)",  color: "var(--pg-blue)"   },
};

const ACWR_LABELS: Record<string, string> = {
  green: "Óptimo",
  red:   "Riesgo",
  amber: "Precaución",
  blue:  "Bajo",
};

export default function TeamPage() {
  return (
    <>
      <Topbar
        title="Equipo"
        subtitle={`${PLAYERS.length} jugadores`}
        actions={
          <button style={{ padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", background: "var(--pg-accent)", border: "none", color: "var(--pg-accent-text)" }}>
            + Invitar jugador
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        {/* Table */}
        <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 11, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 80px 80px", padding: "8px 16px", borderBottom: "1px solid var(--pg-border)" }}>
            {["Jugador", "Posición", "Sesiones", "Cumpl.", "ACWR", "RPE prom.", "Estado"].map(h => (
              <span key={h} style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>{h}</span>
            ))}
          </div>
          {PLAYERS.map(p => (
            <div key={p.name} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 80px 80px 80px 80px 80px", padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--pg-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--pg-muted)", flexShrink: 0 }}>{p.init}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--pg-text)" }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "var(--pg-muted)" }}>#{p.jersey}</div>
                </div>
              </div>
              <span style={{ fontSize: 12, color: "var(--pg-muted)" }}>{p.pos}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--pg-text)" }}>{p.sessions}/5</span>
              <div>
                <div style={{ height: 4, background: "var(--pg-surface)", borderRadius: 2, overflow: "hidden", marginBottom: 3 }}>
                  <div style={{ height: "100%", width: `${p.compliance}%`, background: "var(--pg-accent)", borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{p.compliance}%</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: STATUS_STYLE[p.status].color as string }}>{p.acwr.toFixed(1)}</span>
              <span style={{ fontSize: 13, color: "var(--pg-muted)" }}>{p.rpe.toFixed(1)}</span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 100, ...STATUS_STYLE[p.status] }}>
                {ACWR_LABELS[p.status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
