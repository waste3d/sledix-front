"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import ReactDiffViewer from "react-diff-viewer-continued";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const DADATA_KEY = "4affb62ba89180ef3405454f9a047fa680d957ed";

// --- Цветовая схема ---
const TAG_STYLES: Record<string, { color: string; bg: string }> = {
  PRICING: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
  HIRING: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
  REVIEWS: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" },
  LEGAL: { color: "#a855f7", bg: "rgba(168, 85, 247, 0.1)" },
  PRODUCT: { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
  TECH: { color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)" },
  MARKETING: { color: "#ec4899", bg: "rgba(236, 72, 153, 0.1)" },
};

const TAG_LABELS_RU: Record<string, string> = {
  PRICING: "Цены", HIRING: "Найм", REVIEWS: "Отзывы", LEGAL: "Право", PRODUCT: "Продукт", TECH: "Tech", MARKETING: "Маркетинг",
};

const PAGE_TITLE_RU: Record<string, string> = {
  dashboard: "Системный обзор",
  competitors: "Мониторы",
  signals: "Лента сигналов",
  settings: "Конфигурация",
};

// --- Хелперы ---
const getRelativeTime = (dateStr: string) => {
  if (!dateStr) return "ожидание";
  const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)}м назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}ч назад`;
  return `${Math.floor(diff / 86400)}д назад`;
};

const getCompScore = (comp: any, signals: any[]) => {
  let score = 55;
  if (comp.inn) score += 15;
  const count = signals.filter(s => s.company === comp.name).length;
  score += count * 5;
  return Math.min(score, 99);
};

const Icons = {
  dashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  competitors: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  signals: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>,
  settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1V11a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  chevron: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m9 18 6-6-6-6"/></svg>
};

// --- Универсальные UI компоненты ---

function GlassCard({ children, className = "", hover = true }: any) {
  return (
    <div className={`
      relative overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#0c0c0e]/50 backdrop-blur-xl
      ${hover ? "hover:border-white/10 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]" : ""}
      ${className}
    `}>
      {children}
    </div>
  );
}

function AIInsight({ text, defaultMsg }: { text?: string; defaultMsg: string }) {
  const isFailed = !text || text.includes("Не удалось") || text.includes("временно недоступен");
  return (
    <div className="relative group overflow-hidden rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/40" />
      <div className="flex gap-3">
        <div className="mt-1 shrink-0 animate-pulse text-emerald-500">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>
        </div>
        <div>
          <span className="text-[9px] font-mono text-emerald-400/60 font-bold uppercase tracking-[0.2em] block mb-1">Intelligence Insight</span>
          <p className="text-[13px] text-white/80 leading-relaxed tracking-wide font-light">{isFailed ? defaultMsg : text}</p>
        </div>
      </div>
    </div>
  );
}

function SignalBadge({ label }: { label: string }) {
  const style = TAG_STYLES[label] || { color: "#71717a", bg: "rgba(113, 113, 122, 0.1)" };
  return (
    <span className="text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider" 
          style={{ color: style.color, backgroundColor: style.bg, borderColor: `${style.color}33` }}>
      {TAG_LABELS_RU[label] || label}
    </span>
  );
}

// --- ОСНОВНОЙ КОМПОНЕНТ ---

export default function DashboardPage() {
  const params = useParams();
  const companySlug = params.company as string;
  const companyRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

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
      const [uRes, cRes, sRes, stRes, dsRes] = await Promise.allSettled([
        apiRequest(`/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/competitors`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/signals`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/activity`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/distribution`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      if (uRes.status === 'fulfilled') setUser(uRes.value);
      if (cRes.status === 'fulfilled') setCompetitors(cRes.value || []);
      if (sRes.status === 'fulfilled') setSignals(sRes.value || []);
      if (stRes.status === 'fulfilled') setStats(stRes.value || []);
      if (dsRes.status === 'fulfilled') setDist(dsRes.value || []);
      setIsLoading(false);
    } catch (err) { setIsLoading(false); }
  };

  useEffect(() => { if (companySlug) fetchData(); }, [companySlug]);

  const openDiff = async (signal: any) => {
    try {
      const token = localStorage.getItem("access_token");
      const data = await apiRequest(`/api/signals/${signal.id}/diff`, { headers: { Authorization: `Bearer ${token}` } });
      setDiffData({ ...data, ai_analysis: signal.ai_analysis, msg: signal.msg }); 
      setShowDiffModal(true);
    } catch (e) { alert("Для этого события нет визуального сравнения."); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setIsAdding(true);
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/competitors", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: newCompName, website_url: newCompUrl, city, inn }) });
      setNewCompName(""); setNewCompUrl(""); setCity(""); setInn(""); setShowModal(false); fetchData();
    } catch (err: any) { alert(err.message); } finally { setIsAdding(false); }
  };

  const handleDelete = async (e: any, id: string) => {
    if (e.stopPropagation) e.stopPropagation();
    if (!confirm("Удалить этот объект мониторинга?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest(`/api/competitors/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (selectedComp?.id === id) setSelectedComp(null);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  if (isLoading) return <div className="h-screen bg-[#050505] flex items-center justify-center text-white/10 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">Инициализация среды…</div>;

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans antialiased selection:bg-emerald-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-60 shrink-0 flex flex-col border-r border-white/[0.04] bg-[#08080a]/80 backdrop-blur-xl">
        <div className="h-20 flex items-center gap-3 px-8">
           <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
             <div className="w-4 h-4 bg-black rounded-sm transform rotate-45" />
           </div>
           <span className="font-bold tracking-tighter text-lg">SLEDIX</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem active={page==="dashboard" && !selectedComp} onClick={() => {setPage("dashboard"); setSelectedComp(null);}} icon={Icons.dashboard} label="Обзор" />
          <NavItem active={page==="competitors"} onClick={() => {setPage("competitors"); setSelectedComp(null);}} icon={Icons.competitors} label="Мониторы" count={competitors.length} />
          <NavItem active={page==="signals"} onClick={() => {setPage("signals"); setSelectedComp(null);}} icon={Icons.signals} label="Сигналы" count={signals.length} />
        </nav>

        <div className="px-4 pb-8 border-t border-white/[0.04] pt-6 space-y-1">
          <NavItem active={page==="settings"} onClick={() => setPage("settings")} icon={Icons.settings} label="Настройки" />
          <div className="flex items-center gap-3 px-4 py-4 mt-4 bg-white/[0.02] rounded-2xl border border-white/[0.05]">
             <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-500">{user?.email?.[0]?.toUpperCase()}</div>
             <div className="flex-1 min-w-0">
               <p className="text-[11px] font-medium truncate text-white/70">{user?.email}</p>
               <button onClick={() => {localStorage.clear(); window.location.href="/auth/login"}} className="text-[9px] font-mono text-red-400/40 hover:text-red-400 uppercase tracking-tighter transition-colors">Выйти</button>
             </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 shrink-0 flex items-center justify-between px-10 border-b border-white/[0.04] bg-[#050505]/50 backdrop-blur-xl z-20">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white/90">{selectedComp ? selectedComp.name : (PAGE_TITLE_RU[page] || page)}</h1>
            <p className="text-[10px] text-white/30 font-mono uppercase tracking-[0.2em] mt-0.5">Control Panel v2.4</p>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-500/60 uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Система активна</div>
             <button onClick={() => setShowModal(true)} className="text-[10px] tracking-widest uppercase bg-white text-black px-6 py-2.5 rounded-xl font-bold hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
               + Новый монитор
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-10 custom-scrollbar bg-[#050505]">
          {!user?.is_email_verified && <VerificationBanner email={user?.email} />}
          
          {selectedComp ? (
            <CompetitorDetailsView comp={selectedComp} signals={signals.filter(s => s.company === selectedComp.name)} onDelete={handleDelete} onBack={() => setSelectedComp(null)} onViewDiff={openDiff} />
          ) : (
            <div className="max-w-[1400px] mx-auto">
              {page === "dashboard" && <DashboardView competitors={competitors} signals={signals} stats={stats} dist={dist} />}
              {page === "competitors" && <CompetitorsListView competitors={competitors} signals={signals} onDelete={handleDelete} onSelect={setSelectedComp} />}
              {page === "signals" && <SignalsFeedView signals={signals} onViewDiff={openDiff} />}
              {page === "settings" && <SettingsView user={user} />}
            </div>
          )}
        </div>
      </div>

      {/* --- ADD MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <GlassCard className="p-10 w-full max-w-md border-white/10" hover={false}>
            <h3 className="text-xl font-bold mb-1 uppercase tracking-tight">Новый монитор</h3>
            <p className="text-white/30 text-[10px] mb-8 font-mono uppercase tracking-[0.3em]">Конфигурация объекта отслеживания</p>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="relative" ref={companyRef}>
                <p className="text-[9px] font-mono text-white/20 uppercase mb-2 tracking-widest">Название / Компания</p>
                <input required value={newCompName} onChange={e => {
                   setNewCompName(e.target.value);
                   if (e.target.value.length >= 3) {
                    fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Token ${DADATA_KEY}` }, body: JSON.stringify({ query: e.target.value }) }).then(r => r.json()).then(d => setPartySuggestions(d.suggestions || []));
                   } else setPartySuggestions([]);
                }} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-sm outline-none focus:border-emerald-500/50 transition-all font-mono"/>
                {partySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#121214] border border-white/10 rounded-xl overflow-hidden z-[110] shadow-2xl">
                    {partySuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => { setNewCompName(s.value); setInn(s.data.inn || ""); if(s.data.address?.data?.city) setCity(s.data.address.data.city); setPartySuggestions([]); }} className="w-full px-5 py-4 hover:bg-white/5 border-b border-white/5 last:border-0 text-left transition-colors">
                        <p className="text-xs text-white font-medium">{s.value}</p>
                        <p className="text-[9px] text-white/30 uppercase mt-1">{s.data.address.value}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div><p className="text-[9px] font-mono text-white/20 uppercase mb-2 tracking-widest">URL Сайта</p><input required value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="www.domain.com" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-sm outline-none focus:border-emerald-500/50 font-mono transition-all"/></div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-white/10 py-4 rounded-xl text-[10px] font-mono font-bold uppercase text-white/30 hover:text-white transition-all">Отмена</button>
                <button type="submit" disabled={isAdding} className="flex-1 bg-white text-black py-4 rounded-xl text-[10px] font-mono font-bold uppercase hover:bg-emerald-500 hover:text-white transition-all">
                  {isAdding ? "Загрузка…" : "Запустить"}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* --- DIFF MODAL --- */}
      {showDiffModal && diffData && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[200] flex flex-col p-10">
          <div className="flex justify-between items-start mb-8">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">Анализ структурных изменений</h3>
              <AIInsight text={diffData.ai_analysis} defaultMsg={diffData.msg} />
            </div>
            <button onClick={() => setShowDiffModal(false)} className="px-8 py-3 bg-white text-black rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Закрыть</button>
          </div>
          <div className="flex-1 overflow-auto rounded-3xl border border-white/10 bg-[#08080a] custom-scrollbar">
            <ReactDiffViewer oldValue={diffData.old} newValue={diffData.new} splitView={true} useDarkTheme={true}
              styles={{
                variables: { dark: { diffViewerBackground: '#08080a', addedBackground: 'rgba(16, 185, 129, 0.08)', addedColor: '#10b981', removedBackground: 'rgba(239, 68, 68, 0.08)', removedColor: '#ef4444' } },
                contentText: { fontSize: '12px', fontFamily: 'monospace', lineHeight: '1.6' }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- ПОД-КОМПОНЕНТЫ ---

function NavItem({ active, icon, label, count, onClick }: any) {
  return (
    <button onClick={onClick} className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] transition-all duration-300
      ${active ? "bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"}
    `}>
      <span className={active ? "text-emerald-500" : ""}>{icon}</span>
      <span className="font-medium">{label}</span>
      {count !== undefined && <span className="ml-auto text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">{count}</span>}
    </button>
  );
}

// --- Dashboard Bento View ---
function DashboardView({ competitors, signals, stats, dist }: any) {
  const pieData = dist.map((d: { label: string | number; value: any; }) => ({ name: TAG_LABELS_RU[d.label] || d.label, value: d.value, color: TAG_STYLES[d.label]?.color || "#fff" }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* 4 Маленьких карточки сверху */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard label="Объекты" value={competitors.length} sub="Активный мониторинг" />
        <StatCard label="Сигналы" value={signals.length} sub="События за 30 дней" />
        <StatCard label="AI Анализ" value={signals.filter((s: { ai_analysis: any; }) => s.ai_analysis).length} sub="Автоматическая обработка" />
        <StatCard label="Охват" value={`${competitors.length > 0 ? Math.round((new Set(signals.map((s: { company: any; }) => s.company)).size / competitors.length) * 100) : 0}%`} sub="Активность сетей" />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Главный график */}
        <GlassCard className="col-span-8 p-10 h-[480px]" hover={false}>
          <div className="flex items-center justify-between mb-10">
             <div>
               <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">Интенсивность сигналов</h3>
               <p className="text-[10px] text-white/30 font-mono mt-1">Динамика изменений по дням</p>
             </div>
             <div className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] font-mono text-emerald-500 uppercase">Live Timeline</div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ backgroundColor: '#0c0c0e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', color: '#fff' }} />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Круговая диаграмма */}
        <GlassCard className="col-span-4 p-10 flex flex-col h-[480px]" hover={false}>
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/90 mb-2">Классификация</h3>
          <p className="text-[10px] text-white/30 font-mono mb-8">Распределение типов данных</p>
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value">
                  {pieData.map((entry: { color: any; }, index: any) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold tracking-tighter">{signals.length}</span>
                <span className="text-[8px] text-white/20 uppercase font-mono tracking-widest">Всего</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-3 mt-6">
             {pieData.slice(0, 4).map((d: { color: any; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, i: React.Key | null | undefined) => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                 <span className="text-[9px] text-white/40 truncate uppercase font-mono">{d.name}</span>
               </div>
             ))}
          </div>
        </GlassCard>

        {/* Лента последних сигналов */}
        <div className="col-span-12">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">Последние изменения</h3>
              <div className="h-[1px] flex-1 mx-8 bg-white/[0.05]" />
           </div>
           <div className="grid grid-cols-3 gap-6">
              {signals.slice(0, 3).map((s: any) => (
                <GlassCard key={s.id} className="p-6 group">
                   <div className="flex justify-between items-start mb-6">
                      <SignalBadge label={s.tag} />
                      <span className="text-[10px] font-mono text-white/20 uppercase">{getRelativeTime(s.created_at)}</span>
                   </div>
                   <p className="text-[13px] leading-relaxed text-white/70 line-clamp-2 mb-6 group-hover:text-white transition-colors">{s.ai_analysis || s.msg}</p>
                   <div className="flex justify-between items-center pt-4 border-t border-white/[0.05]">
                      <span className="text-[10px] font-bold text-white/30 uppercase tracking-tighter">{s.company}</span>
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                         {Icons.chevron}
                      </div>
                   </div>
                </GlassCard>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: any) {
  return (
    <GlassCard className="p-7 group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
         <svg width="48" height="48" viewBox="0 0 24 24" fill="white"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
      </div>
      <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mb-4">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tighter text-white/90">{value}</span>
      </div>
      <p className="text-[9px] font-mono text-white/20 mt-2 uppercase tracking-tighter">{sub}</p>
    </GlassCard>
  );
}

// --- Competitors List View ---
function CompetitorsListView({ competitors, signals, onDelete, onSelect }: any) {
  return (
    <div className="grid grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {competitors.map((c: any) => (
        <GlassCard key={c.id} onClick={() => onSelect(c)} className="p-8 cursor-pointer group">
          <div className="flex justify-between items-start mb-10">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl font-bold text-white/20 border border-white/5 group-hover:border-emerald-500/30 group-hover:text-emerald-500 transition-all">
              {c.name[0]}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold tracking-tighter text-white/90">{getCompScore(c, signals)}</p>
              <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Risk Level</p>
            </div>
          </div>
          
          <h3 className="text-lg font-bold truncate mb-1">{c.name}</h3>
          <p className="text-[11px] text-white/30 font-mono truncate mb-8">{c.website_url}</p>
          
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-8">
            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">{c.city || "Global"}</span>
            <button onClick={(e) => onDelete(e, c.id)} className="p-2 text-white/20 hover:text-red-500 transition-all">
              {Icons.trash}
            </button>
          </div>

          <div className="flex items-center justify-between">
             <span className="text-[9px] font-mono uppercase text-emerald-500/60 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">Активен</span>
             <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
               Детали {Icons.chevron}
             </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

// --- Signals Feed View ---
function SignalsFeedView({ signals, onViewDiff }: any) {
  return (
    <GlassCard className="overflow-hidden" hover={false}>
       <div className="px-10 py-8 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.01]">
          <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/40">Стрим событий</p>
          <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{signals.length} транзакций</span>
       </div>
       <div className="divide-y divide-white/[0.04]">
          {signals.map((s: any) => (
            <div key={s.id} className="flex items-start gap-12 px-10 py-8 hover:bg-white/[0.01] transition-all group">
              <div className="w-40 shrink-0">
                <p className="text-[12px] font-bold text-white/80 uppercase font-mono truncate tracking-tighter">{s.company}</p>
                <p className="text-[9px] font-mono text-white/20 mt-1 uppercase">{getRelativeTime(s.created_at)}</p>
              </div>
              <div className="flex-1">
                <AIInsight text={s.ai_analysis} defaultMsg={s.msg} />
              </div>
              <div className="flex flex-col items-end gap-3 min-w-[120px]">
                <SignalBadge label={s.tag} />
                {s.tag === 'PRODUCT' && (
                  <button onClick={() => onViewDiff(s)} className="text-[10px] font-mono text-emerald-500 hover:text-emerald-400 border-b border-emerald-500/20 hover:border-emerald-500 transition-all uppercase tracking-tighter">
                    Сравнить
                  </button>
                )}
              </div>
            </div>
          ))}
       </div>
    </GlassCard>
  );
}

// --- Competitor Details (Single View) ---
function CompetitorDetailsView({ comp, signals, onDelete, onBack, onViewDiff }: any) {
  const [socialUrl, setSocialUrl] = useState("");
  const [platform, setPlatform] = useState("telegram");
  const [socials, setSocials] = useState<any[]>([]);
  const [isLinking, setIsLinking] = useState(false);

  const fetchSocials = async () => { 
    try { 
      const token = localStorage.getItem("access_token"); 
      const data = await apiRequest(`/api/competitors/${comp.id}/socials`, { headers: { Authorization: `Bearer ${token}` } }); 
      setSocials(data || []); 
    } catch (e) {} 
  };
  
  useEffect(() => { fetchSocials(); }, [comp.id]);

  const handleLink = async () => { 
    if (!socialUrl) return; 
    setIsLinking(true); 
    try { 
      const token = localStorage.getItem("access_token"); 
      await apiRequest(`/api/competitors/${comp.id}/socials`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ platform, url: socialUrl, interval: 60 }) }); 
      setSocialUrl(""); 
      fetchSocials(); 
    } catch (e) {} finally { setIsLinking(false); } 
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-700 max-w-[1400px] mx-auto space-y-10">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-[11px] font-mono text-white/40 hover:text-white flex items-center gap-3 uppercase tracking-[0.2em] transition-all">
          <span className="text-xl">←</span> Назад к списку
        </button>
        <button onClick={(e) => onDelete(e, comp.id)} className="text-[10px] font-mono text-red-500/50 hover:text-red-400 uppercase px-6 py-2.5 rounded-xl border border-red-500/20 hover:bg-red-500/5 transition-all">
          Удалить мониторинг
        </button>
      </div>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-4 space-y-8">
           <GlassCard className="p-10" hover={false}>
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center text-4xl font-bold border border-emerald-500/20 mb-8">
                {comp.name[0]}
              </div>
              <h2 className="text-3xl font-bold mb-2 tracking-tight">{comp.name}</h2>
              <p className="text-sm text-white/30 font-mono mb-10 truncate">{comp.website_url}</p>
              
              <div className="space-y-6 pt-10 border-t border-white/[0.05]">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">ИНН Объекта</span>
                  <span className="text-sm font-mono text-white/70">{comp.inn || "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">Локация</span>
                  <span className="text-sm font-mono text-white/70">{comp.city || "—"}</span>
                </div>
              </div>
           </GlassCard>

           <GlassCard className="p-10" hover={false}>
              <h3 className="text-[11px] font-mono text-white/40 uppercase tracking-[0.3em] mb-8">Подключенные источники</h3>
              <div className="space-y-3 mb-10">
                 {socials.length === 0 && <p className="text-[11px] text-white/20 font-mono italic">Нет активных источников...</p>}
                 {socials.map((s: any) => (
                   <div key={s.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex justify-between items-center">
                      <p className="text-[11px] font-bold text-white/60 uppercase font-mono">{s.platform}</p>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   </div>
                 ))}
              </div>
              <div className="space-y-4 pt-10 border-t border-white/[0.05]">
                 <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-xs text-white outline-none focus:border-white/30 transition-all">
                    <option value="telegram" className="bg-[#121214]">Telegram Channel</option>
                    <option value="vk" className="bg-[#121214]">VK.com Page</option>
                 </select>
                 <input value={socialUrl} onChange={e => setSocialUrl(e.target.value)} placeholder="https://..." className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-xs text-white outline-none font-mono focus:border-white/30 transition-all"/>
                 <button onClick={handleLink} disabled={isLinking} className="w-full bg-white text-black py-4 rounded-xl font-mono text-[11px] font-bold uppercase hover:bg-emerald-500 hover:text-white transition-all">
                    {isLinking ? "Синхронизация…" : "Подключить источник"}
                 </button>
              </div>
           </GlassCard>
        </div>

        <div className="col-span-8 flex flex-col h-[850px]">
           <GlassCard className="flex-1 flex flex-col overflow-hidden" hover={false}>
              <div className="px-10 py-8 border-b border-white/[0.06] bg-white/[0.01]">
                 <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/40">Хронология изменений</p>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar divide-y divide-white/[0.04]">
                 {signals.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                     <p className="text-sm font-mono">Сигналы отсутствуют</p>
                   </div>
                 )}
                 {signals.map((s: any) => (
                   <div key={s.id} className="p-10 hover:bg-white/[0.01] transition-all">
                      <div className="flex justify-between items-center mb-6">
                         <div className="flex items-center gap-4">
                            <SignalBadge label={s.tag} />
                            {s.tag === 'PRODUCT' && (
                              <button onClick={() => onViewDiff(s)} className="text-[10px] font-mono text-emerald-500 uppercase hover:underline">Просмотр Diff</button>
                            )}
                         </div>
                         <span className="text-[10px] font-mono text-white/20 uppercase">{getRelativeTime(s.created_at)}</span>
                      </div>
                      <AIInsight text={s.ai_analysis} defaultMsg={s.msg} />
                   </div>
                 ))}
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}

// --- Settings View ---
function SettingsView({ user }: any) {
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => { 
    setIsSaving(true); 
    setMessage(""); 
    try { 
      const token = localStorage.getItem("access_token"); 
      await apiRequest("/api/auth/me", { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ email, password: showPass ? password : "" }) }); 
      setMessage("Настройки успешно сохранены"); 
      setShowPass(false); 
      setPassword(""); 
    } catch (err: any) { setMessage(`Ошибка: ${err.message}`); } finally { setIsSaving(false); } 
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <GlassCard className="p-12" hover={false}>
        <h3 className="text-[12px] font-mono text-white/30 uppercase tracking-[0.4em] mb-12">Безопасность и аккаунт</h3>
        
        <div className="space-y-10">
          <div className="space-y-3">
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest ml-1">Электронная почта</p>
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-5 text-sm text-white font-mono outline-none focus:border-emerald-500/50 transition-all"/>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest ml-1">Доступ</p>
            {showPass ? (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Новый пароль…" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-6 py-5 text-sm text-white font-mono outline-none focus:border-emerald-500/50"/>
                <button onClick={() => setShowPass(false)} className="text-[10px] font-mono text-white/30 hover:text-white uppercase tracking-widest transition-colors ml-1">Отмена</button>
              </div>
            ) : (
              <button onClick={() => setShowPass(true)} className="text-[11px] font-mono text-white/60 border border-white/10 px-8 py-4 rounded-xl hover:bg-white/5 transition-all uppercase tracking-[0.2em]">Сменить пароль</button>
            )}
          </div>

          {message && <p className={`text-[11px] font-mono p-4 rounded-lg bg-white/5 ${message.startsWith("Ошибка") ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p>}

          <div className="pt-10 border-t border-white/[0.05]">
            <button onClick={handleSave} disabled={isSaving} className="w-full bg-white text-black py-5 rounded-2xl font-mono text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50">
              {isSaving ? "Сохранение…" : "Сохранить изменения"}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function VerificationBanner({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleResend = async () => { setLoading(true); try { const token = localStorage.getItem("access_token"); await apiRequest("/api/auth/resend-verification", { method: "POST", headers: { Authorization: `Bearer ${token}` } }); setSent(true); } catch (e) { alert("Ошибка при отправке"); } finally { setLoading(false); } };
  return (
    <div className="mb-10 animate-in fade-in slide-in-from-top-2 duration-700">
      <div className="border border-amber-500/20 bg-amber-500/[0.03] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-sm">
        <div className="flex items-center gap-5">
           <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
           </div>
           <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/90">Требуется подтверждение аккаунта</p>
              <p className="text-[11px] text-white/40 font-mono mt-1">Письмо отправлено на <span className="text-amber-500/80">{email}</span></p>
           </div>
        </div>
        <div className="flex items-center gap-4">
          {sent ? (
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 px-4 py-2 bg-emerald-400/10 rounded-lg">Отправлено</span>
          ) : (
            <button onClick={handleResend} disabled={loading} className="text-[10px] font-mono uppercase tracking-widest text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl border border-white/10 transition-all">
              {loading ? "Отправка…" : "Выслать повторно"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}