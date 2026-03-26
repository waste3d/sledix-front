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

  if (typeof window !== "undefined" && !localStorage.getItem("access_token")) {
    window.location.href = "/auth/login";
    return null;
  }

  const [page, setPage] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  
  // Состояние модалки
  const [showModal, setShowModal] = useState(false);
  const [newCompName, setNewCompName] = useState("");
  const [newCompUrl, setNewCompUrl] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  
  const [businessSuggestions, setBusinessSuggestions] = useState<any[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // --- ПОИСК КОМПАНИЙ / БИЗНЕСОВ (OSM) ---
  const searchBusiness = async (query: string) => {
    setNewCompName(query);
    if (query.length < 2) { setBusinessSuggestions([]); return; }
    try {
      // Ищем объекты (POI) с учетом кириллицы
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=ru`);
      const data = await res.json();
      setBusinessSuggestions(data.features || []);
    } catch (e) { console.error(e); }
  };

  // --- ПОИСК ЛОКАЦИЙ ---
  const searchLocation = async (query: string) => {
    setCity(query);
    if (query.length < 2) { setCitySuggestions([]); return; }
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=ru&type=city`);
      const data = await res.json();
      setCitySuggestions(data.features || []);
    } catch (e) { console.error(e); }
  };

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
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => { if (companySlug) fetchData(); }, [companySlug]);

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
        body: JSON.stringify({ 
            name: newCompName, 
            website_url: newCompUrl,
            city: city,
            country: country
        })
      });
      setNewCompName(""); setNewCompUrl(""); setCity(""); setCountry("");
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  if (error) return <div className="h-screen bg-[#060608] text-white flex items-center justify-center p-6 uppercase font-mono text-xs">{error}</div>;

  return (
    <div className="flex h-screen bg-[#060608] text-white overflow-hidden font-sans antialiased">
      
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-white/[0.06]">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-white/[0.06]">
          <SledixLogo /><span className="font-display font-bold text-sm tracking-tight">Sledix</span>
        </div>
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[9px] font-bold uppercase">{companySlug[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-white truncate">{companySlug}</p>
              <p className="text-[9px] text-white/25 font-mono uppercase">{user?.plan || "..."}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavItem icon={Icons.dashboard}   label="Dashboard"    active={page==="dashboard"}   onClick={() => setPage("dashboard")}/>
          <NavItem icon={Icons.competitors} label="Competitors"  active={page==="competitors"} onClick={() => setPage("competitors")} badge={competitors.length}/>
          <NavItem icon={Icons.settings}    label="Settings"     active={page==="settings"}    onClick={() => setPage("settings")}/>
        </nav>
        <div className="p-4 border-t border-white/[0.06]">
            <p className="text-[10px] text-white/40 truncate mb-1">{user?.email}</p>
            <button onClick={handleLogout} className="text-[9px] text-red-400/50 hover:text-red-400 uppercase font-mono transition-colors">Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-white/[0.06]">
          <h1 className="font-display text-lg font-bold tracking-tight capitalize">{page}</h1>
          <button onClick={() => setShowModal(true)} className="text-[11px] tracking-[0.15em] uppercase bg-white text-[#060608] px-4 py-2 rounded-lg font-bold hover:bg-white/90 transition-colors font-mono">+ Add competitor</button>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="space-y-6"><Skeleton className="h-24 w-full"/><Skeleton className="h-64 w-full"/></div>
          ) : (
            <div className="animate-in fade-in duration-500 h-full">
              {page === "dashboard" && <DashboardView count={competitors.length} onAdd={() => setShowModal(true)} />}
              {page === "competitors" && <CompetitorsView competitors={competitors} />}
              {page === "settings" && <SettingsView user={user} company={companySlug} />}
            </div>
          )}
        </div>
      </div>

      {/* --- МОДАЛКА С УЛУЧШЕННЫМ ПОИСКОМ --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f1012] border border-white/10 rounded-[32px] p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="font-display text-xl font-bold mb-1 text-white">Deploy Intelligence</h3>
            <p className="text-white/20 text-[10px] mb-6 font-mono uppercase tracking-[0.2em]">Start autonomous monitoring</p>
            
            <form onSubmit={handleAddCompetitor} className="space-y-5">
              
              {/* Поиск Компании / Бизнеса */}
              <div className="relative">
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2">Company / Business Name</p>
                <input required value={newCompName} onChange={e => searchBusiness(e.target.value)} placeholder="БУКЕТ-СБ, Apple, и т.д." className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all font-mono"/>
                
                {businessSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#16171a] border border-white/10 rounded-xl overflow-hidden z-[70] shadow-2xl">
                    {businessSuggestions.slice(0, 5).map((s, i) => (
                      <button key={i} type="button" onClick={() => { 
                          setNewCompName(s.properties.name || s.properties.city); 
                          setBusinessSuggestions([]); 
                        }} className="w-full flex flex-col gap-0.5 px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-left">
                        <span className="text-xs text-white font-medium">{s.properties.name}</span>
                        <span className="text-[9px] text-white/20 font-mono uppercase">{s.properties.country} {s.properties.city ? `· ${s.properties.city}` : ''}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Website URL */}
              <div>
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2">Website URL</p>
                <input required value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="https://company.com" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all font-mono"/>
              </div>

              {/* Поиск города */}
              <div className="relative">
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2">Target Location</p>
                <input required value={city} onChange={e => searchLocation(e.target.value)} placeholder="Сосновый Бор, Moscow..." className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all font-mono"/>
                
                {citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#16171a] border border-white/10 rounded-xl overflow-hidden z-[60] shadow-2xl">
                    {citySuggestions.slice(0, 5).map((feat: any, i: number) => (
                      <button key={i} type="button" onClick={() => { 
                          setCity(feat.properties.name); 
                          setCountry(feat.properties.country); 
                          setCitySuggestions([]); 
                        }} className="w-full text-left px-4 py-3 hover:bg-white/5 text-xs border-b border-white/5 last:border-0">
                        <span className="text-white">{feat.properties.name}</span>
                        <span className="text-white/20 ml-2">{feat.properties.country}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-white/10 py-3 rounded-xl text-[10px] font-mono font-bold uppercase text-white/40 hover:text-white transition-all">Cancel</button>
                <button type="submit" disabled={isAdding} className="flex-1 bg-white text-black py-3 rounded-xl text-[10px] font-mono font-bold uppercase hover:bg-white/90 disabled:opacity-50 transition-all">{isAdding ? "Deploying..." : "Add Monitor"}</button>
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
        {[{ label: "Competitors", value: count }, { label: "Active Signals", value: "0" }, { label: "AI Insights", value: "0" }, { label: "System Status", value: "Optimal" }].map((s, i) => (
          <div key={i} className="border border-white/[0.07] rounded-2xl p-5 bg-white/[0.02]">
            <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-white/25 mb-3">{s.label}</p>
            <p className="font-display text-3xl font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="border-2 border-dashed border-white/5 rounded-[32px] p-20 flex flex-col items-center justify-center text-center">
        <h2 className="font-display text-xl font-bold mb-2 text-white/80 tracking-tight">Autonomous Mode Active</h2>
        <p className="text-white/20 text-xs font-mono max-w-xs mb-8 leading-relaxed">Monitoring is pending. Add more competitors to increase intelligence density.</p>
        <button onClick={onAdd} className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-white/90 transition-all">Deploy Monitor</button>
      </div>
    </div>
  );
}

// --- SUB-VIEW: Competitors List ---
function CompetitorsView({ competitors }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {competitors.length === 0 ? (
        <div className="col-span-full border-2 border-dashed border-white/5 rounded-[32px] p-20 text-center text-white/20 font-mono text-[10px] uppercase tracking-[0.3em]">No monitors deployed yet.</div>
      ) : (
        competitors.map((c: any) => (
          <div key={c.id} className="border border-white/[0.07] rounded-2xl p-5 bg-white/[0.02] hover:border-white/15 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-lg font-bold text-white/20 uppercase">{c.name[0]}</div>
              <div>
                <h4 className="font-display font-bold text-sm">{c.name}</h4>
                <p className="text-[10px] text-white/30 font-mono truncate max-w-[150px]">{c.website_url}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
                 <span className="text-[8px] bg-white/5 text-white/40 px-2 py-0.5 rounded uppercase font-mono">{c.city || 'Global'}</span>
                 <span className="text-[8px] bg-white/5 text-white/40 px-2 py-0.5 rounded uppercase font-mono">{c.country || ''}</span>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-[9px] font-mono uppercase text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">Tracking</span>
              <button className="text-[9px] font-mono uppercase text-white/20 hover:text-white transition-colors">Details →</button>
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
    setIsSaving(true); setMessage("");
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/auth/me", { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ email, password }) });
      setMessage("Success: Profile updated.");
      setPassword("");
    } catch (err: any) { setMessage(`Error: ${err.message}`); } finally { setIsSaving(false); }
  };
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border border-white/[0.07] rounded-2xl bg-white/[0.02] p-6 space-y-5">
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] mb-4">Profile Settings</p>
        <div><p className="text-[10px] font-mono text-white/20 uppercase mb-2">Email</p><input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono"/></div>
        <div><p className="text-[10px] font-mono text-white/20 uppercase mb-2">New Password</p><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono"/></div>
        {message && <p className="text-[10px] font-mono uppercase text-emerald-400">{message}</p>}
        <button onClick={handleSave} disabled={isSaving} className="w-full bg-white text-black py-4 rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest">{isSaving ? "Saving..." : "Save Changes"}</button>
      </div>
    </div>
  );
}