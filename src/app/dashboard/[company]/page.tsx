"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import ReactDiffViewer from "react-diff-viewer-continued";

const DADATA_KEY = "4affb62ba89180ef3405454f9a047fa680d957ed";

// --- Цветовая схема и константы ---
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

const Icons = {
  dashboard:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  competitors: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  signals:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  settings:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  trash:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  plus:        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  globe:       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
};

const getRelativeTime = (dateStr: string) => {
  if (!dateStr) return "ожидание";
  const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)}м`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}ч`;
  return `${Math.floor(diff / 86400)}д`;
};

// --- Мини-компоненты ---

function SignalBadge({ label }: { label: string }) {
  const style = TAG_STYLES[label] || { color: "#71717a", bg: "rgba(113, 113, 122, 0.1)" };
  return (
    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider" 
          style={{ color: style.color, backgroundColor: style.bg, borderColor: `${style.color}33` }}>
      {TAG_LABELS_RU[label] || label}
    </span>
  );
}

function AIInsightMinimal({ text, date, tag, onViewDiff, hasDiff }: any) {
  return (
    <div className="group relative py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.01] transition-colors">
      <div className="flex items-start gap-4">
        <div className="mt-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" /></div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <SignalBadge label={tag} />
            <span className="text-[10px] font-mono text-white/20">{getRelativeTime(date)}</span>
            {hasDiff && (
              <button onClick={onViewDiff} className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2">Diff</button>
            )}
          </div>
          <p className="text-[13px] text-white/70 leading-relaxed font-light">{text}</p>
        </div>
      </div>
    </div>
  );
}

