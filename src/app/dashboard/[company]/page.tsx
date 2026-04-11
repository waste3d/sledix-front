"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Globe, Rss, Settings, Plus, Trash2, 
  ExternalLink, ChevronRight, AlertCircle, CheckCircle2,
  LogOut, Languages, Clock, Sparkles
} from "lucide-react";
import { apiRequest } from "../../../lib/api";
import ReactDiffViewer from "react-diff-viewer-continued";

const DADATA_KEY = "4affb62ba89180ef3405454f9a047fa680d957ed";

// --- LOGO (Original Vector) ---
const SledixLogo = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 676 584" fill="currentColor">
    <path d="M 2970 5165 c161 -51 273 -146 343 -292 l42 -88 0 -120 c-1 -107 -4 -127 -27 -182 -54 -128 -110 -190 -259 -289 -115 -77 -185 -148 -231 -235 l-33 -64 0 -160 c0 -156 1 -162 29 -218 41 -84 129 -173 248 -251 116 -76 184 -148 228 -241 51 -108 62 -214 35 -319 -50 -190 -200 -341 -385 -387 -83 -21 -496 -17 -613 5 -505 97 -919 440 -1102 914 -19 51 -47 141 -62 200 -23 94 -26 128 -26 277 0 94 5 206 12 250 86 559 531 1047 1081 1184 132 33 218 40 450 37 171 -3 226 -7 270 -21z m2597 11 c4 -4 -217 -230 -492 -502 l-500 -493 -370 0 c-413 -1 -466 5 -562 60 -75 43 -161 131 -200 204 -56 107 -67 265 -26 390 39 120 148 242 272 303 l75 37 170 6 c264 9 1623 5 1633 -5z m-1137 -1889 c186 -44 350 -117 520 -230 95 -64 300 -269 368 -369 107 -158 -188 -353 229 -553 25 -125 25 -416 -1 -533 -72 -337 -260 -635 -533 -849 -202 -158 -452 -261 -710 -293 -109 -14 -421 -14 -493 0 -190 35 -376 216 -410 399 -31 165 23 351 132 460 27 27 88 75 134 107 197 133 284 277 284 467 0 185 -77 299 -312 464 -121 86 -149 114 -191 198 -43 86 -61 163 -61 260 0 78 4 99 31 162 61 143 135 223 273 293 94 48 109 50 380 46 228 -4 266 -7 360 -29z m-1425 -1858 c184 -81 300 -212 341 -385 27 -118 1 -241 -78 -362 -52 -80 -122 -142 -218 -191 l-75 -39 -932 -4 c-830 -3 -930 -2 -923 12 9 17 558 561 835 828 l180 174 410 -6 c395 -5 412 -6 460 -27z" transform="translate(0, 584) scale(0.1, -0.1)" />
  </svg>
);

