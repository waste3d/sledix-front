"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import ReactDiffViewer from "react-diff-viewer-continued";

const DADATA_KEY = "4affb62ba89180ef3405454f9a047fa680d957ed";

// --- Локализация ---
const TRANSLATIONS = {
  RU: {
    dashboard: "Обзор",
    monitors: "Мониторы",
    signals: "Сигналы",
    settings: "Настройки",
    add_monitor: "Добавить объект",
    logout: "Выйти",
    last_signals: "Последние события",
    all_signals: "История сигналы",
    no_data: "Нет данных",
    active: "В сети",
    index: "Индекс влияния",
    coverage: "Охват",
    health: "Статус системы",
    lang_name: "Русский",
    save: "Сохранить",
    connected_accounts: "Привязанные соцсети",
    add_social: "Подключить",
    diff_analysis: "Анализ изменений",
    website: "Сайт",
    region: "Регион",
    inn: "ИНН",
  },
  EN: {
    dashboard: "Dashboard",
    monitors: "Monitors",
    signals: "Signals",
    settings: "Settings",
    add_monitor: "Add Monitor",
    logout: "Logout",
    last_signals: "Recent Events",
    all_signals: "Signal Feed",
    no_data: "No data",
    active: "Live",
    index: "Impact Index",
    coverage: "Coverage",
    health: "System Health",
    lang_name: "English",
    save: "Save Changes",
    connected_accounts: "Linked Accounts",
    add_social: "Connect",
    diff_analysis: "Change Analysis",
    website: "Website",
    region: "Region",
    inn: "Tax ID",
  }
};

const TAG_STYLES: Record<string, string> = {
  PRICING: "#f59e0b", HIRING: "#3b82f6", REVIEWS: "#ef4444", 
  LEGAL: "#a855f7", PRODUCT: "#10b981", TECH: "#6366f1", MARKETING: "#ec4899"
};

// --- Компоненты UI ---

const Icon = ({ name }: { name: string }) => {
  const icons: any = {
    dashboard: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    monitors: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
    signals: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h3l2-9 4 18 3-9h3"/></svg>,
    settings: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>,
    trash: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
  };
  return icons[name] || null;
};

