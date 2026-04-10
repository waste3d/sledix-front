"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { apiRequest } from "../../../lib/api";

const SledixLogo = () => (
  <svg width="24" height="24" viewBox="0 0 676 584" fill="white">
    <path d="M 2970 5165 c161 -51 273 -146 343 -292 l42 -88 0 -120 c-1 -107 -4 -127 -27 -182 -54 -128 -110 -190 -259 -289 -115 -77 -185 -148 -231 -235 l-33 -64 0 -160 c0 -156 1 -162 29 -218 41 -84 129 -173 248 -251 116 -76 184 -148 228 -241 51 -108 62 -214 35 -319 -50 -190 -200 -341 -385 -387 -83 -21 -496 -17 -613 5 -505 97 -919 440 -1102 914 -19 51 -47 141 -62 200 -23 94 -26 128 -26 277 0 94 5 206 12 250 86 559 531 1047 1081 1184 132 33 218 40 450 37 171 -3 226 -7 270 -21z m2597 11 c4 -4 -217 -230 -492 -502 l-500 -493 -370 0 c-413 -1 -466 5 -562 60 -75 43 -161 131 -200 204 -56 107 -67 265 -26 390 39 120 148 242 272 303 l75 37 170 6 c264 9 1623 5 1633 -5z m-1137 -1889 c186 -44 350 -117 520 -230 95 -64 300 -269 368 -369 107 -158 188 -353 229 -553 25 -125 25 -416 -1 -533 -72 -337 -260 -635 -533 -849 -202 -158 -452 -261 -710 -293 -109 -14 -421 -14 -493 0 -190 35 -376 216 -410 399 -31 165 23 351 132 460 27 27 88 75 134 107 197 133 284 277 284 467 0 185 -77 299 -312 464 -121 86 -149 114 -191 198 -43 86 -61 163 -61 260 0 78 4 99 31 162 61 143 135 223 273 293 94 48 109 50 380 46 228 -4 266 -7 360 -29z m-1425 -1858 c184 -81 300 -212 341 -385 27 -118 1 -241 -78 -362 -52 -80 -122 -142 -218 -191 l-75 -39 -932 -4 c-830 -3 -930 -2 -923 12 9 17 558 561 835 828 l180 174 410 -6 c395 -5 412 -6 460 -27z" transform="translate(0, 584) scale(0.1, -0.1)" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/api/auth/login", { 
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!data || !data.user) throw new Error("Authentication failed");
      localStorage.setItem("access_token", data.access_token);
      router.push(`/dashboard/${data.user.tenant_slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans antialiased">
      
      {/* Top Brand Block */}
      <div className="mb-20">
        <Link href="/" className="flex flex-col items-center gap-4">
          <SledixLogo />
          <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-zinc-500">Sledix Platform</span>
        </Link>
      </div>

      <div className="w-full max-w-[340px]">
        {/* Heading */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold uppercase tracking-tighter  mb-2">Вход</h1>
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Авторизация пользователя</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">Email Address</label>
            <input
              required
              type="email"
              placeholder="name@company.com"
              className="w-full bg-transparent border-b border-white/10 py-3 text-sm font-bold uppercase tracking-widest focus:border-white outline-none transition-all placeholder:text-zinc-900"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-700">Password</label>
            </div>
            <input
              required
              type="password"
              placeholder="••••••••"
              className="w-full bg-transparent border-b border-white/10 py-3 text-sm font-bold tracking-widest focus:border-white outline-none transition-all placeholder:text-zinc-900"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {error && (
            <div className="text-[9px] font-bold uppercase tracking-widest text-red-500 text-center">
              {error}
            </div>
          )}

          <div className="pt-6 space-y-8">
            <button
              disabled={loading}
              className="w-full bg-white text-black py-5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              {loading ? "ВХОД..." : "Войти"} <ArrowUpRight size={14} />
            </button>

            <div className="flex flex-col items-center gap-4">
              <Link href="/auth/register" className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 hover:text-white transition-all">
                Нет аккаунта? Создать
              </Link>
              <Link href="/auth/reset" className="text-[9px] font-bold uppercase tracking-widest text-zinc-800 hover:text-zinc-400 transition-all">
                Забыли пароль?
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Footer */}
      <div className="mt-20">
        <span className="text-[8px] font-bold uppercase tracking-[0.6em] text-zinc-900">
          Protected Access 2026
        </span>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        body { background: black; font-family: 'Inter', sans-serif; }
      `}</style>
    </main>
  );
}