"use client";

import React, { useState, useEffect } from "react";

function SledixLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <path
        d="M76 32 C76 20 64 14 52 18 C40 22 36 32 42 40 C48 48 68 50 74 60 C80 70 74 84 60 88 C46 92 36 84 36 74"
        stroke="currentColor" strokeWidth="8" strokeLinecap="square" fill="none"
      />
    </svg>
  );
}

const COMPETITORS = [
  { id: 1, name: "Crayon",    score: 87, delta: +3,  risk: "low",    tags: ["PRICING","PRODUCT"],   lastSeen: "2m ago",  website: "crayon.co",   employees: 120, founded: 2016 },
  { id: 2, name: "Klue",      score: 74, delta: +11, risk: "medium", tags: ["HIRING","GROWTH"],     lastSeen: "14m ago", website: "klue.com",    employees: 200, founded: 2015 },
  { id: 3, name: "Signum.AI", score: 61, delta: -4,  risk: "low",    tags: ["REVIEWS","RISK"],      lastSeen: "1h ago",  website: "signum.ai",   employees: 45,  founded: 2019 },
  { id: 4, name: "Kompyte",   score: 49, delta: +2,  risk: "low",    tags: ["PRODUCT","AI"],        lastSeen: "3h ago",  website: "kompyte.com", employees: 60,  founded: 2014 },
];

const SIGNALS = [
  { id: 1,  co: "Crayon",    msg: "Pricing page updated — Pro plan increased by $20/mo",     tag: "PRICING",   t: "2m",  important: true },
  { id: 2,  co: "Klue",      msg: "8 new job postings: 5× Engineer, 2× Sales, 1× Designer", tag: "HIRING",    t: "14m", important: true },
  { id: 3,  co: "Signum.AI", msg: "11 new G2 reviews — avg 3.2 stars (down from 4.1)",      tag: "REVIEWS",   t: "31m", important: false },
  { id: 4,  co: "Crayon",    msg: "New blog: 'AI-powered battle cards — what's next'",       tag: "CONTENT",   t: "1h",  important: false },
  { id: 5,  co: "Kompyte",   msg: "Homepage headline changed: focus shift to 'real-time'",  tag: "MESSAGING", t: "2h",  important: false },
  { id: 6,  co: "Klue",      msg: "Partnership announced with HubSpot — CRM integration",   tag: "PR",        t: "3h",  important: true },
  { id: 7,  co: "Signum.AI", msg: "Terms of Service updated — data retention section 4.2",  tag: "LEGAL",     t: "5h",  important: false },
  { id: 8,  co: "Crayon",    msg: "New feature: AI-generated summaries in weekly digest",   tag: "PRODUCT",   t: "6h",  important: true },
  { id: 9,  co: "Kompyte",   msg: "Raised $8M Series A — Sequoia Capital led",              tag: "FUNDING",   t: "1d",  important: true },
  { id: 10, co: "Klue",      msg: "Glassdoor rating dropped from 4.2 to 3.8",               tag: "REVIEWS",   t: "1d",  important: false },
];

