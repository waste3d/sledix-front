"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, Activity, Search, ShieldCheck, 
  Trash2, Globe, Settings, Plus, LayoutDashboard, 
  Rss, ChevronRight, X, ExternalLink
} from "lucide-react";
import { apiRequest } from "../../../lib/api";
import ReactDiffViewer from "react-diff-viewer-continued";

const DADATA_KEY = "4affb62ba89180ef3405454f9a047fa680d957ed";

// --- Логотип из вашего дизайна ---
const SledixLogo = () => (
  <svg width="20" height="20" viewBox="0 0 676 584" fill="white">
    <path d="M 2970 5165 c161 -51 273 -146 343 -292 l42 -88 0 -120 c-1 -107 -4 -127 -27 -182 -54 -128 -110 -190 -259 -289 -115 -77 -185 -148 -231 -235 l-33 -64 0 -160 c0 -156 1 -162 29 -218 41 -84 129 -173 248 -251 116 -76 184 -148 228 -241 51 -108 62 -214 35 -319 -50 -190 -200 -341 -385 -387 -83 -21 -496 -17 -613 5 -505 97 -919 440 -1102 914 -19 51 -47 141 -62 200 -23 94 -26 128 -26 277 0 94 5 206 12 250 86 559 531 1047 1081 1184 132 33 218 40 450 37 171 -3 226 -7 270 -21z m2597 11 c4 -4 -217 -230 -492 -502 l-500 -493 -370 0 c-413 -1 -466 5 -562 60 -75 43 -161 131 -200 204 -56 107 -67 265 -26 390 39 120 148 242 272 303 l75 37 170 6 c264 9 1623 5 1633 -5z m-1137 -1889 c186 -44 350 -117 520 -230 95 -64 300 -269 368 -369 107 -158 -188 -353 229 -553 25 -125 25 -416 -1 -533 -72 -337 -260 -635 -533 -849 -202 -158 -452 -261 -710 -293 -109 -14 -421 -14 -493 0 -190 35 -376 216 -410 399 -31 165 23 351 132 460 27 27 88 75 134 107 197 133 284 277 284 467 0 185 -77 299 -312 464 -121 86 -149 114 -191 198 -43 86 -61 163 -61 260 0 78 4 99 31 162 61 143 135 223 273 293 94 48 109 50 380 46 228 -4 266 -7 360 -29z m-1425 -1858 c184 -81 300 -212 341 -385 27 -118 1 -241 -78 -362 -52 -80 -122 -142 -218 -191 l-75 -39 -932 -4 c-830 -3 -930 -2 -923 12 9 17 558 561 835 828 l180 174 410 -6 c395 -5 412 -6 460 -27z" transform="translate(0, 584) scale(0.1, -0.1)" />
  </svg>
);

const TAG_LABELS_RU: Record<string, string> = {
  PRICING: "Цены", HIRING: "Найм", REVIEWS: "Отзывы", LEGAL: "Право", PRODUCT: "Продукт", TECH: "Tech", MARKETING: "Маркетинг",
};

