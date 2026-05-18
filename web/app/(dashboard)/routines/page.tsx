import Topbar from "@/components/dashboard/Topbar";

const ROUTINES = [
  { name: "Fuerza — Semana 20",      type: "weekly",  days: 4, exercises: 28, assigned: 18, status: "active"  },
  { name: "Velocidad y potencia",    type: "weekly",  days: 3, exercises: 18, assigned: 12, status: "active"  },
  { name: "Recuperación activa",     type: "daily",   days: 1, exercises: 8,  assigned: 18, status: "active"  },
  { name: "Pretemporada — Bloque 1", type: "monthly", days: 5, exercises: 40, assigned: 18, status: "past"    },
  { name: "Core y estabilidad",      type: "daily",   days: 1, exercises: 12, assigned: 8,  status: "active"  },
  { name: "Pliometría",              type: "weekly",  days: 3, exercises: 22, assigned: 10, status: "draft"   },
];

const TYPE_STYLE: Record<string, React.CSSProperties> = {
  daily:   { background: "rgba(14,165,233,0.12)",  color: "var(--pg-blue)"   },
  weekly:  { background: "rgba(110,231,183,0.12)", color: "var(--pg-accent)" },
  monthly: { background: "rgba(167,139,250,0.12)", color: "var(--pg-purple)" },
};

const TYPE_LABELS: Record<string, string> = {
  daily: "Diaria", weekly: "Semanal", monthly: "Mensual",
};

const STATUS_STYLE: Record<string, React.CSSProperties> = {
  active: { background: "rgba(74,222,128,0.12)",  color: "var(--pg-green)"  },
  past:   { background: "rgba(136,136,136,0.12)", color: "var(--pg-muted)"  },
  draft:  { background: "rgba(167,139,250,0.12)", color: "var(--pg-purple)" },
};

const STATUS_LABELS: Record<string, string> = {
  active: "Activa", past: "Finalizada", draft: "Borrador",
};

export default function RoutinesPage() {
  return (
    <>
      <Topbar
        title="Rutinas"
        subtitle={`${ROUTINES.filter(r => r.status === "active").length} rutinas activas`}
        actions={
          <button style={{ padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", background: "var(--pg-accent)", border: "none", color: "var(--pg-accent-text)" }}>
            + Crear rutina
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {ROUTINES.map(r => (
            <div key={r.name} style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 12, padding: 16, cursor: "pointer", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--pg-text)", letterSpacing: "-0.2px" }}>{r.name}</div>
                  <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, ...TYPE_STYLE[r.type] }}>{TYPE_LABELS[r.type]}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, ...STATUS_STYLE[r.status] }}>{STATUS_LABELS[r.status]}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {[
                  { label: "Días",       value: r.days       },
                  { label: "Ejercicios", value: r.exercises  },
                  { label: "Asignados",  value: r.assigned   },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "var(--pg-text)" }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: "var(--pg-muted)" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
                <button style={{ padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 500, cursor: "pointer", border: "1px solid var(--pg-border)", color: "var(--pg-muted)", background: "var(--pg-surface)" }}>Ver</button>
                <button style={{ padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer", background: "var(--pg-accent-bg)", border: "1px solid rgba(110,231,183,0.3)", color: "var(--pg-accent)" }}>Asignar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
