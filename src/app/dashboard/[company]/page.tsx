"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Globe, Rss, Settings, Plus, Trash2, 
  ExternalLink, ChevronRight, AlertCircle, CheckCircle2,
  LogOut, Languages, Search, Activity
} from "lucide-react";
import { apiRequest } from "../../../lib/api";
import ReactDiffViewer from "react-diff-viewer-continued";

const DADATA_KEY = "4affb62ba89180ef3405454f9a047fa680d957ed";

// --- ЛОГОТИП SLEDIX ---
const SledixLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 676 584" fill="white">
    <path d="M 2970 5165 c161 -51 273 -146 343 -292 l42 -88 0 -120 c-1 -107 -4 -127 -27 -182 -54 -128 -110 -190 -259 -289 -115 -77 -185 -148 -231 -235 l-33 -64 0 -160 c0 -156 1 -162 29 -218 41 -84 129 -173 248 -251 116 -76 184 -148 228 -241 51 -108 62 -214 35 -319 -50 -190 -200 -341 -385 -387 -83 -21 -496 -17 -613 5 -505 97 -919 440 -1102 914 -19 51 -47 141 -62 200 -23 94 -26 128 -26 277 0 94 5 206 12 250 86 559 531 1047 1081 1184 132 33 218 40 450 37 171 -3 226 -7 270 -21z m2597 11 c4 -4 -217 -230 -492 -502 l-500 -493 -370 0 c-413 -1 -466 5 -562 60 -75 43 -161 131 -200 204 -56 107 -67 265 -26 390 39 120 148 242 272 303 l75 37 170 6 c264 9 1623 5 1633 -5z m-1137 -1889 c186 -44 350 -117 520 -230 95 -64 300 -269 368 -369 107 -158 -188 -353 229 -553 25 -125 25 -416 -1 -533 -72 -337 -260 -635 -533 -849 -202 -158 -452 -261 -710 -293 -109 -14 -421 -14 -493 0 -190 35 -376 216 -410 399 -31 165 23 351 132 460 27 27 88 75 134 107 197 133 284 277 284 467 0 185 -77 299 -312 464 -121 86 -149 114 -191 198 -43 86 -61 163 -61 260 0 78 4 99 31 162 61 143 135 223 273 293 94 48 109 50 380 46 228 -4 266 -7 360 -29z m-1425 -1858 c184 -81 300 -212 341 -385 27 -118 1 -241 -78 -362 -52 -80 -122 -142 -218 -191 l-75 -39 -932 -4 c-830 -3 -930 -2 -923 12 9 17 558 561 835 828 l180 174 410 -6 c395 -5 412 -6 460 -27z" transform="translate(0, 584) scale(0.1, -0.1)" />
  </svg>
);

const TAG_LABELS_RU: Record<string, string> = {
  PRICING: "Цены", HIRING: "Найм", REVIEWS: "Отзывы", LEGAL: "Право", PRODUCT: "Продукт", TECH: "Tech", MARKETING: "Маркетинг",
};