export default function DashboardPage() {
  const params = useParams();
  const companySlug = params.company as string;
  const router = useRouter();
  
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

  const [partySuggestions, setPartySuggestions] = useState<any[]>([]);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/auth/login"); return; }
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
          router.push(`/dashboard/${uRes.value.tenant_slug}`);
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
    if (!confirm("Удалить монитор?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest(`/api/competitors/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  if (isLoading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center space-y-4">
      <SledixLogo />
      <span className="text-[10px] text-zinc-600 uppercase tracking-[0.5em] animate-pulse">Initializing System</span>
    </div>
  );

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden font-sans selection:bg-white selection:text-black antialiased">
      {/* --- Sidebar --- */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/10 bg-black">
        <div className="h-16 flex items-center px-6 border-b border-white/10 gap-3">
          <SledixLogo />
          <span className="text-sm font-bold tracking-tighter uppercase">Sledix</span>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          <NavItem active={page==="dashboard" && !selectedComp} onClick={() => {setPage("dashboard"); setSelectedComp(null)}} icon={<LayoutDashboard size={16}/>} label="Обзор" />
          <NavItem active={page==="competitors"} onClick={() => {setPage("competitors"); setSelectedComp(null)}} icon={<Globe size={16}/>} label="Объекты" count={competitors.length} />
          <NavItem active={page==="signals"} onClick={() => {setPage("signals"); setSelectedComp(null)}} icon={<Rss size={16}/>} label="Живой поток" count={signals.length} />
        </nav>

        <div className="p-4 border-t border-white/10">
           <button onClick={() => setPage("settings")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${page === "settings" ? "bg-white text-black" : "text-zinc-500 hover:text-white"}`}>
             <Settings size={14} /> Настройки
           </button>
        </div>
      </aside>

      {/* --- Main --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-8 border-b border-white/10 bg-black/50 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
             <h1 className="text-[11px] font-black text-white uppercase tracking-[0.3em] italic">
               {selectedComp ? selectedComp.name : (page === "dashboard" ? "Intelligence Center" : page === "competitors" ? "Objects" : "Signals")}
             </h1>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-white text-black text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full hover:bg-zinc-200 transition-all flex items-center gap-2">
            <Plus size={14} /> Add monitor
          </button>
        </header>

        <div className="flex-1 overflow-auto custom-scrollbar bg-black">
          <div className="max-w-6xl mx-auto p-8">
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
        </div>
      </main>

      {/* --- Modals --- */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-black border border-white/10 rounded-3xl p-10 w-full max-w-[400px]">
              <h3 className="text-4xl font-bold uppercase tracking-tighter italic mb-8">New Monitor</h3>
              <form onSubmit={handleAdd} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">Company Name</label>
                  <input required value={newCompName} onChange={e => {
                    setNewCompName(e.target.value);
                    if (e.target.value.length >= 3) {
                      fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party", { 
                        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Token ${DADATA_KEY}` }, 
                        body: JSON.stringify({ query: e.target.value }) 
                      }).then(r => r.json()).then(d => setPartySuggestions(d.suggestions || []));
                    } else setPartySuggestions([]);
                  }} className="w-full bg-transparent border-b border-white/10 py-3 text-sm font-bold uppercase tracking-widest focus:border-white outline-none transition-all placeholder:text-zinc-900" />
                  {partySuggestions.length > 0 && (
                    <div className="absolute bg-zinc-950 border border-white/10 rounded-xl mt-1 w-full z-[110] max-h-40 overflow-auto shadow-2xl">
                      {partySuggestions.map((s, i) => (
                        <button key={i} type="button" onClick={() => { setNewCompName(s.value); setCity(s.data.address?.data?.city || ""); setPartySuggestions([]); }} className="w-full px-4 py-3 hover:bg-white hover:text-black text-left text-[10px] font-bold uppercase border-b border-white/5">{s.value}</button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">Website URL</label>
                  <input required value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="example.com" className="w-full bg-transparent border-b border-white/10 py-3 text-sm font-bold uppercase tracking-widest focus:border-white outline-none transition-all placeholder:text-zinc-900" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" disabled={isAdding} className="flex-1 bg-white text-black py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">
                    {isAdding ? "Scanning..." : "Launch Monitor"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showDiffModal && diffData && (
          <div className="fixed inset-0 z-[200] flex flex-col bg-black p-6">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
              <div>
                <h3 className="text-2xl font-bold uppercase tracking-tighter italic">Change Intelligence</h3>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">{diffData.msg}</p>
              </div>
              <button onClick={() => setShowDiffModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 hover:bg-white hover:text-black transition-all">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-auto rounded-3xl border border-white/10 bg-[#050505]">
              <ReactDiffViewer oldValue={diffData.old} newValue={diffData.new} splitView={true} useDarkTheme={true} />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-components ---

function NavItem({ active, onClick, icon, label, count }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] transition-all ${active ? "bg-white text-black shadow-2xl" : "text-zinc-500 hover:text-white"}`}>
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && <span className="text-[9px] font-mono opacity-40">{count}</span>}
    </button>
  );
}

function StatCard({ label, value, trend, icon }: any) {
  return (
    <div className="bg-black border border-white/10 rounded-3xl p-8 flex flex-col justify-between group hover:border-white/30 transition-all">
      <div className="flex justify-between items-start mb-10">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">{label}</span>
        <div className="text-zinc-800 group-hover:text-white transition-colors">{icon}</div>
      </div>
      <div>
        <div className="text-5xl font-bold tracking-tighter italic mb-4">{value}</div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">{trend}</div>
      </div>
    </div>
  );
}

// --- Views ---

function DashboardView({ count, signals, stats, dist }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Active Monitors" value={count} trend="+1 this cycle" icon={<Globe size={20}/>} />
        <StatCard label="Signals (24h)" value={signals.filter((s:any) => new Date(s.created_at) > new Date(Date.now() - 86400000)).length} trend="High intensity" icon={<Activity size={20}/>} />
        <StatCard label="System Health" value="98%" trend="Operational" icon={<ShieldCheck size={20}/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-black border border-white/10 rounded-3xl p-8">
           <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-12 italic">Signal Intensity History</h3>
           <div className="h-48 flex items-end gap-1.5">
              {stats.map((s:any, i:number) => (
                <div key={i} className="flex-1 bg-zinc-900 hover:bg-white transition-all rounded-t-sm" style={{ height: `${(s.value / Math.max(...stats.map((x:any)=>x.value), 1)) * 100}%` }} />
              ))}
           </div>
        </div>
        <div className="lg:col-span-4 bg-black border border-white/10 rounded-3xl p-8">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-8 italic">Category Weight</h3>
          <div className="space-y-6">
            {dist.slice(0, 5).map((d:any, i:number) => (
              <div key={i} className="flex justify-between items-center group">
                <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">
                   {TAG_LABELS_RU[d.label] || d.label}
                </span>
                <span className="text-xs font-mono text-zinc-800 group-hover:text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CompetitorsList({ competitors, onSelect, onDelete }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-x border-white/10">
      {competitors.map((c: any) => (
        <div key={c.id} onClick={() => onSelect(c)} className="grid grid-cols-12 py-8 px-6 border-b border-white/10 hover:bg-zinc-950 transition-all cursor-pointer group">
          <div className="col-span-5">
            <h4 className="text-xl font-bold uppercase tracking-tighter italic group-hover:text-white">{c.name}</h4>
            <p className="text-[9px] font-mono text-zinc-600 mt-1 uppercase tracking-widest">{c.website_url}</p>
          </div>
          <div className="col-span-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
             <Globe size={12} /> {c.city || "Global"}
          </div>
          <div className="col-span-2 flex items-center">
             <span className="text-[8px] font-black uppercase tracking-[0.2em] border border-green-900/50 text-green-500 px-3 py-1 rounded-full">Active Scan</span>
          </div>
          <div className="col-span-2 flex justify-end items-center gap-4">
             <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="p-2 text-zinc-800 hover:text-red-500 transition-colors">
               <Trash2 size={16} />
             </button>
             <ChevronRight size={16} className="text-zinc-800" />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function SignalsView({ signals, onViewDiff }: any) {
  return (
    <div className="max-w-4xl mx-auto space-y-px bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
      {signals.map((s: any) => (
        <div key={s.id} className="bg-black p-8 flex gap-8 hover:bg-zinc-950 transition-all items-start">
           <div className="w-24 shrink-0">
             <div className="text-[9px] font-black uppercase tracking-widest text-white italic">{s.company}</div>
             <div className="text-[8px] font-mono text-zinc-600 mt-2 uppercase">
               {new Date(s.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
             </div>
           </div>
           <div className="flex-1">
             <p className="text-[13px] text-zinc-400 font-medium leading-relaxed uppercase tracking-tight italic">
               {s.ai_analysis || s.msg}
             </p>
             <div className="flex gap-4 mt-6 items-center">
               <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600 border border-white/10 px-2 py-0.5 rounded">
                 {TAG_LABELS_RU[s.tag] || s.tag}
               </span>
               {s.tag === 'PRODUCT' && (
                 <button onClick={() => onViewDiff(s)} className="text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-1 hover:underline">
                   View Diff <ArrowUpRight size={10} />
                 </button>
               )}
             </div>
           </div>
        </div>
      ))}
    </div>
  );
}

function CompetitorDetailsView({ comp, signals, onBack, onViewDiff }: any) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-white mb-12 flex items-center gap-2 transition-all">
        ← Return to objects
      </button>

      <div className="grid grid-cols-12 gap-12">
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="p-8 border border-white/10 rounded-3xl">
              <h2 className="text-4xl font-bold uppercase tracking-tighter italic mb-4">{comp.name}</h2>
              <a href={`https://${comp.website_url}`} target="_blank" className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-2 hover:text-white">
                {comp.website_url} <ExternalLink size={10} />
              </a>
           </div>
           <div className="p-8 border border-white/10 rounded-3xl">
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-6 italic">Object Stats</h4>
              <div className="space-y-4">
                 <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                   <span className="text-zinc-600">Events Total</span>
                   <span>{signals.length}</span>
                 </div>
                 <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                   <span className="text-zinc-600">Location</span>
                   <span>{comp.city || "Global"}</span>
                 </div>
              </div>
           </div>
        </div>
        <div className="col-span-12 lg:col-span-8 bg-zinc-950/50 border border-white/10 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/10 bg-black">
             <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 italic">Historical Signal Stream</h4>
          </div>
          <div className="divide-y divide-white/5">
            {signals.map((s: any) => (
              <div key={s.id} className="p-8 hover:bg-black transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[8px] font-black uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded text-zinc-500">
                    {TAG_LABELS_RU[s.tag] || s.tag}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-800 uppercase">
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 font-medium italic uppercase tracking-tight">{s.ai_analysis || s.msg}</p>
                {s.tag === 'PRODUCT' && (
                  <button onClick={() => onViewDiff(s)} className="mt-4 text-[9px] font-black uppercase tracking-widest text-white hover:underline flex items-center gap-1">
                    Analyze Change <ChevronRight size={12}/>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SettingsView({ user }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto border border-white/10 rounded-3xl p-12">
      <h3 className="text-4xl font-bold uppercase tracking-tighter italic mb-12 text-center">Security & Plan</h3>
      <div className="space-y-10">
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">Auth Identity</label>
          <div className="text-xl font-bold italic border-b border-white/10 py-3">{user?.email}</div>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">Subscription Tier</label>
          <div className="text-xl font-bold italic border-b border-white/10 py-3 text-zinc-400">{user?.plan || "Founding Member"}</div>
        </div>
        <button 
          onClick={() => { localStorage.clear(); window.location.href = "/auth/login"; }}
          className="w-full mt-10 py-5 rounded-full border border-red-900/30 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-500 hover:text-white transition-all"
        >
          Terminate Session
        </button>
      </div>
    </motion.div>
  );
}