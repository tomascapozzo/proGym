"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--pg-surface)",
  border: "1px solid var(--pg-border)",
  borderRadius: 9,
  padding: "0.65rem 0.85rem",
  color: "var(--pg-text)",
  fontSize: "0.88rem",
  outline: "none",
};

export default function ClubCreatorForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Sesión expirada. Volvé a iniciar sesión.");
      setLoading(false);
      return;
    }

    const { data: club, error: clubError } = await supabase
      .from("clubs")
      .insert({ name: name.trim(), description: description.trim() || null, created_by: user.id })
      .select("id")
      .single();

    if (clubError || !club) {
      setError(clubError?.message ?? "No se pudo crear el club.");
      setLoading(false);
      return;
    }

    const { error: memberError } = await supabase
      .from("club_members")
      .insert({ club_id: club.id, user_id: user.id, role: "admin", status: "active" });

    if (memberError) {
      setError(memberError.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
      <div>
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--pg-muted)", display: "block", marginBottom: 6 }}>Nombre del club</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Club Atlético San Martín"
          required
          maxLength={120}
          style={inputStyle}
        />
      </div>

      <div>
        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--pg-muted)", display: "block", marginBottom: 6 }}>Descripción <span style={{ color: "var(--pg-disabled)", fontWeight: 400 }}>(opcional)</span></label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Una breve descripción de tu club"
          rows={3}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
        />
      </div>

      {error && (
        <div style={{ fontSize: "0.8rem", color: "var(--pg-red)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "0.55rem 0.8rem" }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name.trim()}
        style={{
          marginTop: 4,
          background: loading || !name.trim() ? "var(--pg-accent-bg)" : "var(--pg-accent)",
          color: loading || !name.trim() ? "var(--pg-accent)" : "var(--pg-accent-text)",
          border: loading || !name.trim() ? "1px solid rgba(212,168,83,0.3)" : "none",
          borderRadius: 10,
          padding: "0.8rem",
          fontWeight: 800,
          fontSize: "0.88rem",
          cursor: loading || !name.trim() ? "default" : "pointer",
        }}
      >
        {loading ? "Creando..." : "Crear club"}
      </button>
    </form>
  );
}
