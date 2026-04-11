"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Globe, Rss, Settings, Plus, Trash2, 
  ExternalLink, ChevronRight, AlertCircle, CheckCircle2,
  LogOut, Languages, Search, Activity, BarChart3, Clock
} from "lucide-react";
import { apiRequest } from "../../../lib/api";
import ReactDiffViewer from "react-diff-viewer-continued";

const DADATA_KEY = "4affb62ba89180ef3405454f9a047fa680d957ed";

// --- LOGO ---
const SledixLogo = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 676 584" fill="currentColor">
    <path d="M 2970 5165 c161 -51 273 -146 343 -292 l42 -88 0 -120 c-1 -107 -4 -127 -27 -182 -54 -128 -110 -190 -259 -289 -115 -77 -185 -148 -231 -235 l-33 -64 0 -160 c0 -156 1 -162 29 -218 41 -84 129 -173 248 -251 116 -76 184 -148 228 -241 51 -108 62 -214 35 -319 -50 -190 -200 -341 -385 -387 -83 -21 -496 -17 -613 5 -505 97 -919 440 -1102 914 -19 51 -47 141 -62 200 -23 94 -26 128 -26 277 0 94 5 206 12 250 86 559 531 1047 1081 1184 132 33 218 40 450 37 171 -3 226 -7 270 -21z m2597 11 c4 -4 -217 -230 -492 -502 l-500 -493 -370 0 c-413 -1 -466 5 -562 60 -75 43 -161 131 -200 204 -56 107 -67 265 -26 390 39 120 148 242 272 303 l75 37 170 6 c264 9 1623 5 1633 -5z m-1137 -1889 c186 -44 350 -117 520 -230 95 -64 300 -269 368 -369 107 -158 -188 -353 229 -553 25 -125 25 -416 -1 -533 -72 -337 -260 -635 -533 -849 -202 -158 -452 -261 -710 -293 -109 -14 -421 -14 -493 0 -190 35 -376 216 -410 399 -31 165 23 351 132 460 27 27 88 75 134 107 197 133 284 277 284 467 0 185 -77 299 -312 464 -121 86 -149 114 -191 198 -43 86 -61 163 -61 260 0 78 4 99 31 162 61 143 135 223 273 293 94 48 109 50 380 46 228 -4 266 -7 360 -29z m-1425 -1858 c184 -81 300 -212 341 -385 27 -118 1 -241 -78 -362 -52 -80 -122 -142 -218 -191 l-75 -39 -932 -4 c-830 -3 -930 -2 -923 12 9 17 558 561 835 828 l180 174 410 -6 c395 -5 412 -6 460 -27z" transform="translate(0, 584) scale(0.1, -0.1)" />
  </svg>
);

const TAG_LABELS_RU: Record<string, string> = {
  PRICING: "Цены", HIRING: "Найм", REVIEWS: "Отзывы", LEGAL: "Право", PRODUCT: "Продукт", TECH: "Tech", MARKETING: "Маркетинг",
};

