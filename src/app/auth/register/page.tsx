"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "../../../lib/api";

function SledixLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <path 
        d="M76 32 C76 20 64 14 52 18 C40 22 36 32 42 40 C48 48 68 50 74 60 C80 70 74 84 60 88 C46 92 36 84 36 74" 
        stroke="currentColor" strokeWidth="8" strokeLinecap="square" fill="none" 
      />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", tenant_slug: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (!data || !data.user) {
        throw new Error("User data not found in response");
      }

      localStorage.setItem("access_token", data.access_token);
      router.push(`/dashboard/${data.user.tenant_slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-[#050505] text-white font-sans antialiased selection:bg-indigo-500/30">
      
      {/* ================= ЛЕВАЯ ЧАСТЬ (ВИЗУАЛ) ================= */}
      <div className="relative hidden lg:flex lg:w-[45%] flex-col justify-between overflow-hidden bg-[#020205] border-r border-white/5 p-14">
        
        {/* Абстрактный технологичный фон: Матрица развертывания */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Матричная сетка */}
          <div 
            className="absolute inset-0 opacity-[0.2]"
            style={{ 
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)', 
              backgroundSize: '32px 32px',
              backgroundPosition: '0 0'
            }}
          />
          {/* Диагональные сканирующие линии */}
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 10px)' }} 
          />
          {/* Свечения: Индиго и Фуксия */}
          <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] bg-indigo-600/15 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 blur-[130px] rounded-full" />
          
          {/* Градиентное затухание (виньетка) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020205] via-transparent to-transparent opacity-80" />
        </div>

        {/* Логотип */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <SledixLogo size={36} />
            <span className="font-display text-xl font-bold tracking-tight">Sledix</span>
          </Link>
        </div>

        {/* Инфо блок */}
        <div className="relative z-10 mb-8" style={{ animation: "fadeUp 1s ease-out both" }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-indigo-400">Node Initialization</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight leading-[1.1] mb-6">
            Construct your <br />
            <span className="text-white/40">Intelligence Matrix</span>
          </h2>
          <p className="text-white/30 text-sm font-light max-w-sm leading-relaxed">
            Deploy your dedicated workspace and start mapping your competitive landscape in real-time.
          </p>
        </div>
      </div>

      {/* ================= ПРАВАЯ ЧАСТЬ (ФОРМА) ================= */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-16 md:px-24 lg:px-32 relative bg-[#060608]">
        
        {/* Мобильный хедер */}
        <div className="absolute top-8 left-6 right-6 flex items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <SledixLogo size={24} />
            <span className="font-display font-bold text-sm tracking-tight">Sledix</span>
          </Link>
          <Link href="/auth/login" className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            Sign In
          </Link>
        </div>

        {/* Десктопная ссылка авторизации сверху */}
        <div className="absolute top-10 right-12 hidden lg:block">
          <p className="text-xs text-white/40 font-light">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-white hover:text-indigo-400 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <div className="w-full max-w-[420px] mx-auto" style={{ animation: "fadeUp 0.6s cubic-bezier(.16,1,.3,1) both" }}>
          
          <div className="mb-10">
            <h1 className="font-display text-3xl font-medium tracking-tight mb-2">Create workspace</h1>
            <p className="text-white/40 text-sm font-light">Set up your intelligence hub in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2 group">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono transition-colors group-focus-within:text-white/80">
                Workspace URL
              </label>
              <div className="relative flex items-center border-b border-white/10 group-focus-within:border-white transition-colors">
                <input
                  required
                  placeholder="my-company"
                  className="w-full bg-transparent px-0 py-3 pr-24 text-base text-white outline-none placeholder-white/20 font-light lowercase"
                  onChange={(e) => setForm({ ...form, tenant_slug: e.target.value })}
                />
                <span className="absolute right-0 text-white/20 text-xs font-mono pointer-events-none">
                  .sledix.tech
                </span>
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono transition-colors group-focus-within:text-white/80">
                Work Email
              </label>
              <input
                required
                type="email"
                placeholder="name@company.com"
                className="w-full bg-transparent border-b border-white/10 px-0 py-3 text-base text-white outline-none placeholder-white/20 focus:border-white transition-colors font-light"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono transition-colors group-focus-within:text-white/80">
                Password
              </label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-white/10 px-0 py-3 text-base text-white outline-none placeholder-white/20 focus:border-white transition-colors font-light tracking-widest"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && (
              <div 
                className="flex items-center gap-3 bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-red-400"
                style={{ animation: "slideIn 0.3s ease both" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="text-xs font-mono">{error}</span>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full relative group overflow-hidden bg-white text-black py-4 rounded-xl text-xs uppercase tracking-[0.15em] font-bold mt-4 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                  Deploying
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Deploy Workspace
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transform group-hover:translate-x-1 transition-transform">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[10px] tracking-[0.1em] text-white/20">
            By creating an account, you agree to our <br className="hidden sm:block" />
            <a href="/legal/terms" className="underline decoration-white/20 hover:text-white transition-colors">Terms of Service</a> and <a href="/legal/privacy" className="underline decoration-white/20 hover:text-white transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </main>
  );
}