// --- Основной компонент страницы ---
export default function DashboardPage() {
  const params = useParams();
  const companySlug = params.company as string;
  const [lang, setLang] = useState<'RU' | 'EN'>('RU');
  const t = TRANSLATIONS[lang];

  const [page, setPage] = useState("dashboard");
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [dist, setDist] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newComp, setNewComp] = useState({ name: "", url: "", city: "", inn: "" });

  const [diffData, setDiffData] = useState<any>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);

  // --- Загрузка данных ---
  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const [u, c, s, st, ds] = await Promise.all([
        apiRequest(`/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/competitors`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/signals`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/activity`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/distribution`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUser(u); setCompetitors(c); setSignals(s); setStats(st); setDist(ds);
      setIsLoading(false);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = () => { localStorage.clear(); window.location.href = "/auth/login"; };

  if (isLoading) return <div className="h-screen bg-[#000] flex items-center justify-center text-[10px] font-mono text-white/20 tracking-widest uppercase">Initializing...</div>;

  return (
    <div className="flex h-screen bg-[#09090b] text-[#fafafa] font-sans selection:bg-white/10">
      
      {/* Sidebar - Тонкий и строгий */}
      <aside className="w-64 border-r border-white/5 flex flex-col bg-[#09090b]">
        <div className="p-6 mb-4">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="black"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <span className="font-bold tracking-tight text-lg">SLEDIX</span>
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: "dashboard", icon: "dashboard", label: t.dashboard },
            { id: "competitors", icon: "monitors", label: t.monitors, count: competitors.length },
            { id: "signals", icon: "signals", label: t.signals, count: signals.length },
            { id: "settings", icon: "settings", label: t.settings }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setPage(item.id); setSelectedComp(null); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                page === item.id && !selectedComp ? "bg-white/5 text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              <Icon name={item.icon} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== undefined && <span className="text-[10px] font-mono opacity-40">{item.count}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
           <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px]">{user?.email?.[0].toUpperCase()}</div>
              <div className="flex-1 truncate">
                 <p className="text-[11px] font-medium truncate opacity-80">{user?.email}</p>
                 <button onClick={handleLogout} className="text-[10px] text-red-400/50 hover:text-red-400 uppercase tracking-tighter">{t.logout}</button>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#09090b]/50 backdrop-blur-md">
           <h2 className="text-sm font-medium tracking-tight">
              {selectedComp ? selectedComp.name : t[page as keyof typeof t]}
           </h2>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-wide">{t.active}</span>
              </div>
              <button onClick={() => setShowModal(true)} className="bg-white text-black text-xs font-bold px-4 py-2 rounded-md hover:bg-neutral-200 transition-colors">
                 {t.add_monitor}
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
           {selectedComp ? (
             <CompetitorDetail comp={selectedComp} signals={signals.filter(s => s.company === selectedComp.name)} t={t} onBack={() => setSelectedComp(null)} />
           ) : (
             <>
                {page === "dashboard" && <DashboardOverview stats={stats} dist={dist} signals={signals} t={t} />}
                {page === "competitors" && <MonitorsGrid list={competitors} signals={signals} onSelect={setSelectedComp} t={t} />}
                {page === "signals" && <SignalsFeed list={signals} t={t} />}
                {page === "settings" && <SettingsView user={user} lang={lang} setLang={setLang} t={t} fetchData={fetchData} />}
             </>
           )}
        </div>
      </main>

      {/* Модальное окно (Add) - Упрощено */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-[#121214] border border-white/10 w-full max-w-sm rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">{t.add_monitor}</h3>
              <div className="space-y-4">
                 <input placeholder="Name" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/20" value={newComp.name} onChange={e => setNewComp({...newComp, name: e.target.value})} />
                 <input placeholder="Website URL" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white/20" value={newComp.url} onChange={e => setNewComp({...newComp, url: e.target.value})} />
                 <div className="flex gap-3 mt-6">
                    <button onClick={() => setShowModal(false)} className="flex-1 text-sm py-2.5 hover:bg-white/5 rounded-lg transition-colors">Cancel</button>
                    <button className="flex-1 bg-white text-black text-sm font-bold py-2.5 rounded-lg">Create</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// --- Под-компоненты (Views) ---

function DashboardOverview({ stats, dist, signals, t }: any) {
  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: t.monitors, val: stats.length ? stats.reduce((a:any,b:any)=>a+b.value,0) : 0, color: 'text-white' },
          { label: t.signals, val: signals.length, color: 'text-blue-400' },
          { label: t.coverage, val: '98%', color: 'text-emerald-400' },
          { label: t.health, val: 'Stable', color: 'text-white/40' },
        ].map((s, i) => (
          <div key={i} className="p-6 border border-white/5 bg-white/[0.02] rounded-xl">
             <p className="text-[10px] font-mono uppercase tracking-widest text-white/30 mb-1">{s.label}</p>
             <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
         <div className="col-span-2 p-6 border border-white/5 bg-white/[0.01] rounded-xl">
            <h3 className="text-[10px] font-mono uppercase text-white/30 mb-6 tracking-widest">Activity History</h3>
            <div className="h-48 flex items-end gap-1">
               {stats.slice(-30).map((s:any, i:number) => (
                 <div key={i} className="flex-1 bg-white/10 hover:bg-emerald-500/50 transition-colors rounded-t-sm" style={{ height: `${(s.value/10)*100}%` }} />
               ))}
            </div>
         </div>
         <div className="p-6 border border-white/5 bg-white/[0.01] rounded-xl">
            <h3 className="text-[10px] font-mono uppercase text-white/30 mb-6 tracking-widest">Signal Types</h3>
            <div className="space-y-4">
               {dist.map((d:any, i:number) => (
                 <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-white/60">{d.label}</span>
                    <span className="text-xs font-mono">{d.value}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

function MonitorsGrid({ list, signals, onSelect, t }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-xl overflow-hidden">
       {list.map((c: any) => {
         const count = signals.filter((s:any) => s.company === c.name).length;
         return (
           <div key={c.id} onClick={() => onSelect(c)} className="bg-[#09090b] p-6 hover:bg-white/[0.02] transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold">{c.name[0]}</div>
                 <div className="text-right">
                    <p className="text-[10px] font-mono text-white/20 uppercase">{t.index}</p>
                    <p className="text-sm font-bold text-emerald-400">{55 + count * 2}%</p>
                 </div>
              </div>
              <h4 className="font-bold text-white/90 group-hover:text-white transition-colors">{c.name}</h4>
              <p className="text-xs text-white/30 font-mono mt-1 mb-6 truncate">{c.website_url}</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-white/20 uppercase tracking-tighter">
                 <span>{c.city || 'Global'}</span>
                 <span>{count} Signals</span>
              </div>
           </div>
         );
       })}
    </div>
  );
}

function SignalsFeed({ list, t }: any) {
  return (
    <div className="max-w-4xl border border-white/5 rounded-xl overflow-hidden bg-white/[0.01]">
       {list.map((s: any) => (
         <div key={s.id} className="p-5 border-b border-white/5 flex items-start gap-6 hover:bg-white/[0.01] transition-all">
            <div className="w-24 shrink-0">
               <span className="text-[10px] font-bold text-white/40 truncate block uppercase font-mono">{s.company}</span>
            </div>
            <div className="flex-1">
               <p className="text-sm text-white/80 leading-relaxed">{s.ai_analysis || s.msg}</p>
               <div className="flex items-center gap-3 mt-2">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-white/30 uppercase">{s.tag}</span>
                  <span className="text-[9px] font-mono text-white/20">{new Date(s.created_at).toLocaleDateString()}</span>
               </div>
            </div>
         </div>
       ))}
    </div>
  );
}

function SettingsView({ user, lang, setLang, t, fetchData }: any) {
  const [msg, setMsg] = useState("");
  const updateLang = (val: 'RU' | 'EN') => {
    setLang(val);
    setMsg("Language updated / Язык обновлен");
  };

  return (
    <div className="max-w-xl space-y-12 animate-in slide-in-from-bottom-2">
       <section>
          <h3 className="text-[10px] font-mono uppercase text-white/30 tracking-[0.3em] mb-6">Localization</h3>
          <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
             {['RU', 'EN'].map((l: any) => (
               <button key={l} onClick={() => updateLang(l)} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${lang === l ? 'bg-white text-black' : 'text-white/40 hover:text-white/60'}`}>
                  {l === 'RU' ? 'Русский' : 'English'}
               </button>
             ))}
          </div>
       </section>

       <section className="pt-12 border-t border-white/5">
          <h3 className="text-[10px] font-mono uppercase text-white/30 tracking-[0.3em] mb-6">Account Details</h3>
          <div className="space-y-4">
             <div>
                <label className="text-[10px] text-white/20 uppercase font-mono mb-2 block">Email</label>
                <input readOnly value={user?.email} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white/40 outline-none" />
             </div>
             <div>
                <label className="text-[10px] text-white/20 uppercase font-mono mb-2 block">Plan</label>
                <div className="px-4 py-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg inline-block text-xs font-bold text-emerald-500">
                   Enterprise / {user?.plan || "Growth"}
                </div>
             </div>
          </div>
       </section>

       {msg && <p className="text-xs font-mono text-emerald-400">{msg}</p>}
    </div>
  );
}

