"use client";

import { useState, useTransition } from "react";
import { UserPlus, X } from "lucide-react";
import { addMemberToGroup, removeMemberFromGroup } from "@/app/(dashboard)/squads/actions";

interface Member {
  user_id: string;
  name: string;
  username: string;
}

function initials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function GroupMemberManager({
  groupId,
  members,
  available,
  canManage,
}: {
  groupId: string;
  members: Member[];
  available: Member[];
  canManage: boolean;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleAdd(userId: string) {
    setError(null);
    startTransition(async () => {
      const result = await addMemberToGroup(groupId, userId);
      if (!result.ok) setError(result.error ?? "No se pudo agregar.");
    });
  }

  function handleRemove(userId: string, name: string) {
    if (!confirm(`¿Quitar a ${name} del plantel?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await removeMemberFromGroup(groupId, userId);
      if (!result.ok) setError(result.error ?? "No se pudo quitar.");
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {canManage && (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {addOpen ? (
            <button
              onClick={() => setAddOpen(false)}
              style={btnSecondary}
            >
              Cerrar
            </button>
          ) : (
            <button
              onClick={() => setAddOpen(true)}
              disabled={available.length === 0}
              style={{ ...btnPrimary, opacity: available.length === 0 ? 0.5 : 1, cursor: available.length === 0 ? "default" : "pointer" }}
            >
              <UserPlus size={12} />
              Agregar miembros
            </button>
          )}
        </div>
      )}

      {error && (
        <div style={{ fontSize: 11, color: "var(--pg-red)", padding: "6px 10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8 }}>
          {error}
        </div>
      )}

      {addOpen && canManage && (
        <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-muted)", marginBottom: 8, letterSpacing: "1px", textTransform: "uppercase" }}>
            Miembros del club disponibles
          </div>
          {available.length === 0 ? (
            <div style={{ fontSize: 11, color: "var(--pg-muted)", padding: 12, textAlign: "center" }}>
              Todos los miembros del club ya están en este plantel.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {available.map(m => (
                <div key={m.user_id} style={memberRow}>
                  <Avatar name={m.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--pg-text)" }}>{m.name || "Sin nombre"}</div>
                    {m.username && <div style={{ fontSize: 10, color: "var(--pg-muted)" }}>@{m.username}</div>}
                  </div>
                  <button
                    onClick={() => handleAdd(m.user_id)}
                    disabled={isPending}
                    style={{ ...btnPrimary, padding: "4px 10px", fontSize: 10 }}
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--pg-muted)", marginBottom: 8, letterSpacing: "1px", textTransform: "uppercase" }}>
          Miembros del plantel
        </div>
        {members.length === 0 ? (
          <div style={{ fontSize: 11, color: "var(--pg-muted)", padding: 12, textAlign: "center" }}>
            Este plantel aún no tiene miembros.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {members.map(m => (
              <div key={m.user_id} style={memberRow}>
                <Avatar name={m.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--pg-text)" }}>{m.name || "Sin nombre"}</div>
                  {m.username && <div style={{ fontSize: 10, color: "var(--pg-muted)" }}>@{m.username}</div>}
                </div>
                {canManage && (
                  <button
                    onClick={() => handleRemove(m.user_id, m.name || "este miembro")}
                    disabled={isPending}
                    title="Quitar del plantel"
                    style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: "transparent",
                      border: "1px solid var(--pg-border)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--pg-muted)", cursor: "pointer",
                    }}
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: "50%",
      background: "var(--pg-surface)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 10, fontWeight: 700, color: "var(--pg-muted)", flexShrink: 0,
    }}>
      {initials(name)}
    </div>
  );
}

const memberRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "6px 8px",
  borderRadius: 7,
};

const btnPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  padding: "5px 12px",
  borderRadius: 7,
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
  background: "var(--pg-accent)",
  border: "none",
  color: "var(--pg-accent-text)",
};

const btnSecondary: React.CSSProperties = {
  padding: "5px 12px",
  borderRadius: 7,
  fontSize: 11,
  fontWeight: 500,
  cursor: "pointer",
  background: "transparent",
  border: "1px solid var(--pg-border)",
  color: "var(--pg-muted)",
};
