"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "../../../lib/api";

// Используем ваш логотип и частицы из landing page
function SledixLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <path d="M76 32 C76 20 64 14 52 18 C40 22 36 32 42 40 C48 48 68 50 74 60 C80 70 74 84 60 88 C46 92 36 84 36 74" stroke="currentColor" strokeWidth="8" strokeLinecap="square" fill="none" />
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

      // Твой apiRequest вернул payload.data, поэтому data — это { user, access_token }
      if (!data || !data.user) {
        throw new Error("Данные пользователя не найдены в ответе");
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
    <main className="min-h-screen bg-[#080809] text-white flex flex-col items-center justify-center p-6 font-sans">
      {/* Логотип */}
      <Link href="/" className="mb-12 flex items-center gap-3 group">
        <SledixLogo />
        <span className="font-display text-2xl font-bold tracking-tight">Sledix</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="border border-white/10 rounded-3xl p-8 md:p-10 bg-white/[0.02] backdrop-blur-xl">
          <h1 className="font-display text-3xl font-bold mb-2">Create account</h1>
          <p className="text-white/30 text-sm mb-8 font-light font-mono uppercase tracking-widest">Start monitoring in 5 minutes</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] block mb-2">Workspace URL</label>
              <div className="relative">
                <input
                  required
                  placeholder="my-company"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-white/30 transition-all font-mono"
                  onChange={(e) => setForm({ ...form, tenant_slug: e.target.value })}
                />
                <span className="absolute right-4 top-3.5 text-white/10 text-sm font-mono">.sledix.tech</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] block mb-2">Work Email</label>
              <input
                required
                type="email"
                placeholder="you@company.com"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-white/30 transition-all font-mono"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] block mb-2">Password</label>
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-white/30 transition-all font-mono"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-xs font-mono">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-xl font-mono text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-white/20 text-xs font-light">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-white hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}