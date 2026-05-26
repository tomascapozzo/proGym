"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

      console.log("[login] signIn result:", { user: data?.user?.id, session: !!data?.session, error: authError?.message });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("[login] unexpected error:", err);
      setError("Error inesperado. Revisá la consola.");
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--pg-surface)",
    border: "1px solid var(--pg-border)",
    borderRadius: 9,
    padding: "0.75rem 1rem",
    color: "var(--pg-text)",
    fontSize: "0.9rem",
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--pg-bg)", padding: "2rem" }}>
      {/* background glow */}
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse, rgba(212,168,83,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 380, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.03em" }}>
            proGym <span style={{ color: "var(--pg-accent)" }}>Coach</span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--pg-muted)", marginTop: 6 }}>
            Iniciá sesión para continuar
          </div>
        </div>

        {/* Card */}
        <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 16, padding: "2rem" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--pg-muted)", display: "block", marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="coach@miclub.com"
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--pg-muted)", display: "block", marginBottom: 6 }}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{ fontSize: "0.82rem", color: "var(--pg-red)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "0.6rem 0.875rem" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: 4, background: loading ? "var(--pg-accent-bg)" : "var(--pg-accent)", color: loading ? "var(--pg-accent)" : "var(--pg-accent-text)", border: loading ? "1px solid rgba(212,168,83,0.3)" : "none", borderRadius: 10, padding: "0.875rem", fontWeight: 800, fontSize: "0.9rem", cursor: loading ? "default" : "pointer", transition: "all 0.2s" }}
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "var(--pg-muted)", marginTop: "1.25rem" }}>
          ¿No tenés cuenta?{" "}
          <Link href="/auth/signup" style={{ color: "var(--pg-accent)", textDecoration: "none", fontWeight: 600 }}>
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
