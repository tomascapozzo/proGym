"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X, Trash2 } from "lucide-react";
import { updateGroup, deleteGroup } from "@/app/(dashboard)/squads/actions";

const inputStyle: React.CSSProperties = {
  background: "var(--pg-surface)",
  border: "1px solid var(--pg-border)",
  borderRadius: 7,
  padding: "4px 8px",
  color: "var(--pg-text)",
  fontSize: 13,
  fontWeight: 600,
  outline: "none",
};

export default function GroupHeaderEditor({
  groupId,
  initialName,
  initialDescription,
  canEdit,
}: {
  groupId: string;
  initialName: string;
  initialDescription: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await updateGroup(groupId, name, description || null);
      if (!result.ok) {
        setError(result.error ?? "No se pudo guardar.");
        return;
      }
      setEditing(false);
    });
  }

  function handleCancel() {
    setName(initialName);
    setDescription(initialDescription ?? "");
    setError(null);
    setEditing(false);
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar el plantel "${initialName}"? Esto también quita a todos sus miembros del plantel.`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteGroup(groupId);
      if (!result.ok) {
        setError(result.error ?? "No se pudo eliminar.");
        return;
      }
      router.push("/squads");
    });
  }

  if (!editing) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {description && (
          <p style={{ fontSize: 11, color: "var(--pg-muted)", margin: 0, lineHeight: 1.5 }}>{description}</p>
        )}
        {canEdit && (
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button
              onClick={() => setEditing(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 7,
                fontSize: 10, fontWeight: 600,
                background: "transparent", border: "1px solid var(--pg-border)",
                color: "var(--pg-muted)", cursor: "pointer",
              }}
            >
              <Pencil size={10} /> Editar
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 7,
                fontSize: 10, fontWeight: 600,
                background: "transparent", border: "1px solid rgba(239,68,68,0.3)",
                color: "var(--pg-red)", cursor: "pointer",
              }}
            >
              <Trash2 size={10} /> Eliminar plantel
            </button>
            {error && <span style={{ fontSize: 10, color: "var(--pg-red)", alignSelf: "center" }}>{error}</span>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ ...inputStyle, fontSize: 14 }}
        autoFocus
      />
      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Descripción (opcional)"
        style={{ ...inputStyle, fontSize: 11, fontWeight: 400, color: "var(--pg-muted)" }}
      />
      {error && <div style={{ fontSize: 10, color: "var(--pg-red)" }}>{error}</div>}
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={handleSave}
          disabled={isPending || !name.trim()}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 10px", borderRadius: 7,
            fontSize: 10, fontWeight: 700,
            background: "var(--pg-accent)", border: "none", color: "var(--pg-accent-text)",
            cursor: isPending || !name.trim() ? "default" : "pointer",
            opacity: isPending || !name.trim() ? 0.6 : 1,
          }}
        >
          <Check size={10} /> Guardar
        </button>
        <button
          onClick={handleCancel}
          disabled={isPending}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 10px", borderRadius: 7,
            fontSize: 10, fontWeight: 600,
            background: "transparent", border: "1px solid var(--pg-border)",
            color: "var(--pg-muted)", cursor: "pointer",
          }}
        >
          <X size={10} /> Cancelar
        </button>
      </div>
    </div>
  );
}
