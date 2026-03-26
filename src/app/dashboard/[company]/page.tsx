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

// --- Вспомогательные компоненты UI ---
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

// --- ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ ---
export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const companySlug = params.company as string;

  // 1. Мгновенная блокировка неавторизованных (до рендера)
  if (typeof window !== "undefined" && !localStorage.getItem("access_token")) {
    window.location.href = "/auth/login";
    return null;
  }

  // --- Состояние ---
  const [page, setPage] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  
  // Состояние модалки
  const [showModal, setShowModal] = useState(false);
  const [newCompName, setNewCompName] = useState("");
  const [newCompUrl, setNewCompUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // --- Загрузка данных (Профиль + Конкуренты) ---
  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const [userRes, compRes] = await Promise.all([
        apiRequest(`/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/competitors`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUser(userRes);
      setCompetitors(compRes || []);
      setIsLoading(false);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (companySlug) fetchData();
  }, [companySlug]);

  // --- Действия ---
  const handleLogout = async () => {
    localStorage.removeItem("access_token");
    try { await apiRequest("/api/auth/logout", { method: "POST" }); } catch {}
    window.location.href = "/auth/login";
  };

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    const token = localStorage.getItem("access_token");
    try {
      await apiRequest("/api/competitors", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCompName, website_url: newCompUrl })
      });
      setNewCompName("");
      setNewCompUrl("");
      setShowModal(false);
      fetchData(); // Обновляем список
    } catch (err: any) {
      alert("Error adding competitor: " + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  if (error) return (
    <div className="h-screen bg-[#060608] flex flex-col items-center justify-center text-white p-6 text-center font-sans">
      <div className="border border-red-500/20 bg-red-500/5 p-8 rounded-3xl backdrop-blur-xl max-w-sm">
        <p className="text-red-400 font-mono text-xs uppercase tracking-widest mb-4">Critical Error: {error}</p>
        <button onClick={() => window.location.reload()} className="w-full bg-white text-black py-3 rounded-xl font-mono text-xs font-bold uppercase tracking-widest">Retry Connection</button>
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

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavItem icon={Icons.dashboard}   label="Dashboard"    active={page==="dashboard"}   onClick={() => setPage("dashboard")}/>
          <NavItem icon={Icons.competitors} label="Competitors"  active={page==="competitors"} onClick={() => setPage("competitors")} badge={competitors.length}/>
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
            <button onClick={() => setShowModal(true)} className="text-[11px] tracking-[0.15em] uppercase bg-white text-[#060608] px-4 py-2 rounded-lg font-bold hover:bg-white/90 transition-colors font-mono">
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
              {page === "dashboard" && <DashboardView count={competitors.length} onAdd={() => setShowModal(true)} />}
              {page === "competitors" && <CompetitorsView competitors={competitors} />}
              {page === "settings" && <SettingsView user={user} company={companySlug} />}
              
              {/* Placeholders for Signals & Battlecards */}
              {(page === "signals" || page === "battlecards") && (
                <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-[32px]">
                   <p className="text-white/20 font-mono text-[10px] uppercase tracking-[0.3em]">Module {page} is being deployed</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL: Add Competitor --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f1012] border border-white/10 rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-display text-xl font-bold mb-2">Add Competitor</h3>
            <p className="text-white/30 text-xs mb-6 font-mono uppercase tracking-widest">Autonomous monitoring start</p>
            
            <form onSubmit={handleAddCompetitor} className="space-y-4">
              <div>
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-2">Company Name</p>
                <input required value={newCompName} onChange={e => setNewCompName(e.target.value)} placeholder="e.g. Crayon" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all font-mono"/>
              </div>
              <div>
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-2">Website URL</p>
                <input required value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="e.g. https://crayon.co" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all font-mono"/>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-white/10 py-3 rounded-xl text-[10px] font-mono font-bold uppercase text-white/40 hover:text-white transition-all">Cancel</button>
                <button type="submit" disabled={isAdding} className="flex-1 bg-white text-black py-3 rounded-xl text-[10px] font-mono font-bold uppercase hover:bg-white/90 disabled:opacity-50 transition-all">
                  {isAdding ? "Deploying..." : "Add Monitor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-VIEW: Dashboard ---
function DashboardView({ count, onAdd }: any) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Competitors", value: count },
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
          <span className="text-2xl">⚡️</span>
        </div>
        <h2 className="font-display text-xl font-bold mb-2 text-white/80 tracking-tight">Your workspace is active.</h2>
        <p className="text-white/20 text-xs font-mono max-w-xs mb-8 leading-relaxed">
          {count > 0 ? "Monitoring is in progress. Intelligence will appear as signals are detected." : "Start by adding your first competitor to enable real-time tracking."}
        </p>
        <button onClick={onAdd} className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-white/90 transition-all">
          {count > 0 ? "Add Another" : "Add First Competitor"}
        </button>
      </div>
    </div>
  );
}

// --- SUB-VIEW: Competitors List ---
function CompetitorsView({ competitors }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {competitors.length === 0 ? (
        <div className="col-span-full border-2 border-dashed border-white/5 rounded-[32px] p-20 text-center text-white/20 font-mono text-[10px] uppercase tracking-[0.3em]">
           No monitors deployed yet.
        </div>
      ) : (
        competitors.map((c: any) => (
          <div key={c.id} className="border border-white/[0.07] rounded-2xl p-5 bg-white/[0.02] hover:border-white/15 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-lg font-bold text-white/20 group-hover:text-white/40 transition-colors">
                {c.name[0]}
              </div>
              <div>
                <h4 className="font-display font-bold text-sm">{c.name}</h4>
                <p className="text-[10px] text-white/30 font-mono truncate max-w-[150px]">{c.website_url}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-[9px] font-mono uppercase text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Active</span>
              <button className="text-[9px] font-mono uppercase text-white/20 hover:text-white transition-colors">Explore Intelligence →</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// --- SUB-VIEW: Settings ---
function SettingsView({ user, company }: any) {
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/auth/me", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email, password })
      });
      setMessage("Success: Settings updated.");
      setPassword("");
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30">Profile Settings</p>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">Email Address</p>
            <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20 transition-all font-mono"/>
          </div>
          <div>
            <p className="text-[10px] font-mono text-white/25 uppercase tracking-widest mb-2">New Password (optional)</p>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/20 transition-all font-mono"/>
          </div>
          
          {message && <p className={`text-[10px] font-mono uppercase ${message.startsWith('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p>}

          <button onClick={handleSave} disabled={isSaving} className="w-full bg-white text-black py-4 rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white/90 disabled:opacity-50 transition-all">
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/30">Subscription & Plan</p>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80 font-medium capitalize">{user?.plan || "Free"} Plan</p>
            <p className="text-[11px] text-white/25 font-light mt-1">Growth ready. Track up to 3 competitors simultaneously.</p>
          </div>
          <button className="px-5 py-2.5 border border-white/10 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-all">Upgrade</button>
        </div>
      </div>
    </div>
  );
}