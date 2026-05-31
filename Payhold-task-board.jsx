import { useEffect, useState } from "react";

const TASKS = [
  {
    id: "auth-backend",
    phase: "P1",
    phaseColor: "#00D4A0",
    layer: "Backend",
    title: "JWT auth service",
    desc: "Register, login, refresh token, logout endpoints. Auth middleware for protected routes. BVN/NIN verification hooks.",
    skills: ["TypeScript", "Node.js", "Express", "JWT", "Prisma"],
    priority: "critical",
    effort: "3–4 days",
    file: "src/routes/auth.ts · src/middleware/auth.ts",
  },
  {
    id: "state-machine",
    phase: "P1",
    phaseColor: "#00D4A0",
    layer: "Backend",
    title: "Escrow state machine",
    desc: "12-state transaction engine. Every transition validated, logged, and event-emitted. The heart of PayHold — must be unbreakable.",
    skills: ["TypeScript", "Node.js", "Prisma", "PostgreSQL"],
    priority: "critical",
    effort: "4–5 days",
    file: "src/services/escrow/stateMachine.ts",
  },
  {
    id: "transactions-api",
    phase: "P1",
    phaseColor: "#00D4A0",
    layer: "Backend",
    title: "Transactions REST API",
    desc: "CRUD endpoints for transactions. State transition controllers. Zod validation. asyncHandler pattern throughout.",
    skills: ["TypeScript", "Express", "Zod", "Prisma", "REST API"],
    priority: "high",
    effort: "3–4 days",
    file: "src/routes/transactions.ts · src/controllers/",
  },
  {
    id: "paystack",
    phase: "P1",
    phaseColor: "#00D4A0",
    layer: "Backend",
    title: "Paystack integration",
    desc: "Initialize payment, verify webhook signature, fund escrow on confirmation. Kobo-only amounts. Payout/release flow to seller.",
    skills: ["TypeScript", "Node.js", "Paystack API", "Webhooks"],
    priority: "high",
    effort: "3–4 days",
    file: "src/services/payment/paystack.ts · webhook.ts",
  },
  {
    id: "mobile-auth",
    phase: "P1",
    phaseColor: "#00D4A0",
    layer: "Mobile",
    title: "Mobile auth screens",
    desc: "Connect Expo auth screens to real backend. Login, register, token storage, refresh logic. Replace all dummy AsyncStorage auth.",
    skills: ["React Native", "Expo", "TypeScript", "AsyncStorage"],
    priority: "high",
    effort: "2–3 days",
    file: "app/(auth)/index.tsx · hooks/useAuth.ts",
  },
  {
    id: "mobile-dashboard",
    phase: "P1",
    phaseColor: "#00D4A0",
    layer: "Mobile",
    title: "Dashboard + transaction flow",
    desc: "Wire dashboard, create-transaction, and transaction list screens to live API. Replace all dummy data. Handle loading/error states.",
    skills: ["React Native", "Expo Router", "TypeScript", "REST API"],
    priority: "high",
    effort: "3–4 days",
    file: "app/(app)/dashboard/ · components/",
  },
  {
    id: "disputes",
    phase: "P1",
    phaseColor: "#00D4A0",
    layer: "Backend",
    title: "Dispute system",
    desc: "Raise dispute, evidence upload (Supabase storage), 72hr SLA timer via BullMQ, admin resolution endpoint, partial fund release.",
    skills: ["TypeScript", "Node.js", "BullMQ", "Supabase", "Prisma"],
    priority: "medium",
    effort: "4–5 days",
    file: "src/routes/disputes.ts · src/services/dispute/",
  },
  {
    id: "reputation",
    phase: "P1",
    phaseColor: "#00D4A0",
    layer: "Backend",
    title: "Reputation scoring engine",
    desc: "Event-driven score updates on every transaction event. Decay cron job (monthly). Tier assignment. Score floor at 300.",
    skills: ["TypeScript", "Node.js", "BullMQ", "Prisma", "PostgreSQL"],
    priority: "medium",
    effort: "3–4 days",
    file: "src/services/reputation/scorer.ts · decay.ts",
  },
  {
    id: "notifications",
    phase: "P1",
    phaseColor: "#00D4A0",
    layer: "Backend",
    title: "Notification service",
    desc: "Expo push notifications for every state transition. SMS fallback via Termii. Notification preference management.",
    skills: ["TypeScript", "Node.js", "Expo Push API", "Termii"],
    priority: "medium",
    effort: "2–3 days",
    file: "src/services/notification/push.ts · sms.ts",
  },
  {
    id: "hold-window",
    phase: "P2",
    phaseColor: "#3B9EFF",
    layer: "Backend",
    title: "45-min dispatcher hold window",
    desc: "Redis TTL for window clock. BullMQ score loop every 90s. Composite scoring algorithm. Hard-assign at T=45:00. Geospatial route matching.",
    skills: ["TypeScript", "Redis", "BullMQ", "Node.js", "Geospatial"],
    priority: "future",
    effort: "5–7 days",
    file: "src/services/dispatcher/holdWindow.ts · scoring.ts · geo.ts",
  },
  {
    id: "dispatcher-app",
    phase: "P2",
    phaseColor: "#3B9EFF",
    layer: "Mobile",
    title: "Dispatcher mobile app",
    desc: "Separate dispatcher-facing app or tab. Accept/decline jobs. GPS tracking during transit. Package confirmation flow.",
    skills: ["React Native", "Expo", "TypeScript", "Maps SDK"],
    priority: "future",
    effort: "7–10 days",
    file: "app/(dispatcher)/ · new screens",
  },
  {
    id: "prisma-schema",
    phase: "P1",
    phaseColor: "#00D4A0",
    layer: "Database",
    title: "Full Prisma schema + migrations",
    desc: "Complete schema supporting all 6 phases. Nullable Phase 2+ fields. Audit log table (append-only). All enums defined. Supabase connection.",
    skills: ["Prisma", "PostgreSQL", "SQL", "Supabase"],
    priority: "critical",
    effort: "1–2 days",
    file: "prisma/schema.prisma · migrations/",
  },
];

