"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { RedeemInvitationResult } from "@/types/club";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--pg-surface)",
  border: "1px solid var(--pg-border)",
  borderRadius: 9,
  padding: "0.7rem 0.9rem",
  color: "var(--pg-text)",
  fontSize: "1rem",
  letterSpacing: "0.1em",
  fontFamily: "var(--font-mono, monospace)",
  textTransform: "uppercase",
  outline: "none",
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code:     "El código no existe o fue revocado.",
  expired:          "Este código expiró.",
  max_uses_reached: "Este código ya alcanzó el máximo de usos.",
  already_member:   "Ya formás parte de un club.",
};

export default function ClubJoinForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const trimmed = code.trim().toUpperCase();

    const { data, error: rpcError } = await supabase.rpc("redeem_club_invitation", {
      p_code: trimmed,
    });

    if (rpcError) {
      setError(rpcError.message);
      setLoading(false);
      return;
    }

    const result = data as RedeemInvitationResult;
    if (result?.error) {
      setError(ERROR_MESSAGES[result.error] ?? "No se pudo canjear el código.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div>
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--pg-muted)", display: "block", marginBottom: 6 }}>Código de invitación</label>
        <input
          type="text"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="COACH-XXXXXX"
          required
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          style={inputStyle}
        />
        <div style={{ fontSize: "0.72rem", color: "var(--pg-disabled)", marginTop: 6 }}>
          Pedile el código a un entrenador o administrador de tu club.
        </div>
      </div>

      {error && (
        <div style={{ fontSize: "0.8rem", color: "var(--pg-red)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "0.55rem 0.8rem" }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !code.trim()}
        style={{
          marginTop: 4,
          background: loading || !code.trim() ? "var(--pg-accent-bg)" : "var(--pg-accent)",
          color: loading || !code.trim() ? "var(--pg-accent)" : "var(--pg-accent-text)",
          border: loading || !code.trim() ? "1px solid rgba(212,168,83,0.3)" : "none",
          borderRadius: 10,
          padding: "0.8rem",
          fontWeight: 800,
          fontSize: "0.88rem",
          cursor: loading || !code.trim() ? "default" : "pointer",
        }}
      >
        {loading ? "Validando..." : "Unirme al club"}
      </button>
    </form>
  );
}
