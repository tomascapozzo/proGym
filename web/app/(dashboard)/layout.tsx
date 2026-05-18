import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--pg-bg)" }}>
      <Sidebar coachName="Coach" teamName="Mi Equipo" />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--pg-bg)" }}>
        {children}
      </main>
    </div>
  );
}