const BATTLE_CARDS = [
  {
    id: 1, competitor: "Crayon", updated: "Today",
    weaknesses: ["$15K/yr minimum — too expensive for startups", "Complex onboarding — takes 2+ weeks to set up", "No real-time alerts — daily digest only"],
    strengths:  ["Large enterprise customer base", "Good integrations ecosystem", "Strong brand recognition"],
    ourEdge:    ["6× cheaper at $49/mo", "5-minute setup, no training needed", "Real-time signals vs daily digest"],
    objections: [
      { q: "Crayon is the industry standard", a: "Standard for enterprise, yes. For startups and growth teams, it's overkill and overpriced. We do 80% of what matters at 10% of the cost." },
      { q: "We already use Crayon", a: "Great — try us for one month free alongside it. Most teams switch after seeing real-time vs daily updates." },
    ],
  },
  {
    id: 2, competitor: "Klue", updated: "Yesterday",
    weaknesses: ["Requires dedicated CI manager to operate", "Slow battle card updates — manual process", "Expensive Slack add-on sold separately"],
    strengths:  ["Excellent battle card UX", "Strong sales enablement focus", "Good customer support"],
    ourEdge:    ["Battle cards auto-update from signals", "Slack integration included in all plans", "No dedicated manager needed"],
    objections: [
      { q: "Klue has better battle cards", a: "Klue's cards look great but need manual updates. Ours refresh automatically when a competitor changes something — zero effort." },
    ],
  },
  {
    id: 3, competitor: "Signum.AI", updated: "3 days ago",
    weaknesses: ["Uses human trend-spotters — not scalable", "Limited to marketing and ad signals", "No hiring or legal signal monitoring"],
    strengths:  ["Strong social signal detection", "Good ad campaign tracking"],
    ourEdge:    ["Full-spectrum: 6 signal types covered", "Fully automated — no humans in the loop", "Hiring + legal + reviews included"],
    objections: [
      { q: "Signum tracks social better", a: "They do social well. We do social + pricing + hiring + reviews + legal + PR. One platform, not six tools." },
    ],
  },
];

const TAG_COLOR: Record<string, string> = {
  PRICING: "#f59e0b", HIRING: "#60a5fa", REVIEWS: "#f87171",
  CONTENT: "#a78bfa", MESSAGING: "#34d399", PR: "#fb923c",
  LEGAL: "#e879f9", PRODUCT: "#38bdf8", FUNDING: "#4ade80",
  GROWTH: "#34d399", RISK: "#f87171", AI: "#a78bfa",
};

const RISK_COLOR: Record<string, string> = { low: "#34d399", medium: "#f59e0b", high: "#f87171" };
const CHART_DATA = [14, 22, 18, 31, 27, 19, 38];
const CHART_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Tag({ label }: { label: string }) {
  const color = TAG_COLOR[label] || "#888";
  return <span className="text-[8px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wide" style={{ color, background: `${color}18` }}>{label}</span>;
}

function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
      <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30">{title}</p>
      {action && <button onClick={onAction} className="text-[10px] font-mono text-white/20 hover:text-white/50 transition-colors">{action}</button>}
    </div>
  );
}

