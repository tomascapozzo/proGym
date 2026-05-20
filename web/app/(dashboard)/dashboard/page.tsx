import Link from "next/link";
import Topbar from "@/components/dashboard/Topbar";
import { FormSquares, AcwrBadge, acwrBg, acwrColor, acwrLabel, complianceColor } from "@/components/dashboard/PlayerBadges";

type F = (boolean | null)[];

const KPI_CARDS = [
  { label: "Jugadores activos",  value: "18",   delta: "+2 esta semana",     color: "var(--pg-accent)" },
  { label: "Cumplimiento",        value: "76%",  delta: "+4% vs semana ant.", color: "var(--pg-accent)" },
  { label: "En riesgo (ACWR)",    value: "2",    delta: "1 en alerta roja",   color: "var(--pg-red)"    },
  { label: "Carga promedio",      value: "3.2k", delta: "UA esta semana",     color: "var(--pg-blue)"   },
];

const PLAYERS = [
  { id: 1, init: "MG", name: "M. García",    pos: "Pilar",    acwr: 1.1, compliance: 100, rpe: 6.8, form: [true,true,true,true,true]    as F },
  { id: 2, init: "RL", name: "R. López",     pos: "Hooker",   acwr: 1.6, compliance: 60,  rpe: 8.9, form: [true,false,true,false,false]  as F },
  { id: 3, init: "NF", name: "N. Ferreyra",  pos: "Segunda",  acwr: 0.9, compliance: 100, rpe: 7.1, form: [true,true,true,true,true]    as F },
  { id: 4, init: "PA", name: "P. Acosta",    pos: "Ala",      acwr: 1.4, compliance: 80,  rpe: 8.2, form: [true,true,false,true,true]   as F },
  { id: 5, init: "JM", name: "J. Morales",   pos: "Apertura", acwr: 0.7, compliance: 40,  rpe: 5.4, form: [false,true,false,false,true] as F },
  { id: 6, init: "CR", name: "C. Rodríguez", pos: "Centro",   acwr: 1.2, compliance: 100, rpe: 7.5, form: [true,true,true,true,true]    as F },
  { id: 7, init: "LT", name: "L. Torres",    pos: "Ala",      acwr: 1.1, compliance: 100, rpe: 6.9, form: [true,true,true,true,true]    as F },
  { id: 8, init: "FM", name: "F. Méndez",    pos: "Wing",     acwr: 1.3, compliance: 80,  rpe: 7.8, form: [true,false,true,true,true]   as F },
];

const ALERTS = [
  { color: "var(--pg-red)",   name: "R. López",   msg: "ACWR 1.6 — riesgo de lesión elevado",   time: "hace 2h" },
  { color: "var(--pg-amber)", name: "P. Acosta",  msg: "ACWR 1.4 — carga sobre el umbral",       time: "hace 5h" },
  { color: "var(--pg-blue)",  name: "J. Morales", msg: "Cumplimiento < 50% — solo 2/5 sesiones", time: "hace 1d" },
];

const WEEK_SESSIONS = [
  { day: "Lun", count: 18, today: false },
  { day: "Mar", count: 14, today: true  },
  { day: "Mié", count: 0,  today: false },
  { day: "Jue", count: 16, today: false },
  { day: "Vie", count: 12, today: false },
];

const COL = "28px 1fr 72px 54px 100px 52px 38px 76px";
const HEADERS = ["", "Jugador", "Posición", "Forma", "Cumplimiento", "ACWR", "RPE", "Estado"];

