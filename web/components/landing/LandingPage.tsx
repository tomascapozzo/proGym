"use client";

import { useState } from "react";
import Link from "next/link";

type Lang = "es" | "en";

const CONTENT = {
  es: {
    navCta: "Unirme a la lista",
    badge: "Acceso anticipado",
    heroTitle: ["El panel de control que tu ", "cuerpo técnico", " siempre necesitó"],
    heroSub: "Asigná rutinas, monitoreá cargas y dales feedback a tus jugadores desde un solo lugar. Para clubes amateur que quieren entrenar como los profesionales.",
    heroPlh: "Tu email",
    heroBtn: "Quiero acceso anticipado",
    heroNote: "Sé parte de los primeros clubes en sumarse",
    heroOk: "¡Te anotamos! Te avisamos cuando esté listo.",
    probLabel: "El problema",
    probTitle: "WhatsApp y Excel no son suficientes",
    probDesc: "Mandás la rutina por WhatsApp. Nadie sabe si la hicieron. Pedís los datos y llegan tres días después, incompletos. Planificás a ciegas y los jugadores llegan a la práctica sin que nadie sepa en qué condición están.",
    probItems: ["Sin control de cumplimiento", "Sin datos de carga reales", "Sin feedback estructurado", "Comunicación dispersa"],
    painHeader: "Grupo WhatsApp — Plantel",
    noResponse: "14 jugadores sin responder — Vie 18:00",
    featLabel: "Funcionalidades",
    featTitle: "Todo lo que necesitás en un solo lugar",
    featSub: "Diseñado para preparadores físicos de clubes amateur que quieren datos reales sin la complejidad de las herramientas profesionales.",
    features: [
      { title: "Asignación de rutinas", desc: "Creá la rutina de la semana y asignala a todo el plantel o jugadores individuales. Ellos la ven directo en su app." },
      { title: "Control de cumplimiento", desc: "Sabé en tiempo real quién entrenó, quién no y con qué intensidad. Sin perseguir a nadie por WhatsApp." },
      { title: "Gestión de carga (ACWR)", desc: "El ratio carga aguda:crónica te muestra quién está en riesgo de lesión antes de que ocurra. La misma herramienta que usan los equipos de élite." },
      { title: "Feedback por sesión", desc: "Revisá los sets, repeticiones y RPE de cada jugador y dejales comentarios directamente en la app." },
    ],
    howLabel: "Cómo funciona",
    howTitle: "Empezar es simple",
    steps: [
      { num: "01", title: "Creá tu equipo", desc: "Registrate como entrenador, creá tu equipo e invitá a tus jugadores con un link o código." },
      { num: "02", title: "Asigná las rutinas", desc: "Diseñá la semana de entrenamiento y enviala al plantel con un click." },
      { num: "03", title: "Monitoreá el progreso", desc: "Seguí el cumplimiento, la carga y la evolución de cada jugador desde tu dashboard." },
    ],
    analyLabel: "Analytics",
    analyTitle: "Datos que te ayudan a tomar mejores decisiones",
    analySub: "Visualizá la carga de cada jugador, detectá riesgos antes de que se conviertan en lesiones y entendé cómo evoluciona el equipo a lo largo de la temporada.",
    stats: [
      { value: "ACWR", label: "Ratio carga aguda:crónica", color: "var(--pg-accent)" },
      { value: "100%", label: "Visibilidad del plantel", color: "var(--pg-blue)" },
      { value: "0", label: "Planillas de Excel necesarias", color: "var(--pg-purple)" },
    ],
    dashTitle: "Carga del plantel",
    dashWeek: "Semana 12",
    ctaTitle: "Sé de los primeros en sumarte",
    ctaSub: "Estamos armando el grupo de clubes piloto. Anotate y te contactamos cuando estemos listos.",
    ctaPlh: "Tu email",
    ctaBtn: "Quiero acceso anticipado",
    ctaOk: "¡Te anotamos! Te avisamos cuando esté listo.",
    ctaNote: "Sin spam. Te avisamos cuando esté listo.",
    footerTag: "Entrenamiento inteligente para equipos reales.",
    footerLinks: ["Inicio", "Características", "Cómo funciona", "Contacto"],
    footerCopy: "© 2026 proGym. Todos los derechos reservados.",
  },
  en: {
    navCta: "Join the waitlist",
    badge: "Early access",
    heroTitle: ["The coaching dashboard your ", "staff", " always needed"],
    heroSub: "Assign routines, monitor training load, and give feedback to every player — all from one place. Built for amateur clubs that want to train like professionals.",
    heroPlh: "Your email",
    heroBtn: "Get early access",
    heroNote: "Be among the first clubs to join",
    heroOk: "You're on the list! We'll reach out when we're ready.",
    probLabel: "The problem",
    probTitle: "WhatsApp and Excel aren't enough",
    probDesc: "You send the routine on WhatsApp. Nobody knows if players did it. You ask for the data and it arrives three days later, incomplete. You plan blind and players show up to practice with no one knowing what condition they're in.",
    probItems: ["No compliance tracking", "No real load data", "No structured feedback", "Scattered communication"],
    painHeader: "WhatsApp Group — Squad",
    noResponse: "14 players haven't responded — Fri 18:00",
    featLabel: "Features",
    featTitle: "Everything you need in one place",
    featSub: "Built for physical trainers at amateur clubs who want real data without the complexity of professional tools.",
    features: [
      { title: "Routine assignment", desc: "Create the week's routine and assign it to the full squad or individual players. They see it directly in their app." },
      { title: "Compliance tracking", desc: "Know in real time who trained, who didn't, and at what intensity. No chasing anyone on WhatsApp." },
      { title: "Load management (ACWR)", desc: "The acute:chronic workload ratio shows you who's at injury risk before it happens. The same tool elite teams use." },
      { title: "Per-session feedback", desc: "Review each player's sets, reps, and RPE and leave comments directly in the app." },
    ],
    howLabel: "How it works",
    howTitle: "Getting started is simple",
    steps: [
      { num: "01", title: "Create your team", desc: "Sign up as a coach, create your team, and invite your players with a link or code." },
      { num: "02", title: "Assign routines", desc: "Design the training week and send it to the squad with one click." },
      { num: "03", title: "Monitor progress", desc: "Track compliance, load, and each player's development from your dashboard." },
    ],
    analyLabel: "Analytics",
    analyTitle: "Data that helps you make better decisions",
    analySub: "Visualize each player's training load, detect risks before they become injuries, and understand how the team evolves across the season.",
    stats: [
      { value: "ACWR", label: "Acute:chronic workload ratio", color: "var(--pg-accent)" },
      { value: "100%", label: "Full squad visibility", color: "var(--pg-blue)" },
      { value: "0", label: "Excel spreadsheets needed", color: "var(--pg-purple)" },
    ],
    dashTitle: "Squad load",
    dashWeek: "Week 12",
    ctaTitle: "Be among the first to join",
    ctaSub: "We're putting together a pilot club group. Sign up and we'll reach out when we're ready.",
    ctaPlh: "Your email",
    ctaBtn: "Get early access",
    ctaOk: "You're on the list! We'll reach out when we're ready.",
    ctaNote: "No spam. We'll let you know when it's ready.",
    footerTag: "Smart training for real teams.",
    footerLinks: ["Home", "Features", "How it works", "Contact"],
    footerCopy: "© 2026 proGym. All rights reserved.",
  },
} as const;