const DICTIONARY = {
  RU: {
    dashboard: "Аналитика", objects: "Объекты", feed: "Лента", settings: "Настройки",
    add: "Добавить объект", status: "Статус", location: "Локация", resend: "Выслать письмо",
    verify: "Подтвердите Email", exit: "Выйти", lang: "Язык", city: "Город", website: "Сайт"
  },
  EN: {
    dashboard: "Analytics", objects: "Objects", feed: "Feed", settings: "Settings",
    add: "Add Object", status: "Status", location: "Location", resend: "Resend email",
    verify: "Verify Email", exit: "Logout", lang: "Language", city: "City", website: "Website"
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

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить объект?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest(`/api/competitors/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  if (isLoading) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs uppercase tracking-widest">System Loading...</div>;

  return (
    <div className="flex h-screen bg-black text-zinc-200 font-sans antialiased">
      
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-zinc-800 flex flex-col bg-black">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 gap-3">
          <SledixLogo />
          <span className="text-sm font-black text-white uppercase tracking-tight">Sledix</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavItem active={page==="dashboard"} onClick={() => {setPage("dashboard"); setSelectedComp(null)}} icon={<LayoutDashboard size={18}/>} label={t.dashboard} />
          <NavItem active={page==="competitors"} onClick={() => {setPage("competitors"); setSelectedComp(null)}} icon={<Globe size={18}/>} label={t.objects} count={competitors.length} />
          <NavItem active={page==="signals"} onClick={() => {setPage("signals"); setSelectedComp(null)}} icon={<Rss size={18}/>} label={t.feed} />
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-2">
          <button onClick={() => setLang(lang === "RU" ? "EN" : "RU")} className="w-full flex items-center gap-3 px-3 py-2 rounded text-[10px] font-bold text-zinc-500 hover:bg-zinc-900 transition-all uppercase tracking-widest">
            <Languages size={14} /> {t.lang}: {lang}
          </button>
          <button onClick={() => setPage("settings")} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${page === "settings" ? "bg-white text-black" : "text-zinc-500 hover:bg-zinc-900 hover:text-white"}`}>
            <Settings size={14} /> {t.settings}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 bg-black">
        <header className="h-16 flex items-center justify-between px-8 border-b border-zinc-800 bg-black/50 backdrop-blur-md">
          <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
            {selectedComp ? selectedComp.name : page}
          </h1>
          <button onClick={() => setShowModal(true)} className="bg-white text-black px-5 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2">
            <Plus size={14} /> {t.add}
          </button>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {user && !user.is_email_verified && page !== "settings" && (
            <VerificationBanner email={user.email} t={t} />
          )}

          {selectedComp ? (
            <CompetitorDetailsView comp={selectedComp} signals={signals.filter(s => s.company === selectedComp.name)} onBack={() => setSelectedComp(null)} onViewDiff={openDiff} t={t} />
          ) : (
            <>
              {page === "dashboard" && <DashboardView competitors={competitors} signals={signals} stats={stats} />}
              {page === "competitors" && <CompetitorsList competitors={competitors} onSelect={setSelectedComp} onDelete={handleDelete} t={t} />}
              {page === "signals" && <SignalsView signals={signals} onViewDiff={openDiff} />}
              {page === "settings" && <SettingsView user={user} t={t} />}
            </>
          )}
        </div>
      </main>

      {/* Modals */}
      {showModal && (
        <AddObjectModal 
          onClose={() => setShowModal(false)} 
          onSuccess={() => { setShowModal(false); fetchData(); }} 
          t={t} 
          DADATA_KEY={DADATA_KEY}
        />
      )}

      {showDiffModal && diffData && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-tighter italic text-white">Изменения: {diffData.msg}</h3>
            <button onClick={() => setShowDiffModal(false)} className="bg-zinc-800 text-white px-4 py-2 rounded text-xs font-bold uppercase">Закрыть</button>
          </div>
          <div className="flex-1 overflow-auto rounded-lg border border-zinc-800 bg-[#050505]">
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
    <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-2.5 rounded text-[11px] font-bold uppercase tracking-widest transition-all ${active ? "bg-zinc-800 text-white shadow-xl" : "text-zinc-500 hover:text-white hover:bg-zinc-900"}`}>
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && <span className="text-[10px] font-mono opacity-40">{count}</span>}
    </button>
  );
}

function VerificationBanner({ email, t }: any) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const resend = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/auth/resend-verification", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      setSent(true);
    } catch (e) { alert("Ошибка при отправке."); } finally { setLoading(false); }
  };

  return (
    <div className="mb-8 p-4 bg-zinc-950 border border-zinc-800 rounded flex items-center justify-between">
      <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
        <AlertCircle size={18} className="text-amber-500" />
        <span>{t.verify}: <b>{email}</b></span>
      </div>
      <button onClick={resend} disabled={loading || sent} className="text-[10px] uppercase font-black text-white hover:underline disabled:text-zinc-600">
        {sent ? "Отправлено" : t.resend}
      </button>
    </div>
  );
}

function DashboardView({ competitors, signals, stats }: any) {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 border border-zinc-800 rounded-lg bg-zinc-950/50">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Объекты</p>
          <p className="text-4xl font-bold text-white tracking-tighter">{competitors.length}</p>
        </div>
        <div className="p-8 border border-zinc-800 rounded-lg bg-zinc-950/50">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Сигналы (24ч)</p>
          <p className="text-4xl font-bold text-white tracking-tighter">
            {signals.filter((s:any) => new Date(s.created_at) > new Date(Date.now() - 86400000)).length}
          </p>
        </div>
        <div className="p-8 border border-zinc-800 rounded-lg bg-zinc-950/50">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">Здоровье</p>
          <div className="text-4xl font-bold text-emerald-500 flex items-center gap-3 tracking-tighter">100% <CheckCircle2 size={32}/></div>
        </div>
      </div>
      
      <div className="p-10 border border-zinc-800 rounded-lg bg-zinc-950/50">
         <div className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 mb-12">Активность мониторинга</div>
         <div className="h-40 flex items-end gap-1.5">
            {stats.map((s:any, i:number) => (
              <div key={i} className="flex-1 bg-zinc-800 hover:bg-white transition-all" style={{ height: `${(s.value / Math.max(...stats.map((x:any)=>x.value), 1)) * 100}%` }} title={s.value} />
            ))}
         </div>
      </div>
    </div>
  );
}

function CompetitorsList({ competitors, onSelect, onDelete, t }: any) {
  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden bg-zinc-950/30">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-zinc-900 border-b border-zinc-800">
          <tr>
            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">{t.objects}</th>
            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-600">{t.location}</th>
            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 text-right">{t.status}</th>
            <th className="px-8 py-4 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900">
          {competitors.map((c: any) => (
            <tr key={c.id} onClick={() => onSelect(c)} className="hover:bg-zinc-900 cursor-pointer group transition-all">
              <td className="px-8 py-6">
                <div className="font-bold text-white text-sm uppercase tracking-tight">{c.name}</div>
                <div className="text-[10px] text-zinc-500 font-mono mt-1">{c.website_url}</div>
              </td>
              <td className="px-8 py-6 text-zinc-400 font-bold uppercase tracking-tighter">{c.city || "—"}</td>
              <td className="px-8 py-6 text-right">
                 <span className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-500/5 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Live
                 </span>
              </td>
              <td className="px-8 py-6">
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
      await apiRequest(`/api/competitors/${comp.id}/socials`, { 
        method: "POST", headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ platform, url: socialUrl, interval: 60 })
      });
      setSocialUrl(""); fetchSocials();
    } catch (e) { alert("Ошибка привязки"); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-10">
      <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-white transition-all flex items-center gap-2">
        ← Вернуться
      </button>

      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="p-8 border border-zinc-800 rounded-lg bg-zinc-950">
            <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-tighter">{comp.name}</h2>
            <p className="text-xs text-zinc-500 font-mono mb-8">{comp.website_url}</p>
            <div className="space-y-6 pt-6 border-t border-zinc-900">
               <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700 mb-1">{t.location}</p>
                 <p className="text-xs font-bold text-zinc-400">{comp.city || "—"}</p>
               </div>
               <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700 mb-1">Скор (Риск)</p>
                 <p className="text-2xl font-bold text-white tracking-tighter">74 <span className="text-[10px] text-zinc-600 uppercase">/ 100</span></p>
               </div>
            </div>
          </div>

          <div className="p-8 border border-zinc-800 rounded-lg bg-zinc-950">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-6">Социальные сети</h3>
            <div className="space-y-2 mb-6">
               {socials.map(s => (
                 <div key={s.id} className="p-3 bg-white/5 border border-white/5 rounded flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                   <span>{s.platform}</span>
                   <span className="text-emerald-500">Live</span>
                 </div>
               ))}
            </div>
            <div className="space-y-3 pt-6 border-t border-zinc-900">
              <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-[10px] font-bold uppercase tracking-widest outline-none">
                <option value="telegram">Telegram</option>
                <option value="vk">VK.com</option>
              </select>
              <input value={socialUrl} onChange={e => setSocialUrl(e.target.value)} placeholder="Ссылка..." className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-[10px] font-bold outline-none" />
              <button onClick={handleLink} disabled={loading} className="w-full py-3 bg-white text-black rounded text-[10px] font-black uppercase tracking-widest transition-all">
                {loading ? "..." : "Привязать"}
              </button>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden divide-y divide-zinc-900">
           <div className="p-4 bg-zinc-900/50 text-[10px] font-black uppercase tracking-widest text-zinc-600">События по объекту</div>
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
    <div className="p-8 flex gap-8 hover:bg-zinc-900/30 transition-all group">
      <div className="w-32 shrink-0">
        <div className="text-[10px] font-black text-white uppercase tracking-tight truncate">{signal.company}</div>
        <div className="text-[10px] font-mono text-zinc-600 mt-2">
          {new Date(signal.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>
      <div className="flex-1">
        <p className="text-sm text-zinc-400 leading-relaxed font-medium uppercase tracking-tight italic">
          {signal.ai_analysis || signal.msg}
        </p>
        <div className="flex gap-4 mt-6">
          <span className="text-[9px] font-black uppercase px-2 py-1 border border-zinc-800 text-zinc-600 rounded">
            {signal.tag}
          </span>
          {signal.tag === 'PRODUCT' && (
            <button onClick={onDiff} className="text-[10px] font-black text-white hover:underline uppercase tracking-widest flex items-center gap-1">
              Разница <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SignalsView({ signals, onViewDiff }: any) {
  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-950 divide-y divide-zinc-900">
       <div className="p-4 bg-zinc-900/50 text-[10px] font-black uppercase tracking-widest text-zinc-600">Живой поток данных</div>
       {signals.map((s: any) => <SignalRow key={s.id} signal={s} onDiff={() => onViewDiff(s)} />)}
    </div>
  );
}

function SettingsView({ user, t }: any) {
  return (
    <div className="max-w-xl mx-auto border border-zinc-800 rounded-lg p-10 bg-zinc-950 shadow-2xl">
      <h3 className="text-3xl font-bold text-white uppercase tracking-tighter mb-12">Account Settings</h3>
      <div className="space-y-10">
        <div className="space-y-2 border-b border-zinc-900 pb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Auth Identity</p>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold italic">{user?.email}</span>
            {user?.is_email_verified && <CheckCircle2 size={16} className="text-emerald-500" />}
          </div>
        </div>
        <div className="space-y-2 border-b border-zinc-900 pb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Billing Plan</p>
          <span className="text-base font-bold uppercase tracking-tight">{user?.plan || "Growth Plan"}</span>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href = "/auth/login"; }} className="w-full py-5 rounded border border-red-900/30 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
          <LogOut size={16} className="inline mr-2" /> {t.exit}
        </button>
      </div>
    </div>
  );
}

function AddObjectModal({ onClose, onSuccess, t, DADATA_KEY }: any) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [city, setCity] = useState("");
  const [partySuggestions, setPartySuggestions] = useState<any[]>([]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/competitors", { 
        method: "POST", headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, website_url: url, city })
      });
      onSuccess();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-10 w-full max-w-md shadow-2xl">
        <h3 className="text-4xl font-bold text-white mb-10 uppercase tracking-tighter italic">New Monitor</h3>
        <form onSubmit={handleAdd} className="space-y-8">
          <div className="space-y-2 relative">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-700">Company Name</label>
            <input required value={name} onChange={e => {
              setName(e.target.value);
              if (e.target.value.length >= 3) {
                fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party", {
                  method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Token ${DADATA_KEY}` },
                  body: JSON.stringify({ query: e.target.value })
                }).then(r => r.json()).then(d => setPartySuggestions(d.suggestions || []));
              } else setPartySuggestions([]);
            }} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-sm font-bold uppercase tracking-widest outline-none focus:border-white transition-all" />
            {partySuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-[60] mt-2 bg-zinc-900 border border-zinc-800 rounded-lg max-h-40 overflow-auto shadow-2xl">
                 {partySuggestions.map((s, i) => (
                   <button key={i} type="button" onClick={() => { setName(s.value); setCity(s.data.address?.data?.city || ""); setPartySuggestions([]); }} className="w-full px-4 py-3 text-left text-[10px] font-bold uppercase border-b border-zinc-800 hover:bg-white hover:text-black">
                     {s.value}
                   </button>
                 ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-700">{t.website}</label>
            <input required value={url} onChange={e => setUrl(e.target.value)} placeholder="example.com" className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-sm font-bold outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-700">{t.city}</label>
            <input value={city} onChange={e => setCity(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-sm font-bold outline-none uppercase tracking-widest" />
          </div>
          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-4 border border-zinc-800 rounded text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-4 bg-white text-black rounded text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all">Run Scan</button>
          </div>
        </form>
      </div>
    </div>
  );
}