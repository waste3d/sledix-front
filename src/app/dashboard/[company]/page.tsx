"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "../../../lib/api";
import ReactDiffViewer from "react-diff-viewer-continued";

const DADATA_KEY = "4affb62ba89180ef3405454f9a047fa680d957ed";

// --- Дизайн-система ---
const THEME = {
  bg: "#050505",
  card: "rgba(15, 15, 18, 0.6)",
  border: "rgba(255, 255, 255, 0.06)",
  accent: "#10b981", // Emerald
};

const TAG_STYLES: Record<string, { color: string; bg: string }> = {
  PRICING: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
  HIRING: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
  REVIEWS: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" },
  LEGAL: { color: "#a855f7", bg: "rgba(168, 85, 247, 0.1)" },
  PRODUCT: { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
  TECH: { color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)" },
  MARKETING: { color: "#ec4899", bg: "rgba(236, 72, 153, 0.1)" },
};

// --- Компоненты UI ---

const Icon = ({ name }: { name: string }) => {
  const icons: any = {
    search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
    plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>,
    zap: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    external: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
  };
  return icons[name] || null;
};

// --- Обновленный AI Insight с кнопкой ---
function SmartInsight({ text, defaultMsg }: { text?: string; defaultMsg: string }) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleReveal = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsRevealed(true);
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.02] p-4 transition-all hover:border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isRevealed ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-white/20'}`} />
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/40">AI Strategic Analysis</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-start gap-3"
          >
            <p className="text-[13px] text-white/20 italic line-clamp-1">{defaultMsg}</p>
            <button 
              onClick={handleReveal}
              disabled={isAnalyzing}
              className="group relative flex items-center gap-2 overflow-hidden rounded-lg bg-white/[0.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 transition-all hover:bg-emerald-500/10 active:scale-95"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-spin rounded-full border border-emerald-400 border-t-transparent" />
                  Обработка...
                </span>
              ) : (
                <>
                  <Icon name="zap" />
                  Сгенерировать инсайт
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="text-[13px] leading-relaxed text-white/80"
          >
            {text || "Не удалось получить детальный анализ события."}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Dashboard View (Bento) ---
function DashboardOverview({ competitors, signals, stats, dist }: any) {
  return (
    <div className="grid grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Ключевые метрики */}
      <div className="col-span-12 grid grid-cols-4 gap-4">
        {[
          { label: "Всего мониторов", val: competitors.length, trend: "Active" },
          { label: "Сигналы (24ч)", val: signals.filter((s:any) => new Date(s.created_at).getTime() > Date.now() - 86400000).length, trend: "+12%" },
          { label: "Точек данных", val: signals.length * 4, trend: "Live" },
          { label: "Средний риск", val: "24%", trend: "Low" }
        ].map((m, i) => (
          <div key={i} className="group relative overflow-hidden rounded-[24px] border border-white/[0.05] bg-white/[0.02] p-6 transition-all hover:border-white/10">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">{m.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <h3 className="text-3xl font-bold tracking-tighter">{m.val}</h3>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{m.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* График активности */}
      <div className="col-span-8 rounded-[32px] border border-white/[0.05] bg-white/[0.01] p-8 h-[400px] flex flex-col">
        <div className="mb-8 flex items-center justify-between">
          <h4 className="text-sm font-bold uppercase tracking-widest text-white/60">Динамика изменений</h4>
          <div className="flex gap-2">
            {['1D', '1W', '1M'].map(t => <button key={t} className="text-[9px] font-mono text-white/20 hover:text-white px-2 py-1">{t}</button>)}
          </div>
        </div>
        <div className="flex-1 w-full bg-gradient-to-t from-white/[0.02] to-transparent rounded-2xl relative overflow-hidden">
           {/* Здесь может быть ваш ActivityChart */}
           <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/10 uppercase tracking-widest">Визуализация данных потока...</div>
        </div>
      </div>

      {/* Матрица распределения */}
      <div className="col-span-4 rounded-[32px] border border-white/[0.05] bg-white/[0.01] p-8">
        <h4 className="mb-8 text-sm font-bold uppercase tracking-widest text-white/60">Матрица сигналов</h4>
        <div className="space-y-6">
          {dist.map((item: any, i: number) => (
            <div key={i}>
              <div className="flex justify-between text-[10px] font-mono uppercase mb-2">
                <span className="text-white/40">{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: `${(item.value / Math.max(...dist.map((d:any)=>d.value))) * 100}%` }}
                  className="h-full" style={{ backgroundColor: TAG_STYLES[item.label]?.color || '#fff' }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- ГЛАВНАЯ СТРАНИЦА ---
export default function DashboardPage() {
  const params = useParams();
  const companySlug = params.company as string;
  
  const [page, setPage] = useState("dashboard");
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [dist, setDist] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [newCompName, setNewCompName] = useState("");
  const [newCompUrl, setNewCompUrl] = useState("");
  const [city, setCity] = useState("");
  const [inn, setInn] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [partySuggestions, setPartySuggestions] = useState<any[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);

  const [diffData, setDiffData] = useState<any>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { window.location.href = "/auth/login"; return; }

    try {
      const [uRes, cRes, sRes, stRes, dsRes] = await Promise.all([
        apiRequest(`/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/competitors`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/signals`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/activity`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/distribution`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUser(uRes); setCompetitors(cRes || []); setSignals(sRes || []); setStats(stRes || []); setDist(dsRes || []);
      setIsLoading(false);
    } catch (err: any) {
      if (err.message.includes('401')) { localStorage.clear(); window.location.href = "/auth/login"; }
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openDiff = async (signal: any) => {
    try {
      const token = localStorage.getItem("access_token");
      const data = await apiRequest(`/api/signals/${signal.id}/diff`, { headers: { Authorization: `Bearer ${token}` } });
      setDiffData({ ...data, ai_analysis: signal.ai_analysis, msg: signal.msg }); 
      setShowDiffModal(true);
    } catch (e) { alert("Данные для сравнения отсутствуют."); }
  };

  if (isLoading) return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#050505] space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent shadow-[0_0_15px_#10b981]" />
      <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-white/20">Initializing System</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans antialiased overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/[0.05] bg-[#08080a] flex flex-col p-6">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Icon name="zap" />
          </div>
          <span className="text-xl font-bold tracking-tighter">SLEDIX</span>
        </div>

        <nav className="flex-1 space-y-1">
          {[
            { id: 'dashboard', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { id: 'competitors', label: 'Monitors', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { id: 'signals', label: 'Intelligence', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id); setSelectedComp(null); }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${page === item.id ? 'bg-white/[0.08] text-white shadow-inner' : 'text-white/40 hover:bg-white/[0.03] hover:text-white'}`}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/[0.05] pt-6">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-white/10 flex items-center justify-center text-[10px] font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-medium text-white/80">{user?.email}</p>
              <button onClick={() => { localStorage.clear(); window.location.href = "/auth/login"; }} className="text-[10px] font-mono uppercase text-red-400/60 hover:text-red-400 transition-colors">Sign Out</button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 shrink-0 flex items-center justify-between px-10 border-b border-white/[0.05] bg-[#050505]/50 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-white/90">
              {selectedComp ? selectedComp.name : page}
            </h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 rounded-full border border-white/[0.05] bg-white/[0.02] px-4 py-2">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-500/80">System Live</span>
             </div>
             <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black transition-all hover:bg-neutral-200 active:scale-95"
             >
               <Icon name="plus" /> New Monitor
             </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            {page === "dashboard" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="dash">
                <DashboardOverview competitors={competitors} signals={signals} stats={stats} dist={dist} />
              </motion.div>
            )}

            {page === "competitors" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="comp" className="grid grid-cols-3 gap-6">
                {competitors.map((c: any) => (
                  <div key={c.id} onClick={() => { setSelectedComp(c); setPage("details"); }} className="group relative cursor-pointer rounded-[32px] border border-white/[0.06] bg-white/[0.01] p-8 transition-all hover:border-white/20 hover:bg-white/[0.03]">
                    <div className="mb-6 flex items-start justify-between">
                      <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center font-mono text-xl font-bold text-white/20 group-hover:text-white/60 transition-colors">
                        {c.name[0]}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold tracking-tighter text-white/90">74</p>
                        <p className="text-[9px] font-mono uppercase text-white/20">Risk Score</p>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold truncate">{c.name}</h3>
                    <p className="mb-6 text-xs text-white/30 font-mono truncate">{c.website_url}</p>
                    <div className="flex items-center justify-between border-t border-white/5 pt-6">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">{c.city || 'Global'}</span>
                      <button onClick={(e) => { e.stopPropagation(); /* delete logic */ }} className="text-white/20 hover:text-red-500 transition-colors">
                        <Icon name="trash" />
                      </button>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {page === "signals" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="sig" className="space-y-4">
                {signals.map((s: any) => (
                  <div key={s.id} className="flex items-start gap-8 rounded-[24px] border border-white/[0.05] bg-white/[0.01] p-6 transition-all hover:bg-white/[0.02]">
                    <div className="w-40 shrink-0">
                      <p className="text-xs font-bold text-white/80 truncate mb-1">{s.company}</p>
                      <span className="text-[10px] font-mono text-white/20 uppercase">{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex-1">
                      <SmartInsight text={s.ai_analysis} defaultMsg={s.msg} />
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest" style={{ color: TAG_STYLES[s.tag]?.color }}>
                        {s.tag}
                      </span>
                      {s.tag === 'PRODUCT' && (
                        <button onClick={() => openDiff(s)} className="text-[10px] font-mono text-emerald-400 hover:underline">Compare Diff</button>
                      )}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* MODAL: ADD MONITOR */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md overflow-hidden rounded-[40px] border border-white/10 bg-[#0f1012] p-10 shadow-2xl">
            <h3 className="text-xl font-bold uppercase tracking-tight mb-2">Initialize Monitor</h3>
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] mb-8">Enter entity details</p>
            
            <div className="space-y-6">
              <div>
                <label className="text-[9px] font-mono uppercase text-white/40 mb-2 block">Company Name</label>
                <input 
                  value={newCompName} 
                  onChange={(e) => setNewCompName(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div>
                <label className="text-[9px] font-mono uppercase text-white/40 mb-2 block">Primary Domain</label>
                <input 
                  value={newCompUrl} 
                  onChange={(e) => setNewCompUrl(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-white/5 px-5 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all"
                  placeholder="www.acme.com"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 rounded-2xl border border-white/5 py-4 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white">Cancel</button>
                <button className="flex-1 rounded-2xl bg-emerald-500 py-4 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-emerald-400">Launch Monitor</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: DIFF VIEW */}
      <AnimatePresence>
        {showDiffModal && diffData && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-xl p-10"
          >
            <div className="mb-8 flex items-start justify-between">
              <div className="max-w-2xl">
                <h3 className="text-2xl font-bold uppercase tracking-tighter mb-4">Structural Changes detected</h3>
                <SmartInsight text={diffData.ai_analysis} defaultMsg={diffData.msg} />
              </div>
              <button onClick={() => setShowDiffModal(false)} className="rounded-full bg-white/10 px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-white/20">Close</button>
            </div>
            <div className="flex-1 overflow-hidden rounded-[32px] border border-white/10 bg-[#08080a]">
              <div className="h-full overflow-y-auto custom-scrollbar">
                <ReactDiffViewer 
                  oldValue={diffData.old} 
                  newValue={diffData.new} 
                  splitView={true} 
                  useDarkTheme={true}
                  styles={{
                    variables: { 
                      dark: { 
                        diffViewerBackground: '#08080a',
                        addedBackground: 'rgba(16, 185, 129, 0.1)',
                        removedBackground: 'rgba(239, 68, 68, 0.1)',
                      } 
                    },
                    contentText: { fontSize: '12px', fontFamily: 'monospace' }
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}