const PLAYERS = [
  { init: "MG", name: "M. García",   compliance: 100, acwr: "1.1", pill: "green" },
  { init: "RL", name: "R. López",    compliance: 60,  acwr: "1.6", pill: "red"   },
  { init: "NF", name: "N. Ferreyra", compliance: 100, acwr: "0.9", pill: "green" },
  { init: "PA", name: "P. Acosta",   compliance: 80,  acwr: "1.4", pill: "amber" },
  { init: "JM", name: "J. Morales",  compliance: 40,  acwr: "0.7", pill: "blue"  },
];

const PILL_STYLES: Record<string, React.CSSProperties> = {
  green: { background: "rgba(74,222,128,0.13)", color: "var(--pg-green)" },
  red:   { background: "rgba(239,68,68,0.13)",  color: "var(--pg-red)"   },
  amber: { background: "rgba(245,158,11,0.13)", color: "var(--pg-amber)" },
  blue:  { background: "rgba(14,165,233,0.13)", color: "var(--pg-blue)"  },
};

const FEATURE_ICONS = [
  // clipboard
  <svg key="clipboard" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  // check-circle
  <svg key="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  // activity
  <svg key="activity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  // message
  <svg key="message" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={20} height={20}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
];

function WaitlistForm({ id, placeholder, btnLabel, okText }: { id: string; placeholder: string; btnLabel: string; okText: string }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  function submit() {
    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setError(true);
      setTimeout(() => setError(false), 1800);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 12, padding: "0.875rem 1.25rem", color: "var(--pg-green)", fontWeight: 600, maxWidth: 420, margin: "0 auto" }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><polyline points="20 6 9 17 4 12"/></svg>
        {okText}
      </div>
    );
  }

  return (
    <form id={id} onSubmit={e => { e.preventDefault(); submit(); }} style={{ display: "flex", gap: 10, width: "100%", maxWidth: 480, margin: "0 auto" }}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          background: "var(--pg-surface)",
          border: `1px solid ${error ? "var(--pg-red)" : "var(--pg-border)"}`,
          borderRadius: 10,
          padding: "0.875rem 1.25rem",
          color: "var(--pg-text)",
          fontSize: "0.95rem",
          outline: "none",
          transition: "border-color 0.2s",
        }}
      />
      <button type="submit" style={{ background: "var(--pg-accent)", color: "var(--pg-accent-text)", border: "none", borderRadius: 10, padding: "0.875rem 1.4rem", fontWeight: 800, fontSize: "0.875rem", cursor: "pointer", whiteSpace: "nowrap" }}>
        {btnLabel}
      </button>
    </form>
  );
}

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("es");
  const c = CONTENT[lang];

  return (
    <div style={{ background: "var(--pg-bg)", color: "var(--pg-text)", fontFamily: "inherit", overflowX: "hidden" }}>

      {/* ── NAV ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, padding: "1rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(10,15,26,0.85)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(30,41,59,0.6)" }}>
        <span style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em" }}>
          proGym <span style={{ color: "var(--pg-accent)" }}>Coach</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ background: "var(--pg-surface)", border: "1px solid var(--pg-border)", borderRadius: 8, padding: "0.3rem", display: "flex", gap: 2 }}>
            {(["es", "en"] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ padding: "0.2rem 0.6rem", borderRadius: 5, fontSize: "0.8rem", fontWeight: 700, border: "none", cursor: "pointer", transition: "all 0.2s", background: lang === l ? "var(--pg-accent)" : "transparent", color: lang === l ? "var(--pg-accent-text)" : "var(--pg-muted)" }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <a href="#waitlist" style={{ background: "var(--pg-accent)", color: "var(--pg-accent-text)", borderRadius: 9, padding: "0.55rem 1.2rem", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none" }}>
            {c.navCta}
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "9rem 2rem 7rem", position: "relative", overflow: "hidden" }}>
        {/* dot grid */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(110,231,183,0.07) 1px, transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
        {/* glow */}
        <div style={{ position: "absolute", top: "10%", left: "50%", transform: "translateX(-50%)", width: 700, height: 500, background: "radial-gradient(ellipse, rgba(110,231,183,0.12) 0%, transparent 68%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--pg-accent-bg)", border: "1px solid rgba(110,231,183,0.35)", color: "var(--pg-accent)", borderRadius: 100, padding: "0.35rem 1rem", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "1.75rem" }}>
            <span style={{ width: 6, height: 6, background: "var(--pg-accent)", borderRadius: "50%", display: "inline-block" }} />
            {c.badge}
          </div>

          <h1 style={{ fontSize: "clamp(2rem,5vw,3.6rem)", fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em", maxWidth: 820, marginBottom: "1.5rem" }}>
            {c.heroTitle[0]}<em style={{ fontStyle: "normal", color: "var(--pg-accent)" }}>{c.heroTitle[1]}</em>{c.heroTitle[2]}
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--pg-muted)", maxWidth: 560, marginBottom: "2.5rem", lineHeight: 1.75 }}>
            {c.heroSub}
          </p>

          <WaitlistForm id="hero-form" placeholder={c.heroPlh} btnLabel={c.heroBtn} okText={c.heroOk} />
          <p style={{ marginTop: "1rem", fontSize: "0.83rem", color: "var(--pg-disabled)" }}>{c.heroNote}</p>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section style={{ padding: "6rem 2rem", maxWidth: 1100, margin: "0 auto", borderTop: "1px solid var(--pg-border)" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pg-accent)", marginBottom: "0.875rem" }}>{c.probLabel}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "clamp(1.75rem,3vw,2.6rem)", fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: "1rem" }}>{c.probTitle}</h2>
            <p style={{ fontSize: "1rem", color: "var(--pg-muted)", lineHeight: 1.8, marginBottom: "1.75rem" }}>{c.probDesc}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {c.probItems.map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.95rem", color: "var(--pg-muted)" }}>
                  <span style={{ color: "var(--pg-red)", fontWeight: 800 }}>✕</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          {/* WhatsApp mockup */}
          <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 16, overflow: "hidden" }}>
            <div style={{ background: "var(--pg-surface)", padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--pg-border)", fontSize: "0.78rem", fontWeight: 600, color: "var(--pg-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.painHeader}</div>
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: "rgba(14,165,233,0.1)", borderLeft: "3px solid var(--pg-blue)", borderRadius: 10, padding: "0.75rem 1rem", fontSize: "0.875rem", color: "var(--pg-muted)" }}>
                Rutina semana 12 — adjunto PDF
                <div style={{ fontSize: "0.72rem", color: "var(--pg-disabled)", marginTop: 4 }}>Coach · Lun 08:14</div>
              </div>
              <div style={{ background: "var(--pg-surface)", borderRadius: 10, padding: "0.75rem 1rem", fontSize: "0.875rem", color: "var(--pg-muted)" }}>
                Ok profe!<div style={{ fontSize: "0.72rem", color: "var(--pg-disabled)", marginTop: 4 }}>Ramiro · Lun 09:02</div>
              </div>
              <div style={{ background: "var(--pg-surface)", borderRadius: 10, padding: "0.75rem 1rem", fontSize: "0.875rem", color: "var(--pg-muted)" }}>
                👍<div style={{ fontSize: "0.72rem", color: "var(--pg-disabled)", marginTop: 4 }}>Nicolás · Lun 09:45</div>
              </div>
              <div style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "0.75rem 1rem", fontSize: "0.8rem", color: "var(--pg-red)", textAlign: "center" }}>{c.noResponse}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "6rem 2rem", maxWidth: 1100, margin: "0 auto", borderTop: "1px solid var(--pg-border)" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pg-accent)", marginBottom: "0.875rem" }}>{c.featLabel}</div>
        <h2 style={{ fontSize: "clamp(1.75rem,3vw,2.6rem)", fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: "0.75rem" }}>{c.featTitle}</h2>
        <p style={{ fontSize: "1.05rem", color: "var(--pg-muted)", maxWidth: 540, lineHeight: 1.75, marginBottom: "3rem" }}>{c.featSub}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1.25rem" }}>
          {c.features.map((f, i) => (
            <div key={f.title} style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 16, padding: "2rem", transition: "border-color 0.2s" }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: "var(--pg-accent-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", color: "var(--pg-accent)" }}>
                {FEATURE_ICONS[i]}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>{f.title}</div>
              <div style={{ fontSize: "0.875rem", color: "var(--pg-muted)", lineHeight: 1.7 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "6rem 2rem", maxWidth: 1100, margin: "0 auto", borderTop: "1px solid var(--pg-border)", textAlign: "center" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pg-accent)", marginBottom: "0.875rem" }}>{c.howLabel}</div>
        <h2 style={{ fontSize: "clamp(1.75rem,3vw,2.6rem)", fontWeight: 900, letterSpacing: "-0.025em", marginBottom: "3.5rem" }}>{c.howTitle}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2rem", position: "relative" }}>
          <div style={{ position: "absolute", top: 27, left: "calc(16.66% + 28px)", right: "calc(16.66% + 28px)", height: 1, background: "linear-gradient(90deg, rgba(110,231,183,0.5), rgba(30,41,59,0.8))" }} />
          {c.steps.map(s => (
            <div key={s.num} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 54, height: 54, borderRadius: "50%", background: "var(--pg-accent-bg)", border: "2px solid rgba(110,231,183,0.45)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.82rem", fontWeight: 900, color: "var(--pg-accent)", marginBottom: "1.25rem", position: "relative", zIndex: 1 }}>{s.num}</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.4rem" }}>{s.title}</div>
              <div style={{ fontSize: "0.865rem", color: "var(--pg-muted)", lineHeight: 1.65 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ANALYTICS ── */}
      <section style={{ padding: "6rem 2rem", maxWidth: 1100, margin: "0 auto", borderTop: "1px solid var(--pg-border)" }}>
        <div style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pg-accent)", marginBottom: "0.875rem" }}>{c.analyLabel}</div>
        <h2 style={{ fontSize: "clamp(1.75rem,3vw,2.6rem)", fontWeight: 900, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: "0.75rem" }}>{c.analyTitle}</h2>
        <p style={{ fontSize: "1.05rem", color: "var(--pg-muted)", maxWidth: 540, lineHeight: 1.75, marginBottom: "3rem" }}>{c.analySub}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "3.5rem", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
            {c.stats.map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1, color: s.color, letterSpacing: "-0.03em" }}>{s.value}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--pg-muted)" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Dashboard mockup */}
          <div style={{ background: "var(--pg-card)", border: "1px solid var(--pg-border)", borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
            <div style={{ background: "var(--pg-surface)", padding: "0.875rem 1.25rem", borderBottom: "1px solid var(--pg-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--pg-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{c.dashTitle}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--pg-disabled)" }}>{c.dashWeek}</span>
            </div>
            <div style={{ padding: "0.5rem 1.25rem 1rem" }}>
              {PLAYERS.map((p, i) => (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "0.75rem 0", borderBottom: i < PLAYERS.length - 1 ? "1px solid rgba(30,41,59,0.5)" : "none" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--pg-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68rem", fontWeight: 800, color: "var(--pg-muted)", flexShrink: 0 }}>{p.init}</div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 500, flex: 1 }}>{p.name}</div>
                  <div style={{ width: 72 }}>
                    <div style={{ height: 4, background: "var(--pg-surface)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p.compliance}%`, background: "var(--pg-accent)", borderRadius: 2 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, padding: "0.22rem 0.6rem", borderRadius: 100, minWidth: 56, textAlign: "center", ...PILL_STYLES[p.pill] }}>
                    ACWR {p.acwr}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="waitlist" style={{ padding: "6rem 2rem", maxWidth: 1100, margin: "0 auto", borderTop: "1px solid var(--pg-border)" }}>
        <div style={{ background: "linear-gradient(140deg, var(--pg-accent-bg) 0%, var(--pg-accent-alt) 100%)", border: "1px solid rgba(110,231,183,0.2)", borderRadius: 24, padding: "5rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(110,231,183,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
          <h2 style={{ fontSize: "clamp(1.75rem,3vw,2.5rem)", fontWeight: 900, letterSpacing: "-0.025em", marginBottom: "1rem", position: "relative" }}>{c.ctaTitle}</h2>
          <p style={{ color: "var(--pg-muted)", fontSize: "1.05rem", marginBottom: "2.25rem", position: "relative" }}>{c.ctaSub}</p>
          <div style={{ position: "relative" }}>
            <WaitlistForm id="cta-form" placeholder={c.ctaPlh} btnLabel={c.ctaBtn} okText={c.ctaOk} />
          </div>
          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "var(--pg-disabled)", position: "relative" }}>{c.ctaNote}</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--pg-border)", padding: "2.5rem 2.5rem 3rem", maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
        <div>
          <div style={{ fontSize: "1rem", fontWeight: 800 }}>proGym <span style={{ color: "var(--pg-accent)" }}>Coach</span></div>
          <div style={{ fontSize: "0.82rem", color: "var(--pg-muted)", marginTop: 4 }}>{c.footerTag}</div>
        </div>
        <ul style={{ listStyle: "none", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
          {c.footerLinks.map(l => (
            <li key={l}><a href="#" style={{ fontSize: "0.85rem", color: "var(--pg-muted)", textDecoration: "none" }}>{l}</a></li>
          ))}
        </ul>
        <div style={{ width: "100%", textAlign: "center", fontSize: "0.78rem", color: "var(--pg-disabled)", paddingTop: "1.5rem", borderTop: "1px solid var(--pg-border)" }}>{c.footerCopy}</div>
      </footer>
    </div>
  );
}
