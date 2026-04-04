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

// Декоративный лейбл в стиле лендинга
function Label({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-px w-5 bg-white/20" />
      <span className="text-[10px] tracking-[0.28em] uppercase text-white/30 font-mono">{text}</span>
    </div>
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
    <main className="min-h-screen bg-[#080809] text-white font-sans antialiased selection:bg-white/10 flex flex-col">
      
      {/* Навигация */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-14 h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="text-white group-hover:text-white/80 transition-colors">
            <SledixLogo size={32} />
          </div>
          <span className="font-display text-base font-bold tracking-tight">Sledix</span>
        </Link>
        
        <Link href="/auth/login" className="text-[11px] tracking-[0.15em] uppercase text-white/40 hover:text-white transition-colors font-mono">
          Sign in
        </Link>
      </nav>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div 
          className="w-full max-w-[400px]"
          style={{ animation: "fadeUp 0.7s cubic-bezier(.16,1,.3,1) both" }}
        >
          <Label text="Early access" />
          
          <h1 className="font-display text-[clamp(2.2rem,4vw,3rem)] font-bold tracking-[-0.02em] leading-[1.05] mb-3">
            Create account.
          </h1>
          <p className="text-white/30 text-sm font-light mb-12">
            Start monitoring your competitive landscape in 5 minutes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-3">
              <label className="text-[10px] tracking-[0.25em] uppercase text-white/40 font-mono block">
                Workspace URL
              </label>
              <div className="relative flex items-center">
                <input
                  required
                  placeholder="my-company"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-5 pr-28 py-4 text-sm outline-none focus:border-white/20 transition-colors placeholder-white/15 font-mono font-light lowercase"
                  onChange={(e) => setForm({ ...form, tenant_slug: e.target.value })}
                />
                {/* pointer-events-none нужен, чтобы клик по тексту не блокировал инпут */}
                <span className="absolute right-5 text-white/20 text-xs font-mono pointer-events-none">
                  .sledix.tech
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] tracking-[0.25em] uppercase text-white/40 font-mono block">
                Work Email
              </label>
              <input
                required
                type="email"
                placeholder="you@company.com"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-sm outline-none focus:border-white/20 transition-colors placeholder-white/15 font-mono font-light"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] tracking-[0.25em] uppercase text-white/40 font-mono block">
                Password
              </label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-sm outline-none focus:border-white/20 transition-colors placeholder-white/15 font-mono font-light tracking-widest"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && (
              <div 
                className="flex items-center gap-3 border border-[#f87171]/20 bg-[#f87171]/5 rounded-xl px-5 py-4 text-sm text-[#f87171] font-light"
                style={{ animation: "slideIn 0.3s ease both" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#f87171] shrink-0" />
                <span className="font-mono text-xs">{error}</span>
              </div>
            )}

            <button
              disabled={loading}
              className="w-full mt-4 bg-white text-[#080809] px-7 py-4 rounded-xl text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-white/90 transition-colors font-mono disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
            >
              {loading ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#080809] animate-pulse" />
                  Creating...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[9px] tracking-[0.25em] uppercase text-white/15 font-mono">
            By creating an account, you agree to our Terms
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-5px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </main>
  );
}