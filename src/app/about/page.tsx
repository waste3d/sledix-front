"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "../../lib/api";
import ReactDiffViewer from "react-diff-viewer-continued";

const DADATA_KEY = "4affb62ba89180ef3405454f9a047fa680d957ed";

// --- ЛОКАЛИЗАЦИЯ ---
const T: Record<string, any> = {
  ru: {
    dashboard: "Обзор",
    monitors: "Мониторы",
    settings: "Настройки",
    logout: "Выйти",
    add: "+ Объект",
    online: "Система активна",
    loading: "Загрузка...",
    metrics: {
      count: "Мониторы",
      signals: "События",
      uptime: "Аптайм",
      health: "Здоровье"
    },
    settings_page: {
      lang: "Язык интерфейса",
      email: "Почта",
      password: "Безопасность",
      change_btn: "Изменить пароль",
      save: "Сохранить изменения",
      cancel: "Отмена",
      success: "Обновлено"
    },
    card: {
      index: "Индекс влияния",
      status: "Статус",
      live: "В эфире",
      idle: "Нет данных"
    },
    verify: "Подтвердите email",
    resend: "Отправить повторно"
  },
  en: {
    dashboard: "Overview",
    monitors: "Monitors",
    settings: "Settings",
    logout: "Sign Out",
    add: "+ Add Monitor",
    online: "System Live",
    loading: "Loading...",
    metrics: {
      count: "Monitors",
      signals: "Signals",
      uptime: "Uptime",
      health: "Health"
    },
    settings_page: {
      lang: "Language",
      email: "Email Address",
      password: "Security",
      change_btn: "Change Password",
      save: "Save Settings",
      cancel: "Cancel",
      success: "Updated"
    },
    card: {
      index: "Impact Index",
      status: "Status",
      live: "Live",
      idle: "Idle"
    },
    verify: "Verify Email",
    resend: "Resend Link"
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

function SledixLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 676 584" fill="white">
      <g transform="translate(0, 584) scale(0.1, -0.1)">
        <path d="M 2970 5165 c161 -51 273 -146 343 -292 l42 -88 0 -120 c-1 -107 -4 -127 -27 -182 -54 -128 -110 -190 -259 -289 -115 -77 -185 -148 -231 -235 l-33 -64 0 -160 c0 -156 1 -162 29 -218 41 -84 129 -173 248 -251 116 -76 184 -148 228 -241 51 -108 62 -214 35 -319 -50 -190 -200 -341 -385 -387 -83 -21 -496 -17 -613 5 -505 97 -919 440 -1102 914 -19 51 -47 141 -62 200 -23 94 -26 128 -26 277 0 94 5 206 12 250 86 559 531 1047 1081 1184 132 33 218 40 450 37 171 -3 226 -7 270 -21z m2597 11 c4 -4 -217 -230 -492 -502 l-500 -493 -370 0 c-413 -1 -466 5 -562 60 -75 43 -161 131 -200 204 -56 107 -67 265 -26 390 39 120 148 242 272 303 l75 37 170 6 c264 9 1623 5 1633 -5z m-1137 -1889 c186 -44 350 -117 520 -230 95 -64 300 -269 368 -369 107 -158 188 -353 229 -553 25 -125 25 -416 -1 -533 -72 -337 -260 -635 -533 -849 -202 -158 -452 -261 -710 -293 -109 -14 -421 -14 -493 0 -190 35 -376 216 -410 399 -31 165 23 351 132 460 27 27 88 75 134 107 197 133 284 277 284 467 0 185 -77 299 -312 464 -121 86 -149 114 -191 198 -43 86 -61 163 -61 260 0 78 4 99 31 162 61 143 135 223 273 293 94 48 109 50 380 46 228 -4 266 -7 360 -29z m-1425 -1858 c184 -81 300 -212 341 -385 27 -118 1 -241 -78 -362 -52 -80 -122 -142 -218 -191 l-75 -39 -932 -4 c-830 -3 -930 -2 -923 12 9 17 558 561 835 828 l180 174 410 -6 c395 -5 412 -6 460 -27z" />
      </g>
    </svg>
  );
}

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export default function DashboardPage() {
  const params = useParams();
  const companySlug = params.company as string;
  
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

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "en" || saved === "ru") setLang(saved);
    fetchData();
  }, [companySlug]);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) { window.location.href = "/auth/login"; return; }
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

  const t = T[lang];

  if (isLoading) return <div className="h-screen bg-[#060608] flex items-center justify-center text-white/10 font-mono text-[10px] tracking-[0.5em] uppercase">{t.loading}</div>;

  return (
    <div className="flex h-screen bg-[#060608] text-white overflow-hidden font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-white/5 bg-[#08080a]">
        <div className="h-16 flex items-center px-6 gap-3"><SledixLogo size={32} /></div>
        
        <nav className="flex-1 px-4 py-6 space-y-1">
          <NavItem active={page==="dashboard"} label={t.dashboard} onClick={() => {setPage("dashboard"); setSelectedComp(null);}} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>} />
          <NavItem active={page==="monitors"} label={t.monitors} onClick={() => {setPage("monitors"); setSelectedComp(null);}} count={competitors.length} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} />
          <NavItem active={page==="settings"} label={t.settings} onClick={() => setPage("settings")} icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>} />
        </nav>

        <div className="mt-auto p-4 border-t border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-[10px] text-white/30">{user?.email?.[0].toUpperCase()}</div>
          <div className="flex-1 truncate">
            <p className="text-[11px] text-white/50 truncate font-mono">{user?.email}</p>
            <button onClick={() => {localStorage.clear(); window.location.href="/auth/login"}} className="text-[9px] text-red-400/40 uppercase hover:text-red-400 transition-colors font-mono">{t.logout}</button>
          </div>
        </div>
      </aside>

      {/* HEADER + CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-10 border-b border-white/5 bg-[#060608]/50 backdrop-blur-xl z-10">
          <h1 className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/80">{selectedComp ? selectedComp.name : t[page]}</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-500 uppercase tracking-widest"><div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> {t.online}</div>
            <button onClick={() => setShowModal(true)} className="px-5 py-2 bg-white text-black text-[10px] font-bold uppercase rounded-lg hover:bg-white/90 transition-all">{t.add}</button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-10 custom-scrollbar">
          {!user?.is_email_verified && <VerificationBanner t={t} email={user?.email} />}
          
          {selectedComp ? (
            <CompetitorDetailsView t={t} comp={selectedComp} signals={signals.filter(s => s.company === selectedComp.name)} onBack={() => setSelectedComp(null)} />
          ) : (
            <>
              {page === "dashboard" && <DashboardView t={t} count={competitors.length} signals={signals} stats={stats} />}
              {page === "monitors" && <MonitorsGrid t={t} competitors={competitors} signals={signals} onSelect={setSelectedComp} />}
              {page === "settings" && <SettingsView t={t} user={user} lang={lang} setLang={(l: any) => {setLang(l); localStorage.setItem("lang", l);}} />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// --- VIEWS ---

function DashboardView({ t, count, signals, stats }: any) {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="grid grid-cols-4 gap-6">
        <StatCard label={t.metrics.count} value={count} />
        <StatCard label={t.metrics.signals} value={signals.length} />
        <StatCard label={t.metrics.uptime} value="99.9%" />
        <StatCard label={t.metrics.health} value="Good" />
      </div>
      <div className="p-10 rounded-[40px] border border-white/5 bg-[#08080a] h-[350px]">
        <ActivityLine data={stats} />
      </div>
    </div>
  );
}

// --- ТА САМАЯ СЕТКА МОНИТОРОВ ---
function MonitorsGrid({ t, competitors, signals, onSelect }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5 border border-white/5 rounded-[32px] overflow-hidden animate-in fade-in duration-700">
      {competitors.map((c: any) => {
        const score = 55 + (signals.filter((s: any) => s.company === c.name).length * 5);
        const lastSignal = signals.filter((s: any) => s.company === c.name).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        
        return (
          <div key={c.id} onClick={() => onSelect(c)} className="bg-[#060608] p-10 hover:bg-white/[0.02] transition-colors cursor-pointer group flex flex-col justify-between h-[280px]">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-bold text-white/30 text-xl">{c.name[0]}</div>
                <div>
                  <h3 className="text-lg font-medium text-white/90">{c.name}</h3>
                  <p className="text-[11px] font-mono text-white/20 uppercase tracking-widest">{c.website_url.replace(/https?:\/\//, '')}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-2xl font-mono text-white/80 font-light">{Math.min(score, 99)}%</span>
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">{t.card.index}</span>
              </div>
            </div>

            <div className="my-6">
              <p className="text-[13px] text-white/40 leading-relaxed line-clamp-2 h-10 font-light italic">
                {lastSignal?.ai_analysis || lastSignal?.msg || t.card.idle}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-6">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-white/20 uppercase">{c.city || "Global"}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 animate-pulse" />
                  <span className="text-[9px] font-mono text-emerald-500/50 uppercase">{t.card.live}</span>
                </div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- SETTINGS (ЛОКАЛИЗАЦИЯ + ПРОФИЛЬ) ---
function SettingsView({ t, user, lang, setLang }: any) {
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/auth/me", { 
        method: "PATCH", 
        headers: { Authorization: `Bearer ${token}` }, 
        body: JSON.stringify({ email, password: showPass ? password : "" }) 
      });
      setMessage(t.settings_page.success);
      setShowPass(false);
    } catch (e: any) { setMessage(e.message); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="max-w-2xl space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Language Switch */}
      <div className="space-y-4">
        <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">{t.settings_page.lang}</label>
        <div className="flex gap-2">
          {["ru", "en"].map(l => (
            <button key={l} onClick={() => setLang(l)} className={`flex-1 py-4 rounded-2xl border font-mono text-[11px] uppercase transition-all ${lang === l ? "bg-white text-black border-white" : "border-white/10 text-white/30 hover:border-white/20"}`}>
              {l === "ru" ? "Русский" : "English"}
            </button>
          ))}
        </div>
      </div>

      {/* Account Info */}
      <div className="p-10 rounded-[40px] border border-white/5 bg-[#08080a] space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-mono text-white/20 uppercase ml-1">{t.settings_page.email}</label>
          <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono text-white outline-none focus:border-white/30 transition-all"/>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-mono text-white/20 uppercase ml-1">{t.settings_page.password}</label>
          {showPass ? (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t.settings_page.password} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono text-white outline-none focus:border-white/30"/>
              <button onClick={() => setShowPass(false)} className="text-[10px] font-mono text-white/30 uppercase hover:text-white">{t.settings_page.cancel}</button>
            </div>
          ) : (
            <button onClick={() => setShowPass(true)} className="block w-full text-left px-6 py-4 border border-white/5 rounded-2xl text-[10px] font-mono text-white/20 uppercase tracking-widest hover:bg-white/[0.02]">{t.settings_page.change_btn}</button>
          )}
        </div>

        {message && <p className="text-[11px] font-mono text-emerald-500">{message}</p>}
        
        <button onClick={handleSave} disabled={isSaving} className="w-full py-5 bg-white text-black rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-white/90 transition-all disabled:opacity-50">
          {isSaving ? "..." : t.settings_page.save}
        </button>
      </div>
    </div>
  );
}