// --- Основной компонент ---

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
  const [isAdding, setIsAdding] = useState(false);

  const [diffData, setDiffData] = useState<{old: string, new: string, ai_analysis: string, msg: string} | null>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);

  // Рефы для Dadata
  const companyRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const [partySuggestions, setPartySuggestions] = useState<any[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const [uRes, cRes, sRes, stRes, dsRes] = await Promise.allSettled([
        apiRequest(`/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/competitors`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/signals`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/activity`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/distribution`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (uRes.status === 'fulfilled') {
        setUser(uRes.value);
        if (companySlug && companySlug !== uRes.value.tenant_slug) {
          window.location.href = `/dashboard/${uRes.value.tenant_slug}`;
          return;
        }
      }
      if (cRes.status === 'fulfilled') setCompetitors(cRes.value || []);
      if (sRes.status === 'fulfilled') setSignals(sRes.value || []);
      if (stRes.status === 'fulfilled') setStats(stRes.value || []);
      if (dsRes.status === 'fulfilled') setDist(dsRes.value || []);
      
      setIsLoading(false);
    } catch (err) { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, [companySlug]);

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
      await apiRequest("/api/competitors", { 
        method: "POST", 
        headers: { Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ name: newCompName, website_url: newCompUrl, city }) 
      });
      setNewCompName(""); setNewCompUrl(""); setCity(""); setShowModal(false); fetchData();
    } catch (err: any) { alert(err.message); } finally { setIsAdding(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить объект мониторинга?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest(`/api/competitors/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (selectedComp?.id === id) setSelectedComp(null);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  if (isLoading) return <div className="h-screen bg-[#060608] flex items-center justify-center text-white/10 font-mono text-[10px] uppercase tracking-[0.5em]">System Booting…</div>;

  return (
    <div className="flex h-screen bg-[#060608] text-white overflow-hidden font-sans antialiased">
      {/* --- Sidebar --- */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/[0.04] bg-[#08080a]">
        <div className="h-16 flex items-center px-6 border-b border-white/[0.04]">
          <span className="text-sm font-bold tracking-widest uppercase">Sledix <span className="text-emerald-500">.</span></span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavItem active={page==="dashboard" && !selectedComp} onClick={() => {setPage("dashboard"); setSelectedComp(null)}} icon={Icons.dashboard} label="Дашборд" />
          <NavItem active={page==="competitors"} onClick={() => {setPage("competitors"); setSelectedComp(null)}} icon={Icons.competitors} label="Мониторы" count={competitors.length} />
          <NavItem active={page==="signals"} onClick={() => {setPage("signals"); setSelectedComp(null)}} icon={Icons.signals} label="Лента" count={signals.length} />
        </nav>

        <div className="p-4 border-t border-white/[0.04]">
           <button onClick={() => setPage("settings")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${page === "settings" ? "text-white bg-white/5" : "text-white/40 hover:text-white"}`}>
             {Icons.settings} Настройки
           </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/[0.04] bg-[#060608]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
             <h1 className="text-sm font-medium text-white/90 uppercase tracking-widest">
               {selectedComp ? selectedComp.name : (page === "dashboard" ? "Обзор системы" : page === "competitors" ? "Объекты" : "События")}
             </h1>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-white text-black text-[10px] font-bold uppercase px-4 py-2 rounded hover:bg-zinc-200 transition-all flex items-center gap-2">
            {Icons.plus} Добавить монитор
          </button>
        </header>

        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          {selectedComp ? (
            <CompetitorDetailsView comp={selectedComp} signals={signals.filter(s => s.company === selectedComp.name)} onBack={() => setSelectedComp(null)} onViewDiff={openDiff} />
          ) : (
            <>
              {page === "dashboard" && <DashboardView count={competitors.length} signals={signals} stats={stats} dist={dist} />}
              {page === "competitors" && <CompetitorsList competitors={competitors} onSelect={setSelectedComp} onDelete={handleDelete} />}
              {page === "signals" && <SignalsView signals={signals} onViewDiff={openDiff} />}
              {page === "settings" && <SettingsView user={user} />}
            </>
          )}
        </div>
      </main>

      {/* --- Modals (Add & Diff) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-[#0f1012] border border-white/10 rounded-2xl p-8 w-full max-w-md">
              <h3 className="text-lg font-bold mb-6 uppercase tracking-tight">Новый объект</h3>
              <form onSubmit={handleAdd} className="space-y-5">
                <div ref={companyRef}>
                  <label className="text-[10px] font-mono text-white/30 uppercase block mb-2">Название</label>
                  <input required value={newCompName} onChange={e => {
                    setNewCompName(e.target.value);
                    if (e.target.value.length >= 3) {
                      fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party", { 
                        method: "POST", 
                        headers: { "Content-Type": "application/json", "Authorization": `Token ${DADATA_KEY}` }, 
                        body: JSON.stringify({ query: e.target.value }) 
                      }).then(r => r.json()).then(d => setPartySuggestions(d.suggestions || []));
                    } else setPartySuggestions([]);
                  }} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-white/30 outline-none" />
                  {partySuggestions.length > 0 && (
                    <div className="absolute bg-[#16171a] border border-white/10 rounded-lg mt-1 w-[384px] z-[110] max-h-40 overflow-auto">
                      {partySuggestions.map((s, i) => (
                        <button key={i} type="button" onClick={() => { setNewCompName(s.value); setCity(s.data.address?.data?.city || ""); setPartySuggestions([]); }} className="w-full px-4 py-2 hover:bg-white/5 text-left text-[11px] text-white/60 border-b border-white/5">{s.value}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/30 uppercase block mb-2">Сайт (URL)</label>
                  <input required value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="example.com" className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-white/30 outline-none" />
                </div>
                <div ref={cityRef}>
                  <label className="text-[10px] font-mono text-white/30 uppercase block mb-2">Город</label>
                  <input required value={city} onChange={e => {
                    setCity(e.target.value);
                    if (e.target.value.length >= 2) {
                      fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", { 
                        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Token ${DADATA_KEY}` }, 
                        body: JSON.stringify({ query: e.target.value, from_bound: { value: "city" }, to_bound: { value: "city" } }) 
                      }).then(r => r.json()).then(d => setCitySuggestions(d.suggestions || []));
                    } else setCitySuggestions([]);
                  }} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-sm focus:border-white/30 outline-none" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-white/10 rounded-lg text-xs font-bold uppercase text-white/40 hover:text-white transition-all">Отмена</button>
                  <button type="submit" disabled={isAdding} className="flex-1 px-4 py-3 bg-white text-black rounded-lg text-xs font-bold uppercase hover:bg-zinc-200 transition-all">
                    {isAdding ? "..." : "Запустить"}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {showDiffModal && diffData && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex flex-col p-6">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest">Анализ изменений</h3>
              <button onClick={() => setShowDiffModal(false)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-[10px] uppercase font-bold transition-all">Закрыть</button>
           </div>
           <div className="flex-1 overflow-auto rounded-xl border border-white/10 bg-[#08080a]">
              <ReactDiffViewer oldValue={diffData.old} newValue={diffData.new} splitView={true} useDarkTheme={true} />
           </div>
        </div>
      )}
    </div>
  );
}

