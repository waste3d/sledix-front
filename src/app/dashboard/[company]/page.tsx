"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Globe, 
  Rss, 
  Settings, 
  Plus, 
  Trash2, 
  ExternalLink, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2,
  LogOut,
  Languages
} from "lucide-react";
import { apiRequest } from "../../../lib/api";
import ReactDiffViewer from "react-diff-viewer-continued";

const DADATA_KEY = "4affb62ba89180ef3405454f9a047fa680d957ed";

const DICTIONARY = {
  RU: {
    dashboard: "Обзор",
    objects: "Объекты мониторинга",
    feed: "Лента событий",
    settings: "Настройки профиля",
    add: "Добавить объект",
    location: "Локация",
    status: "Статус",
    verify_msg: "Ваш адрес электронной почты не подтвержден. Пожалуйста, проверьте почту.",
    resend_link: "Отправить ссылку повторно",
    exit: "Выйти из системы",
    lang: "Язык интерфейса",
    empty: "Данных пока нет",
    company_name: "Название компании",
    website: "Сайт",
    city: "Город",
    cancel: "Отмена",
    run: "Запустить мониторинг"
  },
  EN: {
    dashboard: "Dashboard",
    objects: "Monitoring Objects",
    feed: "Activity Feed",
    settings: "Account Settings",
    add: "Add Object",
    location: "Location",
    status: "Status",
    verify_msg: "Your email address is not verified. Please check your inbox.",
    resend_link: "Resend verification link",
    exit: "Logout",
    lang: "Interface Language",
    empty: "No data available",
    company_name: "Company Name",
    website: "Website",
    city: "City",
    cancel: "Cancel",
    run: "Start Tracking"
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
  const [city, setCity] = useState("");
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/competitors", { 
        method: "POST", 
        headers: { Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ name: newCompName, website_url: newCompUrl, city }) 
      });
      setShowModal(false);
      setNewCompName(""); setNewCompUrl(""); setCity("");
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Удалить объект?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest(`/api/competitors/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  if (isLoading) return <div className="h-screen bg-black flex items-center justify-center text-zinc-500 text-sm">Загрузка системы...</div>;

  return (
    <div className="flex h-screen bg-black text-zinc-200 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-zinc-800 flex flex-col bg-black">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <span className="text-lg font-bold text-white tracking-tight">SLEDIX</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <SidebarItem active={page==="dashboard"} onClick={() => {setPage("dashboard"); setSelectedComp(null)}} icon={<LayoutDashboard size={20}/>} label={t.dashboard} />
          <SidebarItem active={page==="competitors"} onClick={() => {setPage("competitors"); setSelectedComp(null)}} icon={<Globe size={20}/>} label={t.objects} count={competitors.length} />
          <SidebarItem active={page==="signals"} onClick={() => {setPage("signals"); setSelectedComp(null)}} icon={<Rss size={20}/>} label={t.feed} />
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-1">
          <button onClick={() => setLang(lang === "RU" ? "EN" : "RU")} className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm text-zinc-500 hover:bg-zinc-900 transition-colors">
            <Languages size={18} /> {t.lang}: {lang}
          </button>
          <button onClick={() => setPage("settings")} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${page === "settings" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:bg-zinc-900"}`}>
            <Settings size={18} /> {t.settings}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-8 border-b border-zinc-800 bg-black">
          <h1 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
            {selectedComp ? selectedComp.name : t[page as keyof typeof t] || page}
          </h1>
          <button onClick={() => setShowModal(true)} className="bg-white text-black px-5 py-2 rounded text-xs font-bold hover:bg-zinc-200 transition-all flex items-center gap-2">
            <Plus size={16} /> {t.add}
          </button>
        </header>

        <div className="flex-1 overflow-auto p-8">
          {/* Email Verification Banner */}
          {user && !user.is_email_verified && (
            <div className="mb-8 p-4 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <AlertCircle size={20} className="text-amber-500" />
                <span>{t.verify_msg}</span>
              </div>
              <button className="text-xs font-bold text-white hover:underline">{t.resend_link}</button>
            </div>
          )}

          {selectedComp ? (
            <div className="space-y-8">
              <button onClick={() => setSelectedComp(null)} className="text-sm text-zinc-500 hover:text-white">← Вернуться к списку</button>
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-4 space-y-6">
                   <div className="p-6 border border-zinc-800 rounded bg-zinc-950">
                      <h2 className="text-2xl font-bold text-white mb-1">{selectedComp.name}</h2>
                      <p className="text-sm text-zinc-500 mb-6">{selectedComp.website_url}</p>
                      <div className="space-y-4 pt-4 border-t border-zinc-800">
                        <div>
                          <p className="text-[10px] font-bold text-zinc-600 uppercase">Локация</p>
                          <p className="text-sm">{selectedComp.city || "—"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-600 uppercase">Статус</p>
                          <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Активен
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
                <div className="col-span-8 border border-zinc-800 rounded bg-zinc-950 divide-y divide-zinc-900">
                   <div className="p-4 bg-zinc-900/50 text-[10px] font-bold text-zinc-500 uppercase">Последние события объекта</div>
                   {signals.filter(s => s.company === selectedComp.name).map(s => (
                     <SignalItem key={s.id} signal={s} />
                   ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {page === "dashboard" && <DashboardView competitors={competitors} signals={signals} stats={stats} />}
              {page === "competitors" && <CompetitorsList competitors={competitors} onSelect={setSelectedComp} onDelete={handleDelete} />}
              {page === "signals" && <div className="border border-zinc-800 rounded bg-zinc-950 divide-y divide-zinc-900">{signals.map(s => <SignalItem key={s.id} signal={s} />)}</div>}
              {page === "settings" && <SettingsView user={user} t={t} />}
            </>
          )}
        </div>
      </main>

      {/* Modal: Add Object */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90">
          <div className="bg-zinc-950 border border-zinc-800 rounded p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-8 uppercase tracking-tight">Добавить монитор</h3>
            <form onSubmit={handleAdd} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-zinc-600 uppercase block mb-2">{t.company_name}</label>
                <input required value={newCompName} onChange={e => setNewCompName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-sm text-white focus:border-zinc-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-600 uppercase block mb-2">{t.website}</label>
                <input required value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="example.com" className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-sm text-white focus:border-zinc-500 outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-600 uppercase block mb-2">{t.city}</label>
                <input value={city} onChange={e => setCity(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded px-4 py-3 text-sm text-white focus:border-zinc-500 outline-none" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-zinc-800 rounded text-xs font-bold text-zinc-400 hover:text-white">{t.cancel}</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-white text-black rounded text-xs font-bold hover:bg-zinc-200">{t.run}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Компоненты View ---

function SidebarItem({ active, onClick, icon, label, count }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all ${active ? "bg-zinc-800 text-white" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"}`}>
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {count !== undefined && <span className="text-xs font-bold opacity-30">{count}</span>}
    </button>
  );
}

function DashboardView({ competitors, signals, stats }: any) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-zinc-800 rounded bg-zinc-950">
          <p className="text-[10px] font-bold text-zinc-600 uppercase mb-2">Объекты в работе</p>
          <p className="text-4xl font-bold text-white">{competitors.length}</p>
        </div>
        <div className="p-6 border border-zinc-800 rounded bg-zinc-950">
          <p className="text-[10px] font-bold text-zinc-600 uppercase mb-2">События за сутки</p>
          <p className="text-4xl font-bold text-white">
            {signals.filter((s:any) => new Date(s.created_at) > new Date(Date.now() - 86400000)).length}
          </p>
        </div>
        <div className="p-6 border border-zinc-800 rounded bg-zinc-950">
          <p className="text-[10px] font-bold text-zinc-600 uppercase mb-2">Здоровье системы</p>
          <div className="flex items-center gap-3">
             <span className="text-4xl font-bold text-emerald-500 underline decoration-emerald-500/30">100%</span>
             <CheckCircle2 size={24} className="text-emerald-500" />
          </div>
        </div>
      </div>
      
      <div className="p-8 border border-zinc-800 rounded bg-zinc-950">
         <p className="text-[10px] font-bold text-zinc-600 uppercase mb-10">Активность мониторинга (24ч)</p>
         <div className="h-32 flex items-end gap-1.5">
            {stats.length > 0 ? stats.map((s:any, i:number) => (
              <div key={i} className="flex-1 bg-zinc-800 hover:bg-zinc-500 transition-colors" style={{ height: `${(s.value / Math.max(...stats.map((x:any)=>x.value), 1)) * 100}%` }} title={s.value} />
            )) : <div className="w-full text-center text-xs text-zinc-700">Нет данных для графиков</div>}
         </div>
      </div>
    </div>
  );
}

function CompetitorsList({ competitors, onSelect, onDelete }: any) {
  return (
    <div className="border border-zinc-800 rounded bg-zinc-950 overflow-hidden">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-zinc-900 border-b border-zinc-800">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Объект</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Локация</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Статус</th>
            <th className="px-6 py-4 w-20"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900">
          {competitors.map((c: any) => (
            <tr key={c.id} onClick={() => onSelect(c)} className="hover:bg-zinc-900/50 cursor-pointer transition-colors group">
              <td className="px-6 py-5">
                <div className="font-bold text-white">{c.name}</div>
                <div className="text-xs text-zinc-500 font-mono">{c.website_url}</div>
              </td>
              <td className="px-6 py-5 text-zinc-400 font-medium">{c.city || "—"}</td>
              <td className="px-6 py-5">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
                 </div>
              </td>
              <td className="px-6 py-5">
                <button onClick={(e) => { e.stopPropagation(); onDelete(c.id); }} className="p-2 text-zinc-700 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SignalItem({ signal }: any) {
  return (
    <div className="p-6 flex gap-8 hover:bg-zinc-900/30 transition-colors">
      <div className="w-32 shrink-0">
        <div className="text-[10px] font-bold text-white uppercase truncate">{signal.company}</div>
        <div className="text-[10px] font-mono text-zinc-600 mt-1">
          {new Date(signal.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>
      <div className="flex-1">
        <div className="text-sm text-zinc-300 leading-relaxed">
          {signal.ai_analysis || signal.msg}
        </div>
        <div className="flex gap-4 mt-5">
          <span className="text-[9px] font-bold uppercase px-2 py-1 border border-zinc-800 text-zinc-500 rounded bg-zinc-900">
            {signal.tag}
          </span>
          {signal.tag === 'PRODUCT' && (
            <button className="text-[10px] font-bold text-white hover:underline flex items-center gap-1">
              Анализ изменений <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsView({ user, t }: any) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="p-8 border border-zinc-800 rounded bg-zinc-950">
        <h3 className="text-sm font-bold text-white uppercase mb-8 border-b border-zinc-800 pb-4">Управление аккаунтом</h3>
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Email адрес</p>
              <p className="text-base font-medium">{user?.email}</p>
            </div>
            {user?.is_email_verified ? (
              <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold uppercase border border-emerald-500/20 px-3 py-1 rounded">
                <CheckCircle2 size={14} /> Подтвержден
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-500 text-[10px] font-bold uppercase border border-amber-500/20 px-3 py-1 rounded">
                <AlertCircle size={14} /> Требует подтверждения
              </div>
            )}
          </div>
          
          <div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Текущий тариф</p>
            <p className="text-lg font-bold text-white uppercase tracking-tight">{user?.plan || "Growth Plan"}</p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-800">
          <button 
            onClick={() => { localStorage.clear(); window.location.href = "/auth/login"; }} 
            className="w-full flex items-center justify-center gap-3 py-4 border border-red-900/50 text-red-500 text-xs font-bold uppercase rounded hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut size={16} /> {t.exit}
          </button>
        </div>
      </div>
    </div>
  );
}