// --- МИНИ-КОМПОНЕНТЫ ---

function NavItem({ active, label, onClick, icon, count }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] transition-all ${active ? "bg-white/5 text-white" : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]"}`}>
      {icon} <span className="flex-1 text-left">{label}</span>
      {count !== undefined && <span className="text-[10px] font-mono opacity-30">{count}</span>}
    </button>
  );
}

function StatCard({ label, value }: any) {
  return (
    <div className="p-8 rounded-3xl border border-white/5 bg-white/[0.01]">
      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/20">{label}</span>
      <div className="text-3xl font-light mt-3 text-white/90 tracking-tighter">{value}</div>
    </div>
  );
}

function ActivityLine({ data }: { data: any[] }) {
  if (!data || data.length < 2) return <div className="h-full w-full flex items-center justify-center font-mono text-[10px] text-white/5 uppercase tracking-widest">Stream incoming...</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const points = data.map((d, i) => `${(i / (data.length - 1)) * 1000},${300 - (d.value / max) * 240}`).join(" ");
  return (
    <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible">
      <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]" />
    </svg>
  );
}

function VerificationBanner({ t, email }: any) {
  return (
    <div className="mb-10 p-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-[11px] font-mono text-amber-500/80 uppercase tracking-widest">{t.verify}: {email}</span>
      </div>
      <button className="text-[10px] font-mono text-white/40 hover:text-white uppercase border-b border-white/10">{t.resend}</button>
    </div>
  );
}