// --- Вспомогательные компоненты ---

function NavItem({ active, onClick, icon, label, count }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active ? "bg-white/5 text-white shadow-sm" : "text-white/30 hover:text-white hover:bg-white/[0.02]"}`}>
      <span className={active ? "text-emerald-500" : "text-inherit"}>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && <span className="text-[10px] font-mono opacity-40">{count}</span>}
    </button>
  );
}

// --- Views ---

function DashboardView({ count, signals, stats, dist }: any) {
  return (
    <div className="space-y-10 max-w-6xl animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Всего мониторов" value={count} trend="+1 в этом месяце" />
        <StatCard label="Сигналы (24ч)" value={signals.filter((s:any) => new Date(s.created_at) > new Date(Date.now() - 86400000)).length} trend="Активно" />
        <StatCard label="Здоровье системы" value="98%" trend="Норма" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-[#08080a] border border-white/[0.04] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30">Активность мониторинга</h3>
          </div>
          <div className="h-64 flex items-end gap-1 px-2">
            {stats.map((s:any, i:number) => (
              <div key={i} className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/40 transition-all rounded-t-sm" style={{ height: `${(s.value / Math.max(...stats.map((x:any)=>x.value), 1)) * 100}%` }} title={`${s.value} сигналов`} />
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-[#08080a] border border-white/[0.04] rounded-2xl p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-6">Категории</h3>
            <div className="space-y-4">
              {dist.slice(0, 5).map((d:any, i:number) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-white/50">{TAG_LABELS_RU[d.label] || d.label}</span>
                  <span className="font-mono">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompetitorsList({ competitors, onSelect, onDelete }: any) {
  return (
    <div className="max-w-6xl animate-in fade-in duration-500">
      <div className="bg-[#08080a] border border-white/[0.04] rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.04] bg-white/[0.01]">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Название</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30">Локация</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-white/30 text-right">Статус</th>
              <th className="px-6 py-4 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {competitors.map((c: any) => (
              <tr key={c.id} onClick={() => onSelect(c)} className="group hover:bg-white/[0.01] cursor-pointer transition-colors">
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium group-hover:text-emerald-400 transition-colors">{c.name}</span>
                    <span className="text-[10px] text-white/20 font-mono mt-0.5">{c.website_url}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 text-[11px] text-white/40 uppercase tracking-tighter">
                    {Icons.globe} {c.city || "—"}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/5 text-emerald-500/60 text-[9px] font-bold uppercase tracking-widest">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Live
                  </span>
                </td>
                <td className="px-6 py-5">
                  <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="p-2 text-white/10 hover:text-red-400 transition-colors">
                    {Icons.trash}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CompetitorDetailsView({ comp, signals, onBack, onViewDiff }: any) {
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
      await apiRequest(`/api/competitors/${comp.id}/socials`, { 
        method: "POST", headers: { Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ platform, url: socialUrl, interval: 60 }) 
      });
      setSocialUrl(""); fetchSocials();
    } catch (e) {} finally { setIsLinking(false); }
  };

  return (
    <div className="max-w-6xl animate-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="text-[10px] font-bold uppercase text-white/30 hover:text-white mb-8 flex items-center gap-2 transition-all">
        ← Вернуться к списку
      </button>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-[#08080a] border border-white/[0.04] rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-1">{comp.name}</h2>
            <p className="text-xs text-white/30 font-mono mb-6">{comp.website_url}</p>
            <div className="pt-4 border-t border-white/[0.04] space-y-4">
              <div className="flex justify-between text-[11px] uppercase tracking-tighter">
                <span className="text-white/30 italic">Локация</span>
                <span className="text-white/60">{comp.city || "—"}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#08080a] border border-white/[0.04] rounded-2xl p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-6">Социальные сети</h3>
            <div className="space-y-3 mb-6">
              {socials.map((s: any) => (
                <div key={s.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex justify-between items-center text-xs">
                  <span className="uppercase font-mono text-white/40">{s.platform}</span>
                  <span className="text-emerald-500 text-[10px] uppercase font-bold">Active</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-4 border-t border-white/[0.04]">
              <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs outline-none">
                <option value="telegram">Telegram</option>
                <option value="vk">VK.com</option>
              </select>
              <input value={socialUrl} onChange={e => setSocialUrl(e.target.value)} placeholder="Ссылка..." className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs outline-none font-mono" />
              <button onClick={handleLink} disabled={isLinking} className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase transition-all">
                {isLinking ? "..." : "Добавить"}
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 bg-[#08080a] border border-white/[0.04] rounded-2xl p-8 min-h-[500px]">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-8 text-center">Лента событий объекта</h3>
          <div className="space-y-2">
            {signals.map((s: any) => (
              <AIInsightMinimal key={s.id} text={s.ai_analysis || s.msg} date={s.created_at} tag={s.tag} hasDiff={s.tag === 'PRODUCT'} onViewDiff={() => onViewDiff(s)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SignalsView({ signals, onViewDiff }: any) {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
       <div className="bg-[#08080a] border border-white/[0.04] rounded-2xl overflow-hidden">
          <div className="px-8 py-4 border-b border-white/[0.04] bg-white/[0.01]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30">Все события системы</h3>
          </div>
          <div className="p-8">
            {signals.map((s: any) => (
               <div key={s.id} className="flex gap-8 py-6 border-b border-white/[0.03] last:border-0 items-start">
                  <div className="w-24 shrink-0">
                    <p className="text-[10px] font-bold text-white/60 uppercase truncate">{s.company}</p>
                    <p className="text-[9px] font-mono text-white/20 mt-1">{getRelativeTime(s.created_at)}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] text-white/80 leading-relaxed font-light">{s.ai_analysis || s.msg}</p>
                    <div className="flex gap-2 mt-3">
                       <SignalBadge label={s.tag} />
                       {s.tag === 'PRODUCT' && <button onClick={() => onViewDiff(s)} className="text-[9px] font-mono text-emerald-400 underline underline-offset-4">Посмотреть разницу</button>}
                    </div>
                  </div>
               </div>
            ))}
          </div>
       </div>
    </div>
  );
}

function SettingsView({ user }: any) {
  return (
    <div className="max-w-xl animate-in fade-in duration-500">
      <div className="bg-[#08080a] border border-white/[0.04] rounded-2xl p-8">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-8 text-center">Профиль</h3>
        <div className="space-y-6">
          <div>
            <label className="text-[10px] text-white/20 uppercase block mb-2">Email</label>
            <div className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3 text-sm font-mono text-white/40">
              {user?.email}
            </div>
          </div>
          <div>
             <label className="text-[10px] text-white/20 uppercase block mb-2">Тарифный план</label>
             <div className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-4 py-3 text-sm font-mono text-emerald-500">
               {user?.plan || "Growth"}
             </div>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.href = "/auth/login"; }} className="w-full mt-8 py-3 border border-red-500/20 text-red-500/60 hover:bg-red-500/5 rounded-lg text-[10px] font-bold uppercase transition-all">
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend }: any) {
  return (
    <div className="bg-[#08080a] border border-white/[0.04] rounded-2xl p-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">{label}</p>
      <p className="text-3xl font-light mb-2">{value}</p>
      <p className="text-[9px] font-mono text-white/20 uppercase">{trend}</p>
    </div>
  );
}