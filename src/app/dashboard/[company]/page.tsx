"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "../../../lib/api";

const DADATA_KEY = "4affb62ba89180ef3405454f9a047fa680d957ed";

// --- Хелперы ---

// Красивое время (2m ago, 1h ago)
const formatRelativeTime = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

// Расчет рейтинга угрозы/силы конкурента
const calculateScore = (comp: any, signals: any[]) => {
  let score = 60; // Базовый уровень
  if (comp.inn) score += 15; // Юрлицо подтверждено
  const compSignals = signals.filter(s => s.company === comp.name).length;
  score += compSignals * 5; // Чем больше активности, тем выше score
  return Math.min(score, 98); // Кап на 98
};

const Icons = {
  dashboard:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>,
  competitors: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
  signals:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M1 8h2l2-5 3 10 2-7 2 4 1-2h2"/></svg>,
  settings:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/></svg>,
  trash:       <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 4h12M5 4V2.5c0-.3.2-.5.5-.5h5c.3 0 .5.2.5.5V4M6 7v5M10 7v5M3 4l1 10c0 .6.4 1 1 1h6c.6 0 1-.4 1-1l1-10" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevron:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 12l4-4-4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>
};

function SledixLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <path d="M76 32 C76 20 64 14 52 18 C40 22 36 32 42 40 C48 48 68 50 74 60 C80 70 74 84 60 88 C46 92 36 84 36 74" stroke="currentColor" strokeWidth="8" strokeLinecap="square" fill="none" />
    </svg>
  );
}

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const companySlug = params.company as string;

  const companyRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState("dashboard");
  const [selectedComp, setSelectedComp] = useState<any>(null); // Для деталей
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [newCompName, setNewCompName] = useState("");
  const [newCompUrl, setNewCompUrl] = useState("");
  const [city, setCity] = useState("");
  const [inn, setInn] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [partySuggestions, setPartySuggestions] = useState<any[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) setPartySuggestions([]);
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCitySuggestions([]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { window.location.href = "/auth/login"; return; }
    try {
      const [uRes, cRes, sRes] = await Promise.allSettled([
        apiRequest(`/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/competitors`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/signals`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (uRes.status === 'fulfilled') setUser(uRes.value);
      if (cRes.status === 'fulfilled') setCompetitors(cRes.value || []);
      if (sRes.status === 'fulfilled') setSignals(sRes.value || []);
      setIsLoading(false);
    } catch (err) { setIsLoading(false); }
  };

  useEffect(() => { if (companySlug) fetchData(); }, [companySlug]);

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/competitors", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCompName, website_url: newCompUrl, city, inn })
      });
      setNewCompName(""); setNewCompUrl(""); setCity(""); setInn("");
      setShowModal(false);
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setIsAdding(false); }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Remove this monitor?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest(`/api/competitors/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (selectedComp?.id === id) setSelectedComp(null);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  if (isLoading) return <div className="h-screen bg-[#060608] flex items-center justify-center text-white/10 font-mono text-[10px] uppercase tracking-[0.4em]">Synchronizing...</div>;

  const totalScore = competitors.length > 0 
    ? Math.round(competitors.reduce((acc, c) => acc + calculateScore(c, signals), 0) / competitors.length)
    : 0;

  return (
    <div className="flex h-screen bg-[#060608] text-white overflow-hidden font-sans antialiased">
      
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-white/[0.06]">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-white/[0.06]">
          <SledixLogo /><span className="font-display font-bold text-sm tracking-tight">Sledix</span>
        </div>
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[9px] font-bold uppercase">{companySlug[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-white truncate">{companySlug}</p>
              <p className="text-[9px] text-white/25 font-mono uppercase">{user?.plan || "Growth"}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          <button onClick={() => { setPage("dashboard"); setSelectedComp(null); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${page==="dashboard"?"bg-white/[0.08] text-white":"text-white/35 hover:text-white/70"}`}>{Icons.dashboard} Dashboard</button>
          <button onClick={() => { setPage("competitors"); setSelectedComp(null); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${page==="competitors"?"bg-white/[0.08] text-white":"text-white/35 hover:text-white/70"}`}>{Icons.competitors} Monitors <span className="ml-auto text-[9px] bg-white/5 px-1.5 rounded">{competitors.length}</span></button>
          <button onClick={() => { setPage("signals"); setSelectedComp(null); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${page==="signals"?"bg-white/[0.08] text-white":"text-white/35 hover:text-white/70"}`}>{Icons.signals} Signals <span className="ml-auto text-[9px] bg-white/5 px-1.5 rounded">{signals.length}</span></button>
        </nav>
        <div className="px-3 pb-4 border-t border-white/[0.06] pt-3 space-y-0.5">
          <button onClick={() => { setPage("settings"); setSelectedComp(null); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${page==="settings"?"bg-white/[0.08] text-white":"text-white/35 hover:text-white/70"}`}>{Icons.settings} Settings</button>
          <div className="flex items-center gap-2.5 px-3 py-3 mt-2">
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">{user?.email[0].toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/60 truncate">{user?.email}</p>
              <button onClick={() => {localStorage.clear(); window.location.href="/auth/login"}} className="text-[9px] font-mono text-red-400/40 hover:text-red-400 uppercase transition-colors">Sign Out</button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-lg font-bold tracking-tight capitalize">{selectedComp ? selectedComp.name : page}</h1>
            {selectedComp && <span className="text-white/20">/ Details</span>}
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/25"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>Live</div>
             <button onClick={() => setShowModal(true)} className="text-[11px] tracking-[0.15em] uppercase bg-white text-[#060608] px-4 py-2 rounded-lg font-bold hover:bg-white/90 font-mono transition-all">+ Add Monitor</button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {selectedComp ? (
            <CompetitorDetailsView comp={selectedComp} signals={signals.filter(s => s.company === selectedComp.name)} onBack={() => setSelectedComp(null)} />
          ) : (
            <>
              {page === "dashboard" && <DashboardView count={competitors.length} signals={signals} totalScore={totalScore} />}
              {page === "competitors" && <CompetitorsView competitors={competitors} signals={signals} onDelete={handleDelete} onSelect={setSelectedComp} />}
              {page === "signals" && <SignalsView signals={signals} />}
              {page === "settings" && <SettingsView user={user} />}
            </>
          )}
        </div>
      </div>

      {/* --- MODAL (DaData Search) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f1012] border border-white/10 rounded-[32px] p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="font-display text-xl font-bold mb-1 text-white">New Monitor</h3>
            <p className="text-white/20 text-[10px] mb-6 font-mono uppercase tracking-[0.2em]">Target Identification</p>
            <form onSubmit={handleAddCompetitor} className="space-y-5">
              <div className="relative" ref={companyRef}>
                <p className="text-[10px] font-mono text-white/20 uppercase mb-2 text-[9px] tracking-widest">Business Search</p>
                <input required value={newCompName} onChange={e => {
                   setNewCompName(e.target.value);
                   const q = e.target.value;
                   if (q.length >= 3) {
                    fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party", {
                      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Token ${DADATA_KEY}` },
                      body: JSON.stringify({ query: q })
                    }).then(r => r.json()).then(d => setPartySuggestions(d.suggestions || []));
                   } else setPartySuggestions([]);
                }} placeholder="Start typing name or ИП..." className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all font-mono"/>
                {partySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#16171a] border border-white/10 rounded-xl overflow-hidden z-[70] shadow-2xl">
                    {partySuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => { 
                          setNewCompName(s.value); setInn(s.data.inn || "");
                          if(s.data.address?.data?.city) setCity(s.data.address.data.city);
                          setPartySuggestions([]); 
                        }} className="w-full flex flex-col gap-0.5 px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-left">
                        <span className="text-xs text-white font-medium">{s.value}</span>
                        <span className="text-[9px] text-white/20 font-mono uppercase">{s.data.address.value}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[10px] font-mono text-white/20 uppercase mb-2 text-[9px] tracking-widest">Website URL</p>
                <input required value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="www.website.com" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 font-mono"/>
              </div>
              <div className="relative" ref={cityRef}>
                <p className="text-[10px] font-mono text-white/20 uppercase mb-2 text-[9px] tracking-widest">Location</p>
                <input required value={city} onChange={e => {
                   setCity(e.target.value);
                   const q = e.target.value;
                   if (q.length >= 2) {
                    fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
                      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Token ${DADATA_KEY}` },
                      body: JSON.stringify({ query: q, from_bound: { value: "city" }, to_bound: { value: "city" } })
                    }).then(r => r.json()).then(d => setCitySuggestions(d.suggestions || []));
                   } else setCitySuggestions([]);
                }} placeholder="City..." className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 font-mono"/>
                {citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#16171a] border border-white/10 rounded-xl overflow-hidden z-[60] shadow-2xl">
                    {citySuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => { setCity(s.value); setCitySuggestions([]); }} className="w-full px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-left text-xs text-white/70">{s.value}</button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-white/10 py-3 rounded-xl text-[10px] font-mono font-bold uppercase text-white/40 hover:text-white transition-all">Cancel</button>
                <button type="submit" disabled={isAdding} className="flex-1 bg-white text-black py-3 rounded-xl text-[10px] font-mono font-bold uppercase hover:bg-white/90 disabled:opacity-50 transition-all">{isAdding ? "Saving..." : "Start"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- ПОД-СТРАНИЦЫ ---

function DashboardView({ count, signals, totalScore }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Monitors", value: count }, 
          { label: "Total Signals", value: signals.length }, 
          { label: "Intelligence Score", value: totalScore }, 
          { label: "Status", value: "Online" }
        ].map((s, i) => (
          <div key={i} className="border border-white/[0.07] rounded-2xl p-5 bg-white/[0.02] transition-all hover:border-white/10">
            <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-white/25 mb-3">{s.label}</p>
            <p className="font-display text-3xl font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 border border-white/[0.07] rounded-[32px] p-20 text-center bg-white/[0.01]">
            <p className="text-white/20 text-xs font-mono uppercase tracking-widest">Autonomous system monitoring active...</p>
          </div>
          <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] p-5 flex flex-col">
             <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-6">Recent Feed</p>
             <div className="space-y-4 flex-1 overflow-auto">
               {signals.slice(0, 5).map((sig: any) => (
                 <div key={sig.id} className="border-l border-white/10 pl-4 py-1">
                    <p className="text-[11px] text-white/50 leading-snug">{sig.msg}</p>
                    <div className="flex justify-between items-center mt-2">
                       <p className="text-[9px] font-mono text-white/20 uppercase">{sig.company}</p>
                       <p className="text-[8px] font-mono text-white/10 uppercase">{formatRelativeTime(sig.created_at)}</p>
                    </div>
                 </div>
               ))}
               {signals.length === 0 && <p className="text-white/10 text-[10px] uppercase font-mono mt-10 text-center">Waiting for data</p>}
             </div>
          </div>
      </div>
    </div>
  );
}

function CompetitorsView({ competitors, signals, onDelete, onSelect }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {competitors.map((c: any) => (
        <div key={c.id} onClick={() => onSelect(c)} className="border border-white/[0.07] rounded-2xl p-5 bg-white/[0.02] hover:border-white/15 transition-all group relative cursor-pointer">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-lg font-bold text-white/20 uppercase font-mono">{c.name[0]}</div>
            <div className="min-w-0 flex-1">
              <h4 className="font-display font-bold text-sm truncate">{c.name}</h4>
              <p className="text-[10px] text-white/30 font-mono truncate">{c.website_url}</p>
            </div>
            <div className="text-right">
               <p className="font-display text-xl font-bold">{calculateScore(c, signals)}</p>
               <p className="text-[8px] font-mono text-white/20 uppercase">Score</p>
            </div>
          </div>
          <p className="text-[9px] font-mono uppercase text-white/20 mb-4">{c.city || 'Global'}</p>
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <span className="text-[9px] font-mono uppercase text-emerald-400/60 bg-emerald-400/5 px-2 py-0.5 rounded">Active</span>
            <div className="flex items-center gap-2">
               <button onClick={(e) => onDelete(e, c.id)} className="p-2 text-white/10 hover:text-red-400 transition-all">
                 {Icons.trash}
               </button>
               <div className="text-[9px] font-mono uppercase text-white/20 group-hover:text-white transition-colors flex items-center gap-1">Details {Icons.chevron}</div>
            </div>
          </div>
        </div>
      ))}
      {competitors.length === 0 && <div className="col-span-full border-2 border-dashed border-white/5 rounded-[32px] p-20 text-center text-white/10 font-mono uppercase text-[10px]">No targets found.</div>}
    </div>
  );
}

function CompetitorDetailsView({ comp, signals, onBack }: any) {
  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      <button onClick={onBack} className="text-[10px] font-mono text-white/30 hover:text-white mb-4 flex items-center gap-2 uppercase tracking-widest">← Back to monitors</button>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 border border-white/[0.07] rounded-2xl p-6 bg-white/[0.02]">
           <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-3xl font-bold text-white/20 uppercase font-mono mb-6">{comp.name[0]}</div>
           <h2 className="font-display text-2xl font-bold mb-1">{comp.name}</h2>
           <p className="text-sm text-white/40 font-mono mb-6">{comp.website_url}</p>
           
           <div className="space-y-4 pt-6 border-t border-white/5">
              <div><p className="text-[9px] font-mono text-white/20 uppercase mb-1">INN / Tax ID</p><p className="text-sm font-mono text-white/60">{comp.inn || 'Not provided'}</p></div>
              <div><p className="text-[9px] font-mono text-white/20 uppercase mb-1">Primary Region</p><p className="text-sm font-mono text-white/60">{comp.city || 'Global'}</p></div>
              <div><p className="text-[9px] font-mono text-white/20 uppercase mb-1">Status</p><span className="text-[10px] text-emerald-400 font-mono uppercase">Actively Monitored</span></div>
           </div>
        </div>

        <div className="col-span-2 border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
           <div className="px-5 py-4 border-b border-white/[0.06]"><p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Target History & Signals</p></div>
           <div className="divide-y divide-white/[0.04]">
              {signals.map((s: any) => (
                <div key={s.id} className="p-5 hover:bg-white/[0.01]">
                   <div className="flex justify-between mb-2">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-white/5 text-white/20 uppercase">{s.tag}</span>
                      <span className="text-[10px] font-mono text-white/20">{formatRelativeTime(s.created_at)}</span>
                   </div>
                   <p className="text-xs text-white/50 leading-relaxed">{s.msg}</p>
                </div>
              ))}
              {signals.length === 0 && <div className="p-20 text-center text-white/10 font-mono uppercase text-[10px]">No signals detected for this target.</div>}
           </div>
        </div>
      </div>
    </div>
  );
}

function SignalsView({ signals }: any) {
  return (
    <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] bg-white/[0.01] flex justify-between items-center">
            <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">Global Signal Stream</p>
            <span className="text-[9px] font-mono text-white/20 uppercase">{signals.length} total</span>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {signals.map((s: any) => (
            <div key={s.id} className="flex items-center gap-6 px-6 py-5 hover:bg-white/[0.01] transition-all">
              <div className="w-24 shrink-0"><p className="text-[10px] font-bold text-white/60 uppercase font-mono truncate">{s.company}</p></div>
              <p className="flex-1 text-xs text-white/40 font-light leading-relaxed">{s.msg}</p>
              <span className="text-[9px] font-mono px-2 py-1 rounded border border-white/5 text-white/20 uppercase tracking-widest">{s.tag}</span>
              <span className="text-[10px] font-mono text-white/20 w-24 text-right shrink-0">{formatRelativeTime(s.created_at)}</span>
            </div>
          ))}
          {signals.length === 0 && <div className="p-20 text-center text-white/10 font-mono uppercase text-[10px]">No signals detected yet.</div>}
        </div>
    </div>
  );
}

function SettingsView({ user }: any) {
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const handleSave = async () => {
    setIsSaving(true); setMessage("");
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/auth/me", { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ email, password: showPass ? password : "" }) });
      setMessage("Success: Profile updated.");
      setShowPass(false);
    } catch (err: any) { setMessage(`Error: ${err.message}`); } finally { setIsSaving(false); }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] p-6 space-y-6">
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] mb-4">Account Control</p>
        <div>
           <p className="text-[10px] font-mono text-white/20 uppercase mb-2">Email Address</p>
           <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-white/20"/>
        </div>
        <div>
           <p className="text-[10px] font-mono text-white/20 uppercase mb-2">Security</p>
           {showPass ? (
              <div className="space-y-4">
                 <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-white/20"/>
                 <button onClick={() => setShowPass(false)} className="text-[10px] font-mono text-white/20 hover:text-white uppercase">Cancel</button>
              </div>
           ) : (
              <button onClick={() => setShowPass(true)} className="text-[10px] font-mono text-white/40 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5 transition-all uppercase">Change Password</button>
           )}
        </div>
        {message && <p className={`text-[10px] font-mono uppercase ${message.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p>}
        <button onClick={handleSave} disabled={isSaving} className="w-full bg-white text-black py-4 rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 disabled:opacity-50 transition-all">{isSaving ? "Saving..." : "Save Changes"}</button>
      </div>
    </div>
  );
}