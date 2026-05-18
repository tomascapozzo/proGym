import Topbar from "@/components/dashboard/Topbar";
import { BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <>
      <Topbar title="Analítica" subtitle="Próximamente" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, color: "var(--pg-muted)", padding: "2rem" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--pg-surface)", border: "1px solid var(--pg-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BarChart2 size={28} style={{ color: "var(--pg-accent)", opacity: 0.6 }} />
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--pg-text)", marginBottom: 6 }}>Analítica avanzada</div>
          <div style={{ fontSize: 13, color: "var(--pg-muted)", maxWidth: 360, lineHeight: 1.6 }}>
            Gráficos de volumen, progresión de cargas, evolución del equipo y distribución de intensidad. En construcción.
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
          {["ACWR por jugador", "Volumen semanal", "Distribución RPE", "Comparativa posiciones"].map(f => (
            <span key={f} style={{ fontSize: 11, fontWeight: 500, padding: "5px 12px", borderRadius: 20, background: "var(--pg-surface)", border: "1px solid var(--pg-border)", color: "var(--pg-muted)" }}>{f}</span>
          ))}
        </div>
      </div>
    </>
  );
}
