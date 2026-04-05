"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

const SECTIONS = [
  { id: "acceptance", title: "Принятие условий" },
  { id: "description", title: "Описание сервиса" },
  { id: "responsibilities", title: "Обязанности пользователя" },
  { id: "security", title: "Безопасность аккаунта" },
  { id: "liability", title: "Ограничение ответственности" },
];

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

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);

  // Простой scroll-spy для подсветки активного пункта в меню
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans antialiased selection:bg-indigo-500/30 relative">
      
      {/* Декоративный фон шапки */}
      <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div 
          className="absolute inset-0 opacity-[0.15]"
          style={{ 
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)', 
            backgroundSize: '32px 32px',
            maskImage: 'linear-gradient(to bottom, black 10%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 10%, transparent 90%)'
          }}
        />
      </div>

      {/* Навигация */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-14 h-20 bg-[#050505]/70 backdrop-blur-xl border-b border-white/[0.05]">
        <Link href="/" className="inline-flex items-center">
          <SledixLogo size={28} />
        </Link>
        <Link href="/" className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">
          Начать
        </Link>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-32 flex flex-col md:flex-row gap-16 lg:gap-32">
        
        {/* Боковое меню (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-32">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-6 pl-4">Содержание</p>
            <nav className="flex flex-col border-l border-white/10 relative">
              {/* Индикатор активного пункта */}
              <div 
                className="absolute left-[-1px] w-[2px] bg-indigo-500 transition-all duration-300 ease-out"
                style={{ 
                  height: '32px', 
                  top: `${SECTIONS.findIndex(s => s.id === activeSection) * 44}px` 
                }}
              />
              {SECTIONS.map((section) => (
                <a 
                  key={section.id} 
                  href={`#${section.id}`}
                  className={`h-[44px] flex items-center pl-6 text-sm transition-colors duration-200 ${
                    activeSection === section.id ? "text-white font-medium" : "text-white/40 hover:text-white/80"
                  }`}
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Контент */}
        <div className="flex-1 max-w-3xl">
          <div className="mb-20" style={{ animation: "fadeUp 0.8s cubic-bezier(.16,1,.3,1) both" }}>
            <div className="inline-flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/60">Юридический документ / 01</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
              Условия использования
            </h1>
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Вступают в силу: апрель 2026</p>
          </div>

          <div className="space-y-24 text-white/70 leading-[1.8] font-light text-[15px]" style={{ animation: "fadeUp 1s cubic-bezier(.16,1,.3,1) both 0.1s" }}>
            
            <section id="acceptance" className="scroll-mt-32 group">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-mono text-indigo-400/50 bg-indigo-400/10 px-2 py-1 rounded">01</span>
                <h2 className="text-xl font-medium text-white tracking-tight">Принятие условий</h2>
              </div>
              <p className="mb-4">
                Получая доступ к Sledix ("Следикс") и пользуясь им, вы соглашаетесь с настоящими Условиями использования. Если вы с ними не согласны, не используйте платформу. Мы можем обновлять условия в любое время без предварительного уведомления. Продолжение использования платформы означает ваше согласие с актуальной редакцией.
              </p>
            </section>

            <section id="description" className="scroll-mt-32 group">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-mono text-indigo-400/50 bg-indigo-400/10 px-2 py-1 rounded">02</span>
                <h2 className="text-xl font-medium text-white tracking-tight">Описание сервиса</h2>
              </div>
              <p className="mb-4">
                Sledix — это автоматизированный центр конкурентной разведки. Сервис с помощью алгоритмов отслеживает общедоступные данные в сети. Абсолютную точность собранных данных мы не гарантируем: вёрстка сайтов, CDN и защита от ботов могут временно влиять на полноту и актуальность синхронизации.
              </p>
            </section>

            <section id="responsibilities" className="scroll-mt-32 group">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-mono text-indigo-400/50 bg-indigo-400/10 px-2 py-1 rounded">03</span>
                <h2 className="text-xl font-medium text-white tracking-tight">Обязанности пользователя</h2>
              </div>
              <p className="mb-4">
                Вы обязуетесь использовать Sledix только в законных целях и самостоятельно следить за тем, чтобы мониторинг соответствовал применимому местному и международному праву. Запрещено использовать нашу инфраструктуру для DDoS, распространения вредоносного ПО или иных действий, наносящих ущерб объектам мониторинга.
              </p>
            </section>

            <section id="security" className="scroll-mt-32 group">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-mono text-indigo-400/50 bg-indigo-400/10 px-2 py-1 rounded">04</span>
                <h2 className="text-xl font-medium text-white tracking-tight">Безопасность аккаунта</h2>
              </div>
              <p className="mb-4">
                Вы несёте ответственность за сохранность пароля доступа к Сервису и за все действия, совершённые в вашем рабочем пространстве. Мы применяем строгие правила сессий, но не отвечаем за убытки, вызванные вашей недостаточной защитой учётных данных и устройств.
              </p>
            </section>

            <section id="liability" className="scroll-mt-32 group">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-mono text-indigo-400/50 bg-indigo-400/10 px-2 py-1 rounded">05</span>
                <h2 className="text-xl font-medium text-white tracking-tight">Ограничение ответственности</h2>
              </div>
              <p className="mb-4">
                Ни при каких обстоятельствах Sledix, её руководство, сотрудники, партнёры, представители, поставщики или аффилированные лица не несут ответственности за косвенный, случайный, специальный, последующий или штрафной ущерб — в том числе за упущенную выгоду, потерю данных, деловой репутации и иные нематериальные потери — вследствие доступа к Сервису, его использования или невозможности им воспользоваться.
              </p>
            </section>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        html { scroll-behavior: smooth; }
      `}</style>
    </main>
  );
}