const DEVS = ["Night", "Sulaiman", "Daniel", "Alex"];

const PRIORITY_META = {
  critical: { label: "Critical", color: "#E24B4A", bg: "rgba(226,75,74,.12)" },
  high:     { label: "High",     color: "#FFD166", bg: "rgba(255,209,102,.1)" },
  medium:   { label: "Medium",   color: "#00D4A0", bg: "rgba(0,212,160,.1)" },
  future:   { label: "Phase 2",  color: "#3B9EFF", bg: "rgba(59,158,255,.1)" },
};

const LAYER_COLORS = {
  Backend:  "#B77FFF",
  Mobile:   "#00D4A0",
  Database: "#FFD166",
};

export default function TaskBoard() {
  const [claims, setClaims] = useState({});
  const [openForm, setOpenForm] = useState(null);
  const [formState, setFormState] = useState({ name: "", skills: [] });
  const [filter, setFilter] = useState("All");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("payhold-claims");
        if (r) setClaims(JSON.parse(r.value));
      } catch {}
    })();
  }, []);

  async function saveClaim(taskId) {
    const task = TASKS.find(t => t.id === taskId);
    const matched = formState.skills.filter(s => task.skills.includes(s));
    const matchPct = Math.round((matched.length / task.skills.length) * 100);
    const newClaims = {
      ...claims,
      [taskId]: {
        name: formState.name,
        skills: formState.skills,
        matched,
        matchPct,
        claimedAt: new Date().toLocaleString("en-GB", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }),
      },
    };
    setClaims(newClaims);
    try { await window.storage.set("payhold-claims", JSON.stringify(newClaims)); } catch {}
    setOpenForm(null);
    setFormState({ name: "", skills: [] });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function releaseClaim(taskId) {
    const newClaims = { ...claims };
    delete newClaims[taskId];
    setClaims(newClaims);
    try { await window.storage.set("payhold-claims", JSON.stringify(newClaims)); } catch {}
  }

  function toggleSkill(skill) {
    setFormState(p => ({
      ...p,
      skills: p.skills.includes(skill) ? p.skills.filter(s => s !== skill) : [...p.skills, skill],
    }));
  }

  const layers = ["All", "Backend", "Mobile", "Database"];
  const filtered = filter === "All" ? TASKS : TASKS.filter(t => t.layer === filter);
  const claimedCount = Object.keys(claims).length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#060E1C", minHeight: "100vh", padding: "0 0 80px", color: "#F0EDE8" }}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "#0D1B2E", borderBottom: "1px solid rgba(255,255,255,.07)", padding: "20px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
        <div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, color: "#00D4A0", letterSpacing: "-.01em" }}>PayHold</div>
          <div style={{ fontSize: 11, color: "rgba(240,237,232,.35)", letterSpacing: ".1em", textTransform: "uppercase", marginTop: 1 }}>Task assignment board</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {saved && <div style={{ fontSize: 12, color: "#00D4A0", background: "rgba(0,212,160,.1)", padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(0,212,160,.3)" }}>Saved ✓</div>}
          <div style={{ fontSize: 13, color: "rgba(240,237,232,.5)" }}>
            <span style={{ color: "#00D4A0", fontWeight: 500 }}>{claimedCount}</span> / {TASKS.length} claimed
          </div>
          <div style={{ height: 4, width: 120, background: "rgba(255,255,255,.08)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(claimedCount / TASKS.length) * 100}%`, background: "#00D4A0", borderRadius: 2, transition: "width .4s" }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 0" }}>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
          {layers.map(l => (
            <button key={l} onClick={() => setFilter(l)} style={{ padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: "pointer", border: "1px solid", fontFamily: "'DM Sans', sans-serif", transition: "all .15s", background: filter === l ? (LAYER_COLORS[l] || "#00D4A0") : "transparent", borderColor: filter === l ? (LAYER_COLORS[l] || "#00D4A0") : "rgba(255,255,255,.12)", color: filter === l ? "#060E1C" : "rgba(240,237,232,.5)" }}>
              {l}
            </button>
          ))}
        </div>

        {/* Task list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(task => {
            const claim = claims[task.id];
            const isOpen = openForm === task.id;
            const pm = PRIORITY_META[task.priority];
            const lc = LAYER_COLORS[task.layer];

            return (
              <div key={task.id} style={{ background: "#0D1B2E", border: `1px solid ${claim ? "rgba(0,212,160,.25)" : "rgba(255,255,255,.07)"}`, borderRadius: 14, overflow: "hidden", transition: "border-color .2s" }}>

                {/* Task row */}
                <div style={{ padding: "18px 20px", display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "start" }}>
                  <div style={{ minWidth: 0 }}>
                    {/* Top meta row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: `${task.phaseColor}18`, border: `1px solid ${task.phaseColor}40`, color: task.phaseColor, letterSpacing: ".06em" }}>{task.phase}</span>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 4, background: `${lc}12`, color: lc, border: `1px solid ${lc}30` }}>{task.layer}</span>
                      <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 20, background: pm.bg, color: pm.color, border: `1px solid ${pm.color}40` }}>{pm.label}</span>
                      <span style={{ fontSize: 11, color: "rgba(240,237,232,.3)", marginLeft: "auto" }}>{task.effort}</span>
                    </div>

                    {/* Title + desc */}
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: "#F0EDE8", marginBottom: 5, letterSpacing: "-.01em" }}>{task.title}</div>
                    <div style={{ fontSize: 13, color: "rgba(240,237,232,.5)", lineHeight: 1.6, marginBottom: 10 }}>{task.desc}</div>

                    {/* File path */}
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(240,237,232,.25)", marginBottom: 10 }}>{task.file}</div>

                    {/* Required skills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {task.skills.map(s => (
                        <span key={s} style={{ fontSize: 11, padding: "2px 9px", borderRadius: 5, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", color: "rgba(240,237,232,.55)", fontFamily: "'JetBrains Mono', monospace" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Right: claim status + button */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                    {claim ? (
                      <>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: "#00D4A0", marginBottom: 1 }}>{claim.name}</div>
                          <div style={{ fontSize: 10, color: "rgba(240,237,232,.3)" }}>claimed {claim.claimedAt}</div>
                        </div>
                        <div style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: claim.matchPct >= 60 ? "rgba(0,212,160,.12)" : "rgba(255,209,102,.1)", color: claim.matchPct >= 60 ? "#00D4A0" : "#FFD166", border: `1px solid ${claim.matchPct >= 60 ? "rgba(0,212,160,.3)" : "rgba(255,209,102,.3)"}` }}>
                          {claim.matchPct}% skill match
                        </div>
                        <button onClick={() => releaseClaim(task.id)} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: "transparent", border: "1px solid rgba(226,75,74,.3)", color: "rgba(226,75,74,.7)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                          Release
                        </button>
                      </>
                    ) : (
                      <button onClick={() => { setOpenForm(isOpen ? null : task.id); setFormState({ name: "", skills: [] }); }} style={{ fontSize: 12, fontWeight: 500, padding: "8px 16px", borderRadius: 8, background: isOpen ? "rgba(0,212,160,.15)" : "transparent", border: `1px solid ${isOpen ? "#00D4A0" : "rgba(255,255,255,.15)"}`, color: isOpen ? "#00D4A0" : "rgba(240,237,232,.6)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap", transition: "all .15s" }}>
                        {isOpen ? "Cancel ✕" : "Claim task"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Claimed banner */}
                {claim && (
                  <div style={{ background: "rgba(0,212,160,.06)", borderTop: "1px solid rgba(0,212,160,.15)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,212,160,.2)", border: "1px solid rgba(0,212,160,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 700, color: "#00D4A0", flexShrink: 0 }}>
                      {claim.name[0]}
                    </div>
                    <div style={{ fontSize: 13, color: "rgba(240,237,232,.7)" }}>
                      <span style={{ color: "#00D4A0", fontWeight: 500 }}>{claim.name}</span> took this task
                      {claim.matched.length > 0 && <span style={{ color: "rgba(240,237,232,.4)" }}> · matched: {claim.matched.join(", ")}</span>}
                    </div>
                  </div>
                )}

                {/* Claim form */}
                {isOpen && !claim && (
                  <div style={{ background: "#060E1C", borderTop: "1px solid rgba(255,255,255,.07)", padding: "20px" }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "rgba(240,237,232,.4)", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 14 }}>Claim this task</div>

                    {/* Name select */}
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ fontSize: 12, color: "rgba(240,237,232,.45)", display: "block", marginBottom: 6 }}>Your name</label>
                      <select value={formState.name} onChange={e => setFormState(p => ({ ...p, name: e.target.value }))} style={{ width: "100%", maxWidth: 280, background: "#0D1B2E", border: "1px solid rgba(255,255,255,.12)", borderRadius: 8, padding: "8px 12px", color: formState.name ? "#F0EDE8" : "rgba(240,237,232,.3)", fontSize: 13, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", outline: "none" }}>
                        <option value="">Select your name…</option>
                        {DEVS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>

                    {/* Skills */}
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ fontSize: 12, color: "rgba(240,237,232,.45)", display: "block", marginBottom: 8 }}>Your skills — select what you bring to this task</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {task.skills.map(s => {
                          const sel = formState.skills.includes(s);
                          return (
                            <button key={s} onClick={() => toggleSkill(s)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 6, cursor: "pointer", border: "1px solid", fontFamily: "'JetBrains Mono', monospace", transition: "all .12s", background: sel ? "rgba(0,212,160,.15)" : "rgba(255,255,255,.04)", borderColor: sel ? "#00D4A0" : "rgba(255,255,255,.12)", color: sel ? "#00D4A0" : "rgba(240,237,232,.5)" }}>
                              {sel ? "✓ " : ""}{s}
                            </button>
                          );
                        })}
                      </div>

                      {/* Live match preview */}
                      {formState.skills.length > 0 && (
                        <div style={{ marginTop: 10, fontSize: 12, color: "rgba(240,237,232,.4)" }}>
                          Match preview: <span style={{ color: formState.skills.filter(s => task.skills.includes(s)).length / task.skills.length >= 0.6 ? "#00D4A0" : "#FFD166", fontWeight: 500 }}>
                            {Math.round((formState.skills.filter(s => task.skills.includes(s)).length / task.skills.length) * 100)}%
                          </span>
                          {" "}({formState.skills.filter(s => task.skills.includes(s)).length} of {task.skills.length} skills matched)
                        </div>
                      )}
                    </div>

                    {/* Save button */}
                    <button
                      onClick={() => formState.name && formState.skills.length > 0 && saveClaim(task.id)}
                      disabled={!formState.name || formState.skills.length === 0}
                      style={{ padding: "9px 22px", borderRadius: 8, fontSize: 13, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: formState.name && formState.skills.length > 0 ? "pointer" : "not-allowed", background: formState.name && formState.skills.length > 0 ? "#00D4A0" : "rgba(255,255,255,.05)", border: "none", color: formState.name && formState.skills.length > 0 ? "#060E1C" : "rgba(240,237,232,.2)", transition: "all .15s" }}
                    >
                      Save claim →
                    </button>
                    {(!formState.name || formState.skills.length === 0) && (
                      <span style={{ fontSize: 12, color: "rgba(240,237,232,.25)", marginLeft: 12 }}>
                        {!formState.name ? "Select your name first" : "Select at least one skill"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Summary footer */}
        <div style={{ marginTop: 40, background: "#0D1B2E", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "20px 24px" }}>
          <div style={{ fontSize: 11, color: "rgba(240,237,232,.3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 14 }}>Team coverage</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {DEVS.map(dev => {
              const devTasks = Object.entries(claims).filter(([, c]) => c.name === dev);
              return (
                <div key={dev} style={{ flex: "1 1 180px", background: "#060E1C", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(255,255,255,.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: devTasks.length > 0 ? "rgba(0,212,160,.15)" : "rgba(255,255,255,.06)", border: `1px solid ${devTasks.length > 0 ? "rgba(0,212,160,.4)" : "rgba(255,255,255,.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: devTasks.length > 0 ? "#00D4A0" : "rgba(240,237,232,.3)", fontFamily: "'Syne', sans-serif" }}>{dev[0]}</div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: devTasks.length > 0 ? "#F0EDE8" : "rgba(240,237,232,.35)" }}>{dev}</span>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "#00D4A0" }}>{devTasks.length} task{devTasks.length !== 1 ? "s" : ""}</span>
                  </div>
                  {devTasks.length > 0 ? devTasks.map(([id]) => {
                    const t = TASKS.find(tk => tk.id === id);
                    return <div key={id} style={{ fontSize: 11, color: "rgba(240,237,232,.4)", padding: "2px 0", borderLeft: "2px solid rgba(0,212,160,.3)", paddingLeft: 8, marginBottom: 3 }}>{t?.title}</div>;
                  }) : <div style={{ fontSize: 11, color: "rgba(240,237,232,.2)" }}>No tasks claimed yet</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}