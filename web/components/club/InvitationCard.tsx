"use client";

import { useState, useTransition } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import { revokeInvitation } from "@/app/(dashboard)/invitations/actions";
import type { ClubInvitationWithGroup } from "@/types/club";

export default function InvitationCard({
  invitation,
  canRevoke,
}: {
  invitation: ClubInvitationWithGroup;
  canRevoke: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCopy() {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(invitation.code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    } else {
      const el = document.createElement("textarea");
      el.value = invitation.code;
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  }

  function handleRevoke() {
    if (!confirm(`¿Revocar el código ${invitation.code}?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await revokeInvitation(invitation.id);
      if (!result.ok) setError(result.error ?? "No se pudo revocar.");
    });
  }

  const isCoach = invitation.role === "coach";
  const roleColor = isCoach ? "var(--pg-blue)" : "var(--pg-accent)";
  const roleBg = isCoach ? "var(--pg-blue-bg)" : "var(--pg-accent-bg)";
  const usesLabel =
    invitation.max_uses != null
      ? `${invitation.uses_count} / ${invitation.max_uses} usos`
      : `${invitation.uses_count} ${invitation.uses_count === 1 ? "uso" : "usos"}`;

  return (
    <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 10, padding: "0.95rem 1rem", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: "0.06em",
            color: "var(--pg-text)",
          }}>
            {invitation.code}
          </div>
          <button
            onClick={handleCopy}
            title="Copiar"
            style={{
              width: 26, height: 26, borderRadius: 6,
              background: copied ? "var(--pg-accent-bg)" : "var(--pg-surface)",
              border: "1px solid var(--pg-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: copied ? "var(--pg-accent)" : "var(--pg-muted)",
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>

        {canRevoke && (
          <button
            onClick={handleRevoke}
            disabled={isPending}
            title="Revocar"
            style={{
              width: 26, height: 26, borderRadius: 6,
              background: "transparent",
              border: "1px solid var(--pg-border)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: isPending ? "default" : "pointer",
              color: "var(--pg-muted)",
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
          background: roleBg, color: roleColor, textTransform: "uppercase", letterSpacing: "0.5px",
        }}>
          {isCoach ? "Coach" : "Jugador"}
        </span>
        {invitation.target_group && (
          <span style={{
            fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 4,
            background: "var(--pg-surface)", color: "var(--pg-muted)",
          }}>
            {invitation.target_group.name}
          </span>
        )}
        <span style={{ fontSize: 10, color: "var(--pg-muted)", marginLeft: "auto" }}>
          {usesLabel}
        </span>
      </div>

      {error && (
        <div style={{ fontSize: 10, color: "var(--pg-red)" }}>{error}</div>
      )}
    </div>
  );
}
