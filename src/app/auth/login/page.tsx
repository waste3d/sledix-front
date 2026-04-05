"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "../../../lib/api";

function SledixLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 676 584"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <g 
        transform="translate(0, 584) scale(0.1, -0.1)" 
        fill="white" 
        stroke="none"
      >
        <path d="M 2970 5165 c161 -51 273 -146 343 -292 l42 -88 0 -120 c-1 -107 -4
          -127 -27 -182 -54 -128 -110 -190 -259 -289 -115 -77 -185 -148 -231 -235
          l-33 -64 0 -160 c0 -156 1 -162 29 -218 41 -84 129 -173 248 -251 116 -76 184
          -148 228 -241 51 -108 62 -214 35 -319 -50 -190 -200 -341 -385 -387 -83 -21
          -496 -17 -613 5 -505 97 -919 440 -1102 914 -19 51 -47 141 -62 200 -23 94
          -26 128 -26 277 0 94 5 206 12 250 86 559 531 1047 1081 1184 132 33 218 40
          450 37 171 -3 226 -7 270 -21z m2597 11 c4 -4 -217 -230 -492 -502 l-500 -493
          -370 0 c-413 -1 -466 5 -562 60 -75 43 -161 131 -200 204 -56 107 -67 265 -26
          390 39 120 148 242 272 303 l75 37 170 6 c264 9 1623 5 1633 -5z m-1137 -1889
          c186 -44 350 -117 520 -230 95 -64 300 -269 368 -369 107 -158 188 -353 229
          -553 25 -125 25 -416 -1 -533 -72 -337 -260 -635 -533 -849 -202 -158 -452
          -261 -710 -293 -109 -14 -421 -14 -493 0 -190 35 -376 216 -410 399 -31 165
          23 351 132 460 27 27 88 75 134 107 197 133 284 277 284 467 0 185 -77 299
          -312 464 -121 86 -149 114 -191 198 -43 86 -61 163 -61 260 0 78 4 99 31 162
          61 143 135 223 273 293 94 48 109 50 380 46 228 -4 266 -7 360 -29z m-1425
          -1858 c184 -81 300 -212 341 -385 27 -118 1 -241 -78 -362 -52 -80 -122 -142
          -218 -191 l-75 -39 -932 -4 c-830 -3 -930 -2 -923 12 9 17 558 561 835 828
          l180 174 410 -6 c395 -5 412 -6 460 -27z" />
      </g>
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let telegramId = null;
    if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
      telegramId = (window as any).Telegram.WebApp.initDataUnsafe?.user?.id;
    }

    try {
      const data = await apiRequest("/api/auth/login", { 
        method: "POST",
        body: JSON.stringify({ ...form, telegram_id: telegramId }),
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
      
      {/* ================= ЛЕВАЯ ЧАСТЬ (ВИЗУАЛ - ЕДИНЫЙ С РЕГИСТРАЦИЕЙ СТИЛЬ) ================= */}
      <div className="relative hidden lg:flex lg:w-[45%] flex-col justify-between overflow-hidden bg-[#020205] border-r border-white/5 p-14">
        
        {/* Абстрактный технологичный фон: Матрица развертывания */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div 
            className="absolute inset-0 opacity-[0.2]"
            style={{ 
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)', 
              backgroundSize: '32px 32px',
              backgroundPosition: '0 0'
            }}
          />
          <div 
            className="absolute inset-0 opacity-[0.03]" 
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 10px)' }} 
          />
          {/* Свечения: Индиго и Фуксия */}
          <div className="absolute top-[-10%] right-[-20%] w-[600px] h-[600px] bg-indigo-600/15 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 blur-[130px] rounded-full" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020205] via-transparent to-transparent opacity-80" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <SledixLogo size={36} />
          </Link>
        </div>

        <div className="relative z-10 mb-8" style={{ animation: "fadeUp 1s ease-out both" }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-400">System Online</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-medium tracking-tight leading-[1.1] mb-6">
            Competitive <br />
            <span className="text-white/40">Intelligence Hub</span>
          </h2>
          <p className="text-white/30 text-sm font-light max-w-sm leading-relaxed">
            Monitor competitors, analyze pricing changes, and track structural shifts in real-time.
          </p>
        </div>
      </div>

      {/* ================= ПРАВАЯ ЧАСТЬ (ФОРМА) ================= */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-16 md:px-24 lg:px-32 relative bg-[#060608]">
        
        <div className="absolute top-8 left-6 right-6 flex items-center justify-between lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <SledixLogo size={24} />
          </Link>
          <Link href="/auth/register" className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors">
            Register
          </Link>
        </div>

        <div className="absolute top-10 right-12 hidden lg:block">
          <p className="text-xs text-white/40 font-light">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-white hover:text-indigo-400 transition-colors font-medium">
              Create workspace
            </Link>
          </p>
        </div>

        <div className="w-full max-w-[420px] mx-auto" style={{ animation: "fadeUp 0.6s cubic-bezier(.16,1,.3,1) both" }}>
          
          <div className="mb-10">
            <h1 className="font-display text-3xl font-medium tracking-tight mb-2">Welcome back</h1>
            <p className="text-white/40 text-sm font-light">Enter your credentials to access the hub.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-2 group">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono transition-colors group-focus-within:text-white/80">
                Email Address
              </label>
              <input
                required
                type="email"
                placeholder="name@company.com"
                className="w-full bg-transparent border-b border-white/10 px-0 py-3 text-base text-white outline-none placeholder-white/20 focus:border-white transition-colors font-light"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2 group relative">
              <div className="flex justify-between items-end">
                <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono transition-colors group-focus-within:text-white/80">
                  Password
                </label>
                <Link href="/auth/reset" className="text-[10px] text-white/30 hover:text-white transition-colors">
                  Forgot?
                </Link>
              </div>
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
                  Authenticating
                </span>
              ) : (
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Sign In
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transform group-hover:translate-x-1 transition-transform">
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </button>
          </form>
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