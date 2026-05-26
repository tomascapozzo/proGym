"use client";

import { useState } from "react";
import Link from "next/link";
import ClubCreatorForm from "./ClubCreatorForm";
import ClubJoinForm from "./ClubJoinForm";

type Tab = "create" | "join";

export default function ClubEntry() {
  const [tab, setTab] = useState<Tab>("create");

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--pg-bg)", padding: "2rem" }}>
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(212,168,83,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.03em" }}>
            proGym <span style={{ color: "var(--pg-accent)" }}>Coach</span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--pg-muted)", marginTop: 6 }}>
            Crea tu club o unite a uno existente
          </div>
        </div>

        <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 16, padding: "1.75rem" }}>
          <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--pg-surface)", borderRadius: 10, marginBottom: "1.25rem" }}>
            <TabButton active={tab === "create"} onClick={() => setTab("create")}>
              Crear club
            </TabButton>
            <TabButton active={tab === "join"} onClick={() => setTab("join")}>
              Unirme con código
            </TabButton>
          </div>

          {tab === "create" ? <ClubCreatorForm /> : <ClubJoinForm />}
        </div>

        <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--pg-muted)", marginTop: "1.25rem" }}>
          <Link href="/auth/login" style={{ color: "var(--pg-muted)", textDecoration: "none" }}>
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "0.55rem 0.75rem",
        borderRadius: 7,
        background: active ? "var(--pg-card)" : "transparent",
        border: active ? "1px solid var(--pg-border)" : "1px solid transparent",
        color: active ? "var(--pg-text)" : "var(--pg-muted)",
        fontSize: "0.8rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  );
}
