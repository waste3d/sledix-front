"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiRequest } from "../../../lib/api";
import Link from "next/link";

// --- UI Components (Skeletons & Elements) ---

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-white/[0.03] rounded-2xl ${className}`} />
);

function SledixLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <path d="M76 32 C76 20 64 14 52 18 C40 22 36 32 42 40 C48 48 68 50 74 60 C80 70 74 84 60 88 C46 92 36 84 36 74" stroke="currentColor" strokeWidth="8" strokeLinecap="square" fill="none" />
    </svg>
  );
}

// --- Main Page ---

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const companySlug = params.company as string;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        const res = await apiRequest(`/api/dashboard/${companySlug}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res);
        // Небольшая задержка для плавности перехода, если бэкенд слишком быстрый
        setTimeout(() => setIsLoading(false), 400);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    if (companySlug) checkAccess();
  }, [companySlug, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#080809] text-white flex items-center justify-center font-sans">
        <div className="text-center border border-red-500/20 bg-red-500/5 p-8 rounded-3xl backdrop-blur-xl">
          <h2 className="text-red-400 font-mono text-sm uppercase tracking-widest mb-2">Access Denied</h2>
          <p className="text-white/60 text-sm mb-6">{error}</p>
          <button onClick={() => router.push('/auth/login')} className="px-6 py-2 bg-white text-black rounded-xl text-xs font-bold uppercase font-mono">Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080809] text-white font-sans selection:bg-white/10">
      {/* --- Навигация --- */}
      <nav className="border-b border-white/[0.05] bg-[#080809]/50 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
              <SledixLogo size={28} />
              <span className="font-display font-bold tracking-tight text-lg">Sledix</span>
            </Link>
            <div className="h-4 w-px bg-white/10 hidden md:block" />
            <div className="hidden md:flex items-center gap-6 text-[10px] uppercase tracking-[0.2em] font-mono text-white/30">
              <span className="text-white underline underline-offset-8">Dashboard</span>
              <span className="hover:text-white cursor-pointer transition-colors">Competitors</span>
              <span className="hover:text-white cursor-pointer transition-colors">Signals</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-[10px] font-mono text-white/40 uppercase tracking-wider">
               {companySlug}.sledix.tech
             </div>
             <button 
               onClick={() => { localStorage.clear(); router.push('/auth/login'); }}
               className="text-[10px] font-mono uppercase text-white/20 hover:text-red-400 transition-colors"
             >
               Logout
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        {/* --- Заголовок --- */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-6 bg-white/20" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/30 font-mono">Intelligence Center</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              {isLoading ? <Skeleton className="h-12 w-64" /> : `${companySlug}`}
            </h1>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-mono uppercase tracking-widest hover:bg-white/[0.06] transition-all">
              Settings
            </button>
            <button className="px-5 py-3 bg-white text-black rounded-xl text-[10px] font-mono uppercase font-bold tracking-widest hover:bg-white/90 transition-all">
              + Add Competitor
            </button>
          </div>
        </header>

        {/* --- Статистика --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/20 mb-4">
                {i === 1 && "Competitors Tracked"}
                {i === 2 && "Active Signals"}
                {i === 3 && "AI Insights"}
                {i === 4 && "System Status"}
              </p>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-display font-bold">
                  {i === 4 ? "Optimal" : "0"}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- Центральный пустой блок --- */}
        <section className="relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-[32px] pointer-events-none" />
          <div className="border-2 border-dashed border-white/5 rounded-[32px] p-20 flex flex-col items-center justify-center text-center transition-all group-hover:border-white/10">
            {isLoading ? (
              <div className="space-y-4 flex flex-col items-center">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="w-48 h-6" />
                <Skeleton className="w-32 h-4" />
              </div>
            ) : (
              <>
                <div className="w-20 h-20 bg-white/[0.03] rounded-full flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform duration-500">
                  <span className="text-3xl">📊</span>
                </div>
                <h2 className="font-display text-2xl font-bold mb-3 tracking-tight">Your workspace is ready.</h2>
                <p className="text-white/30 text-sm font-light max-w-xs mx-auto leading-relaxed mb-8 italic">
                  Start by adding your first competitor to see real-time signals and AI analysis.
                </p>
                <button className="px-8 py-4 bg-white/[0.04] border border-white/10 rounded-2xl text-[11px] font-mono uppercase font-bold tracking-[0.2em] hover:bg-white text-white hover:text-black transition-all">
                   Deploy First Monitor
                </button>
              </>
            )}
          </div>
        </section>
      </main>

      {/* --- Анимация появления --- */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        main {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}