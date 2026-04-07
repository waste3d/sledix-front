"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// ─── Logo Component ──────────────────────────────────────────────────────────
function SledixLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 676 584"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <g transform="translate(0, 584) scale(0.1, -0.1)" fill="white" stroke="none">
        <path d="M 2970 5165 c161 -51 273 -146 343 -292 l42 -88 0 -120 c-1 -107 -4 -127 -27 -182 -54 -128 -110 -190 -259 -289 -115 -77 -185 -148 -231 -235 l-33 -64 0 -160 c0 -156 1 -162 29 -218 41 -84 129 -173 248 -251 116 -76 184 -148 228 -241 51 -108 62 -214 35 -319 -50 -190 -200 -341 -385 -387 -83 -21 -496 -17 -613 5 -505 97 -919 440 -1102 914 -19 51 -47 141 -62 200 -23 94 -26 128 -26 277 0 94 5 206 12 250 86 559 531 1047 1081 1184 132 33 218 40 450 37 171 -3 226 -7 270 -21z m2597 11 c4 -4 -217 -230 -492 -502 l-500 -493 -370 0 c-413 -1 -466 5 -562 60 -75 43 -161 131 -200 204 -56 107 -67 265 -26 390 39 120 148 242 272 303 l75 37 170 6 c264 9 1623 5 1633 -5z m-1137 -1889 c186 -44 350 -117 520 -230 95 -64 300 -269 368 -369 107 -158 188 -353 229 -553 25 -125 25 -416 -1 -533 -72 -337 -260 -635 -533 -849 -202 -158 -452 -261 -710 -293 -109 -14 -421 -14 -493 0 -190 35 -376 216 -410 399 -31 165 23 351 132 460 27 27 88 75 134 107 197 133 284 277 284 467 0 185 -77 299 -312 464 -121 86 -149 114 -191 198 -43 86 -61 163 -61 260 0 78 4 99 31 162 61 143 135 223 273 293 94 48 109 50 380 46 228 -4 266 -7 360 -29z m-1425 -1858 c184 -81 300 -212 341 -385 27 -118 1 -241 -78 -362 -52 -80 -122 -142 -218 -191 l-75 -39 -932 -4 c-830 -3 -930 -2 -923 12 9 17 558 561 835 828 l180 174 410 -6 c395 -5 412 -6 460 -27z" />
      </g>
    </svg>
  );
}

// ─── Label Component ─────────────────────────────────────────────────────────
function Label({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-[1px] w-6 bg-white/30" />
      <span className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-mono">{text}</span>
    </div>
  );
}

