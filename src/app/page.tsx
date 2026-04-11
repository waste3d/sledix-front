"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowUpRight, Activity, ChevronRight, 
  Lock, Search, Sliders, ShieldCheck
} from "lucide-react";

// --- Translations ---
const translations = {
  RU: {
    nav: ["Продукт", "Сигналы", "Цены", "Технология"],
    hero_badge: "Разведка нового поколения",
    hero_title: "Контролируйте рынок.",
    hero_sub: "Автономный AI-мониторинг конкурентов. Цены, найм и стратегия в едином структурированном потоке.",
    cta_primary: "Ранний доступ",
    cta_secondary: "Технология",
    chart_title: "Интенсивность сигналов (24ч)",
    signals_title: "Живой поток",
    pricing_title: "Тарифы",
    methodology_title: "Методология извлечения",
methodology_sub: "От сырого кода до стратегического решения. Наш конвейер обрабатывает данные в три этапа.",
steps: [
  { n: "01", t: "Сбор", d: "Парсинг сайта, мониторинг API-ответов и многое другое" },
  { n: "02", t: "Анализ", d: "Нейросеть отсеивает шум, анализирует и классифицирует тип изменения (цена, найм, стек)." },
  { n: "03", t: "Сигнал", d: "Формирование готового инсайта и предиктивная модель." }
],
    footer_header_1: "Выйграй",
    footer_header_2: "битву конкурентов",
    about_us_button: "Узнать о нас",
    founding_member: "Статус Founding Member зафиксирован",
    features: [
      { t: "Глубокий сканер", d: "Каждое изменение кода, заголовков и навигации фиксируется мгновенно." },
      { t: "Режим стелс", d: "Ваш мониторинг остается полностью невидимым для систем защиты конкурентов." },
      { t: "Свои правила", d: "Настраивайте алерты под специфические триггеры вашего рынка." }
    ],
    scanner_title: "Горизонт событий",
    scanner_sub: "Визуальный поток рыночных данных. Мы обрабатываем миллионы изменений в секунду, чтобы вы видели только то, что имеет значение.",
    waitlist_placeholder: "your@email.com",
    waitlist_btn: "Оставить заявку",
    rights: "Sledix 2026",
    plans: [
      { n: "Starter", p: "100", feat: ["5 Конкурентов", "Дневной дайджест"] },
      { n: "Growth", p: "200", feat: ["20 Конкурентов", "Slack Real-time", "Баттл-карты"], active: true },
      { n: "Scale", p: "300", feat: ["Безлимит", "Доступ к API", "Интеграция с CRM"] }
    ]
  },
  EN: {
    nav: ["Product", "Signals", "Pricing", "Methodology"],
    hero_badge: "Next-gen Intelligence",
    hero_title: "Own the Market.",
    methodology_title: "Extraction Pipeline",
methodology_sub: "From raw code to strategic intelligence. Our engine processes data in three distinct phases.",
steps: [
  { n: "01", t: "Ingestion", d: "Parsing DOM trees, monitoring API responses, and etc." },
  { n: "02", t: "Refining", d: "AI noise reduction and classification of change types (price, HR, tech stack)." },
  { n: "03", t: "Delivery", d: "Generating actionable insights delivered via encrypted intelligence feeds." }
],
    hero_sub: "Autonomous AI monitoring of your competitors. Pricing, hiring, and strategy in a single structured feed.",
    cta_primary: "Early Access",
    cta_secondary: "Technology",
    chart_title: "Signal Intensity (24h)",
    signals_title: "Live Feed",
    pricing_title: "Pricing",
    footer_header_1: "Win the",
    footer_header_2: "COMPETITION WAR",
    founding_member: "Founding Member price fixed forever",
    features: [
      { t: "Deep Scan", d: "Every change in code, headers, and navigation is captured instantly." },
      { t: "Stealth Mode", d: "Your monitoring remains completely invisible to competitor protection systems." },
      { t: "Custom Rules", d: "Set up alerts for triggers specific to your market niche." }
    ],
    scanner_title: "Event Horizon",
    scanner_sub: "Visual stream of market data. Processing millions of changes per second to show you only what truly matters.",
    waitlist_placeholder: "your@email.com",
    about_us_button: "About us",
    waitlist_btn: "JOIN WAITLIST",
    rights: "Sledix  © 2026",
    plans: [
      { n: "Starter", p: "49", feat: ["5 Competitors", "Daily Digest"] },
      { n: "Growth", p: "149", feat: ["20 Competitors", "Real-time Slack", "Battle-cards"], active: true },
      { n: "Scale", p: "499", feat: ["Unlimited", "API Access", "CRM Integration"] }
    ]
  }
};