function CompetitorDetail({ comp, signals, t, onBack }: any) {
  return (
    <div className="max-w-5xl space-y-8">
       <button onClick={onBack} className="text-xs font-mono text-white/30 hover:text-white transition-colors">← Back to monitors</button>
       
       <div className="grid grid-cols-3 gap-8">
          <div className="space-y-6">
             <div className="p-8 border border-white/5 bg-white/[0.02] rounded-xl">
                <div className="w-12 h-12 bg-white/10 rounded-lg mb-6 flex items-center justify-center font-bold text-xl">{comp.name[0]}</div>
                <h2 className="text-2xl font-bold mb-1">{comp.name}</h2>
                <p className="text-xs text-white/30 font-mono mb-8">{comp.website_url}</p>
                
                <div className="space-y-4 border-t border-white/5 pt-6">
                   <div>
                      <span className="text-[9px] font-mono text-white/20 uppercase block mb-1">{t.inn}</span>
                      <span className="text-sm font-mono text-white/70">{comp.inn || "—"}</span>
                   </div>
                   <div>
                      <span className="text-[9px] font-mono text-white/20 uppercase block mb-1">{t.region}</span>
                      <span className="text-sm font-mono text-white/70">{comp.city || "—"}</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="col-span-2 border border-white/5 rounded-xl bg-white/[0.01] overflow-hidden">
             <div className="p-4 border-b border-white/5 bg-white/5">
                <span className="text-[10px] font-mono uppercase text-white/40 tracking-widest">{t.last_signals}</span>
             </div>
             <div className="divide-y divide-white/5">
                {signals.length ? signals.map((s:any) => (
                  <div key={s.id} className="p-6">
                     <div className="flex justify-between mb-3">
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/10 uppercase">{s.tag}</span>
                        <span className="text-[9px] font-mono text-white/20">{new Date(s.created_at).toLocaleTimeString()}</span>
                     </div>
                     <p className="text-sm text-white/70 leading-relaxed">{s.ai_analysis || s.msg}</p>
                  </div>
                )) : (
                  <div className="p-20 text-center text-xs text-white/10 font-mono uppercase tracking-widest">{t.no_data}</div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}