function BarChart() {
  const max = Math.max(...CHART_DATA);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {CHART_DATA.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full rounded-sm" style={{ height: `${(v / max) * 52}px`, background: i === 6 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.12)" }}/>
          <span className="text-[8px] font-mono text-white/20">{CHART_DAYS[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Pages ──────────────────────────────────────────────────────────────────────

function PageDashboard({ onNav }: { onNav: (p: string) => void }) {
  const [newSignal, setNewSignal] = useState(false);
  useEffect(() => { const t = setTimeout(() => setNewSignal(true), 3000); return () => clearTimeout(t); }, []);

  return (
    <div className="p-6 space-y-4 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Competitors tracked", value: "4",  sub: "2 with new signals today", color: "white" },
          { label: "Signals this week",   value: "38", sub: "↑ 22% vs last week",       color: "#34d399" },
          { label: "High priority",       value: "3",  sub: "Require your attention",   color: "#f59e0b" },
          { label: "Last scan",           value: "2m", sub: "Next scan in 8 minutes",   color: "white" },
        ].map((s, i) => (
          <div key={i} className="border border-white/[0.07] rounded-2xl p-5 bg-white/[0.02]">
            <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-white/25 mb-3">{s.label}</p>
            <p className="font-display text-3xl font-bold tracking-tight mb-1" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[11px] text-white/30 font-light">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
          <SectionHeader title="Competitors" action="View all →" onAction={() => onNav("competitors")}/>
          <div className="divide-y divide-white/[0.04]">
            {COMPETITORS.map(c => (
              <div key={c.id} onClick={() => onNav("competitors")}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-white/50 shrink-0">{c.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-white">{c.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: RISK_COLOR[c.risk] }}/>
                  </div>
                  <div className="flex gap-1">{c.tags.map(t => <Tag key={t} label={t}/>)}</div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-xl font-bold text-white">{c.score}</p>
                  <p className={`text-[10px] font-mono ${c.delta > 0 ? "text-red-400" : "text-emerald-400"}`}>{c.delta > 0 ? `+${c.delta}` : c.delta} pts</p>
                </div>
                <p className="text-[10px] font-mono text-white/20 shrink-0 w-14 text-right">{c.lastSeen}</p>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-0 group-hover:opacity-30 transition-opacity shrink-0">
                  <path d="M3 7h8M8 4l3 3-3 3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>
        </div>

        <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30">Signals / week</p>
            <p className="text-[10px] font-mono text-emerald-400">↑ 22%</p>
          </div>
          <BarChart/>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[["PRICING",8],["HIRING",14],["REVIEWS",7],["CONTENT",9]].map(([l,n]) => (
              <div key={l} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: TAG_COLOR[l as string] }}/>
                <span className="text-[10px] text-white/30 font-mono flex-1">{l}</span>
                <span className="text-[10px] text-white/50 font-mono">{n}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
            <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30">Live signal feed</p>
          </div>
          <button onClick={() => onNav("signals")} className="text-[10px] font-mono text-white/20 hover:text-white/50 transition-colors">View all →</button>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {SIGNALS.slice(0,5).map((s,i) => (
            <div key={s.id} className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors ${i===0&&newSignal?"bg-amber-500/5":""}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.important?"bg-white/50":"bg-white/[0.12]"}`}/>
              <span className="text-xs font-medium text-white/60 w-20 shrink-0">{s.co}</span>
              <p className="flex-1 text-xs text-white/35 font-light">{s.msg}</p>
              <span className="text-[9px] font-mono font-bold tracking-widest shrink-0" style={{ color: TAG_COLOR[s.tag] }}>{s.tag}</span>
              <span className="text-[10px] font-mono text-white/20 shrink-0 w-8 text-right">{s.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageCompetitors() {
  const [selected, setSelected] = useState<typeof COMPETITORS[0] | null>(null);
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
          <SectionHeader title="All competitors"/>
          <div className="divide-y divide-white/[0.04]">
            {COMPETITORS.map(c => (
              <div key={c.id} onClick={() => setSelected(c)}
                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${selected?.id===c.id?"bg-white/[0.06]":"hover:bg-white/[0.02]"}`}>
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/50 shrink-0">{c.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{c.name}</p>
                  <p className="text-[10px] text-white/25 font-mono">{c.website}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-bold text-white">{c.score}</p>
                  <p className={`text-[9px] font-mono ${c.delta>0?"text-red-400":"text-emerald-400"}`}>{c.delta>0?`+${c.delta}`:c.delta}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4">
            <button className="w-full border border-white/10 rounded-xl py-2.5 text-[11px] font-mono text-white/30 hover:text-white hover:border-white/20 transition-colors">+ Add competitor</button>
          </div>
        </div>

        <div className="col-span-2 border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
          {selected ? (
            <>
              <div className="px-6 py-5 border-b border-white/[0.06] flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-sm font-bold text-white/50">{selected.name[0]}</div>
                <div>
                  <h2 className="font-display text-xl font-bold">{selected.name}</h2>
                  <p className="text-[11px] text-white/30 font-mono">{selected.website} · {selected.employees} employees · Founded {selected.founded}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-display text-3xl font-bold">{selected.score}</p>
                  <p className="text-[10px] font-mono text-white/30">Threat score</p>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/25 mb-3">Recent signals</p>
                  <div className="space-y-2">
                    {SIGNALS.filter(s => s.co === selected.name).map(s => (
                      <div key={s.id} className="flex items-center gap-3 px-4 py-3 border border-white/[0.06] rounded-xl">
                        <span className="text-[9px] font-mono font-bold tracking-widest" style={{ color: TAG_COLOR[s.tag] }}>{s.tag}</span>
                        <p className="flex-1 text-xs text-white/40 font-light">{s.msg}</p>
                        <span className="text-[10px] font-mono text-white/20">{s.t}</span>
                      </div>
                    ))}
                    {SIGNALS.filter(s => s.co === selected.name).length === 0 && (
                      <p className="text-xs text-white/20 font-mono px-1">No signals yet</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/25 mb-3">Signal types</p>
                  <div className="flex gap-2 flex-wrap">{selected.tags.map(t => <Tag key={t} label={t}/>)}</div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 border border-white/[0.06] rounded-xl">
                  <span className="w-2 h-2 rounded-full" style={{ background: RISK_COLOR[selected.risk] }}/>
                  <span className="text-xs text-white/50 font-mono capitalize">{selected.risk} risk</span>
                  <span className="ml-auto text-[10px] text-white/20 font-mono">Last seen {selected.lastSeen}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-white/15 text-sm font-mono">← Select a competitor</div>
          )}
        </div>
      </div>
    </div>
  );
}

function PageSignals() {
  const [filter, setFilter] = useState("ALL");
  const tags = ["ALL","PRICING","HIRING","REVIEWS","CONTENT","PR","LEGAL","PRODUCT","FUNDING"];
  const filtered = filter === "ALL" ? SIGNALS : SIGNALS.filter(s => s.tag === filter);
  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-4">
      <div className="flex gap-1.5 flex-wrap">
        {tags.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-colors ${
              filter===t ? "bg-white text-[#080809] font-bold" : "border border-white/[0.08] text-white/30 hover:text-white hover:border-white/20"
            }`}>
            {t}
          </button>
        ))}
      </div>
      <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
        <SectionHeader title={`${filtered.length} signals`}/>
        <div className="divide-y divide-white/[0.04]">
          {filtered.map(s => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.important?"bg-white/60":"bg-white/[0.12]"}`}/>
              <span className="text-xs font-medium text-white/70 w-24 shrink-0">{s.co}</span>
              <p className="flex-1 text-xs text-white/40 font-light leading-relaxed">{s.msg}</p>
              <Tag label={s.tag}/>
              <span className="text-[10px] font-mono text-white/20 w-10 text-right shrink-0">{s.t}</span>
              {s.important && <span className="text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 text-white/25 shrink-0">key</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageBattleCards() {
  const [selected, setSelected] = useState(BATTLE_CARDS[0]);
  const [openObj, setOpenObj] = useState<number|null>(null);
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
          <SectionHeader title="Battle cards"/>
          <div className="divide-y divide-white/[0.04]">
            {BATTLE_CARDS.map(bc => (
              <div key={bc.id} onClick={() => { setSelected(bc); setOpenObj(null); }}
                className={`px-4 py-4 cursor-pointer transition-colors ${selected.id===bc.id?"bg-white/[0.06]":"hover:bg-white/[0.02]"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/50">{bc.competitor[0]}</div>
                  <div>
                    <p className="text-sm font-medium text-white">vs {bc.competitor}</p>
                    <p className="text-[10px] text-white/25 font-mono">Updated {bc.updated}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">vs {selected.competitor}</h2>
              <p className="text-[10px] text-white/25 font-mono">Updated {selected.updated}</p>
            </div>
            <button className="text-[11px] tracking-[0.15em] uppercase bg-white text-[#080809] px-4 py-2 rounded-lg font-bold hover:bg-white/90 transition-colors font-mono">Export PDF</button>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div className="border border-white/[0.07] rounded-xl p-4">
              <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-red-400/60 mb-3">Their weaknesses</p>
              <ul className="space-y-2">{selected.weaknesses.map((w,i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/40 font-light"><span className="text-red-400/60 mt-0.5 shrink-0">—</span>{w}</li>
              ))}</ul>
            </div>
            <div className="border border-emerald-500/20 rounded-xl p-4 bg-emerald-500/5">
              <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-emerald-400/60 mb-3">Our edge</p>
              <ul className="space-y-2">{selected.ourEdge.map((e,i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/50 font-light"><span className="text-emerald-400 mt-0.5 shrink-0">✓</span>{e}</li>
              ))}</ul>
            </div>
            <div className="border border-white/[0.07] rounded-xl p-4">
              <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-amber-400/60 mb-3">Their strengths</p>
              <ul className="space-y-2">{selected.strengths.map((s,i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-white/40 font-light"><span className="text-amber-400/60 mt-0.5 shrink-0">!</span>{s}</li>
              ))}</ul>
            </div>
            <div className="border border-white/[0.07] rounded-xl p-4">
              <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-blue-400/60 mb-3">Objection handler</p>
              <div className="space-y-2">
                {selected.objections.map((o,i) => (
                  <div key={i} className="border border-white/[0.06] rounded-lg overflow-hidden">
                    <button onClick={() => setOpenObj(openObj===i?null:i)}
                      className="w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                      <span className="text-xs text-white/45 font-light">"{o.q}"</span>
                      <span className="text-white/20 text-xs ml-2 shrink-0">{openObj===i?"↑":"↓"}</span>
                    </button>
                    {openObj===i && (
                      <div className="px-3 py-2.5 border-t border-white/[0.06] bg-white/[0.02]">
                        <p className="text-xs text-white/40 font-light leading-relaxed">{o.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageSettings() {
  const [emailDigest, setEmailDigest] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);
  const [scanFreq, setScanFreq] = useState("hourly");

  function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
      <button onClick={onToggle} className={`w-10 h-5 rounded-full transition-colors relative ${on?"bg-white":"bg-white/10"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${on?"left-5 bg-[#080809]":"left-0.5 bg-white/30"}`}/>
      </button>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
        <SectionHeader title="Company settings"/>
        <div className="p-5 space-y-4">
          {[
            { label: "Company name",  value: "Buket SB" },
            { label: "Workspace URL", value: "buket-sb" },
            { label: "Industry",      value: "B2B SaaS" },
          ].map(f => (
            <div key={f.label}>
              <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-1.5">{f.label}</p>
              <input defaultValue={f.value} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-white/20 transition-colors text-white/70 font-light"/>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
        <SectionHeader title="Notifications"/>
        <div className="p-5 space-y-4">
          {[
            { label: "Email digest", sub: "Daily summary of all signals", on: emailDigest, toggle: () => setEmailDigest(!emailDigest) },
            { label: "Slack alerts", sub: "Real-time high-priority signals", on: slackAlerts, toggle: () => setSlackAlerts(!slackAlerts) },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">{n.label}</p>
                <p className="text-[11px] text-white/25 font-light">{n.sub}</p>
              </div>
              <Toggle on={n.on} onToggle={n.toggle}/>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
        <SectionHeader title="Scan frequency"/>
        <div className="p-5">
          <div className="flex gap-2">
            {["realtime","hourly","daily"].map(f => (
              <button key={f} onClick={() => setScanFreq(f)}
                className={`flex-1 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-widest transition-colors ${
                  scanFreq===f ? "bg-white text-[#080809] font-bold" : "border border-white/[0.08] text-white/25 hover:text-white hover:border-white/20"
                }`}>{f}</button>
            ))}
          </div>
        </div>
      </div>

      <button className="w-full bg-white text-[#080809] py-3 rounded-xl text-[11px] font-mono font-bold uppercase tracking-widest hover:bg-white/90 transition-colors">
        Save changes
      </button>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge }: {
  icon: React.ReactNode; label: string; active: boolean; onClick: () => void; badge?: number;
}) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left ${active?"bg-white/[0.08] text-white":"text-white/35 hover:text-white/70 hover:bg-white/[0.04]"}`}>
      <span className="w-4 h-4 shrink-0">{icon}</span>
      <span className="font-light tracking-tight flex-1">{label}</span>
      {badge && <span className="text-[9px] bg-amber-500/20 text-amber-400 font-mono px-1.5 py-0.5 rounded">{badge}</span>}
    </button>
  );
}

const Icons = {
  dashboard:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>,
  competitors: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
  signals:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M1 8h2l2-5 3 10 2-7 2 4 1-2h2"/></svg>,
  battlecards: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 6h6M5 9h4"/></svg>,
  settings:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/></svg>,
};

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard", competitors: "Competitors",
  signals: "Signals", battlecards: "Battle cards", settings: "Settings",
};

export default function Dashboard() {
  const [page, setPage] = useState("dashboard");
  const [newSignal, setNewSignal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const tenant = "buket-sb";

  useEffect(() => { const t = setTimeout(() => setNewSignal(true), 3000); return () => clearTimeout(t); }, []);

  return (
    <div className="flex h-screen bg-[#060608] text-white overflow-hidden font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-white/[0.06]">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-white/[0.06]">
          <SledixLogo size={22}/>
          <span className="font-display font-bold text-sm tracking-tight">Sledix</span>
        </div>
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[9px] font-bold uppercase">{tenant[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-white truncate">{tenant}</p>
              <p className="text-[9px] text-white/25 font-mono">Growth plan</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          <NavItem icon={Icons.dashboard}   label="Dashboard"    active={page==="dashboard"}   onClick={() => setPage("dashboard")}/>
          <NavItem icon={Icons.competitors} label="Competitors"  active={page==="competitors"} onClick={() => setPage("competitors")}/>
          <NavItem icon={Icons.signals}     label="Signals"      active={page==="signals"}     onClick={() => setPage("signals")} badge={3}/>
          <NavItem icon={Icons.battlecards} label="Battle cards" active={page==="battlecards"} onClick={() => setPage("battlecards")}/>
        </nav>
        <div className="px-3 pb-4 border-t border-white/[0.06] pt-3 space-y-0.5">
          <NavItem icon={Icons.settings} label="Settings" active={page==="settings"} onClick={() => setPage("settings")}/>
          <div className="flex items-center gap-2.5 px-3 pt-3">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">A</div>
            <div>
              <p className="text-[11px] text-white/60">Admin</p>
              <p className="text-[9px] text-white/20 font-mono">admin@{tenant}.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-white/[0.06]">
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight">{PAGE_TITLES[page]}</h1>
            <p className="text-[10px] text-white/25 font-mono">{tenant}.sledix.ai</p>
          </div>
          <div className="flex items-center gap-3">
            {newSignal && (
              <button onClick={() => setPage("signals")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono hover:bg-amber-500/15 transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"/>
                New signal detected
              </button>
            )}
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>Live
            </div>
            <button onClick={() => setShowModal(true)}
              className="text-[11px] tracking-[0.15em] uppercase bg-white text-[#060608] px-4 py-2 rounded-lg font-bold hover:bg-white/90 transition-colors font-mono">
              + Add competitor
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {page==="dashboard"   && <PageDashboard onNav={setPage}/>}
          {page==="competitors" && <PageCompetitors/>}
          {page==="signals"     && <PageSignals/>}
          {page==="battlecards" && <PageBattleCards/>}
          {page==="settings"    && <PageSettings/>}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-[#0f1012] border border-white/[0.1] rounded-2xl p-6 w-96" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-lg font-bold mb-1">Add competitor</h3>
            <p className="text-white/30 text-xs mb-5">We'll start monitoring immediately.</p>
            <input placeholder="e.g. crayon.co or Crayon"
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm outline-none focus:border-white/20 transition-colors placeholder-white/15 font-mono mb-3"/>
            <div className="flex gap-2">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 py-2.5 rounded-xl text-xs font-mono text-white/30 hover:text-white hover:border-white/20 transition-colors">Cancel</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-white text-[#080809] py-2.5 rounded-xl text-xs font-mono font-bold hover:bg-white/90 transition-colors">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}