function CompetitorDetailsView({ t, comp, signals, onBack }: any) {
  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
      <button onClick={onBack} className="text-[10px] font-mono text-white/30 hover:text-white uppercase tracking-widest">← {t.dashboard}</button>
      <div className="grid grid-cols-3 gap-10">
        <div className="col-span-1 p-10 rounded-[40px] border border-white/5 bg-[#08080a]">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-2xl font-bold mb-10">{comp.name[0]}</div>
          <h2 className="text-3xl font-bold mb-2">{comp.name}</h2>
          <p className="text-sm font-mono text-white/20 mb-10 pb-10 border-b border-white/5">{comp.website_url}</p>
          <div className="space-y-6">
            <div><p className="text-[10px] font-mono text-white/10 uppercase mb-1">INN</p><p className="text-sm font-mono text-white/50">{comp.inn || "—"}</p></div>
            <div><p className="text-[10px] font-mono text-white/10 uppercase mb-1">CITY</p><p className="text-sm font-mono text-white/50">{comp.city || "—"}</p></div>
          </div>
        </div>
        <div className="col-span-2 rounded-[40px] border border-white/5 bg-[#08080a] overflow-hidden">
          <div className="divide-y divide-white/[0.03]">
            {signals.map((s: any) => (
              <div key={s.id} className="p-10">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded border border-white/10 text-white/40 uppercase">{s.tag}</span>
                  <span className="text-[10px] font-mono text-white/10 uppercase tracking-widest">Captured</span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed font-light">{s.ai_analysis || s.msg}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}