// ─── About Page ──────────────────────────────────────────────────────────────
export default function AboutPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <main className="bg-[#080809] text-white min-h-screen font-sans antialiased selection:bg-white/10 overflow-x-hidden relative">
      
      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Мягкий белый свет сверху для объема (вместо зеленого) */}
        <div 
          className="absolute top-[-25vh] left-1/2 -translate-x-1/2 w-[70vw] h-[50vh] rounded-[100%]" 
          style={{ background: 'rgba(255, 255, 255, 0.03)', filter: 'blur(100px)' }} 
        />
        {/* Тонкая сетка */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
      </div>

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-14 h-16 transition-all duration-500 ${scrolled ? "bg-[#080809]/80 backdrop-blur-2xl border-b border-white/[0.06]" : ""}`}>
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-70 transition-opacity">
          <SledixLogo size={28} />
        </Link>
        
        <div className="flex items-center gap-8">
          <Link href="/#pricing" className="text-[10px] font-mono tracking-widest uppercase text-white/40 hover:text-white transition-colors">Цены</Link>
          <Link href="/" className="text-[10px] font-mono tracking-widest uppercase text-white/40 hover:text-white transition-colors">Главная</Link>
          <Link href="/#whitelist" className="text-[10px] font-mono tracking-widest uppercase bg-white text-black px-4 py-2 rounded-lg font-bold hover:bg-white/90 transition-colors">
            Начать
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-44 pb-24 px-8 md:px-14 max-w-[1200px] mx-auto">
        <div style={{ animation: "fadeUp 0.8s cubic-bezier(.16,1,.3,1) both" }}>
          <Label text="Наша миссия" />
          <h1 className="font-display text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1.05] tracking-[-0.03em] mb-12">
            Делаем прозрачным <br />
            <span className="text-white/20">каждый шаг рынка.</span>
          </h1>
          <p className="text-white/40 text-lg md:text-xl font-light leading-relaxed max-w-2xl">
            Sledix родился из идеи, что конкурентная разведка не должна быть привилегией корпораций с миллионными бюджетами. Мы строим автономный интеллект, который дает преимущество тем, кто ценит скорость и данные.
          </p>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="relative z-10 py-24 px-8 md:px-14 max-w-[1200px] mx-auto border-t border-white/[0.06]">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { 
              title: "Автономия", 
              desc: "Мы верим в системы, которые работают сами. Пока вы спите, Sledix анализирует тысячи изменений, чтобы утром у вас был готовый отчет." 
            },
            { 
              title: "Честность", 
              desc: "Никаких скрытых платежей или сложных интеграций. Мы даем доступ к данным напрямую, без бюрократии и лишних посредников." 
            },
            { 
              title: "Скорость", 
              desc: "В мире AI задержка в день — это потеря рыночной доли. Мы доставляем сигналы в течение минут после того, как они произошли." 
            },
          ].map((v, i) => (
            <div key={i} style={{ animation: `fadeUp 0.8s cubic-bezier(.16,1,.3,1) both ${0.2 + i * 0.1}s` }}>
              <div className="text-[10px] font-mono text-white/20 mb-4">0{i+1}</div>
              <h3 className="font-display text-2xl font-bold mb-4">{v.title}</h3>
              <p className="text-white/35 text-sm leading-relaxed font-light">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM/IDENTITY ── */}
      <section className="relative z-10 py-24 px-8 md:px-14 max-w-[1200px] mx-auto border-t border-white/[0.06]">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="md:w-1/3" style={{ animation: "fadeUp 0.8s cubic-bezier(.16,1,.3,1) both" }}>
            <Label text="Команда" />
            <h2 className="font-display text-4xl font-bold tracking-tight">Люди, которые <br/> строят Sledix.</h2>
          </div>
          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-8" style={{ animation: "fadeUp 0.8s cubic-bezier(.16,1,.3,1) both 0.2s" }}>
            <div className="group">
              <div className="aspect-[4/5] bg-transparent border border-white/[0.1] rounded-2xl mb-4 overflow-hidden transition-colors duration-500 group-hover:border-white/25">
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/65">
                  <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center font-mono text-sm tracking-widest">
                    NS
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em]">Founder / CTO</div>
                </div>
              </div>
              <h4 className="font-bold text-lg leading-snug">Сороколетов Николай Артемович</h4>
              <p className="mt-2 text-white/35 text-xs font-mono uppercase tracking-widest">Co-founder & CTO</p>
            </div>
            <div className="group">
              <div className="aspect-[4/5] bg-transparent border border-white/[0.1] rounded-2xl mb-4 overflow-hidden transition-colors duration-500 group-hover:border-white/25">
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/65">
                  <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center font-mono text-sm tracking-widest">
                    NK
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em]">Product / Marketing</div>
                </div>
              </div>
              <h4 className="font-bold text-lg leading-snug">Кочетков Никита Юрьевич</h4>
              <p className="mt-2 text-white/35 text-xs font-mono uppercase tracking-widest">Co-founder & CPO</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 md:px-14 py-12">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2.5">
            <SledixLogo size={24} />
          </div>
          <div className="flex gap-8 text-[9px] tracking-[0.2em] uppercase text-white/20 font-mono">
            <Link href="/legal/terms" className="hover:text-white transition-colors">Условия</Link>
            <Link href="/legal/privacy" className="hover:text-white transition-colors">Приватность</Link>
            <span>© 2026 Sledix AI</span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}