"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "../../../lib/api";

// --- Стили и Иконки из старого дизайна ---

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

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-white/[0.03] rounded-xl ${className}`} />
);

// --- Вспомогательные компоненты ---

function NavItem({ icon, label, active, onClick, badge }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-left ${active ? "bg-white/[0.08] text-white" : "text-white/35 hover:text-white/70 hover:bg-white/[0.04]"}`}>
      <span className="w-4 h-4 shrink-0">{icon}</span>
      <span className="font-light tracking-tight flex-1">{label}</span>
      {badge && <span className="text-[9px] bg-amber-500/20 text-amber-400 font-mono px-1.5 py-0.5 rounded">{badge}</span>}
    </button>
  );
}

// --- Основная страница ---

export default function Dashboard() {
  const params = useParams();
  const router = useRouter();
  const companySlug = params.company as string;

  const [page, setPage] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantData, setTenantData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) { router.push("/auth/login"); return; }

      try {
        const res = await apiRequest(`/api/dashboard/${companySlug}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTenantData(res);
        setTimeout(() => setIsLoading(false), 500); // Плавный переход
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    if (companySlug) fetchData();
  }, [companySlug, router]);

  if (error) return (
    <div className="h-screen bg-[#060608] flex items-center justify-center text-red-400 font-mono text-xs">
      {error} — <button onClick={() => window.location.reload()} className="ml-2 underline">Retry</button>
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
              <p className="text-[9px] text-white/25 font-mono uppercase">Growth plan</p>
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
          <button 
            onClick={() => { localStorage.clear(); router.push('/auth/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-mono uppercase text-white/20 hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
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
            /* --- Seamless Loading (Skeletons) --- */
            <div className="space-y-6">
              <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="col-span-2 h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            /* --- Real Empty Content --- */
            <div className="space-y-6 animate-in fade-in duration-700">
              
              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Competitors", value: "0" },
                  { label: "Signals / Week", value: "0" },
                  { label: "High Priority", value: "0" },
                  { label: "AI Analyzed", value: "100%" },
                ].map((s, i) => (
                  <div key={i} className="border border-white/[0.07] rounded-2xl p-5 bg-white/[0.02]">
                    <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-white/25 mb-3">{s.label}</p>
                    <p className="font-display text-3xl font-bold tracking-tight">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Main Section: Empty State */}
              <div className="border-2 border-dashed border-white/5 rounded-[32px] p-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white/[0.03] rounded-full flex items-center justify-center mb-6 border border-white/5">
                  <span className="text-2xl">⚡️</span>
                </div>
                <h2 className="font-display text-xl font-bold mb-2">Welcome to {companySlug}</h2>
                <p className="text-white/30 text-xs font-light max-w-xs mx-auto mb-8 font-mono">
                  Your workspace is clean. Add a competitor to start receiving signals.
                </p>
                <button className="px-6 py-3 border border-white/10 rounded-xl text-[10px] font-mono uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all">
                  Add first competitor
                </button>
              </div>

              {/* Bottom Row: Placeholders */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] p-5">
                   <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30 mb-4">Activity Timeline</p>
                   <div className="h-32 flex items-center justify-center text-white/10 text-[10px] font-mono uppercase tracking-widest">No data available</div>
                </div>
                <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] p-5">
                   <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30 mb-4">Signal distribution</p>
                   <div className="h-32 flex items-center justify-center text-white/10 text-[10px] font-mono uppercase tracking-widest">No data available</div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>

    </div>
  );
}