// --- Components ---

const SledixLogo = ({ color = "white" }) => (
  <svg width="24" height="24" viewBox="0 0 676 584" fill={color}>
    <path d="M 2970 5165 c161 -51 273 -146 343 -292 l42 -88 0 -120 c-1 -107 -4 -127 -27 -182 -54 -128 -110 -190 -259 -289 -115 -77 -185 -148 -231 -235 l-33 -64 0 -160 c0 -156 1 -162 29 -218 41 -84 129 -173 248 -251 116 -76 184 -148 228 -241 51 -108 62 -214 35 -319 -50 -190 -200 -341 -385 -387 -83 -21 -496 -17 -613 5 -505 97 -919 440 -1102 914 -19 51 -47 141 -62 200 -23 94 -26 128 -26 277 0 94 5 206 12 250 86 559 531 1047 1081 1184 132 33 218 40 450 37 171 -3 226 -7 270 -21z m2597 11 c4 -4 -217 -230 -492 -502 l-500 -493 -370 0 c-413 -1 -466 5 -562 60 -75 43 -161 131 -200 204 -56 107 -67 265 -26 390 39 120 148 242 272 303 l75 37 170 6 c264 9 1623 5 1633 -5z m-1137 -1889 c186 -44 350 -117 520 -230 95 -64 300 -269 368 -369 107 -158 -188 -353 229 -553 25 -125 25 -416 -1 -533 -72 -337 -260 -635 -533 -849 -202 -158 -452 -261 -710 -293 -109 -14 -421 -14 -493 0 -190 35 -376 216 -410 399 -31 165 23 351 132 460 27 27 88 75 134 107 197 133 284 277 284 467 0 185 -77 299 -312 464 -121 86 -149 114 -191 198 -43 86 -61 163 -61 260 0 78 4 99 31 162 61 143 135 223 273 293 94 48 109 50 380 46 228 -4 266 -7 360 -29z m-1425 -1858 c184 -81 300 -212 341 -385 27 -118 1 -241 -78 -362 -52 -80 -122 -142 -218 -191 l-75 -39 -932 -4 c-830 -3 -930 -2 -923 12 9 17 558 561 835 828 l180 174 410 -6 c395 -5 412 -6 460 -27z" transform="translate(0, 584) scale(0.1, -0.1)" />
  </svg>
);

const Chart = () => (
  <div className="w-full h-24 md:h-32 flex items-end gap-1 px-1 md:px-2">
    {[40, 60, 45, 90, 65, 80, 50, 40, 70, 85, 100, 75, 60, 55, 90, 110, 80, 60].map((h, i) => (
      <motion.div
        key={i}
        initial={{ height: 0 }}
        animate={{ height: `${h}%` }}
        transition={{ delay: i * 0.05, duration: 0.8, ease: "circOut" }}
        className="flex-1 bg-white/20 hover:bg-white/50 transition-colors rounded-t-[1px]"
      />
    ))}
  </div>
);

const SignalRow = ({ company, action, time, type }: any) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    className="grid grid-cols-2 md:grid-cols-4 py-3 md:py-4 border-b border-white/5 text-[10px] md:text-[11px] hover:bg-white/[0.02] transition-colors px-4 items-center gap-y-1"
  >
    <span className="font-bold tracking-tight uppercase">{company}</span>
    <span className="text-zinc-500 font-medium md:text-left text-right">{action}</span>
    <span className="text-zinc-600 text-[9px] md:text-[10px] font-mono">{type}</span>
    <span className="text-zinc-700 text-right font-mono">{time}</span>
  </motion.div>
);

const TICKER_ITEMS = [
  "NOTION · PRICE CHANGE ↑",
  "LINEAR · 4 NEW ROLES",
  "STRIPE · TOS UPDATE",
  "FIGMA · SERIES E SIGNAL",
  "LOOM · COPY REWRITE",
  "VERCEL · CTO CHANGE",
];

const COLUMNS = [
  {
    cat: "FINANCE",
    items: [
      { name: "NOTION", desc: "Pricing pivot detected", time: "12:04", op: 0.85 },
      { name: "STRIPE", desc: "ToS update · 3 pages", time: "10:15", op: 0.6 },
      { name: "INTERCOM", desc: "New pricing page", time: "08:50", op: 0.35 },
    ],
  },
  {
    cat: "HR · HIRING",
    items: [
      { name: "LINEAR", desc: "Enterprise sales expansion", time: "11:42 · HIGH SIGNAL", op: 1 },
      { name: "FIGMA", desc: "+12 eng roles opened", time: "09:33", op: 0.6 },
      { name: "VERCEL", desc: "CTO change detected", time: "07:12", op: 0.3 },
    ],
  },
  {
    cat: "PRODUCT",
    items: [
      { name: "LOOM", desc: "Landing copy rewrite", time: "13:01", op: 0.85 },
      { name: "CLICKUP", desc: "Nav restructure ×7", time: "11:08", op: 0.5 },
      { name: "ASANA", desc: "Feature sunset signal", time: "06:44", op: 0.3 },
    ],
  },
];

