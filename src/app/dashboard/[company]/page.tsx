"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import ReactDiffViewer from "react-diff-viewer-continued";

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
  dashboard: "Обзор",
  competitors: "Мониторы",
  signals: "Сигналы",
  settings: "Настройки",
};

// --- Хелперы ---
const getRelativeTime = (dateStr: string) => {
  if (!dateStr) return "ожидание";
  const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`;
  return `${Math.floor(diff / 86400)} дн. назад`;
};

const getCompScore = (comp: any, signals: any[]) => {
  let score = 55;
  if (comp.inn) score += 15;
  const count = signals.filter(s => s.company === comp.name).length;
  score += count * 5;
  return Math.min(score, 99);
};

const Icons = {
  dashboard:   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1"/><rect x="9" y="9" width="5.5" height="5.5" rx="1"/></svg>,
  competitors: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
  signals:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8h2l2-5 3 10 2-7 2 4 1-2h2"/></svg>,
  settings:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/></svg>,
  trash:       <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 4h12M5 4V2.5c0-.3.2-.5.5-.5h5c.3 0 .5.2.5.5V4M6 7v5M10 7v5M3 4l1 10c0 .6.4 1 1 1h6c.6 0 1-.4 1-1l1-10" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevron:     <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 12l4-4-4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>
};

// --- AI Insight Component ---
function AIInsight({ text, defaultMsg }: { text?: string; defaultMsg: string }) {
  const isFailed = !text || text.includes("Не удалось") || text.includes("временно недоступен");

  if (isFailed) {
    return <p className="text-[13px] text-white/40 font-light leading-relaxed italic">{defaultMsg}</p>;
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
      <div className="relative flex gap-3 bg-white/[0.01] border border-white/5 rounded-2xl p-4">
        <div className="mt-1 shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="animate-pulse">
            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#10b981" />
          </svg>
        </div>
        <div>
          <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-[0.2em] block mb-1">AI Insight</span>
          <p className="text-[13px] text-white/90 leading-relaxed font-normal tracking-wide">{text}</p>
        </div>
      </div>
    </div>
  );
}

// --- Другие компоненты UI ---
function MetricAccent() { return <div className="absolute top-0 left-0 w-full h-[1.5px] opacity-60" style={{ clipPath: 'polygon(0 0, 60% 0, 70% 100%, 0 100%)' }} />; }
function SignalBadge({ label }: { label: string }) {
  const style = TAG_STYLES[label] || { color: "#71717a", bg: "rgba(113, 113, 122, 0.1)" };
  const text = TAG_LABELS_RU[label] || label;
  return ( <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider" style={{ color: style.color, backgroundColor: style.bg, borderColor: `${style.color}33` }}>{text}</span> );
}

function SledixLogo({ size = 28 }: { size?: number }) { return ( <svg width={size} height={size} viewBox="0 0 676 584" fill="white"><g transform="translate(0, 584) scale(0.1, -0.1)"><path d="M 2970 5165 c161 -51 273 -146 343 -292 l42 -88 0 -120 c-1 -107 -4 -127 -27 -182 -54 -128 -110 -190 -259 -289 -115 -77 -185 -148 -231 -235 l-33 -64 0 -160 c0 -156 1 -162 29 -218 41 -84 129 -173 248 -251 116 -76 184 -148 228 -241 51 -108 62 -214 35 -319 -50 -190 -200 -341 -385 -387 -83 -21 -496 -17 -613 5 -505 97 -919 440 -1102 914 -19 51 -47 141 -62 200 -23 94 -26 128 -26 277 0 94 5 206 12 250 86 559 531 1047 1081 1184 132 33 218 40 450 37 171 -3 226 -7 270 -21z m2597 11 c4 -4 -217 -230 -492 -502 l-500 -493 -370 0 c-413 -1 -466 5 -562 60 -75 43 -161 131 -200 204 -56 107 -67 265 -26 390 39 120 148 242 272 303 l75 37 170 6 c264 9 1623 5 1633 -5z m-1137 -1889 c186 -44 350 -117 520 -230 95 -64 300 -269 368 -369 107 -158 188 -353 229 -553 25 -125 25 -416 -1 -533 -72 -337 -260 -635 -533 -849 -202 -158 -452 -261 -710 -293 -109 -14 -421 -14 -493 0 -190 35 -376 216 -410 399 -31 165 23 351 132 460 27 27 88 75 134 107 197 133 284 277 284 467 0 185 -77 299 -312 464 -121 86 -149 114 -191 198 -43 86 -61 163 -61 260 0 78 4 99 31 162 61 143 135 223 273 293 94 48 109 50 380 46 228 -4 266 -7 360 -29z m-1425 -1858 c184 -81 300 -212 341 -385 27 -118 1 -241 -78 -362 -52 -80 -122 -142 -218 -191 l-75 -39 -932 -4 c-830 -3 -930 -2 -923 12 9 17 558 561 835 828 l180 174 410 -6 c395 -5 412 -6 460 -27z" /></g></svg> ); }


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

  const [diffData, setDiffData] = useState<{old: string, new: string, ai_analysis: string, msg: string} | null>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);

  if (typeof window !== "undefined" && !localStorage.getItem("access_token")) { window.location.href = "/auth/login"; return null; }

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
    try {
      const [uRes, cRes, sRes, stRes, dsRes] = await Promise.allSettled([
        apiRequest(`/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/competitors`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/signals`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/activity`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/distribution`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const results = [uRes, cRes, sRes, stRes, dsRes];
      const isUnauthorized = results.some(r => r.status === 'rejected' && r.reason.message.includes('401'));

      if(isUnauthorized) {
        handleLogout();
        return;
      }
      if (uRes.status === 'fulfilled') setUser(uRes.value);
      if (cRes.status === 'fulfilled') setCompetitors(cRes.value || []);
      if (sRes.status === 'fulfilled') setSignals(sRes.value || []);
      if (stRes.status === 'fulfilled') setStats(stRes.value || []);
      if (dsRes.status === 'fulfilled') setDist(dsRes.value || []);
      setIsLoading(false);
    } catch (err: unknown) { 
      setIsLoading(false);
      if (err instanceof Error && (err.message.includes('401') || err.message.includes('EXPIRED'))) {
        handleLogout();
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/auth/login";
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
    if (!confirm("Удалить монитор?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest(`/api/competitors/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (selectedComp?.id === id) setSelectedComp(null);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  if (isLoading) return <div className="h-screen bg-[#060608] flex items-center justify-center text-white/10 font-mono text-[10px] uppercase tracking-[0.5em]">Загрузка…</div>;

  return (
    <div className="flex h-screen bg-[#060608] text-white overflow-hidden font-sans antialiased">
      <aside className="w-56 shrink-0 flex flex-col border-r border-white/[0.06] bg-[#08080a]">
        <div className="h-14 flex items-center gap-3 px-5 border-b border-white/[0.06]"><SledixLogo size={36} /></div>
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold uppercase">{companySlug[0]}</div>
            <div className="flex-1 min-w-0"><p className="text-[11px] font-medium truncate">{companySlug}</p><p className="text-[8px] text-white/20 font-mono uppercase">Тариф {user?.plan || "Growth"}</p></div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <button onClick={() => {setPage("dashboard"); setSelectedComp(null);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${page==="dashboard" && !selectedComp?"bg-white/[0.08] text-white":"text-white/30 hover:text-white/60 hover:bg-white/[0.02]"}`}>{Icons.dashboard} Обзор</button>
          <button onClick={() => {setPage("competitors"); setSelectedComp(null);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${page==="competitors"?"bg-white/[0.08] text-white":"text-white/30 hover:text-white/60 hover:bg-white/[0.02]"}`}>{Icons.competitors} Монитор <span className="ml-auto text-[9px] bg-white/5 px-1.5 rounded font-mono">{competitors.length}</span></button>
          <button onClick={() => {setPage("signals"); setSelectedComp(null);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${page==="signals"?"bg-white/[0.08] text-white":"text-white/30 hover:text-white/60 hover:bg-white/[0.02]"}`}>{Icons.signals} Сигналы <span className="ml-auto text-[9px] bg-white/5 px-1.5 rounded font-mono">{signals.length}</span></button>
        </nav>
        <div className="px-3 pb-6 border-t border-white/[0.06] pt-4 space-y-0.5">
          <button onClick={() => setPage("settings")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${page === "settings" ? "bg-white/[0.08] text-white" : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]"}`}>{Icons.settings} Настройки</button>
          <div className="flex items-center gap-3 px-3 py-4 mt-2"><div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/30">{user?.email?.[0]?.toUpperCase()}</div><div className="flex-1 min-w-0"><p className="text-[10px] text-white/50 truncate font-mono">{user?.email}</p><button onClick={() => {localStorage.clear(); window.location.href="/auth/login"}} className="text-[8px] font-mono text-red-400/40 hover:text-red-400 uppercase tracking-tighter">Выйти</button></div></div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 shrink-0 flex items-center justify-between px-8 border-b border-white/[0.06] bg-[#060608]/50 backdrop-blur-xl z-20">
          <h1 className="font-display text-base font-bold tracking-tight uppercase text-white/90">{selectedComp ? selectedComp.name : (PAGE_TITLE_RU[page] || page)}</h1>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-400/80 uppercase tracking-widest"><span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"/> Онлайн</div>
             <button onClick={() => setShowModal(true)} className="text-[10px] tracking-[0.15em] uppercase bg-white text-black px-5 py-2 rounded-lg font-bold hover:bg-white/80 transition-all">+ Мониторинг</button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-[#060608]">
        {!user?.is_email_verified && <VerificationBanner email={user?.email} />}
          {selectedComp ? (
            <CompetitorDetailsView comp={selectedComp} signals={signals.filter(s => s.company === selectedComp.name)} onDelete={handleDelete} onBack={() => setSelectedComp(null)} onViewDiff={openDiff} />
          ) : (
            <>
              {page === "dashboard" && <DashboardView count={competitors.length} signals={signals} stats={stats} dist={dist} />}
              {page === "competitors" && <CompetitorsView competitors={competitors} signals={signals} onDelete={handleDelete} onSelect={setSelectedComp} />}
              {page === "signals" && <SignalsView signals={signals} onViewDiff={openDiff} />}
              {page === "settings" && <SettingsView user={user} />}
            </>
          )}
        </div>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-[#0f1012] border border-white/10 rounded-[40px] p-10 w-full max-w-md shadow-2xl relative">
            <h3 className="font-display text-xl font-bold mb-1 uppercase tracking-tight">Новый монитор</h3>
            <p className="text-white/20 text-[10px] mb-8 font-mono uppercase tracking-[0.3em]">Данные объекта</p>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="relative" ref={companyRef}>
                <p className="text-[9px] font-mono text-white/30 uppercase mb-2">Название / компания</p>
                <input required value={newCompName} onChange={e => {
                   setNewCompName(e.target.value);
                   if (e.target.value.length >= 3) {
                    fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Token ${DADATA_KEY}` }, body: JSON.stringify({ query: e.target.value }) }).then(r => r.json()).then(d => setPartySuggestions(d.suggestions || []));
                   } else setPartySuggestions([]);
                }} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-white/30 transition-all font-mono"/>
                {partySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#16171a] border border-white/10 rounded-2xl overflow-hidden z-[110] shadow-2xl">
                    {partySuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => { setNewCompName(s.value); setInn(s.data.inn || ""); if(s.data.address?.data?.city) setCity(s.data.address.data.city); setPartySuggestions([]); }} className="w-full px-5 py-4 hover:bg-white/5 border-b border-white/5 last:border-0 text-left"><p className="text-xs text-white font-medium">{s.value}</p><p className="text-[9px] text-white/20 uppercase mt-1">{s.data.address.value}</p></button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" ref={cityRef}>
                <p className="text-[9px] font-mono text-white/30 uppercase mb-2">Город / регион</p>
                <input required value={city} onChange={e => {
                   setCity(e.target.value);
                   if (e.target.value.length >= 2) {
                    fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Token ${DADATA_KEY}` }, body: JSON.stringify({ query: e.target.value, from_bound: { value: "city" }, to_bound: { value: "city" } }) }).then(r => r.json()).then(d => setCitySuggestions(d.suggestions || []));
                   } else setCitySuggestions([]);
                }} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-white/30 transition-all font-mono"/>
                {citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#16171a] border border-white/10 rounded-2xl overflow-hidden z-[110] shadow-2xl">
                    {citySuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => { setCity(s.value); setCitySuggestions([]); }} className="w-full px-5 py-4 hover:bg-white/5 border-b border-white/5 last:border-0 text-left text-[11px] text-white/60">{s.value}</button>
                    ))}
                  </div>
                )}
              </div>
              <div><p className="text-[9px] font-mono text-white/30 uppercase mb-2">Сайт</p><input required value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="www.example.com" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-white/30 font-mono"/></div>
              <div className="flex gap-4 pt-4"><button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-white/10 py-4 rounded-2xl text-[10px] font-mono font-bold uppercase text-white/30 transition-all hover:text-white">Отмена</button><button type="submit" disabled={isAdding} className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-mono font-bold uppercase">{isAdding ? "Сохранение…" : "Запустить"}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* --- DIFF MODAL --- */}
      {showDiffModal && diffData && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] flex flex-col p-10">
          <div className="flex justify-between items-start mb-8">
            <div className="max-w-2xl">
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight mb-4">Анализ изменений</h3>
              <AIInsight text={diffData.ai_analysis} defaultMsg={diffData.msg} />
            </div>
            <button onClick={() => setShowDiffModal(false)} className="px-8 py-3 bg-white text-black rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-white/90">Закрыть</button>
          </div>
          <div className="flex-1 overflow-auto rounded-[32px] border border-white/10 bg-[#08080a] custom-scrollbar">
            <ReactDiffViewer oldValue={diffData.old} newValue={diffData.new} splitView={true} useDarkTheme={true}
              styles={{
                variables: { dark: { diffViewerBackground: '#08080a', addedBackground: 'rgba(16, 185, 129, 0.08)', addedColor: '#10b981', removedBackground: 'rgba(239, 68, 68, 0.08)', removedColor: '#ef4444' } },
                contentText: { fontSize: '11px', fontFamily: 'monospace', lineHeight: '1.6' }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- СТРАНИЦЫ (VIEWS) ---

// --- Мини-компонент для метрик (просто текст и цифра) ---
type StatItemProps = {
  label: string;
  value: number | string;
  unit?: string;
  trend?: number[];
};

function StatItem({ label, value, unit = "" }: StatItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-light tracking-tighter text-white/90">{value}</span>
        {unit && <span className="text-xs font-mono text-white/20 uppercase">{unit}</span>}
      </div>
    </div>
  );
}

type ActivityPoint = {
  value: number;
};

type ActivityChartProps = {
  data: ActivityPoint[];
};

function ActivityChart({ data }: ActivityChartProps) {
  if (!data || data.length === 0) return <div className="h-full w-full flex items-center justify-center border border-white/5 text-[9px] font-mono text-white/10 uppercase tracking-widest">No data points</div>;
  
  const maxValue = Math.max(...data.map((d: ActivityPoint) => d.value), 1);
  const width = 1000; const height = 300;
  const points = data.map((d: ActivityPoint, i: number) => ({
    x: (i / (data.length - 1)) * width,
    y: height - (d.value / maxValue) * height
  }));

  const d = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p: { x: number; y: number }) => `L ${p.x} ${p.y}`).join(" ");

  return (
    <div className="w-full h-full group/chart">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        {/* Сетка на фоне */}
        <line x1="0" y1="0" x2={width} y2="0" stroke="white" strokeOpacity="0.03" strokeDasharray="4 4" />
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="white" strokeOpacity="0.03" strokeDasharray="4 4" />
        <line x1="0" y1={height} x2={width} y2={height} stroke="white" strokeOpacity="0.03" strokeDasharray="4 4" />
        
        {/* Основная линия */}
        <path d={d} fill="none" stroke="white" strokeWidth="1.5" className="opacity-80 transition-all group-hover/chart:opacity-100" />
        
        {/* Точки данных */}
        {points.map((p: { x: number; y: number }, i: number) => (
          <circle key={i} cx={p.x} cy={p.y} r="2" fill="black" stroke="white" strokeWidth="1" className="opacity-0 group-hover/chart:opacity-100 transition-opacity" />
        ))}
      </svg>
    </div>
  );
}

type ClassificationMatrixProps = {
  data: Array<{ label: string; value: number }>;
};

function ClassificationMatrix({ data }: ClassificationMatrixProps) {
  const total = data.reduce((acc: number, curr: { value: number }) => acc + curr.value, 0);
  return (
    <div className="w-full space-y-6">
      {data.map((item: { label: string; value: number }, i: number) => (
        <div key={i} className="flex items-center justify-between group/item">
          <div className="flex flex-col">
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest group-hover/item:text-white/60 transition-colors">
              {TAG_LABELS_RU[item.label] || item.label}
            </span>
            <div className="h-[1px] w-12 bg-white/10 mt-1 transition-all group-hover/item:w-full group-hover/item:bg-white/40" />
          </div>
          <span className="text-lg font-light text-white/80">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// --- ГЛАВНЫЙ DASHBOARD VIEW ---
type DashboardViewProps = {
  count: number;
  signals: any[];
  stats: any[];
  dist: any[];
};



// --- 1. Микро-график для метрик (Sparkline) ---
function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 20;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((v - min) / range) * height
  }));
  const d = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  return (
    <svg width={width} height={height} className="opacity-40">
      <path d={d} fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}



// --- 2. Радиальная диаграмма распределения (Donut) ---
function ClassificationDonut({ data }: { data: any[] }) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  let currentOffset = 0;
  const radius = 40;
  const center = 50;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="relative flex items-center gap-12">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" stroke="white" strokeOpacity="0.03" strokeWidth="8" />
          {data.map((item, i) => {
            const percentage = item.value / total;
            const strokeDasharray = `${percentage * circumference} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += percentage * circumference;
            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="white"
                strokeOpacity={0.1 + (i * 0.15)}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-mono text-white/20 uppercase">Total</span>
          <span className="text-lg font-light text-white/80">{total}</span>
        </div>
      </div>
      <div className="flex-1 space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-white transition-opacity" style={{ opacity: 0.1 + (i * 0.15) }} />
              <span className="text-[10px] font-mono uppercase text-white/40 group-hover:text-white/80 transition-colors">{TAG_LABELS_RU[item.label] || item.label}</span>
            </div>
            <span className="text-[10px] font-mono text-white/20">{Math.round((item.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- 3. Радиальный Gauge для Coverage ---
function CoverageGauge({ value }: { value: number }) {
  const radius = 80;
  const circumference = Math.PI * radius; // Полукруг
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 border border-white/5 bg-white/[0.01] rounded-sm">
      <div className="relative w-48 h-24 overflow-hidden">
        <svg viewBox="0 0 180 90" className="w-full h-full">
          <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="white" strokeOpacity="0.03" strokeWidth="12" strokeLinecap="round" />
          <path 
            d="M 10 90 A 80 80 0 0 1 170 90" 
            fill="none" 
            stroke="white" 
            strokeOpacity="0.4" 
            strokeWidth="12" 
            strokeDasharray={circumference} 
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-[1.5s] ease-out"
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <span className="text-3xl font-light tracking-tighter text-white">{value}%</span>
          <span className="text-[8px] font-mono uppercase text-white/20 tracking-[0.2em] mb-1">Network Capacity</span>
        </div>
      </div>
    </div>
  );
}

// --- ОБНОВЛЕННЫЙ DASHBOARD VIEW ---
function DashboardView({ count, signals, stats, dist }: DashboardViewProps) {
  const dataPoints = count + signals.length;
  const coverage = count > 0 ? Math.round((new Set(signals.map((s: any) => s.company)).size / count) * 100) : 0;

  return (
    <div className="space-y-20 animate-in fade-in duration-1000 max-w-[1400px] pb-20">
      
      {/* Метрики с трендами */}
      <div className="grid grid-cols-4 gap-12 border-b border-white/5 pb-12">
        <StatItem label="Active Monitors" value={count} trend={[5, 8, 7, 10, 12, count]} />
        <StatItem label="Intelligence Signals" value={signals.length} trend={[100, 120, 110, 150, 180, signals.length]} />
        <StatItem label="Scanned Points" value={dataPoints} trend={[1000, 1100, 1050, 1300, 1400, dataPoints]} />
        <StatItem label="Success Rate" value="98.2" unit="%" trend={[97, 98, 97, 99, 98, 98.2]} />
      </div>

      <div className="grid grid-cols-12 gap-16">
        {/* Активность (Линейный график) */}
        <div className="col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">Event Propagation Timeline</h3>
            <div className="flex gap-4 text-[9px] font-mono uppercase text-white/20">
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-white/40 rounded-sm" /> Historical</div>
               <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500/40 rounded-sm" /> Predicted</div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ActivityChart data={stats} />
          </div>
        </div>

        {/* Радиальный Охват */}
        <div className="col-span-4 space-y-8">
          <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">Infrastructure</h3>
          <CoverageGauge value={coverage} />
          <div className="p-6 border border-white/5 space-y-4">
             <div className="flex justify-between text-[10px] font-mono uppercase">
                <span className="text-white/20">Uptime</span>
                <span className="text-emerald-500/80">99.99%</span>
             </div>
             <div className="h-[1px] w-full bg-white/5" />
             <div className="flex justify-between text-[10px] font-mono uppercase">
                <span className="text-white/20">Latency</span>
                <span className="text-white/60">240ms</span>
             </div>
          </div>
        </div>

        {/* Кольцевая диаграмма распределения */}
        <div className="col-span-5 space-y-8">
           <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">Signal Distribution</h3>
           <div className="p-10 border border-white/5 rounded-sm">
              <ClassificationDonut data={dist} />
           </div>
        </div>

        {/* Лента последних событий */}
        <div className="col-span-7 space-y-8">
           <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/40">Latest Analysis</h3>
           <div className="divide-y divide-white/5 border-t border-white/5">
              {signals.slice(0, 4).map((sig) => (
                <div key={sig.id} className="py-5 flex items-start gap-6 group">
                   <span className="text-[9px] font-mono text-white/10 shrink-0 mt-1">{getRelativeTime(sig.created_at)}</span>
                   <div className="flex-1">
                      <p className="text-[12px] text-white/60 font-light group-hover:text-white/90 transition-colors line-clamp-1 italic">
                        "{sig.ai_analysis || sig.msg}"
                      </p>
                      <p className="text-[8px] font-mono text-white/10 uppercase tracking-widest mt-1">{sig.company}</p>
                   </div>
                   <SignalBadge label={sig.tag} />
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function CompetitorDetailsView({ comp, signals, onDelete, onBack, onViewDiff }: any) {
  const [socialUrl, setSocialUrl] = useState("");
  const [platform, setPlatform] = useState("telegram");
  const [socials, setSocials] = useState<any[]>([]);
  const [isLinking, setIsLinking] = useState(false);
  const fetchSocials = async () => { try { const token = localStorage.getItem("access_token"); const data = await apiRequest(`/api/competitors/${comp.id}/socials`, { headers: { Authorization: `Bearer ${token}` } }); setSocials(data || []); } catch (e) {} };
  useEffect(() => { fetchSocials(); }, [comp.id]);
  const handleLink = async () => { if (!socialUrl) return; setIsLinking(true); try { const token = localStorage.getItem("access_token"); await apiRequest(`/api/competitors/${comp.id}/socials`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ platform, url: socialUrl, interval: 60 }) }); setSocialUrl(""); fetchSocials(); } catch (e) {} finally { setIsLinking(false); } };
  return (
    <div className="animate-in slide-in-from-bottom-2 duration-700 space-y-10 max-w-[1200px]">
      <div className="flex justify-between items-center"><button onClick={onBack} className="text-[10px] font-mono text-white/30 hover:text-white flex items-center gap-3 uppercase tracking-widest transition-all"><span className="text-lg">←</span> К обзору</button><button onClick={(e) => onDelete(e, comp.id)} className="text-[10px] font-mono text-red-500/40 hover:text-red-400 uppercase px-5 py-2 rounded-xl border border-red-500/10 hover:bg-red-500/5 transition-all">Удалить монитор</button></div>
      <div className="grid grid-cols-3 gap-10">
        <div className="col-span-1 space-y-8">
           <div className="border border-white/[0.07] rounded-[40px] p-10 bg-[#08080a]"><div className="w-20 h-20 bg-white/5 rounded-[24px] flex items-center justify-center text-4xl font-bold text-white/10 uppercase font-mono mb-10">{comp.name[0]}</div><h2 className="font-display text-3xl font-bold mb-2">{comp.name}</h2><p className="text-sm text-white/30 font-mono mb-10 pb-10 border-b border-white/5">{comp.website_url}</p><div className="space-y-6 pt-2"><div><p className="text-[10px] font-mono text-white/20 uppercase mb-2 tracking-widest">ИНН</p><p className="text-sm font-mono text-white/60 bg-white/[0.02] p-4 rounded-2xl border border-white/5">{comp.inn || "—"}</p></div><div><p className="text-[10px] font-mono text-white/20 uppercase mb-2 tracking-widest">Регион</p><p className="text-sm font-mono text-white/60 bg-white/[0.02] p-4 rounded-2xl border border-white/5">{comp.city || "—"}</p></div></div></div>
           <div className="border border-white/[0.06] rounded-[40px] p-10 bg-[#08080a]"><p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] mb-8">Наблюдатели</p><div className="space-y-4 mb-10">{socials.map((s: any) => (<div key={s.id} className="p-5 border border-white/5 rounded-3xl bg-white/[0.01] flex justify-between items-center"><p className="text-[11px] text-white/60 font-mono uppercase">{s.platform}</p><div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse"/></div>))}</div><div className="space-y-4 pt-8 border-t border-white/5"><select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white outline-none"><option value="telegram">Telegram</option><option value="vk">VK.com</option></select><input value={socialUrl} onChange={e => setSocialUrl(e.target.value)} placeholder="Ссылка на канал или страницу…" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white outline-none font-mono focus:border-white/30 transition-all"/><button onClick={handleLink} disabled={isLinking} className="w-full bg-white text-black py-5 rounded-2xl font-mono text-[11px] font-bold uppercase hover:bg-white/90 transition-all">{isLinking ? "Подключаем…" : "Подключить"}</button></div></div>
        </div>
        <div className="col-span-2 border border-white/[0.07] rounded-[40px] bg-[#08080a] overflow-hidden flex flex-col h-[850px]">
           <div className="divide-y divide-white/[0.04] overflow-auto custom-scrollbar">
              {signals.map((s: any) => (
                <div key={s.id} className="p-10 hover:bg-white/[0.01] transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <SignalBadge label={s.tag} />
                      {s.tag === 'PRODUCT' && <button onClick={() => onViewDiff(s)} className="text-[9px] font-mono text-emerald-400 hover:underline uppercase">Изменения</button>}
                    </div>
                    <span className="text-[10px] font-mono text-white/10 uppercase">{getRelativeTime(s.created_at)}</span>
                  </div>
                  <AIInsight text={s.ai_analysis} defaultMsg={s.msg} />
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function SignalsView({ signals, onViewDiff }: any) {
  return (
    <div className="border border-white/[0.06] rounded-[40px] bg-[#08080a] overflow-hidden max-w-[1200px] animate-in fade-in duration-700">
        <div className="px-10 py-8 border-b border-white/[0.06] bg-white/[0.01] flex justify-between items-center"><p className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/40">Все сигналы</p><span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{signals.length} записей</span></div>
        <div className="divide-y divide-white/[0.04]">
          {signals.map((s: any) => (
            <div key={s.id} className="flex items-start gap-12 px-10 py-8 hover:bg-white/[0.01] transition-all">
              <div className="w-32 shrink-0"><p className="text-[11px] font-bold text-white/70 uppercase font-mono truncate tracking-tighter">{s.company}</p></div>
              <div className="flex-1"><AIInsight text={s.ai_analysis} defaultMsg={s.msg} /></div>
              <div className="flex flex-col items-end gap-2">
                <SignalBadge label={s.tag} />
                {s.tag === 'PRODUCT' && <button onClick={() => onViewDiff(s)} className="text-[9px] font-mono text-emerald-400 hover:underline uppercase">Сравнить</button>}
              </div>
              <span className="text-[11px] font-mono text-white/20 w-24 text-right shrink-0">{getRelativeTime(s.created_at)}</span>
            </div>
          ))}
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
  const handleSave = async () => { setIsSaving(true); setMessage(""); try { const token = localStorage.getItem("access_token"); await apiRequest("/api/auth/me", { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ email, password: showPass ? password : "" }) }); setMessage("Настройки сохранены"); setShowPass(false); setPassword(""); } catch (err: any) { setMessage(`Ошибка: ${err.message}`); } finally { setIsSaving(false); } };
  return (
    <div className="max-w-2xl space-y-10 animate-in fade-in duration-700">
      <div className="border border-white/[0.06] rounded-[40px] bg-[#08080a] p-12 space-y-10 shadow-2xl">
        <p className="text-[11px] font-mono text-white/30 uppercase tracking-[0.4em] mb-10">Аккаунт</p>
        <div className="space-y-4"><p className="text-[10px] font-mono text-white/20 uppercase tracking-widest ml-1">Электронная почта</p><input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-[13px] text-white font-mono outline-none focus:border-white/30 transition-all"/></div>
        <div className="space-y-6"><p className="text-[10px] font-mono text-white/20 uppercase tracking-widest ml-1">Пароль</p>{showPass ? (<div className="space-y-6 animate-in slide-in-from-top-2 duration-300"><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Новый пароль…" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-[13px] text-white font-mono outline-none focus:border-white/30"/><button onClick={() => setShowPass(false)} className="text-[10px] font-mono text-white/20 hover:text-white uppercase tracking-widest transition-colors ml-1">Отмена</button></div>) : (<button onClick={() => setShowPass(true)} className="text-[10px] font-mono text-white/40 border border-white/10 px-8 py-4 rounded-2xl hover:bg-white/5 transition-all uppercase tracking-widest">Сменить пароль</button>)}</div>
        {message && <p className={`text-[11px] font-mono leading-relaxed ${message.startsWith("Ошибка") ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p>}
        <div className="pt-10 border-t border-white/5"><button onClick={handleSave} disabled={isSaving} className="w-full bg-white text-black py-6 rounded-[24px] font-mono text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-white/90 disabled:opacity-50 transition-all">{isSaving ? "Сохранение…" : "Сохранить"}</button></div>
      </div>
    </div>
  );
}

function VerificationBanner({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleResend = async () => { setLoading(true); try { const token = localStorage.getItem("access_token"); await apiRequest("/api/auth/resend-verification", { method: "POST", headers: { Authorization: `Bearer ${token}` } }); setSent(true); } catch (e) { alert("Не удалось отправить письмо"); } finally { setLoading(false); } };
  return (
    <div className="mb-12 animate-in fade-in slide-in-from-top-2 duration-700">
      <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4"><div className="flex items-center gap-4"><div className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500/40 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500/80"></span></div><div className="flex flex-col"><span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">Подтвердите почту</span><span className="text-[11px] font-mono text-white/20 mt-0.5">Ожидаем письмо на <span className="text-white/60">{email}</span></span></div></div><div className="flex items-center gap-6">{sent ? ( <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400/60 bg-emerald-400/5 px-3 py-1 rounded-full border border-emerald-400/10">Проверьте почту</span> ) : ( <button onClick={handleResend} disabled={loading} className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/30 hover:text-white transition-colors border-b border-white/10 hover:border-white/40 pb-0.5 disabled:opacity-20">{loading ? "Отправка…" : "Выслать снова"}</button> )}</div></div>
    </div>
  );
}




type CompetitorCardProps = {
  c: any;
  signals: any[];
  onDelete: (e: React.MouseEvent, id: string) => void;
  onSelect: (comp: any) => void;
};

function CompetitorCard({ c, signals, onDelete, onSelect }: CompetitorCardProps) {
  const score = getCompScore(c, signals);
  const lastSignal = signals
    .filter((s: any) => s.company === c.name)
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  return (
    <div
      onClick={() => onSelect(c)}
      className="group relative flex flex-col justify-between p-6 bg-transparent border-b border-white/5 hover:bg-white/[0.02] transition-all duration-300 cursor-pointer"
    >
      {/* Верхняя строка: Название и Индекс */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-[11px] font-medium text-white/40 border border-white/10">
            {c.name[0]}
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-[14px] font-medium text-white/90 truncate tracking-tight">
              {c.name}
            </h4>
            <span className="text-[10px] text-white/30 font-mono truncate">
              {c.website_url.replace(/^https?:\/\//, "")}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-[14px] font-mono font-medium text-white/80">
            {score}%
          </span>
          <span className="text-[8px] uppercase tracking-[0.1em] text-white/20">Index</span>
        </div>
      </div>

      {/* Контент: Только текст последнего сигнала, без лишних плашек */}
      <div className="mb-4">
        {lastSignal ? (
          <p className="text-[12px] text-white/40 leading-relaxed line-clamp-2 font-light">
            {lastSignal.ai_analysis || lastSignal.msg}
          </p>
        ) : (
          <p className="text-[11px] text-white/10 font-mono uppercase tracking-widest">
            Idle
          </p>
        )}
      </div>

      {/* Нижняя строка: Мета и удаление (появляется при ховере) */}
      <div className="flex items-center justify-between h-4">
        <div className="flex items-center gap-3">
            <span className="text-[9px] text-white/20 font-mono uppercase tracking-wider">
                {c.city || "Global"}
            </span>
            {lastSignal && (
                <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
                    <span className="text-[9px] text-emerald-500/50 font-mono uppercase">Live</span>
                </div>
            )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e, c.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-white/20 hover:text-red-400"
        >
          {Icons.trash}
        </button>
      </div>
    </div>
  );
}

type CompetitorsViewProps = {
  competitors: any[];
  signals: any[];
  onDelete: (e: React.MouseEvent, id: string) => void;
  onSelect: (comp: any) => void;
};

function CompetitorsView({ competitors, signals, onDelete, onSelect }: CompetitorsViewProps) {
  return (
    <div className="max-w-[1100px] border-t border-white/5 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {competitors.map((c: any) => (
          <CompetitorCard
            key={c.id}
            c={c}
            signals={signals}
            onDelete={onDelete}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}