"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "../../../lib/api";

const DADATA_KEY = "4affb62ba89180ef3405454f9a047fa680d957ed";

// --- Цветовая схема ---
const TAG_STYLES: Record<string, { color: string; bg: string }> = {
  PRICING: { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
  HIRING: { color: "#3b82f6", bg: "rgba(59, 130, 246, 0.1)" },
  REVIEWS: { color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" },
  LEGAL: { color: "#a855f7", bg: "rgba(168, 85, 247, 0.1)" },
  PRODUCT: { color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" },
  TECH: { color: "#6366f1", bg: "rgba(99, 102, 241, 0.1)" },
  MARKETING: { color: "#ec4899", bg: "rgba(236, 72, 153, 0.1)" },
  NEWS: { color: "#f87171", bg: "rgba(248, 113, 113, 0.1)" },   
};

// --- Хелперы ---
const getRelativeTime = (dateStr: string) => {
  if (!dateStr) return "Pending";
  const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const getCompScore = (comp: any, signals: any[]) => {
  let score = 55;
  if (comp.inn) score += 15;
  const count = signals.filter(s => s.company === comp.name).length;
  score += count * 5;
  return Math.min(score, 99);
};

const Icons = {
  dashboard:   <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1"/><rect x="9" y="9" width="5.5" height="5.5" rx="1"/></svg>,
  competitors: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="6" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
  signals:     <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 8h2l2-5 3 10 2-7 2 4 1-2h2"/></svg>,
  settings:    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.1 3.1l1.4 1.4M11.5 11.5l1.4 1.4M3.1 12.9l1.4-1.4M11.5 4.5l1.4-1.4"/></svg>,
  trash:       <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 4h12M5 4V2.5c0-.3.2-.5.5-.5h5c.3 0 .5.2.5.5V4M6 7v5M10 7v5M3 4l1 10c0 .6.4 1 1 1h6c.6 0 1-.4 1-1l1-10" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  chevron:     <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 12l4-4-4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>
};

// --- Атомные компоненты ---

function SignalBadge({ label }: { label: string }) {
  const style = TAG_STYLES[label] || { color: "#71717a", bg: "rgba(113, 113, 122, 0.1)" };
  return (
    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider" 
      style={{ color: style.color, backgroundColor: style.bg, borderColor: `${style.color}33` }}>{label}</span>
  );
}

function Sparkline({ color }: { color: string }) {
  return (
    <svg width="60" height="20" viewBox="0 0 60 20" className="opacity-30">
      <path d="M0 15 Q 15 5, 30 12 T 60 8" fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function ActivityChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div className="h-full w-full flex items-center justify-center border border-dashed border-white/5 rounded-3xl text-[10px] font-mono text-white/10 uppercase tracking-[0.5em]">Awaiting Telemetry...</div>;
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const width = 800; const height = 240; const padding = 40;
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * (width - padding * 2) + padding,
    y: height - ((d.value / maxValue) * (height - padding * 2) + padding)
  }));
  const d = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  const areaD = `${d} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  return (
    <div className="w-full h-full relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs><linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fff" stopOpacity="0.05" /><stop offset="100%" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
        <path d={areaD} fill="url(#areaG)" className="transition-all duration-1000" />
        <path d={d} fill="none" stroke="white" strokeOpacity="0.15" strokeWidth="1.5" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="2.5" fill="#fff" />
            <text x={p.x} y={height - 10} textAnchor="middle" fill="white" fillOpacity="0.2" fontSize="10" className="font-mono uppercase tracking-widest">{data[i].label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function ClassificationMatrix({ data }: { data: any[] }) {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  const maxValue = Math.max(...data.map(d => d.value), 1);
  if (total === 0) return <div className="p-10 text-center text-white/5 font-mono text-[10px] uppercase tracking-widest border border-dashed border-white/5 rounded-3xl">No signals to classify</div>;
  return (
    <div className="w-full space-y-7 py-2">
      {data.map((item, i) => (
        <div key={i} className="group">
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TAG_STYLES[item.label]?.color || "#fff" }} />
              <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">{item.label}</span>
            </div>
            <span className="text-[10px] font-mono text-white/80 font-bold">{item.value}</span>
          </div>
          <div className="h-[1px] w-full bg-white/5">
            <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: TAG_STYLES[item.label]?.color || "#fff" }} />
          </div>
        </div>
      ))}
      <div className="pt-6 mt-6 border-t border-white/5 flex justify-between items-center">
        <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Aggregate signals</span>
        <span className="text-[14px] font-display font-bold text-white/90">{total}</span>
      </div>
    </div>
  );
}

// --- Представления страниц ---

function DashboardView({ count, signals, stats, dist }: any) {
  const compWithSignals = new Set(signals.map((s: any) => s.company)).size;
  const coverage = count > 0 ? Math.round((compWithSignals / count) * 100) : 0;
  const dataPoints = count + signals.length + (count > 0 ? 1 : 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 max-w-[1300px]">
      <div className="grid grid-cols-4 gap-6">
  {[ 
    { label: "Monitors", value: count, color: "#fff" }, 
    { label: "Signals Detected", value: signals.length, color: "#10b981" }, 
    { label: "Data Units", value: count + signals.length, color: "#3b82f6" }, 
    { label: "System Status", value: "Online", color: "#f59e0b" }
  ].map((s, i) => (
    <div key={i} className="border border-white/[0.06] rounded-[20px] p-6 bg-[#08080a] relative overflow-hidden">      
      <p className="text-[10px] font-mono tracking-[0.2em] uppercase text-white/20 mb-3">{s.label}</p>
      <p className="font-display text-4xl font-bold tracking-tight text-white/90">{s.value}</p>
    </div>
  ))}
</div>
      <div className="grid grid-cols-12 gap-8">
          <div className="col-span-8 border border-white/[0.06] rounded-[40px] p-10 bg-[#08080a] flex flex-col justify-between h-[500px]">
             <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/40 mb-10 text-center">Intelligence Activity (7 Days)</p>
             <ActivityChart data={stats} />
          </div>
          <div className="col-span-4 border border-white/[0.06] rounded-[32px] p-10 bg-[#08080a] h-[500px] flex flex-col relative overflow-hidden">
             <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/20 mb-10 w-full text-left">Signal Matrix</p>
             <ClassificationMatrix data={dist} />
          </div>
          <div className="col-span-4 border border-white/[0.06] rounded-[32px] bg-[#08080a] p-8 h-[450px] flex flex-col shadow-2xl">
             <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-8 border-b border-white/5 pb-4">Master Feed</p>
             <div className="space-y-6 flex-1 overflow-auto pr-2 custom-scrollbar text-white/50 font-light">
               {signals.slice(0, 10).map((sig: any) => (
                 <div key={sig.id} className="border-l-2 border-white/5 pl-5 py-0.5">
                    <div className="flex justify-between items-center mb-1.5"><SignalBadge label={sig.tag} /><p className="text-[9px] font-mono text-white/10 uppercase">{getRelativeTime(sig.created_at)}</p></div>
                    <p className="text-[11px] leading-relaxed line-clamp-2">{sig.msg}</p>
                    <p className="text-[9px] font-mono text-white/30 uppercase mt-2 font-bold">{sig.company}</p>
                 </div>
               ))}
             </div>
          </div>
          <div className="col-span-8 border border-white/[0.06] rounded-[40px] bg-[#08080a] h-[450px] relative overflow-hidden flex flex-col items-center justify-center border-b-4 border-b-white/5">
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-6 bg-white/[0.01] animate-pulse">📡</div>
                <h2 className="font-display text-xl font-bold mb-2 tracking-tight uppercase">Strategic Matrix</h2>
                <p className="text-white/20 text-[10px] font-mono uppercase tracking-widest max-w-sm text-center leading-relaxed">Analyzing {count} targets. Data synchronization optimal.</p>
          </div>
      </div>
    </div>
  );
}

function CompetitorsView({ competitors, signals, onDelete, onSelect }: any) {
  return (
    <div className="grid grid-cols-3 gap-8 animate-in fade-in duration-700 max-w-[1300px]">
      {competitors.map((c: any) => (
        <div key={c.id} onClick={() => onSelect(c)} className="border border-white/[0.07] rounded-[32px] p-8 bg-[#08080a] hover:bg-[#0a0a0c] transition-all group relative cursor-pointer border-b-2 border-b-white/5">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl font-bold text-white/10 uppercase font-mono group-hover:text-white/30 transition-colors">{c.name[0]}</div>
            <div className="min-w-0 flex-1">
              <h4 className="font-display font-bold text-base truncate">{c.name}</h4>
              <p className="text-[10px] text-white/20 font-mono truncate">{c.website_url}</p>
            </div>
            <div className="text-right">
               <p className="font-display text-2xl font-bold tracking-tighter text-white/90">{getCompScore(c, signals)}</p>
               <p className="text-[8px] font-mono text-white/20 uppercase">Threat</p>
            </div>
          </div>
          <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl mb-8">
            <div>
               <p className="text-[10px] font-mono uppercase text-white/30 tracking-widest">{c.city || 'Global Node'}</p>
               <p className="text-[8px] font-mono text-white/10 uppercase mt-1">
                 Web Scan: {c.last_web_scan_at ? getRelativeTime(c.last_web_scan_at) : 'Scheduled'}
               </p>
            </div>
            <button onClick={(e) => onDelete(e, c.id)} className="p-2 text-white/10 hover:text-red-500 transition-all hover:scale-110">{Icons.trash}</button>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-[9px] font-mono uppercase text-emerald-400/60 border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 rounded-full">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              Tracking Active
            </span>
            <div className="text-[9px] font-mono uppercase text-white/20 group-hover:text-white transition-colors flex items-center gap-1.5">Dossier {Icons.chevron}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompetitorDetailsView({ comp, signals, onDelete, onBack }: any) {
  const [socialUrl, setSocialUrl] = useState("");
  const [platform, setPlatform] = useState("telegram");
  const [socials, setSocials] = useState<any[]>([]);
  const [isLinking, setIsLinking] = useState(false);

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
    setIsLinking(true);
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest(`/api/competitors/${comp.id}/socials`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ platform, url: socialUrl, interval: 60 }) });
      setSocialUrl(""); fetchSocials();
    } catch (e) {} finally { setIsLinking(false); }
  };

  return (
    <div className="animate-in slide-in-from-bottom-2 duration-700 space-y-10 max-w-[1200px]">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-[10px] font-mono text-white/30 hover:text-white flex items-center gap-3 uppercase tracking-widest transition-all"><span className="text-lg">←</span> Hub</button>
        <button onClick={(e) => onDelete(e, comp.id)} className="text-[10px] font-mono text-red-500/40 hover:text-red-400 uppercase px-5 py-2 rounded-xl border border-red-500/10 hover:bg-red-500/5 transition-all">Archive Monitor</button>
      </div>
      <div className="grid grid-cols-3 gap-10">
        <div className="col-span-1 space-y-8">
           <div className="border border-white/[0.07] rounded-[40px] p-10 bg-[#08080a]">
              <div className="w-20 h-20 bg-white/5 rounded-[24px] flex items-center justify-center text-4xl font-bold text-white/10 uppercase font-mono mb-10">{comp.name[0]}</div>
              <h2 className="font-display text-3xl font-bold mb-2">{comp.name}</h2>
              <p className="text-sm text-white/30 font-mono mb-10 pb-10 border-b border-white/5">{comp.website_url}</p>
              <div className="space-y-6 pt-2">
                 <div><p className="text-[10px] font-mono text-white/20 uppercase mb-2 tracking-widest">Tax Identity</p><p className="text-sm font-mono text-white/60 bg-white/[0.02] p-4 rounded-2xl border border-white/5">{comp.inn || 'UNIDENTIFIED'}</p></div>
                 <div><p className="text-[10px] font-mono text-white/20 uppercase mb-2 tracking-widest">Node Region</p><p className="text-sm font-mono text-white/60 bg-white/[0.02] p-4 rounded-2xl border border-white/5">{comp.city || 'GLOBAL'}</p></div>
              </div>
           </div>

           {/* БЛОК СТАТУСА ПАРСИНГА САЙТА */}
           <div className="border border-white/[0.06] rounded-[40px] p-10 bg-[#08080a]">
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] mb-8">Web Index Status</p>
              <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                      <span className="text-[10px] text-white/40 uppercase font-mono">Indexing Engine</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold">ONLINE</span>
                  </div>
                  <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                      <p className="text-[9px] text-white/20 uppercase font-mono mb-2">Crawler Config</p>
                      <p className="text-[11px] text-white/50 leading-relaxed font-light">
                          Recursive scan active. Deep-link hashing enabled. 
                          Last sync: {comp.last_web_scan_at ? getRelativeTime(comp.last_web_scan_at) : 'Queueing...'}
                      </p>
                  </div>
              </div>
           </div>

           <div className="border border-white/[0.06] rounded-[40px] p-10 bg-[#08080a]">
              <p className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em] mb-8">Observers</p>
              <div className="space-y-4 mb-10">
                 {socials.map((s: any) => (<div key={s.id} className="p-5 border border-white/5 rounded-3xl bg-white/[0.01] flex justify-between items-center"><p className="text-[11px] text-white/60 font-mono uppercase">{s.platform}</p><div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse"/></div>))}
              </div>
              <div className="space-y-4 pt-8 border-t border-white/5">
                 <select value={platform} onChange={e => setPlatform(e.target.value)} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white outline-none"><option value="telegram">Telegram</option><option value="vk">VK.com</option></select>
                 <input value={socialUrl} onChange={e => setSocialUrl(e.target.value)} placeholder="Observer URL..." className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white outline-none font-mono focus:border-white/30 transition-all"/><button onClick={handleLink} disabled={isLinking} className="w-full bg-white text-black py-5 rounded-2xl font-mono text-[11px] font-bold uppercase hover:bg-white/90 transition-all">Link Observer</button>
              </div>
           </div>
        </div>
        <div className="col-span-2 border border-white/[0.07] rounded-[40px] bg-[#08080a] overflow-hidden flex flex-col h-[850px]">
           <div className="px-10 py-8 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.01]"><p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/40">Raw Intelligence Data</p></div>
           <div className="divide-y divide-white/[0.04] overflow-auto custom-scrollbar">
              {signals.map((s: any) => (<div key={s.id} className="p-10 hover:bg-white/[0.01] transition-all"><div className="flex justify-between items-center mb-4"><SignalBadge label={s.tag} /><span className="text-[10px] font-mono text-white/10 uppercase">{getRelativeTime(s.created_at)}</span></div><p className="text-[13px] text-white/50 leading-relaxed font-light">{s.msg}</p></div>))}
           </div>
        </div>
      </div>
    </div>
  );
}

function SignalsView({ signals }: any) {
  return (
    <div className="border border-white/[0.06] rounded-[40px] bg-[#08080a] overflow-hidden max-w-[1200px] animate-in fade-in duration-700">
        <div className="px-10 py-8 border-b border-white/[0.06] bg-white/[0.01] flex justify-between items-center"><p className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/40">Master Intelligence Stream</p><span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">{signals.length} Signals Captured</span></div>
        <div className="divide-y divide-white/[0.04]">
          {signals.map((s: any) => (<div key={s.id} className="flex items-center gap-12 px-10 py-8 hover:bg-white/[0.01] transition-all"><div className="w-32 shrink-0"><p className="text-[11px] font-bold text-white/70 uppercase font-mono truncate tracking-tighter">{s.company}</p></div><p className="flex-1 text-[13px] text-white/40 font-light leading-relaxed">{s.msg}</p><SignalBadge label={s.tag} /><span className="text-[11px] font-mono text-white/20 w-24 text-right shrink-0 font-mono">{getRelativeTime(s.created_at)}</span></div>))}
          {signals.length === 0 && <div className="p-40 text-center text-white/10 font-mono uppercase text-[10px] tracking-widest">No active signals detected.</div>}
        </div>
    </div>
  );
}

function SettingsView({ user }: any) {
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const handleSave = async () => {
    setIsSaving(true); setMessage("");
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/auth/me", { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ email, password: showPass ? password : "" }) });
      setMessage("Success: Configuration Synchronized");
      setShowPass(false); setPassword("");
    } catch (err: any) { setMessage(`Error: ${err.message}`); } finally { setIsSaving(false); }
  };
  return (
    <div className="max-w-2xl space-y-10 animate-in fade-in duration-700">
      <div className="border border-white/[0.06] rounded-[40px] bg-[#08080a] p-12 space-y-10 shadow-2xl">
        <p className="text-[11px] font-mono text-white/30 uppercase tracking-[0.4em] mb-10">Command Center</p>
        <div className="space-y-4"><p className="text-[10px] font-mono text-white/20 uppercase tracking-widest ml-1">Identity Endpoint</p><input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-[13px] text-white font-mono outline-none focus:border-white/30 transition-all"/></div>
        <div className="space-y-6"><p className="text-[10px] font-mono text-white/20 uppercase tracking-widest ml-1">Security Cipher</p>{showPass ? (<div className="space-y-6 animate-in slide-in-from-top-2 duration-300"><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New Cipher..." className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-[13px] text-white font-mono outline-none focus:border-white/30"/><button onClick={() => setShowPass(false)} className="text-[10px] font-mono text-white/20 hover:text-white uppercase tracking-widest transition-colors ml-1">Abort Key Change</button></div>) : (<button onClick={() => setShowPass(true)} className="text-[10px] font-mono text-white/40 border border-white/10 px-8 py-4 rounded-2xl hover:bg-white/5 transition-all uppercase tracking-widest">Update Access Cipher</button>)}</div>
        {message && <p className={`text-[10px] font-mono uppercase tracking-widest ${message.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{message}</p>}
        <div className="pt-10 border-t border-white/5"><button onClick={handleSave} disabled={isSaving} className="w-full bg-white text-black py-6 rounded-[24px] font-mono text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-white/90 disabled:opacity-50 transition-all">Synchronize Configuration</button></div>
      </div>
    </div>
  );
}

// --- ОСНОВНОЙ КОМПОНЕНТ СТРАНИЦЫ ---
export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const companySlug = params.company as string;
  const companyRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

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
  const [isAdding, setIsAdding] = useState(false);

  const [partySuggestions, setPartySuggestions] = useState<any[]>([]);
  const [citySuggestions, setCitySuggestions] = useState<any[]>([]);

  if (typeof window !== "undefined" && !localStorage.getItem("access_token")) {
    window.location.href = "/auth/login";
    return null;
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) setPartySuggestions([]);
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setCitySuggestions([]);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const [uRes, cRes, sRes, stRes, dsRes] = await Promise.allSettled([
        apiRequest(`/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/competitors`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/signals`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/activity`, { headers: { Authorization: `Bearer ${token}` } }),
        apiRequest(`/api/stats/distribution`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (uRes.status === 'fulfilled') setUser(uRes.value);
      if (cRes.status === 'fulfilled') setCompetitors(cRes.value || []);
      if (sRes.status === 'fulfilled') setSignals(sRes.value || []);
      if (stRes.status === 'fulfilled') setStats(stRes.value || []);
      if (dsRes.status === 'fulfilled') setDist(dsRes.value || []);
      setIsLoading(false);
    } catch (err) { setIsLoading(false); }
  };

  useEffect(() => { if (companySlug) fetchData(); }, [companySlug]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest("/api/competitors", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newCompName, website_url: newCompUrl, city, inn })
      });
      setNewCompName(""); setNewCompUrl(""); setCity(""); setInn("");
      setShowModal(false); fetchData();
    } catch (err: any) { alert(err.message); } finally { setIsAdding(false); }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Permanently remove this monitor?")) return;
    try {
      const token = localStorage.getItem("access_token");
      await apiRequest(`/api/competitors/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (selectedComp?.id === id) setSelectedComp(null);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  if (isLoading) return <div className="h-screen bg-[#060608] flex items-center justify-center text-white/10 font-mono text-[10px] uppercase tracking-[0.5em]">Synchronizing...</div>;

  return (
    <div className="flex h-screen bg-[#060608] text-white overflow-hidden font-sans antialiased selection:bg-white/10">
      
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-white/[0.06] bg-[#08080a]">
        <div className="h-14 flex items-center gap-3 px-5 border-b border-white/[0.06]">
          <svg width="22" height="22" viewBox="0 0 120 120" fill="none"><path d="M76 32 C76 20 64 14 52 18 C40 22 36 32 42 40 C48 48 68 50 74 60 C80 70 74 84 60 88 C46 92 36 84 36 74" stroke="currentColor" strokeWidth="10" strokeLinecap="square" fill="none" /></svg>
          <span className="font-display font-bold text-sm tracking-tight">Sledix</span>
        </div>
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold uppercase">{companySlug[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium truncate">{companySlug}</p>
              <p className="text-[8px] text-white/20 font-mono uppercase">{user?.plan || "Growth"} Active</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <button onClick={() => { setPage("dashboard"); setSelectedComp(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${page==="dashboard" && !selectedComp?"bg-white/[0.08] text-white":"text-white/30 hover:text-white/60 hover:bg-white/[0.02]"}`}>{Icons.dashboard} Dashboard</button>
          <button onClick={() => { setPage("competitors"); setSelectedComp(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${page==="competitors"?"bg-white/[0.08] text-white":"text-white/30 hover:text-white/60 hover:bg-white/[0.02]"}`}>{Icons.competitors} Monitors <span className="ml-auto text-[9px] bg-white/5 px-1.5 rounded font-mono">{competitors.length}</span></button>
          <button onClick={() => { setPage("signals"); setSelectedComp(null); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${page==="signals"?"bg-white/[0.08] text-white":"text-white/30 hover:text-white/60 hover:bg-white/[0.02]"}`}>{Icons.signals} Signals <span className="ml-auto text-[9px] bg-white/5 px-1.5 rounded font-mono">{signals.length}</span></button>
        </nav>
        <div className="px-3 pb-6 border-t border-white/[0.06] pt-4 space-y-0.5">
          <button onClick={() => setPage("settings")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${page === "settings" ? "bg-white/[0.08] text-white" : "text-white/30 hover:text-white/60 hover:bg-white/[0.02]"}`}>{Icons.settings} Settings</button>
          <div className="flex items-center gap-3 px-3 py-4 mt-2">
            <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/30">{user?.email?.[0]?.toUpperCase()}</div>
            <div className="flex-1 min-w-0"><p className="text-[10px] text-white/50 truncate font-mono">{user?.email}</p><button onClick={() => {localStorage.clear(); window.location.href="/auth/login"}} className="text-[8px] font-mono text-red-400/40 hover:text-red-400 uppercase tracking-tighter">Sign Out</button></div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 shrink-0 flex items-center justify-between px-8 border-b border-white/[0.06] bg-[#060608]/50 backdrop-blur-xl z-20">
          <h1 className="font-display text-base font-bold tracking-tight uppercase text-white/90">{selectedComp ? selectedComp.name : page}</h1>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-400/80 uppercase tracking-widest"><span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"/> Live System</div>
             <button onClick={() => setShowModal(true)} className="text-[10px] tracking-[0.15em] uppercase bg-white text-black px-5 py-2 rounded-lg font-bold hover:bg-white/80 transition-all">+ Add Monitor</button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-[#060608]">
          {selectedComp ? (
            <CompetitorDetailsView comp={selectedComp} signals={signals.filter(s => s.company === selectedComp.name)} onDelete={handleDelete} onBack={() => setSelectedComp(null)} />
          ) : (
            <>
              {page === "dashboard" && <DashboardView count={competitors.length} signals={signals} stats={stats} dist={dist} />}
              {page === "competitors" && <CompetitorsView competitors={competitors} signals={signals} onDelete={handleDelete} onSelect={setSelectedComp} />}
              {page === "signals" && <SignalsView signals={signals} />}
              {page === "settings" && <SettingsView user={user} />}
            </>
          )}
        </div>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-[#0f1012] border border-white/10 rounded-[40px] p-10 w-full max-w-md shadow-2xl relative">
            <h3 className="font-display text-xl font-bold mb-1 uppercase tracking-tight">New Monitor</h3>
            <p className="text-white/20 text-[10px] mb-8 font-mono uppercase tracking-[0.3em]">Identification phase</p>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="relative" ref={companyRef}>
                <p className="text-[9px] font-mono text-white/30 uppercase mb-2">Target Name</p>
                <input required value={newCompName} onChange={e => {
                   setNewCompName(e.target.value);
                   if (e.target.value.length >= 3) {
                    fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party", {
                      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Token ${DADATA_KEY}` },
                      body: JSON.stringify({ query: e.target.value })
                    }).then(r => r.json()).then(d => setPartySuggestions(d.suggestions || []));
                   } else setPartySuggestions([]);
                }} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-white/30 transition-all font-mono"/>
                {partySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#16171a] border border-white/10 rounded-2xl overflow-hidden z-[110] shadow-2xl">
                    {partySuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => { setNewCompName(s.value); setInn(s.data.inn || ""); if(s.data.address?.data?.city) setCity(s.data.address.data.city); setPartySuggestions([]); }} className="w-full px-5 py-4 hover:bg-white/5 border-b border-white/5 last:border-0 text-left">
                        <p className="text-xs text-white font-medium">{s.value}</p>
                        <p className="text-[9px] text-white/20 uppercase mt-1">{s.data.address.value}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative" ref={cityRef}>
                <p className="text-[9px] font-mono text-white/30 uppercase mb-2">Node Region</p>
                <input required value={city} onChange={e => {
                   setCity(e.target.value);
                   if (e.target.value.length >= 2) {
                    fetch("https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address", {
                      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Token ${DADATA_KEY}` },
                      body: JSON.stringify({ query: e.target.value, from_bound: { value: "city" }, to_bound: { value: "city" } })
                    }).then(r => r.json()).then(d => setCitySuggestions(d.suggestions || []));
                   } else setCitySuggestions([]);
                }} className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-white/30 transition-all font-mono"/>
                {citySuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#16171a] border border-white/10 rounded-2xl overflow-hidden z-[110] shadow-2xl">
                    {citySuggestions.map((s, i) => (
                      <button key={i} type="button" onClick={() => { setCity(s.value); setCitySuggestions([]); }} className="w-full px-5 py-4 hover:bg-white/5 border-b border-white/5 last:border-0 text-left text-[11px] text-white/60">{s.value}</button>
                    ))}
                  </div>
                )}
              </div>
              <div><p className="text-[9px] font-mono text-white/30 uppercase mb-2">Website</p><input required value={newCompUrl} onChange={e => setNewCompUrl(e.target.value)} placeholder="www.domain.com" className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-white/30 font-mono"/></div>
              <div className="flex gap-4 pt-4"><button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-white/10 py-4 rounded-2xl text-[10px] font-mono font-bold uppercase text-white/30 transition-all hover:text-white">Cancel</button><button type="submit" disabled={isAdding} className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-mono font-bold uppercase hover:bg-white/90 disabled:opacity-50 transition-all">Deploy Monitor</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricAccent({ color }: { color: string }) {
  return (
    <>
      {/* Та самая неровная полоска сверху */}
      <div 
        className="absolute top-0 left-0 w-full h-[2px] opacity-80" 
        style={{ 
          backgroundColor: color, 
          clipPath: 'polygon(0 0, 60% 0, 70% 100%, 0 100%)' 
        }} 
      />
      {/* Графическая волна вместо света */}
      <div className="absolute top-[2px] left-0 right-0 h-4 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 400 32" preserveAspectRatio="none">
          <path 
            d="M0 10 Q 50 20 100 10 T 200 10 T 300 10 T 400 10 V 0 H 0 Z" 
            fill={color} 
          />
        </svg>
      </div>
    </>
  );
}