const DICTIONARY = {
  RU: {
    dashboard: "Обзор", objects: "Объекты", feed: "Лента", settings: "Настройки",
    add: "Добавить", status: "Статус", location: "Город", verify: "Подтвердите почту",
    resend: "Выслать заново", exit: "Выход", lang: "Язык", website: "Сайт"
  },
  EN: {
    dashboard: "Dashboard", objects: "Objects", feed: "Feed", settings: "Settings",
    add: "Add New", status: "Status", location: "City", verify: "Verify Email",
    resend: "Resend", exit: "Logout", lang: "Language", website: "Website"
  }
};

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  
  const [lang, setLang] = useState<"RU" | "EN">("RU");
  const [page, setPage] = useState("dashboard");
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [newCompName, setNewCompName] = useState("");
  const [newCompUrl, setNewCompUrl] = useState("");
  const [newCity, setNewCity] = useState("");
  const [partySuggestions, setPartySuggestions] = useState<any[]>([]);

  const [diffData, setDiffData] = useState<any>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);

  const t = DICTIONARY[lang];

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { router.push("/auth/login"); return; }
    try {
      const [uRes, cRes, sRes, stRes] = await Promise.allSettled([
        apiRequest(`/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/competitors`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/signals`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/activity`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (uRes.status === 'fulfilled') setUser(uRes.value);
      if (cRes.status === 'fulfilled') setCompetitors(cRes.value || []);
      if (sRes.status === 'fulfilled') setSignals(sRes.value || []);
      if (stRes.status === 'fulfilled') setStats(stRes.value || []);
      setIsLoading(false);
    } catch (err) { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openDiff = async (signal: any) => {
    try {
      const token = localStorage.getItem("access_token");
      const data = await apiRequest(`/api/signals/${signal.id}/diff`, { headers: { Authorization: `Bearer ${token}` } });
      setDiffData({ ...data, msg: signal.ai_analysis || signal.msg });
      setShowDiffModal(true);
    } catch (e) { alert("Сравнение недоступно."); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/competitors", { 
        method: "POST", headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCompName, website_url: newCompUrl, city: newCity })
      });
      setShowModal(false);
      setNewCompName(""); setNewCompUrl(""); setNewCity("");
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest(`/api/competitors/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  if (isLoading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="animate-pulse text-white"><SledixLogo size={40} /></div>
      <div className="text-[10px] text-zinc-600 uppercase tracking-[0.5em]">Initializing Intelligence</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-white selection:text-black antialiased">
      
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-zinc-800/50 flex flex-col bg-black/40 backdrop-blur-xl">
        <div className="h-16 flex items-center px-6 gap-3">
          <div className="text-white"><SledixLogo size={22} /></div>
          <span className="text-sm font-black text-white uppercase tracking-tight">Sledix</span>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1">
          <NavItem active={page==="dashboard"} onClick={() => {setPage("dashboard"); setSelectedComp(null)}} icon={<Activity size={18}/>} label={t.dashboard} />
          <NavItem active={page==="competitors"} onClick={() => {setPage("competitors"); setSelectedComp(null)}} icon={<Globe size={18}/>} label={t.objects} count={competitors.length} />
          <NavItem active={page==="signals"} onClick={() => {setPage("signals"); setSelectedComp(null)}} icon={<Rss size={18}/>} label={t.feed} />
        </nav>

        <div className="p-4 border-t border-zinc-800/50 space-y-2">
          <button onClick={() => setLang(lang === "RU" ? "EN" : "RU")} className="w-full flex items-center gap-3 px-3 py-2 rounded text-[10px] font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest">
            <Languages size={14} /> {lang}
          </button>
          <button onClick={() => setPage("settings")} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${page === "settings" ? "bg-white text-black" : "text-zinc-500 hover:text-white hover:bg-zinc-800/50"}`}>
            <Settings size={14} /> {t.settings}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505]">
        <header className="h-16 flex items-center justify-between px-8 border-b border-zinc-800/50 bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
             {selectedComp ? selectedComp.name : page}
          </div>
          <button onClick={() => setShowModal(true)} className="bg-white text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg shadow-white/5">
            <Plus size={14} /> {t.add}
          </button>
        </header>

        <div className="flex-1 overflow-auto p-8 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black">
          {user && !user.is_email_verified && page !== "settings" && (
            <VerificationBanner email={user.email} t={t} />
          )}

          <div className="max-w-6xl mx-auto">
            {selectedComp ? (
              <CompetitorDetailsView comp={selectedComp} signals={signals.filter((s: any) => s.company === selectedComp.name)} onBack={() => setSelectedComp(null)} onViewDiff={openDiff} t={t} />
            ) : (
              <>
                {page === "dashboard" && <DashboardView competitors={competitors} signals={signals} stats={stats} />}
                {page === "competitors" && <CompetitorsList competitors={competitors} onSelect={setSelectedComp} onDelete={handleDelete} t={t} />}
                {page === "signals" && <SignalsView signals={signals} onViewDiff={openDiff} />}
                {page === "settings" && <SettingsView user={user} t={t} />}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Diff Modal */}
      {showDiffModal && diffData && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-2xl p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6 max-w-7xl mx-auto w-full">
            <h3 className="text-sm font-bold uppercase tracking-tight text-white border-l-2 border-white pl-4">{diffData.msg}</h3>
            <button onClick={() => setShowDiffModal(false)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">Close</button>
          </div>
          <div className="flex-1 overflow-auto rounded-2xl border border-zinc-800 bg-black max-w-7xl mx-auto w-full shadow-2xl">
            <ReactDiffViewer oldValue={diffData.old} newValue={diffData.new} splitView={true} useDarkTheme={true} />
          </div>
        </div>
      )}

      {/* Add Object Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-10 w-full max-w-md shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-8 uppercase tracking-tighter">New Monitor</h3>
            <form onSubmit={handleAdd} className="space-y-6">
               <div className="space-y-1 relative">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Company Name</label>
                  <input required value={newCompName} onChange={e => {
                    setNewCompName(e.target.value);
                    if (e.target.value.length >= 3) {
                      fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party", {
                        method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Token ${DADATA_KEY}` },
                        body: JSON.stringify({ query: e.target.value })
                      }).then(r => r.json()).then(d => setPartySuggestions(d.suggestions || []));
                    } else setPartySuggestions([]);
                  }} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold uppercase outline-none focus:border-white transition-all" />
                  {partySuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-[110] mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                       {partySuggestions.map((s, i) => (
                         <button key={i} type="button" onClick={() => { setNewCompName(s.value); setNewCity(s.data.address?.data?.city || ""); setPartySuggestions([]); }} className="w-full px-4 py-3 text-left text-[10px] font-bold uppercase border-b border-zinc-800 hover:bg-white hover:text-black transition-all">
                           {s.value}
                         </button>
                       ))}
                    </div>
                  )}
               </div>
               <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-600 ml-1">Website URL</label>
                  <input required value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="example.com" className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-white transition-all" />
               </div>
               <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 shadow-lg shadow-white/5">Start Tracking</button>
               </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// --- SUB-COMPONENTS ---

function NavItem({ active, onClick, icon, label, count }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${active ? "bg-zinc-800 text-white shadow-xl" : "text-zinc-500 hover:text-white hover:bg-zinc-800/30"}`}>
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && <span className="text-[10px] font-mono opacity-30">{count}</span>}
    </button>
  );
}

function VerificationBanner({ email, t }: any) {
  const [sent, setSent] = useState(false);
  const resend = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/auth/resend-verification", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      setSent(true);
    } catch (e) { alert("Error"); }
  };
  return (
    <div className="mb-8 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center justify-between group">
      <div className="flex items-center gap-4 text-xs font-bold text-amber-500/80 uppercase tracking-widest">
        <AlertCircle size={18} />
        <span>{t.verify}: <span className="text-amber-200">{email}</span></span>
      </div>
      <button onClick={resend} disabled={sent} className="text-[10px] font-black uppercase tracking-[0.2em] text-white hover:underline disabled:text-zinc-600 transition-all">
        {sent ? "Sent" : t.resend}
      </button>
    </div>
  );
}

function DashboardView({ competitors, signals, stats }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 p-8 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Monitors</p>
        <p className="text-5xl font-bold tracking-tighter text-white">{competitors.length}</p>
      </div>
      <div className="md:col-span-1 p-8 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Signals (24h)</p>
        <p className="text-5xl font-bold tracking-tighter text-white">
          {signals.filter((s:any) => new Date(s.created_at) > new Date(Date.now() - 86400000)).length}
        </p>
      </div>
      <div className="md:col-span-2 p-8 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl flex items-center justify-between overflow-hidden">
         <div className="z-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Intelligence Flow</p>
            <p className="text-xl font-bold text-emerald-500 uppercase tracking-tighter">Active & Secure</p>
         </div>
         <Activity size={48} className="text-emerald-500/20 -mr-4" />
      </div>

      <div className="md:col-span-4 p-10 bg-zinc-900/30 border border-zinc-800/50 rounded-3xl">
         <div className="flex justify-between items-center mb-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">Scan Intensity Analytics</p>
            <BarChart3 size={16} className="text-zinc-800" />
         </div>
         <div className="h-48 flex items-end gap-2">
            {stats.map((s:any, i:number) => (
              <div key={i} className="flex-1 bg-zinc-800 hover:bg-white transition-all duration-500 rounded-t-sm" style={{ height: `${(s.value / Math.max(...stats.map((x:any)=>x.value), 1)) * 100}%` }} />
            ))}
         </div>
      </div>
    </div>
  );
}

function CompetitorsList({ competitors, onSelect, onDelete, t }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {competitors.map((c: any) => (
        <div key={c.id} onClick={() => onSelect(c)} className="p-6 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl hover:bg-zinc-900/40 hover:border-zinc-700 transition-all cursor-pointer group flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-lg font-bold text-white/20 group-hover:text-white transition-colors uppercase">
               {c.name[0]}
            </div>
            <div>
              <div className="font-bold text-white text-sm uppercase tracking-tight">{c.name}</div>
              <div className="text-[9px] text-zinc-500 font-mono mt-1">{c.website_url}</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right hidden sm:block">
                <p className="text-[8px] font-black text-zinc-600 uppercase mb-0.5">{t.status}</p>
                <p className="text-[10px] font-bold text-emerald-500 uppercase">Live</p>
             </div>
             <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="p-2 text-zinc-800 hover:text-red-500 transition-colors">
                <Trash2 size={16} />
             </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompetitorDetailsView({ comp, signals, onBack, onViewDiff, t }: any) {
  const [socialUrl, setSocialUrl] = useState("");
  const [platform, setPlatform] = useState("telegram");
  const [socials, setSocials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest(`/api/competitors/${comp.id}/socials`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ platform, url: socialUrl, interval: 60 }) });
      setSocialUrl(""); fetchSocials();
    } catch (e) {} finally { setLoading(false); }
  };

  return (
    <div className="space-y-8">
      <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-all flex items-center gap-2">
        ← All Objects
      </button>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl">
            <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tighter">{comp.name}</h2>
            <p className="text-xs text-zinc-500 font-mono mb-8">{comp.website_url}</p>
            <div className="space-y-6 pt-6 border-t border-zinc-800/50">
               <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-zinc-600">{t.location}</span>
                  <span className="text-xs font-bold text-zinc-300">{comp.city || "—"}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase text-zinc-600">Risk Score</span>
                  <span className="text-xl font-bold text-white tracking-tighter">72 / 100</span>
               </div>
            </div>
          </div>

          <div className="p-8 bg-zinc-900/30 border border-zinc-800 rounded-3xl">
            <h3 className="text-[10px] font-black uppercase text-zinc-600 mb-6">Integrations</h3>
            <div className="space-y-2 mb-6">
               {socials.map((s: any) => (
                 <div key={s.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-[10px] font-bold uppercase">
                   <span>{s.platform}</span>
                   <span className="text-emerald-500 flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />Active</span>
                 </div>
               ))}
            </div>
            <div className="space-y-3 pt-6 border-t border-zinc-800/50">
               <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] font-bold outline-none uppercase">
                  <option value="telegram">Telegram</option>
                  <option value="vk">VK.com</option>
               </select>
               <input value={socialUrl} onChange={e => setSocialUrl(e.target.value)} placeholder="URL..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] font-bold outline-none" />
               <button onClick={handleLink} disabled={loading} className="w-full py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Link Integration</button>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 bg-zinc-900/20 border border-zinc-800 rounded-3xl overflow-hidden divide-y divide-zinc-900">
           {signals.map((s: any) => (
             <SignalRow key={s.id} signal={s} onDiff={() => onViewDiff(s)} />
           ))}
        </div>
      </div>
    </div>
  );
}

function SignalRow({ signal, onDiff }: any) {
  return (
    <div className="p-8 hover:bg-zinc-900/40 transition-all flex gap-8 items-start group">
       <div className="w-20 shrink-0">
          <p className="text-[10px] font-bold text-white uppercase tracking-tighter truncate">{signal.company}</p>
          <div className="text-[10px] font-mono text-zinc-700 mt-2"><Clock size={10} className="inline mr-1" />{new Date(signal.created_at).getHours()}:{new Date(signal.created_at).getMinutes()}</div>
       </div>
       <div className="flex-1">
          <p className="text-sm text-zinc-400 leading-relaxed font-medium uppercase tracking-tight italic">{signal.ai_analysis || signal.msg}</p>
          <div className="flex gap-4 mt-6">
             <span className="text-[9px] font-black uppercase px-2 py-0.5 border border-zinc-800 text-zinc-600 rounded-full">{signal.tag}</span>
             {signal.tag === 'PRODUCT' && (
               <button onClick={onDiff} className="text-[9px] font-black text-white hover:underline uppercase flex items-center gap-1">Diff <ChevronRight size={12} /></button>
             )}
          </div>
       </div>
    </div>
  );
}

function SignalsView({ signals, onViewDiff }: any) {
  return (
    <div className="bg-zinc-900/20 border border-zinc-800 rounded-3xl divide-y divide-zinc-900">
       {signals.map((s: any) => <SignalRow key={s.id} signal={s} onDiff={() => onViewDiff(s)} />)}
    </div>
  );
}

function SettingsView({ user, t }: any) {
  return (
    <div className="max-w-xl mx-auto p-12 bg-zinc-900/30 border border-zinc-800 rounded-[3rem] shadow-2xl">
       <h3 className="text-5xl font-bold text-white uppercase tracking-tighter mb-12">Settings</h3>
       <div className="space-y-10">
          <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Profile Identity</p>
             <div className="flex items-center justify-between text-lg font-bold border-b border-zinc-800 py-3">
                <span>{user?.email}</span>
                {user?.is_email_verified && <CheckCircle2 size={18} className="text-emerald-500" />}
             </div>
          </div>
          <div className="space-y-1">
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Current Plan</p>
             <div className="text-lg font-bold border-b border-zinc-800 py-3 uppercase">{user?.plan || "Growth"}</div>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.href = "/auth/login"; }} className="w-full py-5 rounded-2xl border border-red-900/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
             <LogOut size={16} className="inline mr-2" /> Terminate Session
          </button>
       </div>
    </div>
  );
}