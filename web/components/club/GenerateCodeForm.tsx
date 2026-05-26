"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { generateInvitation } from "@/app/(dashboard)/invitations/actions";
import type { InvitationRole } from "@/types/club";

interface GroupOption { id: string; name: string }

export default function GenerateCodeForm({
  clubId,
  role,
  groups = [],
}: {
  clubId: string;
  role: InvitationRole;
  groups?: GroupOption[];
}) {
  const [open, setOpen] = useState(false);
  const [groupId, setGroupId] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const showGroupSelect = role === "player" && groups.length > 0;

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateInvitation(
        clubId,
        role,
        showGroupSelect && groupId ? groupId : null
      );
      if (!result.ok) {
        setError(result.error ?? "No se pudo generar.");
        return;
      }
      setOpen(false);
      setGroupId("");
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: "6px 12px",
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
          background: "var(--pg-accent)",
          border: "none",
          color: "var(--pg-accent-text)",
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Plus size={12} />
        {role === "coach" ? "Generar código de coach" : "Generar código"}
      </button>
    );
  }

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 10px",
      background: "var(--pg-card)",
      border: "1px solid var(--pg-border)",
      borderRadius: 8,
      flexWrap: "wrap",
    }}>
      {showGroupSelect && (
        <select
          value={groupId}
          onChange={e => setGroupId(e.target.value)}
          style={{
            background: "var(--pg-surface)",
            border: "1px solid var(--pg-border)",
            borderRadius: 7,
            color: "var(--pg-text)",
            padding: "5px 10px",
            fontSize: 11,
            outline: "none",
            minWidth: 160,
          }}
        >
          <option value="">Sin grupo asignado</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      )}

      <button
        onClick={handleGenerate}
        disabled={isPending}
        style={{
          padding: "5px 12px",
          borderRadius: 7,
          fontSize: 11,
          fontWeight: 700,
          cursor: isPending ? "default" : "pointer",
          background: "var(--pg-accent)",
          border: "none",
          color: "var(--pg-accent-text)",
        }}
      >
        {isPending ? "Generando..." : "Generar"}
      </button>

      <button
        onClick={() => { setOpen(false); setGroupId(""); setError(null); }}
        disabled={isPending}
        style={{
          padding: "5px 12px",
          borderRadius: 7,
          fontSize: 11,
          fontWeight: 500,
          cursor: "pointer",
          background: "transparent",
          border: "1px solid var(--pg-border)",
          color: "var(--pg-muted)",
        }}
      >
        Cancelar
      </button>

      {error && (
        <span style={{ fontSize: 10, color: "var(--pg-red)" }}>{error}</span>
      )}
    </div>
  );
}