const SignalRadar = () => {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="w-full aspect-square md:aspect-[16/9] bg-black rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 relative flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-black z-10 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          <span className="text-[8px] md:text-[9px] font-mono text-white/30 uppercase tracking-[0.2em]">
            Live scan · 1,294 OBJECTS
          </span>
        </div>
        <span className="text-[8px] md:text-[9px] font-mono text-white/15">STATUS: ONLINE</span>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.04] relative overflow-y-auto md:overflow-hidden">
        {COLUMNS.map((col, ci) => (
          <div key={ci} className={`${ci === 1 ? "bg-[#050505]" : "bg-black"} p-4 md:p-4 flex flex-col gap-2.5 relative`}>
            <div className="text-[9px] font-mono text-white/20 tracking-[0.3em] mb-1 uppercase">
              {col.cat}
            </div>
            {col.items.map((item, i) => (
              <div key={i} className={i > 0 ? "border-t border-white/[0.04] pt-2" : ""}>
                <div className="text-[11px] font-bold font-mono" style={{ color: `rgba(255,255,255,${item.op})` }}>
                  {item.name}
                </div>
                <div className="text-[9px] mt-0.5" style={{ color: `rgba(255,255,255,${item.op * 0.4})` }}>
                  {item.desc}
                </div>
                <div className="text-[9px] font-mono mt-0.5" style={{ color: `rgba(255,255,255,${item.op * 0.2})` }}>
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.05] overflow-hidden py-2 bg-black shrink-0">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          className="flex gap-8 md:gap-12 whitespace-nowrap"
          style={{ width: "max-content" }}
        >
          {doubled.map((item, i) => (
            <span key={i} className="text-[8px] md:text-[9px] font-mono text-white/20 tracking-[0.15em]">
              {item}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// --- Main Page ---

export default function SledixApp() {
  const [lang, setLang] = useState<"RU" | "EN">("RU");
  const t = translations[lang];

  const navLinks = [
    { name: t.nav[0], id: "hero" },
    { name: t.nav[1], id: "signals" },
    { name: t.nav[2], id: "pricing" },
    { name: t.nav[3], id: "tech" },
  ];

  return (
    <div className="bg-black text-white min-h-screen font-sans selection:bg-white selection:text-black antialiased overflow-x-hidden">
      
      {/* Header */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <SledixLogo />
              <span className="text-xs md:text-sm font-bold uppercase tracking-tighter">Sledix</span>
            </div>
            <div className="hidden lg:flex gap-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {navLinks.map(link => (
                <a key={link.id} href={`#${link.id}`} className="hover:text-white transition-colors uppercase">
                  {link.name}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setLang(lang === "RU" ? "EN" : "RU")}
              className="text-[9px] md:text-[10px] font-mono text-zinc-500 hover:text-white border border-white/10 px-2 py-1 rounded transition-colors"
            >
              {lang}
            </button>
            <button className="bg-white text-black px-3 md:px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all">
              {t.cta_primary}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-24 md:pt-40 pb-16 md:pb-20 px-4 md:px-6 max-w-6xl mx-auto border-x border-white/5">
        <div className="max-w-3xl">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="inline-flex items-center gap-2 px-2 py-1 rounded border border-white/10 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 md:mb-8"
          >
            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
            {t.hero_badge}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-8xl font-bold tracking-tighter uppercase leading-[0.9] mb-8 md:mb-10"
          >
            {t.hero_title}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm md:text-xl text-zinc-400 font-medium max-w-lg leading-snug mb-10 md:mb-12"
          >
            {t.hero_sub}
          </motion.p>

          <div className="flex flex-col md:flex-row gap-4">
            <button className="w-full md:w-auto bg-white text-black px-8 py-4 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2">
              {t.cta_primary} <ArrowUpRight size={14} />
            </button>
            <button
              onClick={() => window.location.href = '/about'}
              className="w-full md:w-auto border border-white/30 text-white px-8 py-4 rounded-full text-[10px] md:text-[11px] font-bold uppercase tracking-widest hover:scale-105 hover:border-white transition-all flex items-center justify-center gap-2"
            >
              {t.about_us_button} <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <motion.div 
          id="signals"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 md:mt-32 border border-white/10 rounded-xl md:rounded-2xl bg-[#080808] overflow-hidden shadow-2xl"
        >
          <div className="p-4 md:p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <Activity size={14} className="text-zinc-500" />
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t.chart_title}</span>
            </div>
            <div className="flex gap-1.5">
               {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/5" />)}
            </div>
          </div>
          <div className="p-4 md:p-8">
            <Chart />
          </div>
          <div className="border-t border-white/10 overflow-x-hidden">
            <div className="bg-white/5 px-4 md:px-6 py-2 md:py-3 flex justify-between items-center">
               <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-zinc-500">{t.signals_title}</span>
            </div>
            <SignalRow company="Notion" action="Price Strategy" type="FINANCE" time="12:04" />
            <SignalRow company="Linear" action="Sales Hiring" type="HR" time="11:42" />
            <SignalRow company="Stripe" action="ToS Update" type="LEGAL" time="10:15" />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="tech" className="px-4 md:px-6 max-w-6xl mx-auto border-x border-white/5 grid grid-cols-1 md:grid-cols-3 gap-px ">
        {t.features.map((f, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-black p-8 md:p-10 py-12 md:py-20 flex flex-col gap-4 md:gap-6 group hover:bg-zinc-950 transition-colors border-b md:border-b-0 border-white/5"
          >
            {i === 0 ? <Search size={20} className="text-zinc-700 group-hover:text-white transition-colors" /> : 
             i === 1 ? <Lock size={20} className="text-zinc-700 group-hover:text-white transition-colors" /> : 
             <Sliders size={20} className="text-zinc-700 group-hover:text-white transition-colors" />}
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-widest italic">{f.t}</h3>
            <p className="text-[10px] md:text-[11px] text-zinc-500 leading-relaxed uppercase tracking-widest">{f.d}</p>
          </motion.div>
        ))}
      </section>

      {/* --- Methodology Section --- */}
<section id="methodology" className="py-20 md:py-32 px-4 md:px-6 max-w-6xl mx-auto border-x border-white/5 relative overflow-hidden">
  {/* Декоративный фон с сеткой */}
  <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
       style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

  <div className="relative z-10">
    <div className="max-w-xl mb-16 md:mb-24">
      <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter italic mb-6 leading-none">
        {t.methodology_title}
      </h2>
      <p className="text-[10px] md:text-[11px] text-zinc-500 uppercase tracking-[0.2em] leading-relaxed">
        {t.methodology_sub}
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
      {/* Линии соединения для десктопа */}
      <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2" />

      {t.steps.map((step, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2 }}
          className="relative group"
        >
          {/* Номер и круг */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-black group-hover:border-white transition-colors duration-500">
              <span className="text-[10px] font-mono text-zinc-500 group-hover:text-white transition-colors">{step.n}</span>
            </div>
            <div className="h-px flex-1 bg-white/5 md:hidden" />
          </div>

          {/* Контент */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold uppercase italic tracking-tighter text-white/90">
              {step.t}
            </h3>
            <p className="text-[10px] md:text-[11px] text-zinc-500 uppercase tracking-widest leading-relaxed min-h-[60px]">
              {step.d}
            </p>
          </div>

          {/* "Технические" параметры снизу */}
          <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-2">
            <div className="flex justify-between text-[8px] font-mono text-zinc-700">
              <span>LATENCY</span>
              <span className="text-zinc-500">1-2ms</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: `${30 + i * 30}%` }}
                 className="h-full bg-zinc-800 group-hover:bg-white transition-colors"
               />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>

  {/* Нижняя плашка в стиле мониторинга */}
  <div className="mt-20 p-4 border border-white/5 bg-white/[0.01] flex flex-wrap gap-8 items-center justify-center md:justify-between">
     <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        <span className="text-[9px] font-mono text-zinc-500 tracking-tighter">ENGINE STATUS: OPTIMIZED</span>
     </div>
  </div>
</section>

      {/* Pricing */}
     {/* Pricing Section */}
<section id="pricing" className="py-20 md:py-32 px-4 md:px-6 max-w-6xl mx-auto border-x border-white/5">
  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
    <div>
      <div className="flex items-center gap-2 mb-4">
      </div>
      <h2 className="text-4xl md:text-3xl font-bold uppercase tracking-tighter italic leading-none">
        {t.pricing_title}
      </h2>
    </div>
    <div className="flex flex-col items-end">
      <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em] px-3 py-1 border border-white/10 bg-white/5">
        {t.founding_member}
      </span>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 border-t border-white/10">
    {t.plans.map((tier, i) => (
      <motion.div 
        key={i}
        whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
        className={`relative p-8 md:p-12 flex flex-col border-b md:border-b-0 md:border-r border-white/10 last:border-r-0 transition-all duration-300 ${
          tier.active ? 'bg-white/[0.03]' : ''
        }`}
      >
        {/* Индикатор активного тарифа в стиле "системного уведомления" */}
        {tier.active && (
          <div className="absolute top-0 left-0 w-full h-[2px] bg-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        )}
        
        <div className="flex justify-between items-start mb-12">
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block mb-2">
            </span>
            <h3 className="text-2xl font-bold uppercase italic tracking-tighter">{tier.n}</h3>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-mono text-zinc-500 block">COST/MO</span>
            <span className="text-3xl font-bold tracking-tighter italic">${tier.p}</span>
          </div>
        </div>

        <div className="space-y-6 flex-grow mb-16">
          <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
            Included_Functions
          </div>
          {tier.feat.map((f, idx) => (
            <div key={idx} className="flex items-start gap-3 group">
              <div className={`mt-1 h-1 w-1 rounded-full ${tier.active ? 'bg-blue-500' : 'bg-zinc-700'}`} />
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400 group-hover:text-white transition-colors leading-tight">
                {f}
              </span>
            </div>
          ))}
        </div>

        <button className={`group relative w-full py-5 overflow-hidden transition-all ${
          tier.active 
          ? 'bg-white text-black' 
          : 'border border-white/20 text-white hover:border-white'
        }`}>
          <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em]">
            {t.cta_primary}
          </span>
          {tier.active && (
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent"
            />
          )}
        </button>
        
        {/* Декоративные элементы в углах (стиль чертежа) */}
        <div className="absolute top-2 right-2 text-[8px] font-mono text-white/5">
          {tier.active ? "SELECTED_UNIT" : "STANDBY"}
        </div>
      </motion.div>
    ))}
  </div>

  {/* Нижняя информационная панель секции */}
  <div className="mt-px grid grid-cols-1 md:grid-cols-3 border-b border-white/10 text-[8px] font-mono text-zinc-700 uppercase tracking-[0.2em] py-4 px-2">
  </div>
</section>
      {/* Live Intelligence */}
      <section className="py-16 md:py-20 px-4 md:px-6 max-w-6xl mx-auto border-x border-white/5">
        <div className="max-w-xl mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter italic mb-3 md:mb-4">{t.scanner_title}</h2>
          <p className="text-[10px] md:text-[11px] text-zinc-500 uppercase tracking-widest leading-relaxed">
            {t.scanner_sub}
          </p>
        </div>
        <SignalRadar />
      </section>

      {/* Footer */}
      <footer id="about" className="py-12 md:py-10 px-4 md:px-6 max-w-6xl mx-auto border-t border-white/5 flex flex-col items-center">
        <h2 className="text-4xl md:text-9xl font-black uppercase italic tracking-tighter text-center mb-12 md:mb-16 leading-[1]">
          {t.footer_header_1} <br /> <span className="text-zinc-800">{t.footer_header_2}.</span>
        </h2>

        <form action="https://formspree.io/f/mpqoongy" method="POST" className="w-full max-w-sm md:max-w-md flex flex-col gap-6 md:gap-8">
          <input 
            type="email" 
            name="email"
            required
            placeholder={t.waitlist_placeholder} 
            className="bg-transparent border-b border-white/10 py-4 md:py-6 text-center text-sm md:text-base font-bold uppercase focus:border-white outline-none transition-all placeholder:text-zinc-900"
          />
          <button type="submit" className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.6em] text-zinc-600 hover:text-white transition-colors">
             {t.waitlist_btn}
          </button>
        </form>

        <div className="mt-24 md:mt-48 w-full flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-[8px] md:text-[9px] font-bold text-zinc-800 uppercase tracking-[0.3em] md:tracking-[0.5em]">
           <span>{t.rights}</span>
           <div className="flex gap-8 md:gap-16">
              <a href="/legal/terms" className="hover:text-zinc-400">Security</a>
              <a href="/legal/privacy" className="hover:text-zinc-400">Privacy</a>
              <a href="#" className="hover:text-zinc-400">API</a>
           </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        html {
          scroll-behavior: smooth;
        }

        body { 
          font-family: 'Inter', sans-serif; 
          background: black;
          overflow-x: hidden;
        }

        ::-webkit-scrollbar { 
          display: none;
        }
      `}</style>
    </div>
  );
}