"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import ReactDiffViewer from "react-diff-viewer-continued";

const DADATA_KEY = "4affb62ba89180ef3405454f9a047fa680d957ed";

// --- ЛОКАЛИЗАЦИЯ ---
const T: Record<string, any> = {
  ru: {
    dashboard: "Обзор",
    monitors: "Мониторы",
    signals: "Сигналы",
    settings: "Настройки",
    logout: "Выйти",
    add_monitor: "+ Мониторинг",
    online: "Онлайн",
    loading: "Загрузка...",
    total_signals: "Всего сигналов",
    activity: "Активность",
    health: "Состояние системы",
    lang: "Язык интерфейса",
    email: "Электронная почта",
    password: "Пароль",
    new_password: "Новый пароль...",
    change_pass: "Сменить пароль",
    save: "Сохранить",
    cancel: "Отмена",
    saved: "Настройки сохранены",
    error: "Ошибка",
    index: "Индекс",
    idle: "Ожидание",
    region: "Регион",
    website: "Сайт",
    delete_monitor: "Удалить монитор",
    back: "Назад",
    connect: "Подключить",
    link_social: "Наблюдатели",
    verify_email: "Подтвердите почту",
    resend: "Выслать снова",
    check_inbox: "Проверьте почту",
    tags: { PRICING: "Цены", HIRING: "Найм", REVIEWS: "Отзывы", LEGAL: "Право", PRODUCT: "Продукт", TECH: "Tech", MARKETING: "Маркетинг" }
  },
  en: {
    dashboard: "Overview",
    monitors: "Monitors",
    signals: "Signals",
    settings: "Settings",
    logout: "Sign Out",
    add_monitor: "+ Monitor",
    online: "Live",
    loading: "Loading...",
    total_signals: "Total Signals",
    activity: "Activity",
    health: "System Health",
    lang: "Interface Language",
    email: "Email Address",
    password: "Password",
    new_password: "New password...",
    change_pass: "Change Password",
    save: "Save Changes",
    cancel: "Cancel",
    saved: "Settings saved",
    error: "Error",
    index: "Index",
    idle: "Idle",
    region: "Region",
    website: "Website",
    delete_monitor: "Delete Monitor",
    back: "Back",
    connect: "Connect",
    link_social: "Watchers",
    verify_email: "Verify Email",
    resend: "Resend",
    check_inbox: "Check inbox",
    tags: { PRICING: "Pricing", HIRING: "Hiring", REVIEWS: "Reviews", LEGAL: "Legal", PRODUCT: "Product", TECH: "Tech", MARKETING: "Marketing" }
  }
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

// --- ИКОНКИ ---
const Icons = {
  dashboard:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>,
  monitors:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  signals:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  settings:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  trash:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
};

function SledixLogo({ size = 28 }: { size?: number }) { return ( <svg width={size} height={size} viewBox="0 0 676 584" fill="white"><g transform="translate(0, 584) scale(0.1, -0.1)"><path d="M 2970 5165 c161 -51 273 -146 343 -292 l42 -88 0 -120 c-1 -107 -4 -127 -27 -182 -54 -128 -110 -190 -259 -289 -115 -77 -185 -148 -231 -235 l-33 -64 0 -160 c0 -156 1 -162 29 -218 41 -84 129 -173 248 -251 116 -76 184 -148 228 -241 51 -108 62 -214 35 -319 -50 -190 -200 -341 -385 -387 -83 -21 -496 -17 -613 5 -505 97 -919 440 -1102 914 -19 51 -47 141 -62 200 -23 94 -26 128 -26 277 0 94 5 206 12 250 86 559 531 1047 1081 1184 132 33 218 40 450 37 171 -3 226 -7 270 -21z m2597 11 c4 -4 -217 -230 -492 -502 l-500 -493 -370 0 c-413 -1 -466 5 -562 60 -75 43 -161 131 -200 204 -56 107 -67 265 -26 390 39 120 148 242 272 303 l75 37 170 6 c264 9 1623 5 1633 -5z m-1137 -1889 c186 -44 350 -117 520 -230 95 -64 300 -269 368 -369 107 -158 188 -353 229 -553 25 -125 25 -416 -1 -533 -72 -337 -260 -635 -533 -849 -202 -158 -452 -261 -710 -293 -109 -14 -421 -14 -493 0 -190 35 -376 216 -410 399 -31 165 23 351 132 460 27 27 88 75 134 107 197 133 284 277 284 467 0 185 -77 299 -312 464 -121 86 -149 114 -191 198 -43 86 -61 163 -61 260 0 78 4 99 31 162 61 143 135 223 273 293 94 48 109 50 380 46 228 -4 266 -7 360 -29z m-1425 -1858 c184 -81 300 -212 341 -385 27 -118 1 -241 -78 -362 -52 -80 -122 -142 -218 -191 l-75 -39 -932 -4 c-830 -3 -930 -2 -923 12 9 17 558 561 835 828 l180 174 410 -6 c395 -5 412 -6 460 -27z" /></g></svg> ); }


export default function DashboardPage() {
  const params = useParams();
  const companySlug = params.company as string;
  
  // States
  const [lang, setLang] = useState<"ru" | "en">("ru");
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
  
  const [diffData, setDiffData] = useState<any>(null);
  const [showDiffModal, setShowDiffModal] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang === "en" || savedLang === "ru") setLang(savedLang);
    fetchData();
  }, [companySlug]);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const [u, c, s, st, ds] = await Promise.all([
        apiRequest(`/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/competitors`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/signals`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/activity`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/distribution`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUser(u); setCompetitors(c || []); setSignals(s || []); setStats(st || []); setDist(ds || []);
      setIsLoading(false);
    } catch (e) { setIsLoading(false); }
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = "/auth/login"; };

  if (isLoading) return <div className="h-screen bg-[#060608] flex items-center justify-center text-white/10 font-mono text-[10px] tracking-[0.5em] uppercase">{T[lang].loading}</div>;

  const t = T[lang];

  return (
    <div className="flex h-screen bg-[#060608] text-white overflow-hidden antialiased font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/5 bg-[#08080a]">
        <div className="h-16 flex items-center px-6 gap-3"><SledixLogo size={32} /></div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavBtn active={page==="dashboard"} icon={Icons.dashboard} label={t.dashboard} onClick={() => {setPage("dashboard"); setSelectedComp(null);}} />
          <NavBtn active={page==="competitors"} icon={Icons.monitors} label={t.monitors} count={competitors.length} onClick={() => {setPage("competitors"); setSelectedComp(null);}} />
          <NavBtn active={page==="signals"} icon={Icons.signals} label={t.signals} count={signals.length} onClick={() => {setPage("signals"); setSelectedComp(null);}} />
          <NavBtn active={page==="settings"} icon={Icons.settings} label={t.settings} onClick={() => setPage("settings")} />
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-4">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">{user?.email?.[0].toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/50 truncate font-mono">{user?.email}</p>
              <button onClick={handleLogout} className="text-[9px] text-red-400/50 hover:text-red-400 uppercase tracking-tighter transition-colors">{t.logout}</button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 shrink-0 flex items-center justify-between px-10 border-b border-white/5 bg-[#060608]/50 backdrop-blur-xl z-10">
          <h1 className="text-xs font-mono uppercase tracking-[0.2em] text-white/80">{selectedComp ? selectedComp.name : t[page]}</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-500 uppercase tracking-widest">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> {t.online}
            </div>
            <button onClick={() => setShowModal(true)} className="px-5 py-2 bg-white text-black text-[10px] font-bold uppercase rounded-lg hover:bg-white/90 transition-all">{t.add_monitor}</button>
          </div>
        </header>

        <main className="flex-1 overflow-auto custom-scrollbar p-10">
          {!user?.is_email_verified && <VerificationBanner t={t} email={user?.email} />}
          
          {selectedComp ? (
            <CompetitorDetailsView t={t} comp={selectedComp} signals={signals.filter(s => s.company === selectedComp.name)} onBack={() => setSelectedComp(null)} />
          ) : (
            <>
              {page === "dashboard" && <DashboardView t={t} count={competitors.length} signals={signals} stats={stats} dist={dist} />}
              {page === "competitors" && <CompetitorsView t={t} competitors={competitors} signals={signals} onSelect={setSelectedComp} />}
              {page === "signals" && <SignalsView t={t} signals={signals} />}
              {page === "settings" && <SettingsView t={t} user={user} lang={lang} setLang={(l:any) => {setLang(l); localStorage.setItem("lang", l);}} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// --- КОМПОНЕНТЫ UI ---

function NavBtn({ active, icon, label, count, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] transition-all ${active ? "bg-white/5 text-white" : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]"}`}>
      {icon} <span className="flex-1 text-left">{label}</span>
      {count !== undefined && <span className="text-[10px] font-mono opacity-40">{count}</span>}
    </button>
  );
}

