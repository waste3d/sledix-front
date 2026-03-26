"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import Link from "next/link";

// ВСТАВЬ СВОЙ КЛЮЧ ИЗ dadata.ru ЗДЕСЬ
const DADATA_KEY = "4affb62ba89180ef3405454f9a047fa680d957ed";

// --- Иконки ---
const Icons = {
  dashboard:   <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><rect x="1" y="1" width="6" height="6" rx="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5"/></svg>,
  competitors: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
  signals:     <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M1 8h2l2-5 3 10 2-7 2 4 1-2h2"/></svg>,
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

// --- ОСНОВНОЙ КОМПОНЕНТ ---
export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const companySlug = params.company as string;

  // Защита от входа без токена
  if (typeof window !== "undefined" && !localStorage.getItem("access_token")) {
    window.location.href = "/auth/login";
    return null;
  }

  // --- Состояние ---
  const [page, setPage] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);
  
  // Состояние модалки добавления
  const [showModal, setShowModal] = useState(false);
  const [newCompName, setNewCompName] = useState("");
  const [newCompUrl, setNewCompUrl] = useState("");
  const [city, setCity] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Подсказки DaData
  const [partySuggestions, setPartySuggestions] = useState<any[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);

  // --- ПОИСК КОМПАНИЙ (DaData) ---
  const searchParty = async (query: string) => {
    setNewCompName(query);
    if (query.length < 3) { setPartySuggestions([]); return; }
    try {
      const res = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Token ${DADATA_KEY}` },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      setPartySuggestions(data.suggestions || []);
    } catch (e) { console.error(e); }
  };

  // --- ПОИСК ГОРОДОВ (DaData) ---
  const searchCity = async (query: string) => {
    setCity(query);
    if (query.length < 2) { setCitySuggestions([]); return; }
    try {
      const res = await fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Token ${DADATA_KEY}` },
        body: JSON.stringify({ query, from_bound: { value: "city" }, to_bound: { value: "city" } })
      });
      const data = await res.json();
      setCitySuggestions(data.suggestions || []);
    } catch (e) { console.error(e); }
  };

  // --- Загрузка данных ---
  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const [uRes, cRes] = await Promise.all([
        apiRequest(`/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/competitors`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setUser(uRes);
      setCompetitors(cRes || []);
      setIsLoading(false);
    } catch (err) { setIsLoading(false); }
  };

  useEffect(() => { if (companySlug) fetchData(); }, [companySlug]);

  // --- Добавление монитора ---
  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/competitors", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCompName, website_url: newCompUrl, city })
      });
      setNewCompName(""); setNewCompUrl(""); setCity("");
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return <div className="h-screen bg-[#060608] flex items-center justify-center text-white/10 font-mono text-[10px] uppercase tracking-[0.4em]">Loading...</div>;

  return (
    <div className="flex h-screen bg-[#060608] text-white overflow-hidden font-sans antialiased">
      
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-white/[0.06]">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-white/[0.06]">
          <SledixLogo /><span className="font-display font-bold text-sm tracking-tight">Sledix</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavItem icon={Icons.dashboard}   label="Dashboard"    active={page==="dashboard"}   onClick={() => setPage("dashboard")}/>
          <NavItem icon={Icons.competitors} label="Competitors"  active={page==="competitors"} onClick={() => setPage("competitors")} badge={competitors.length}/>
          <NavItem icon={Icons.settings}    label="Settings"     active={page==="settings"}    onClick={() => setPage("settings")}/>
        </nav>
        <div className="p-4 border-t border-white/[0.06]">
            <p className="text-[10px] text-white/40 truncate mb-1">{user?.email}</p>
            <button onClick={() => {localStorage.clear(); window.location.href="/auth/login"}} className="text-[9px] text-red-400/50 hover:text-red-400 uppercase font-mono transition-colors">Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-white/[0.06]">
          <h1 className="font-display text-lg font-bold tracking-tight capitalize">{page}</h1>
          <button onClick={() => setShowModal(true)} className="text-[11px] tracking-[0.15em] uppercase bg-white text-[#060608] px-4 py-2 rounded-lg font-bold hover:bg-white/90 transition-colors font-mono">+ Add competitor</button>
        </header>

        <div className="flex-1 overflow-auto p-6">
          {page === "dashboard" && <DashboardView count={competitors.length} />}
          {page === "competitors" && <CompetitorsView competitors={competitors} />}
          {page === "settings" && <SettingsView user={user} company={companySlug} />}
        </div>
      </div>

      {/* --- MODAL: ADD MONITOR --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-[#0f1012] border border-white/10 rounded-[32px] p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="font-display text-xl font-bold mb-1">New Monitor</h3>
            <p className="text-white/20 text-[10px] mb-6 font-mono uppercase tracking-[0.2em]">RU Business Intelligence</p>
            
            <form onSubmit={handleAddCompetitor} className="space-y-5">
              
              {/* Поиск Компании / ИП */}
              <div className="relative">
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2">Company Name or ИП</p>
                <input required value={newCompName} onChange={e => searchParty(e.target.value)} placeholder="sledix / sledix.tech..." className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-all font-mono"/>
                
                {partySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#16171a] border border-white/10 rounded-xl overflow-hidden z-[70] shadow-2xl">
                    {partySuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => { 
                          setNewCompName(s.value); 
                          if (s.data.address?.data?.city) setCity(s.data.address.data.city);
                          setPartySuggestions([]); 
                        }} className="w-full flex flex-col gap-0.5 px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-left">
                        <span className="text-xs text-white font-medium">{s.value}</span>
                        <span className="text-[9px] text-white/20 font-mono uppercase">{s.data.address.value}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Website */}
              <div>
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2">Website URL</p>
                <input required value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="www.buket-sb.ru" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 font-mono"/>
              </div>

              {/* Поиск города */}
              <div className="relative">
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mb-2">Location (City)</p>
                <input required value={city} onChange={e => searchCity(e.target.value)} placeholder="Сосновый Бор" className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-white/30 font-mono"/>
                
                {citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-[#16171a] border border-white/10 rounded-xl overflow-hidden z-[60] shadow-2xl">
                    {citySuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => { setCity(s.value); setCitySuggestions([]); }} className="w-full px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0 text-left text-xs text-white/70">
                        {s.value}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-white/10 py-3 rounded-xl text-[10px] font-mono font-bold uppercase text-white/40 hover:text-white transition-all">Cancel</button>
                <button type="submit" disabled={isAdding} className="flex-1 bg-white text-black py-3 rounded-xl text-[10px] font-mono font-bold uppercase hover:bg-white/90 disabled:opacity-50 transition-all">
                  {isAdding ? "Saving..." : "Deploy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-VIEWS ---

function DashboardView({ count }: { count: number }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[{ label: "Monitors", value: count }, { label: "Signals", value: "0" }, { label: "Status", value: "Optimal" }, { label: "System", value: "Live" }].map((s, i) => (
          <div key={i} className="border border-white/[0.07] rounded-2xl p-5 bg-white/[0.02]">
            <p className="text-[9px] font-mono tracking-[0.2em] uppercase text-white/25 mb-3">{s.label}</p>
            <p className="font-display text-3xl font-bold tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="border-2 border-dashed border-white/5 rounded-[32px] p-20 text-center">
        <p className="text-white/20 text-xs font-mono uppercase tracking-[0.4em]">Autonomous core active. Pending data ingestion.</p>
      </div>
    </div>
  );
}

function CompetitorsView({ competitors }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {competitors.length === 0 ? (
        <div className="col-span-full border-2 border-dashed border-white/5 rounded-[32px] p-20 text-center text-white/20 font-mono text-[10px] uppercase tracking-[0.3em]">No targets deployed.</div>
      ) : (
        competitors.map((c: any) => (
          <div key={c.id} className="border border-white/[0.07] rounded-2xl p-5 bg-white/[0.02] hover:border-white/15 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-lg font-bold text-white/20 uppercase">{c.name[0]}</div>
              <div className="min-w-0">
                <h4 className="font-display font-bold text-sm truncate">{c.name}</h4>
                <p className="text-[10px] text-white/30 font-mono truncate">{c.website_url}</p>
              </div>
            </div>
            <p className="text-[9px] font-mono uppercase text-white/20 mb-4">{c.city || 'Global'}</p>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-[9px] font-mono uppercase text-emerald-400/60 bg-emerald-400/5 px-2 py-0.5 rounded">Active</span>
              <button className="text-[9px] font-mono uppercase text-white/20 hover:text-white transition-colors">Details →</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

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
        <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] mb-4">Settings Control</p>
        <div><p className="text-[10px] font-mono text-white/20 uppercase mb-2">Email</p><input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-white/20"/></div>
        <div><p className="text-[10px] font-mono text-white/20 uppercase mb-2">New Password</p><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono outline-none focus:border-white/20"/></div>
        {message && <p className="text-[10px] font-mono uppercase text-emerald-400">{message}</p>}
        <button onClick={handleSave} disabled={isSaving} className="w-full bg-white text-black py-4 rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest">{isSaving ? "Saving..." : "Save Changes"}</button>
      </div>
    </div>
  );
}