const DICTIONARY = {
  RU: {
    dashboard: "Обзор", objects: "Мониторы", feed: "Сигналы", settings: "Настройки",
    add: "Новый монитор", status: "Статус", location: "Город", verify: "Подтвердите Email",
    resend: "Выслать ссылку", exit: "Выйти", lang: "Язык", website: "Сайт"
  },
  EN: {
    dashboard: "Overview", objects: "Monitors", feed: "Signals", settings: "Settings",
    add: "Add Monitor", status: "Status", location: "City", verify: "Verify Email",
    resend: "Resend", exit: "Logout", lang: "Language", website: "Website"
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const [lang, setLang] = useState<"RU" | "EN">("RU");
  const [page, setPage] = useState("dashboard");
  const [selectedComp, setSelectedComp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  
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
      const [uRes, cRes, sRes] = await Promise.allSettled([
        apiRequest(`/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/competitors`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/signals`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (uRes.status === 'fulfilled') setUser(uRes.value);
      if (cRes.status === 'fulfilled') setCompetitors(cRes.value || []);
      if (sRes.status === 'fulfilled') setSignals(sRes.value || []);
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
    } catch (e) { alert("Diff not available."); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest(`/api/competitors/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err: any) { alert(err.message); }
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

  if (isLoading) return <div className="h-screen bg-black flex items-center justify-center font-mono text-[10px] text-zinc-700 uppercase tracking-[0.4em]">Booting...</div>;

  return (
    <div className="flex h-screen bg-[#000] text-zinc-300 font-sans antialiased">
      
      {/* Sidebar - Ultra Clean */}
      <aside className="w-56 shrink-0 border-r border-zinc-900 flex flex-col bg-[#000]">
        <div className="h-16 flex items-center px-6 gap-3 border-b border-zinc-900/50">
          <div className="text-white"><SledixLogo size={20} /></div>
          <span className="text-xs font-bold text-white uppercase tracking-widest">Sledix</span>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          <NavItem active={page==="dashboard"} onClick={() => {setPage("dashboard"); setSelectedComp(null)}} icon={<LayoutDashboard size={16}/>} label={t.dashboard} />
          <NavItem active={page==="competitors"} onClick={() => {setPage("competitors"); setSelectedComp(null)}} icon={<Globe size={16}/>} label={t.objects} count={competitors.length} />
          <NavItem active={page==="signals"} onClick={() => {setPage("signals"); setSelectedComp(null)}} icon={<Rss size={16}/>} label={t.feed} />
        </nav>

        <div className="p-3 border-t border-zinc-900 space-y-1">
          <button onClick={() => setLang(lang === "RU" ? "EN" : "RU")} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-[10px] font-bold text-zinc-600 hover:text-white transition-all uppercase">
            <Languages size={14} /> {lang}
          </button>
          <button onClick={() => setPage("settings")} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${page === "settings" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-white"}`}>
            <Settings size={14} /> {t.settings}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-8 border-b border-zinc-900 bg-[#000]">
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
             {selectedComp ? selectedComp.name : page}
          </div>
          <button onClick={() => setShowModal(true)} className="bg-white text-black px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2">
            <Plus size={14} /> {t.add}
          </button>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {user && !user.is_email_verified && page !== "settings" && (
            <VerificationBanner email={user.email} t={t} />
          )}

          <div className="max-w-5xl mx-auto">
            {selectedComp ? (
              <CompetitorDetailsView comp={selectedComp} signals={signals.filter((s: any) => s.company === selectedComp.name)} onBack={() => setSelectedComp(null)} onViewDiff={openDiff} t={t} />
            ) : (
              <>
                {page === "dashboard" && <DashboardView competitors={competitors} signals={signals} />}
                {page === "competitors" && <CompetitorsTable competitors={competitors} onSelect={setSelectedComp} onDelete={handleDelete} t={t} />}
                {page === "signals" && <SignalsView signals={signals} onViewDiff={openDiff} />}
                {page === "settings" && <SettingsView user={user} t={t} />}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showModal && (
        <AddObjectModal onClose={() => setShowModal(false)} onSuccess={() => { setShowModal(false); fetchData(); }} t={t} DADATA_KEY={DADATA_KEY} partySuggestions={partySuggestions} setPartySuggestions={setPartySuggestions} />
      )}

      {showDiffModal && diffData && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase text-white tracking-widest">{diffData.msg}</h3>
            <button onClick={() => setShowDiffModal(false)} className="text-[10px] font-bold text-zinc-500 uppercase hover:text-white underline">Close</button>
          </div>
          <div className="flex-1 overflow-auto border border-zinc-900 bg-zinc-950 rounded-lg">
            <ReactDiffViewer oldValue={diffData.old} newValue={diffData.new} splitView={true} useDarkTheme={true} />
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function NavItem({ active, onClick, icon, label, count }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[11px] font-medium transition-all ${active ? "bg-zinc-900 text-white" : "text-zinc-500 hover:text-zinc-200"}`}>
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && <span className="text-[10px] font-mono opacity-20">{count}</span>}
    </button>
  );
}

function VerificationBanner({ email, t }: any) {
  const resend = async () => {
    const token = localStorage.getItem("access_token");
    await apiRequest("/api/auth/resend-verification", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    alert("Sent!");
  };
  return (
    <div className="mb-8 p-3 border border-zinc-900 rounded-md flex items-center justify-between bg-zinc-950/50">
      <div className="flex items-center gap-3 text-[11px] text-zinc-500">
        <AlertCircle size={14} className="text-orange-600" />
        <span>{t.verify}: <b>{email}</b></span>
      </div>
      <button onClick={resend} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white underline">{t.resend}</button>
    </div>
  );
}

function DashboardView({ competitors, signals }: any) {
  return (
    <div className="space-y-6">
      {/* Updated Capacity Banner */}
      <div className="p-8 border border-zinc-900 rounded-xl flex items-center justify-between bg-[#000]">
         <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Monitor Usage</p>
            <p className="text-2xl font-bold text-white tracking-tight">{competitors.length} <span className="text-zinc-800">/ 20</span></p>
         </div>
         <div className="h-10 w-px bg-zinc-900" />
         <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Total Signals</p>
            <p className="text-2xl font-bold text-white tracking-tight">{signals.length}</p>
         </div>
         <div className="h-10 w-px bg-zinc-900" />
         <div className="space-y-1 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">System Status</p>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Scan Online</p>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="p-6 border border-zinc-900 rounded-xl">
            <p className="text-[10px] font-bold uppercase text-zinc-600 mb-4 tracking-widest">Recent Activity</p>
            <div className="space-y-4">
               {signals.slice(0, 3).map((s: any) => (
                 <div key={s.id} className="flex gap-4 text-xs">
                    <span className="text-zinc-700 font-mono">{new Date(s.created_at).getHours()}:{new Date(s.created_at).getMinutes()}</span>
                    <span className="text-zinc-400 truncate">{s.ai_analysis || s.msg}</span>
                 </div>
               ))}
            </div>
         </div>
         <div className="p-6 border border-zinc-900 rounded-xl flex items-center justify-center">
             <p className="text-[10px] font-bold uppercase text-zinc-800 tracking-[0.3em]">Ready for Insights</p>
         </div>
      </div>
    </div>
  );
}

function CompetitorsTable({ competitors, onSelect, onDelete, t }: any) {
  return (
    <div className="border border-zinc-900 rounded-xl overflow-hidden bg-[#000]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-900 bg-zinc-950/20">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">Company</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">{t.location}</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600 text-right">{t.status}</th>
            <th className="px-6 py-4 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900">
          {competitors.map((c: any) => (
            <tr key={c.id} onClick={() => onSelect(c)} className="hover:bg-zinc-900/40 cursor-pointer group transition-all">
              <td className="px-6 py-5">
                 <div className="font-bold text-white text-xs uppercase tracking-wider">{c.name}</div>
                 <div className="text-[10px] text-zinc-700 font-mono mt-0.5">{c.website_url}</div>
              </td>
              <td className="px-6 py-5 text-[11px] font-medium text-zinc-500 uppercase">{c.city || "—"}</td>
              <td className="px-6 py-5 text-right">
                 <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
              </td>
              <td className="px-6 py-5">
                 <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="text-zinc-800 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                 </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SignalsView({ signals, onViewDiff }: any) {
  return (
    <div className="space-y-1">
      {signals.map((s: any) => (
        <div key={s.id} className="p-6 border-b border-zinc-900 flex gap-10 items-start hover:bg-zinc-950 transition-all">
          <div className="w-24 shrink-0">
            <p className="text-[10px] font-bold text-white uppercase truncate tracking-widest">{s.company}</p>
            <div className="text-[9px] font-mono text-zinc-700 mt-1 flex items-center gap-1"><Clock size={10} />{new Date(s.created_at).getHours()}:{new Date(s.created_at).getMinutes()}</div>
          </div>
          <div className="flex-1">
             {s.ai_analysis ? (
               <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-500 tracking-widest">
                    <Sparkles size={10} /> AI Insight
                  </div>
                  <p className="text-[13px] text-zinc-200 leading-relaxed font-medium uppercase tracking-tight">{s.ai_analysis}</p>
               </div>
             ) : (
               <p className="text-[13px] text-zinc-500 leading-relaxed uppercase tracking-tight">{s.msg}</p>
             )}
             <div className="mt-4 flex gap-3">
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 border border-zinc-800 text-zinc-600 rounded">{s.tag}</span>
                {s.tag === 'PRODUCT' && (
                  <button onClick={() => onViewDiff(s)} className="text-[10px] font-bold text-zinc-400 hover:text-white underline uppercase">Compare Changes</button>
                )}
             </div>
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
  const [isLinking, setIsLinking] = useState(false);
  const [showForm, setShowForm] = useState(false); // Состояние для показа полей ввода

  const fetchSocials = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const data = await apiRequest(`/api/competitors/${comp.id}/socials`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
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
        method: "POST", 
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ platform, url: socialUrl, interval: 60 }) 
      });
      setSocialUrl("");
      setShowForm(false);
      fetchSocials();
    } catch (e) {
      alert("Ошибка при добавлении ссылки");
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="space-y-8">
      <button onClick={onBack} className="text-[10px] font-bold uppercase text-zinc-600 hover:text-white transition-all underline decoration-zinc-800">
        ← Все мониторы
      </button>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="p-8 border border-zinc-900 rounded-xl bg-zinc-950/20">
            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter mb-1">{comp.name}</h2>
            <p className="text-xs text-zinc-600 font-mono mb-8">{comp.website_url}</p>
            <div className="pt-6 border-t border-zinc-900 flex justify-between items-center text-[10px] font-bold uppercase text-zinc-500">
               <span>{t.location}</span>
               <span className="text-zinc-300">{comp.city || "—"}</span>
            </div>
          </div>

          {/* Исправленный блок коннекторов */}
          <div className="p-6 border border-zinc-900 rounded-xl bg-black">
             <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700 mb-4">Connectors</p>
             
             {/* Список уже добавленных соцсетей */}
             <div className="space-y-2 mb-4">
                {socials.map((s: any) => (
                  <div key={s.id} className="flex justify-between items-center p-2 bg-zinc-900/50 rounded border border-zinc-800">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">{s.platform}</span>
                    <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">Active</span>
                  </div>
                ))}
             </div>

             {!showForm ? (
               <button 
                 onClick={() => setShowForm(true)}
                 className="w-full py-2 border border-dashed border-zinc-800 rounded text-[10px] font-bold text-zinc-600 uppercase hover:border-zinc-600 hover:text-zinc-300 transition-all"
               >
                 + Add TG/VK
               </button>
             ) : (
               <div className="space-y-3 p-3 bg-zinc-900/30 rounded-lg border border-zinc-800 animate-in fade-in">
                  <select 
                    value={platform} 
                    onChange={e => setPlatform(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-[10px] font-bold text-white outline-none"
                  >
                    <option value="telegram">Telegram</option>
                    <option value="vk">VK.com</option>
                  </select>
                  <input 
                    value={socialUrl} 
                    onChange={e => setSocialUrl(e.target.value)}
                    placeholder="https://t.me/..." 
                    className="w-full bg-black border border-zinc-800 rounded px-2 py-1.5 text-[10px] text-white outline-none focus:border-zinc-600"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowForm(false)}
                      className="flex-1 py-1.5 text-[9px] font-bold text-zinc-500 uppercase hover:text-white"
                    >
                      Отмена
                    </button>
                    <button 
                      onClick={handleLink}
                      disabled={isLinking}
                      className="flex-1 py-1.5 bg-white text-black rounded text-[9px] font-bold uppercase"
                    >
                      {isLinking ? "..." : "Save"}
                    </button>
                  </div>
               </div>
             )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-1">
           {signals.length > 0 ? signals.map((s: any) => (
              <div key={s.id} className="p-6 border-b border-zinc-900/50 bg-[#000] flex gap-8 items-start hover:bg-zinc-950/30 transition-colors">
                 <div className="w-16 shrink-0 text-[10px] font-mono text-zinc-800 mt-1">
                    {new Date(s.created_at).toLocaleDateString([], {day:'2-digit', month:'2-digit'})}
                 </div>
                 <div className="flex-1 space-y-4">
                    {s.ai_analysis ? (
                      <div className="space-y-2">
                         <div className="flex items-center gap-1.5 text-emerald-500">
                           <Sparkles size={12} />
                           <span className="text-[8px] font-black uppercase tracking-widest">AI Analysis</span>
                         </div>
                         <p className="text-[13px] text-zinc-200 leading-relaxed font-medium uppercase tracking-tight italic">
                           {s.ai_analysis}
                         </p>
                      </div>
                    ) : (
                      <p className="text-[13px] text-zinc-400 uppercase tracking-tight">{s.msg}</p>
                    )}
                    <div className="flex gap-3">
                       <span className="text-[8px] font-bold border border-zinc-800 px-2 py-0.5 rounded text-zinc-600 uppercase">{s.tag}</span>
                       {s.tag === 'PRODUCT' && (
                         <button onClick={() => onViewDiff(s)} className="text-[9px] font-bold text-zinc-500 uppercase hover:text-white underline">Diff</button>
                       )}
                    </div>
                 </div>
              </div>
           )) : (
             <div className="p-20 text-center text-zinc-800 text-[10px] font-bold uppercase tracking-[0.3em]">
                No signals captured yet
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function SettingsView({ user, t }: any) {
  return (
    <div className="max-w-md mx-auto space-y-10 py-10">
       <div className="space-y-6">
          <h3 className="text-3xl font-bold text-white uppercase tracking-tighter">Settings</h3>
          <div className="space-y-1 border-b border-zinc-900 pb-4">
             <p className="text-[10px] font-bold uppercase text-zinc-700">Account Identity</p>
             <p className="text-sm font-medium text-zinc-300 italic">{user?.email}</p>
          </div>
          <div className="space-y-1 border-b border-zinc-900 pb-4">
             <p className="text-[10px] font-bold uppercase text-zinc-700">Billing Plan</p>
             <p className="text-sm font-bold text-zinc-300 uppercase">{user?.plan || "Growth Member"}</p>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.href = "/auth/login"; }} className="w-full py-3 rounded-md border border-zinc-800 text-zinc-500 text-[10px] font-bold uppercase hover:bg-red-950/20 hover:text-red-500 transition-all">
             <LogOut size={14} className="inline mr-2" /> {t.exit}
          </button>
       </div>
    </div>
  );
}

function AddObjectModal({ onClose, onSuccess, t, DADATA_KEY, partySuggestions, setPartySuggestions }: any) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [city, setCity] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/competitors", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, website_url: url, city }) });
      onSuccess();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90">
      <div className="bg-[#000] border border-zinc-900 rounded-xl p-10 w-full max-w-sm">
        <h3 className="text-xl font-bold text-white mb-8 uppercase tracking-widest">New Monitor</h3>
        <form onSubmit={handleAdd} className="space-y-6">
           <div className="space-y-1 relative">
              <label className="text-[9px] font-bold uppercase text-zinc-700">Name</label>
              <input required value={name} onChange={e => {
                setName(e.target.value);
                if (e.target.value.length >= 3) {
                  fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Token ${DADATA_KEY}` }, body: JSON.stringify({ query: e.target.value }) }).then(r => r.json()).then(d => setPartySuggestions(d.suggestions || []));
                } else setPartySuggestions([]);
              }} className="w-full bg-zinc-950 border border-zinc-900 rounded-md px-3 py-2 text-xs text-white outline-none focus:border-zinc-700 transition-all" />
              {partySuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-[60] bg-black border border-zinc-900 rounded-md mt-1 max-h-32 overflow-auto">
                   {partySuggestions.map((s: any, i:any) => (
                     <button key={i} type="button" onClick={() => { setName(s.value); setCity(s.data.address?.data?.city || ""); setPartySuggestions([]); }} className="w-full px-3 py-2 text-left text-[9px] font-bold uppercase border-b border-zinc-900 hover:bg-zinc-900 transition-all">{s.value}</button>
                   ))}
                </div>
              )}
           </div>
           <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-zinc-700">{t.website}</label>
              <input required value={url} onChange={e => setUrl(e.target.value)} placeholder="example.com" className="w-full bg-zinc-950 border border-zinc-900 rounded-md px-3 py-2 text-xs outline-none" />
           </div>
           <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose} className="flex-1 py-3 text-[10px] font-bold uppercase text-zinc-700 hover:text-white italic">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-white text-black rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all">Launch</button>
           </div>
        </form>
      </div>
    </div>
  );
}