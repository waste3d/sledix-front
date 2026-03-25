"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import Link from "next/link";

// --- Иконки ---
const Icons = {
  dashboard:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>,
  competitors: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
  signals:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M1 8h2l2-5 3 10 2-7 2 4 1-2h2"/></svg>,
  battlecards: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="2" y="2" width="12" height="12" rx="2"/><path d="M5 6h6M5 9h4"/></svg>,
  settings:    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/></svg>,
};

function SledixLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <path d="M76 32 C76 20 64 14 52 18 C40 22 36 32 42 40 C48 48 68 50 74 60 C80 70 74 84 60 88 C46 92 36 84 36 74" stroke="currentColor" strokeWidth="8" strokeLinecap="square" fill="none" />
    </svg>
  );
}

// --- Вспомогательные компоненты ---
function NavItem({ icon, label, active, onClick, badge }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left ${active ? "bg-white/[0.08] text-white" : "text-white/35 hover:text-white/70 hover:bg-white/[0.04]"}`}>
      <span className="w-4 h-4 shrink-0">{icon}</span>
      <span className="font-light tracking-tight flex-1">{label}</span>
      {badge > 0 && <span className="text-[9px] bg-amber-500/20 text-amber-400 font-mono px-1.5 py-0.5 rounded">{badge}</span>}
    </button>
  );
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-white/[0.03] rounded-2xl ${className}`} />;
}

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const companySlug = params.company as string;

  // 1. Мгновенная проверка авторизации (до рендера)
  if (typeof window !== "undefined" && !localStorage.getItem("access_token")) {
    window.location.href = "/auth/login";
    return null;
  }

  const [page, setPage] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [tenantData, setTenantData] = useState<any>(null);

  // 2. Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const [dashRes, userRes] = await Promise.all([
          apiRequest(`/api/dashboard/${companySlug}`, { headers: { Authorization: `Bearer ${token}` } }),
          apiRequest(`/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setTenantData(dashRes);
        setUser(userRes);
        setTimeout(() => setIsLoading(false), 400);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    if (companySlug) fetchData();
  }, [companySlug]);

  const handleLogout = async () => {
    localStorage.removeItem("access_token");
    try { await apiRequest("/api/auth/logout", { method: "POST" }); } catch {}
    window.location.href = "/auth/login";
  };

  if (error) return (
    <div className="h-screen bg-[#060608] flex flex-col items-center justify-center text-white p-6 text-center">
      <div className="border border-red-500/20 bg-red-500/5 p-8 rounded-3xl backdrop-blur-xl max-w-sm">
        <p className="text-red-400 font-mono text-xs uppercase tracking-widest mb-4">Error: {error}</p>
        <button onClick={() => window.location.reload()} className="w-full bg-white text-black py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-widest">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#060608] text-white overflow-hidden font-sans antialiased">
      
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-white/[0.06]">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-white/[0.06]">
          <SledixLogo />
          <span className="font-display font-bold text-sm tracking-tight">Sledix</span>
        </div>
        
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[9px] font-bold uppercase">
              {companySlug ? companySlug[0] : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-white truncate">{companySlug}</p>
              <p className="text-[9px] text-white/25 font-mono uppercase">{user?.plan || "..."} plan</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5">
          <NavItem icon={Icons.dashboard}   label="Dashboard"    active={page==="dashboard"}   onClick={() => setPage("dashboard")}/>
          <NavItem icon={Icons.competitors} label="Competitors"  active={page==="competitors"} onClick={() => setPage("competitors")}/>
          <NavItem icon={Icons.signals}     label="Signals"      active={page==="signals"}     onClick={() => setPage("signals")} badge={0}/>
          <NavItem icon={Icons.battlecards} label="Battle cards" active={page==="battlecards"} onClick={() => setPage("battlecards")}/>
        </nav>

        <div className="px-3 pb-4 border-t border-white/[0.06] pt-3 space-y-0.5">
          <NavItem icon={Icons.settings} label="Settings" active={page==="settings"} onClick={() => setPage("settings")}/>
          <div className="flex items-center gap-2.5 px-3 py-3 mt-2 bg-white/[0.02] rounded-xl border border-white/[0.04]">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50">
                {user?.email ? user.email[0].toUpperCase() : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/60 truncate">{user?.email || "Loading..."}</p>
              <button onClick={handleLogout} className="text-[9px] font-mono uppercase text-white/20 hover:text-red-400 transition-colors">Sign out</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-white/[0.06]">
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight capitalize">{page}</h1>
            <p className="text-[10px] text-white/25 font-mono">{companySlug}.sledix.tech</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/25">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>Live
            </div>
            <button className="text-[11px] tracking-[0.15em] uppercase bg-white text-[#060608] px-4 py-2 rounded-lg font-bold hover:bg-white/90 transition-colors font-mono">
              + Add competitor
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
              <Skeleton className="h-64 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-40 w-full" /><Skeleton className="h-40 w-full" />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 h-full">
              {page === "dashboard" && <DashboardView company={companySlug} />}
              {page === "settings" && <SettingsView user={user} company={companySlug} />}
              {/* Остальные вкладки */}
              {page !== "dashboard" && page !== "settings" && (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[32px]">
                   <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.3em]">Module {page} is being deployed</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Под-страница: Dashboard ---
function DashboardView({ company }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Competitors", value: "0" },
          { label: "Active Signals", value: "0" },
          { label: "AI Insights", value: "0" },
          { label: "System Status", value: "Optimal" },
        ].map((s, i) => (
          <div key={i} className="border border-white/[0.07] rounded-2xl p-5 bg-white/[0.02] hover:border-white/10 transition-colors">
            <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-white/25 mb-3">{s.label}</p>
            <p className="font-display text-3xl font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="border-2 border-dashed border-white/5 rounded-[32px] p-20 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mb-6 border border-white/5">
          <span className="text-2xl animate-bounce">⚡️</span>
        </div>
        <h2 className="font-display text-xl font-bold mb-2 text-white/80 tracking-tight">Your workspace is ready.</h2>
        <p className="text-white/20 text-xs font-mono max-w-xs mb-8 leading-relaxed">
          Sledix is autonomous. Add your first competitor to start monitoring signals and building intelligence.
        </p>
        <button className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-white/90 transition-all">
          Deploy Monitor
        </button>
      </div>
    </div>
  );
}

// --- Под-страница: Settings ---
function SettingsView({ user, company }: any) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30">Profile Settings</p>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">Email Address</p>
            <div className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/50 font-mono">
              {user?.email}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">Workspace Slug</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white/50 font-mono italic">
                {company}
              </div>
              <span className="text-white/10 font-mono text-xs">.sledix.tech</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30">Plan & Usage</p>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80 font-medium capitalize">{user?.plan || "Free"} Plan</p>
            <p className="text-[11px] text-white/25 font-light mt-1">Unlimited signals, 3 competitors included.</p>
          </div>
          <button className="px-5 py-2.5 border border-white/10 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}