export default function DashboardPage() {
  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Semana 20 · 12–18 mayo 2026"
        actions={
          <button style={{ padding: "5px 12px", borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: "pointer", background: "var(--pg-accent)", border: "none", color: "var(--pg-accent-text)" }}>
            + Nueva rutina
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
          {KPI_CARDS.map(k => (
            <div key={k.label} style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "11px 14px" }}>
              <div style={{ fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--pg-muted)", marginBottom: 5, fontWeight: 500 }}>{k.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-1px", color: k.color, fontVariantNumeric: "tabular-nums" }}>{k.value}</div>
              <div style={{ fontSize: 10, color: "var(--pg-disabled)", marginTop: 2 }}>{k.delta}</div>
            </div>
          ))}
        </div>

        {/* Main split */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 272px", gap: 10, flex: 1, minHeight: 0 }}>

          {/* Player table */}
          <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--pg-border)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>Plantel — semana actual</span>
              <Link href="/team" style={{ fontSize: 10, color: "var(--pg-accent)", textDecoration: "none" }}>Ver todo →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: COL, padding: "5px 14px", borderBottom: "1px solid var(--pg-border)", background: "rgba(0,0,0,0.2)", flexShrink: 0 }}>
              {HEADERS.map(h => (
                <span key={h} style={{ fontSize: 8, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(255,255,255,0.2)", fontWeight: 500 }}>{h}</span>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {PLAYERS.map(p => (
                <Link key={p.id} href={`/team/${p.id}`} className="pg-row" style={{
                  display: "grid",
                  gridTemplateColumns: COL,
                  padding: "7px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.03)",
                  alignItems: "center",
                  textDecoration: "none",
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--pg-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "var(--pg-muted)" }}>{p.init}</div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--pg-text)" }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: "var(--pg-muted)" }}>{p.pos}</span>
                  <FormSquares form={p.form} />
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ flex: 1, height: 3, background: "var(--pg-surface)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p.compliance}%`, background: complianceColor(p.compliance), borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums", minWidth: 26, textAlign: "right" }}>{p.compliance}%</span>
                  </div>
                  <AcwrBadge acwr={p.acwr} />
                  <span style={{ fontSize: 11, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums" }}>{p.rpe.toFixed(1)}</span>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: acwrBg(p.acwr), color: acwrColor(p.acwr) }}>{acwrLabel(p.acwr)}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Alerts */}
            <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--pg-border)" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>Alertas activas</span>
              </div>
              {ALERTS.map(a => (
                <div key={a.name} className="pg-row" style={{ display: "flex", gap: 9, padding: "9px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)", cursor: "pointer" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: a.color, flexShrink: 0, marginTop: 5 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>{a.name}</div>
                    <div style={{ fontSize: 10, color: "var(--pg-muted)", marginTop: 1, lineHeight: 1.4 }}>{a.msg}</div>
                  </div>
                  <span style={{ fontSize: 9, color: a.color, flexShrink: 0, marginTop: 1 }}>{a.time}</span>
                </div>
              ))}
            </div>

            {/* Next session */}
            <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8 }}>
              <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--pg-border)" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)" }}>Próxima sesión</span>
              </div>
              <div style={{ padding: "11px 12px", display: "flex", flexDirection: "column", gap: 7 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--pg-text)" }}>Fuerza — Semana 21</div>
                  <div style={{ fontSize: 10, color: "var(--pg-muted)", marginTop: 2 }}>Mañana · Martes 19 mayo</div>
                </div>
                {[
                  { label: "Jugadores asignados", value: "18",  color: "var(--pg-text)"   },
                  { label: "Ejercicios",           value: "28",  color: "var(--pg-text)"   },
                  { label: "Días completados",      value: "3/4", color: "var(--pg-accent)" },
                ].map(r => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 10, color: "var(--pg-muted)" }}>{r.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: r.color, fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly activity */}
            <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "10px 12px", flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-text)", marginBottom: 10 }}>Actividad — semana 20</div>
              {WEEK_SESSIONS.map(s => (
                <div key={s.day} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 9, color: s.today ? "var(--pg-accent)" : "var(--pg-muted)", width: 22, fontWeight: s.today ? 700 : 400 }}>{s.day}</span>
                  <div style={{ flex: 1, height: 4, background: "var(--pg-surface)", borderRadius: 2, overflow: "hidden" }}>
                    {s.count > 0 && <div style={{ height: "100%", width: `${(s.count / 18) * 100}%`, background: s.today ? "var(--pg-accent)" : "rgba(110,231,183,0.4)", borderRadius: 2 }} />}
                  </div>
                  <span style={{ fontSize: 9, color: "var(--pg-muted)", fontVariantNumeric: "tabular-nums", width: 14, textAlign: "right" }}>{s.count === 0 ? "—" : s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