function StatCard({ label, value, t }: any) {
  return (
    <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01]">
      <span className="text-[10px] font-mono uppercase tracking-widest text-white/20">{label}</span>
      <div className="text-4xl font-light mt-3 text-white/90">{value}</div>
    </div>
  );
}

// --- ГРАФИК (МИНИМАЛИСТИЧНЫЙ) ---
function ActivityLine({ data }: { data: any[] }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => `${(i / (data.length-1)) * 1000},${300 - (d.value / max) * 260}`).join(" ");
  return (
    <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible">
      <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
    </svg>
  );
}

// --- VIEW: DASHBOARD ---
function DashboardView({ t, count, signals, stats }: any) {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-4 gap-6">
        <StatCard label={t.monitors} value={count} t={t} />
        <StatCard label={t.signals} value={signals.length} t={t} />
        <StatCard label={t.activity} value={stats.length > 0 ? stats[stats.length-1].value : 0} t={t} />
        <StatCard label={t.health} value="98%" t={t} />
      </div>
      
      <div className="p-10 rounded-[40px] border border-white/5 bg-white/[0.01]">
        <div className="h-[300px] w-full"><ActivityLine data={stats} /></div>
      </div>
    </div>
  );
}

// --- VIEW: COMPETITORS (GRID) ---
function CompetitorsView({ t, competitors, signals, onSelect }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
      {competitors.map((c: any) => {
        const lastSignal = signals.filter((s: any) => s.company === c.name).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        return (
          <div key={c.id} onClick={() => onSelect(c)} className="bg-[#060608] p-8 hover:bg-white/[0.02] transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-white/30">{c.name[0]}</div>
              <div className="text-right">
                <span className="block text-lg font-mono text-white/80">{getCompScore(c, signals)}%</span>
                <span className="text-[9px] font-mono text-white/20 uppercase">{t.index}</span>
              </div>
            </div>
            <h3 className="text-base font-medium text-white/90 mb-1">{c.name}</h3>
            <p className="text-[11px] font-mono text-white/20 mb-6 truncate">{c.website_url.replace(/https?:\/\//, '')}</p>
            <p className="text-[13px] text-white/40 leading-relaxed line-clamp-2 h-10">{lastSignal?.ai_analysis || t.idle}</p>
          </div>
        );
      })}
    </div>
  );
}

// --- VIEW: SETTINGS (WITH TRANSLATION) ---
function SettingsView({ t, user, lang, setLang }: any) {
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/auth/me", { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ email, password: showPass ? password : "" }) });
      setMsg(t.saved);
    } catch (e: any) { setMsg(`${t.error}: ${e.message}`); }
  };

  return (
    <div className="max-w-xl space-y-12 animate-in fade-in duration-700">
      <div className="space-y-6">
        <label className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">{t.lang}</label>
        <div className="flex gap-2">
          {["ru", "en"].map(l => (
            <button key={l} onClick={() => setLang(l)} className={`flex-1 py-4 rounded-2xl border font-mono text-xs uppercase transition-all ${lang === l ? "bg-white text-black border-white" : "border-white/10 text-white/40 hover:border-white/30"}`}>
              {l === "ru" ? "Русский" : "English"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8 p-10 rounded-[32px] border border-white/5 bg-white/[0.01]">
        <div className="space-y-3">
          <label className="text-[10px] font-mono text-white/20 uppercase ml-1">{t.email}</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-white/20 transition-all font-mono"/>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-mono text-white/20 uppercase ml-1">{t.password}</label>
          {showPass ? (
            <div className="space-y-4">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t.new_password} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-white/20 font-mono"/>
              <button onClick={() => setShowPass(false)} className="text-[10px] font-mono text-white/30 uppercase hover:text-white transition-colors">{t.cancel}</button>
            </div>
          ) : (
            <button onClick={() => setShowPass(true)} className="block w-full text-left px-6 py-4 rounded-2xl border border-white/5 text-[11px] font-mono text-white/30 hover:bg-white/[0.02] transition-all uppercase tracking-widest">{t.change_pass}</button>
          )}
        </div>

        {msg && <p className="text-[11px] font-mono text-emerald-400">{msg}</p>}
        
        <button onClick={handleSave} className="w-full py-5 bg-white text-black rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-white/90 transition-all">{t.save}</button>
      </div>
    </div>
  );
}

// --- VIEW: SIGNALS ---
function SignalsView({ t, signals }: any) {
  return (
    <div className="border border-white/5 rounded-[32px] overflow-hidden bg-white/[0.01]">
      <div className="divide-y divide-white/[0.03]">
        {signals.map((s: any) => (
          <div key={s.id} className="flex items-start gap-10 p-8 hover:bg-white/[0.01] transition-colors">
            <div className="w-32 shrink-0 font-mono text-[11px] text-white/60 truncate uppercase">{s.company}</div>
            <div className="flex-1 text-[13px] text-white/80 leading-relaxed font-light">{s.ai_analysis || s.msg}</div>
            <div className="w-24 shrink-0 text-right"><SignalBadge label={s.tag} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- ХЕЛПЕРЫ ДЛЯ КОМПОНЕНТОВ ---
function SignalBadge({ label }: { label: string }) {
  const style = TAG_STYLES[label] || { color: "#71717a", bg: "rgba(113, 113, 122, 0.1)" };
  return <span className="text-[9px] font-mono px-2 py-0.5 rounded border" style={{ color: style.color, backgroundColor: style.bg, borderColor: `${style.color}22` }}>{label}</span>;
}

function VerificationBanner({ t, email }: any) {
  return (
    <div className="mb-10 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-[11px] font-mono text-amber-500/80 uppercase tracking-widest">{t.verify_email}: {email}</span>
      </div>
      <button className="text-[10px] font-mono text-white/40 hover:text-white uppercase transition-colors">{t.resend}</button>
    </div>
  );
}

function CompetitorDetailsView({ t, comp, signals, onBack }: any) {
  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-500">
      <button onClick={onBack} className="text-[10px] font-mono text-white/30 hover:text-white uppercase tracking-widest">← {t.back}</button>
      <div className="grid grid-cols-3 gap-10">
        <div className="col-span-1 space-y-6">
          <div className="p-10 rounded-[40px] border border-white/5 bg-[#08080a]">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-2xl font-bold mb-8">{comp.name[0]}</div>
            <h2 className="text-2xl font-bold mb-1">{comp.name}</h2>
            <p className="text-xs font-mono text-white/20 mb-10">{comp.website_url}</p>
            <div className="space-y-6">
              <div><p className="text-[9px] font-mono text-white/20 uppercase mb-1">{t.region}</p><p className="text-sm font-mono text-white/60">{comp.city || "—"}</p></div>
              <div><p className="text-[9px] font-mono text-white/20 uppercase mb-1">INN</p><p className="text-sm font-mono text-white/60">{comp.inn || "—"}</p></div>
            </div>
          </div>
        </div>
        <div className="col-span-2 rounded-[40px] border border-white/5 bg-[#08080a] overflow-hidden">
          <div className="divide-y divide-white/[0.03]">
            {signals.map((s: any) => (
              <div key={s.id} className="p-8">
                <div className="flex justify-between mb-4">
                  <SignalBadge label={s.tag} />
                  <span className="text-[10px] font-mono text-white/10 uppercase tracking-widest">live</span>
                </div>
                <p className="text-[13px] text-white/70 leading-relaxed font-light">{s.ai_analysis || s.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const getCompScore = (comp: any, signals: any[]) => {
  let score = 55;
  const count = signals.filter(s => s.company === comp.name).length;
  score += count * 5;
  return Math.min(score, 99);
};