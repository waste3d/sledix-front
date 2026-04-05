"use client";

/**
 * Periscope — Landing Page v3
 * Elegant corporate. Refined typography. Subtle particles.
 *
 * tailwind.config.ts → fontFamily:
 *   display: ['Syne', 'sans-serif'],
 *   sans:    ['DM Sans', 'sans-serif'],
 *   mono:    ['DM Mono', 'monospace'],
 *
 * layout.tsx:
 *   import { Syne, DM_Sans, DM_Mono } from 'next/font/google'
 *   const syne = Syne({ subsets: ['latin'], variable: '--font-display' })
 *   const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })
 *   const dmMono = DM_Mono({ weight: ['300','400'], subsets: ['latin'], variable: '--font-mono' })
 *   className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}
 */

import React, { useState, useEffect, useRef } from "react";

// ─── Translations ─────────────────────────────────────────────────────────────
type Lang = "EN" | "RU" | "ZH";

const T: Record<Lang, {
  badge: string; hero_title: string[]; hero_sub: string;
  cta: string; cta2: string; live: string;
  nav: string[]; how_badge: string; how_title: string; how_sub: string;
  steps: { n: string; title: string; body: string; items: string[] }[];
  sig_badge: string; sig_title: string; sig_sub: string;
  signals: { icon: string; title: string; desc: string }[];
  price_badge: string; price_title: string; price_sub: string;
  plans: { name: string; desc: string; features: string[]; cta: string }[];
  wait_badge: string; wait_title: string; wait_sub: string;
  wait_placeholder: string; wait_btn: string; wait_fine: string;
  early: string;
}> = {
  EN: {
    badge: "AI-native competitive intelligence",
    hero_title: ["Know every move", "your competitor", "make."],
    hero_sub: "Sledix monitors your entire competitive landscape autonomously — pricing, hiring, reviews, messaging — and delivers structured intelligence daily.",
    cta: "Get early access", cta2: "How it works",
    live: "Live signal feed",
    nav: ["Product", "Signals", "Pricing"],
    how_badge: "How it works", how_title: "Three layers.", how_sub: "One platform.",
    steps: [
      { n: "01", title: "Monitor", body: "Watches competitors 24/7 — websites, job boards, review sites, social, press. Every change is captured and scored by impact.", items: ["Website & pricing changes","Job posting intelligence","Review monitoring","PR & news signals"] },
      { n: "02", title: "Analyze", body: "Raw signals become strategic insight. Spot patterns, predict moves, understand what competitor behaviour means before it hurts you.", items: ["Pattern detection","Trend forecasting","Competitor profiling","Win/loss correlation"] },
      { n: "03", title: "Act", body: "Battle cards, daily digests, Slack alerts — intelligence delivered where your team works. Sales ready before the call.", items: ["Auto battle cards","Slack & email digests","CRM integration","Custom alert rules"] },
    ],
    sig_badge: "Signal sources", sig_title: "Nothing", sig_sub: "missed.",
    sig_desc: "Six layers of intelligence, monitored continuously. From a homepage headline change to a buried ToS update — Sledix sees it first.",
    signals: [
      { icon: "🌐", title: "Website changes", desc: "Pricing, messaging, navigation — captured the moment it changes." },
      { icon: "💼", title: "Job postings", desc: "Best leading indicator of strategy. We decode what they're building." },
      { icon: "⭐", title: "Review sites", desc: "G2, Trustpilot, App Store. Know their weakness before your prospect does." },
      { icon: "📰", title: "PR & news", desc: "Funding, partnerships, press — in real time." },
      { icon: "🐦", title: "Social signals", desc: "LinkedIn, X, Reddit. Catch the conversation before it trends." },
      { icon: "⚖️", title: "Legal & patents", desc: "ToS changes and new patents — early warning on their roadmap." },
    ],
    price_badge: "Pricing", price_title: "Simple. No surprises.", price_sub: "Peoples charges $3500/month. We don't.",
    plans: [
      { name: "Starter", desc: "For startups tracking 1–3 competitors", features: ["5 competitors","Daily digest","Website monitoring","Email alerts"], cta: "Join waitlist" },
      { name: "Growth",  desc: "For teams that need real-time edge",    features: ["20 competitors","Real-time alerts","Auto battle cards","Slack integration","Win/loss tracking"], cta: "Get started" },
      { name: "Scale",   desc: "For companies where CI is a program",   features: ["Unlimited competitors","Custom sources","CRM integration","API access","Dedicated support"], cta: "Join waitlist" },
    ],
    wait_badge: "Early access", wait_title: "First to know.", wait_sub: "Free for the first 200 users. No credit card. Founder's pricing locked forever.",
    wait_placeholder: "you@company.com", wait_btn: "Join waitlist", wait_fine: "No spam · Unsubscribe anytime",
    early: "Early access",
  },
  RU: {
    badge: "AI-разведка конкурентов",
    hero_title: ["Знай каждый шаг", "своих конкурентов", "наперёд."],
    hero_sub: "Sledix автоматически мониторит конкурентов 24/7 — цены, найм, отзывы, PR — и присылает только важные сигналы каждый день.",
    cta: "Получить доступ", cta2: "Как это работает",
    live: "Живой поток сигналов",
    nav: ["Продукт", "Сигналы", "Цены"],
    how_badge: "Как это работает", how_title: "Три уровня.", how_sub: "Одна платформа.",
    steps: [
      { n: "01", title: "Мониторинг", body: "Следит за конкурентами 24/7 — сайты, вакансии, отзывы, соцсети, пресса. Каждое изменение фиксируется и оценивается по важности.", items: ["Изменения сайта и цен","Анализ вакансий","Мониторинг отзывов","PR и новости"] },
      { n: "02", title: "Анализ", body: "Из сырых сигналов — стратегические инсайты. Замечай паттерны, предсказывай ходы конкурентов до того как это ударит по тебе.", items: ["Обнаружение паттернов","Прогнозирование трендов","Профиль конкурента","Анализ побед и потерь"] },
      { n: "03", title: "Действие", body: "Battle cards, ежедневные дайджесты, алерты в Slack — разведка там где работает твоя команда. Продажи готовы до звонка.", items: ["Авто-генерация battle cards","Дайджест на почту и Slack","Интеграция с CRM","Настраиваемые алерты"] },
    ],
    sig_badge: "Источники сигналов", sig_title: "Ничего", sig_sub: "не упустим.",
    sig_desc: "Шесть уровней разведки, непрерывный мониторинг. От изменения заголовка на сайте до правок в условиях — Sledix увидит первым.",
    signals: [
      { icon: "🌐", title: "Изменения сайта", desc: "Цены, позиционирование, навигация — фиксируем в момент изменения." },
      { icon: "💼", title: "Вакансии", desc: "Лучший индикатор стратегии. Расшифровываем что они строят." },
      { icon: "⭐", title: "Сайты отзывов", desc: "G2, Trustpilot, App Store. Знай их слабости раньше клиента." },
      { icon: "📰", title: "PR и новости", desc: "Инвестиции, партнёрства, пресса — в реальном времени." },
      { icon: "🐦", title: "Соцсети", desc: "LinkedIn, X, Reddit. Лови разговор до того как он стал трендом." },
      { icon: "⚖️", title: "Юридика и патенты", desc: "Изменения ToS и новые патенты — ранний сигнал о роадмапе." },
    ],
    price_badge: "Цены", price_title: "Просто. Без сюрпризов.", price_sub: "Crayon стоит $15 000 в год. Мы — нет.",
    plans: [
      { name: "Старт", desc: "Для стартапов, 1–3 конкурента", features: ["5 конкурентов","Ежедневный дайджест","Мониторинг сайтов","Email алерты"], cta: "В вайтлист" },
      { name: "Рост",  desc: "Для команд которым важна скорость", features: ["20 конкурентов","Алерты в реальном времени","Авто battle cards","Интеграция Slack","Анализ побед"], cta: "Начать" },
      { name: "Масштаб", desc: "Для компаний где CI — программа", features: ["Без ограничений","Кастомные источники","Интеграция CRM","API доступ","Выделенная поддержка"], cta: "В вайтлист" },
    ],
    wait_badge: "Ранний доступ", wait_title: "Узнай первым.", wait_sub: "Бесплатно для первых 200 пользователей. Без карты. Цена фаундера — навсегда.",
    wait_placeholder: "ты@компания.ru", wait_btn: "Войти в вайтлист", wait_fine: "Без спама · Отписка в любой момент",
    early: "Ранний доступ",
  },
  ZH: {
    badge: "AI竞争情报平台",
    hero_title: ["掌握竞争对手", "的每一步动态", "。"],
    hero_sub: "Sledix 全天候自动监控您的竞争对手——定价、招聘、评价、营销——每天为您推送结构化情报。",
    cta: "获取早期访问", cta2: "了解产品",
    live: "实时信号流",
    nav: ["产品", "信号", "定价"],
    how_badge: "工作原理", how_title: "三个层次。", how_sub: "一个平台。",
    steps: [
      { n: "01", title: "监控", body: "全天候监控竞争对手——网站、招聘平台、评价网站、社交媒体、新闻。每一个变化都被捕获并按影响力评分。", items: ["网站与定价变化","招聘信息分析","评价监控","PR与新闻信号"] },
      { n: "02", title: "分析", body: "将原始信号转化为战略洞察。发现规律，预测竞争对手的下一步，在威胁到来之前做好准备。", items: ["模式检测","趋势预测","竞争对手画像","胜负分析"] },
      { n: "03", title: "行动", body: "战斗卡片、每日摘要、Slack 提醒——情报送达您团队的工作场所。销售在通话前已做好准备。", items: ["自动生成战斗卡片","邮件与Slack摘要","CRM集成","自定义提醒规则"] },
    ],
    sig_badge: "信号来源", sig_title: "一个不漏", sig_sub: "。",
    sig_desc: "六层情报，持续监控。从主页标题的细微变化到隐藏在服务条款中的更新——Sledix 第一时间发现。",
    signals: [
      { icon: "🌐", title: "网站变化", desc: "定价、文案、导航——变化发生的瞬间即被捕获。" },
      { icon: "💼", title: "招聘信息", desc: "战略意图的最佳指标。我们解读他们正在构建什么。" },
      { icon: "⭐", title: "评价网站", desc: "G2、Trustpilot、App Store。在您的客户之前了解他们的弱点。" },
      { icon: "📰", title: "PR与新闻", desc: "融资、合作、新闻发布——实时推送。" },
      { icon: "🐦", title: "社交信号", desc: "LinkedIn、X、Reddit。在话题成为趋势前捕捉对话。" },
      { icon: "⚖️", title: "法律与专利", desc: "服务条款变更和新专利申请——产品路线图的早期预警。" },
    ],
    price_badge: "定价", price_title: "简单透明，无隐藏费用。", price_sub: "Crayon 每年收费 $15,000。我们不是。",
    plans: [
      { name: "入门版", desc: "适合追踪1–3个竞争对手的初创企业", features: ["5个竞争对手","每日摘要","网站监控","邮件提醒"], cta: "加入等待列表" },
      { name: "成长版", desc: "适合需要实时优势的团队", features: ["20个竞争对手","实时提醒","自动战斗卡片","Slack集成","胜负追踪"], cta: "立即开始" },
      { name: "规模版", desc: "适合将CI作为核心项目的企业", features: ["无限竞争对手","自定义来源","CRM集成","API访问","专属支持"], cta: "加入等待列表" },
    ],
    wait_badge: "早期访问", wait_title: "抢先一步。", wait_sub: "前200名用户免费。无需信用卡。创始人定价永久锁定。",
    wait_placeholder: "您的邮箱", wait_btn: "加入等待列表", wait_fine: "无垃圾邮件 · 随时取消订阅",
    early: "早期访问",
  },
} as any;


function SledixLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <path
        d="M76 32 C76 20 64 14 52 18 C40 22 36 32 42 40 C48 48 68 50 74 60 C80 70 74 84 60 88 C46 92 36 84 36 74"
        stroke="currentColor" strokeWidth="8" strokeLinecap="square" fill="none"
      />
    </svg>
  );
}

// ─── Particle Canvas ──────────────────────────────────────────────────────────
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;
    let W = 0, H = 0;
    const COUNT = 55;
    const pts: { x: number; y: number; vx: number; vy: number; r: number }[] = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < COUNT; i++) {
      pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1 + 0.3,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < COUNT; i++) {
        for (let j = i + 1; j < COUNT; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,255,255,${0.03 * (1 - d / 120)})`;
            ctx.lineWidth = 0.4;
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fill();
        pts[i].x += pts[i].vx;
        pts[i].y += pts[i].vy;
        if (pts[i].x < 0 || pts[i].x > W) pts[i].vx *= -1;
        if (pts[i].y < 0 || pts[i].y > H) pts[i].vy *= -1;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ opacity: 0.5 }} />;
}

// ─── Enhanced Background (Clean & Elegant) ──────────────────────────────────
// ─── Premium Minimal Background ──────────────────────────────────────────────
function PremiumBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#080809]">
      
      {/* 1. Ультра-тонкая светящаяся линия горизонта сверху (премиальный акцент) */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      {/* 2. Главный изумрудный свет (Spotlight) — фокус на заголовке */}
      <div 
        className="absolute top-[-30vh] left-1/2 -translate-x-1/2 w-[80vw] md:w-[60vw] h-[60vh] rounded-[100%]" 
        style={{ 
          background: 'rgba(16, 185, 129, 0.10)', 
          filter: 'blur(120px)' 
        }} 
      />

      {/* 3. Мягкий фоновый белый свет снизу-справа для придания объема */}
      <div 
        className="absolute bottom-[-20vh] right-[-10vw] w-[50vw] h-[50vh] rounded-[100%]" 
        style={{ 
          background: 'rgba(255, 255, 255, 0.03)', 
          filter: 'blur(100px)' 
        }} 
      />

      {/* 4. Элегантный диагональный блик (эффект дорогого стекла) */}
      <div className="absolute top-[-50%] left-[15%] w-[30%] h-[200%] -rotate-[35deg] bg-gradient-to-r from-transparent via-white/[0.015] to-transparent" />
      
    </div>
  );
}

// ─── Reveal ───────────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.9s cubic-bezier(.16,1,.3,1) ${delay}ms, transform 0.9s cubic-bezier(.16,1,.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Live Feed ────────────────────────────────────────────────────────────────
const SIGNALS = [
  { co: "Notion", msg: "Pricing page — removed free tier mention", tag: "PRICING", t: "2m" },
  { co: "Linear", msg: "New posting: VP of Enterprise Sales", tag: "HIRING", t: "14m" },
  { co: "Figma", msg: "12 negative G2 reviews in 24 hours", tag: "REVIEWS", t: "31m" },
  { co: "Vercel", msg: "Blog: 'Announcing AI-native infrastructure'", tag: "PRODUCT", t: "1h" },
  { co: "Stripe", msg: "Terms of Service — section 4.2 modified", tag: "LEGAL", t: "2h" },
];
const TAG_COLOR: Record<string, string> = {
  PRICING: "#f59e0b", HIRING: "#60a5fa", REVIEWS: "#f87171", PRODUCT: "#34d399", LEGAL: "#a78bfa",
};

function LiveFeed() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % SIGNALS.length), 2800);
    return () => clearInterval(t);
  }, []);
  const s = SIGNALS[idx];
  return (
    <div className="border border-white/10 rounded-2xl p-5 bg-white/[0.03] backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[9px] tracking-[0.25em] uppercase text-white/25 font-mono">Live signal feed</span>
      </div>
      <div key={idx} style={{ animation: "slideIn 0.3s ease both" }}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <span className="text-white text-sm font-medium">{s.co}</span>
            <p className="text-white/40 text-sm font-light mt-0.5 leading-snug">{s.msg}</p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
            <span className="text-[9px] font-mono font-bold tracking-widest" style={{ color: TAG_COLOR[s.tag] }}>{s.tag}</span>
            <span className="text-white/20 text-[9px] font-mono">{s.t} ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Label({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-px w-5 bg-white/20" />
      <span className="text-[10px] tracking-[0.28em] uppercase text-white/30 font-mono">{text}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PeriscopeLandingV3() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<Lang>("EN");
  const [langOpen, setLangOpen] = useState(false);
  const t = T[lang];

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <main className="bg-[#080809] text-white min-h-screen font-sans antialiased selection:bg-white/10 overflow-x-hidden relative">
      <PremiumBackground />
      <ParticleBackground />

      {/* ── NAV ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-14 h-16 transition-all duration-500 ${scrolled ? "bg-[#080809]/80 backdrop-blur-2xl border-b border-white/[0.06]" : ""}`}>
        <div className="flex items-center gap-2.5">
          <SledixLogo size={32} />
          <span className="font-display text-base font-bold tracking-tight">Sledix</span>
        </div>

        <div className="hidden md:flex items-center gap-10 text-[11px] tracking-[0.18em] uppercase text-white/30 font-mono">
          {t.nav.map((l: string, i: number) => (
            <a key={l} href={["#product","#signals","#pricing"][i]} className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>

        <div className="flex items-center gap-3">

          {/* Lang dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono tracking-widest uppercase text-white/35 hover:text-white/70 transition-colors rounded-lg hover:bg-white/[0.05]"
            >
              {lang}
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ opacity: 0.4, transform: langOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                <path d="M1 2.5L4 5.5L7 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>

            {langOpen && (
              <div className="absolute right-0 top-full mt-1.5 bg-[#0f1012] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl z-50 min-w-[80px]">
                {(["EN","RU","ZH"] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setLangOpen(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-mono tracking-widest uppercase transition-colors ${
                      lang === l ? "text-white bg-white/[0.06]" : "text-white/35 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    <span>{l}</span>
                    {lang === l && <span className="w-1 h-1 rounded-full bg-white/50" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <a href="#waitlist" className="text-[11px] tracking-[0.15em] uppercase bg-white text-[#080809] px-5 py-2.5 rounded-lg font-semibold hover:bg-white/90 transition-colors font-mono">
            {t.early}
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 min-h-screen flex flex-col justify-center px-8 md:px-14 pt-28 pb-20 max-w-[1320px] mx-auto">

        <div className="flex items-center gap-3 mb-10 w-fit"
          style={{ animation: "fadeUp 0.7s cubic-bezier(.16,1,.3,1) both" }}>
          <div className="h-px w-7 bg-white/20" />
          <span className="text-[10px] tracking-[0.28em] uppercase text-white/30 font-mono">{t.badge}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-end">
          {/* left */}
          <div>
            <h1
              className="font-display text-[clamp(3.2rem,6vw,5.5rem)] font-bold leading-[1.0] tracking-[-0.03em] mb-6"
              style={{ animation: "fadeUp 0.7s 0.07s cubic-bezier(.16,1,.3,1) both" }}
            >
              {t.hero_title[0]}<br />
              <span className="text-white/20">{t.hero_title[1]}</span><br />
              {t.hero_title[2]}
            </h1>

            <p
              className="text-white/40 text-base font-light leading-relaxed max-w-sm mb-10"
              style={{ animation: "fadeUp 0.7s 0.14s cubic-bezier(.16,1,.3,1) both" }}
            >
              Sledix monitors your entire competitive landscape autonomously — pricing, hiring, reviews, messaging — and delivers structured intelligence daily.
            </p>

            <div
              className="flex gap-3"
              style={{ animation: "fadeUp 0.7s 0.21s cubic-bezier(.16,1,.3,1) both" }}
            >
              <a href="#waitlist" className="inline-flex items-center gap-2 bg-white text-[#080809] px-6 py-3.5 rounded-xl text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-white/90 transition-colors font-mono">
                Get early access
              </a>
              <a href="#product" className="inline-flex items-center gap-2 border border-white/10 px-6 py-3.5 rounded-xl text-[11px] tracking-[0.18em] uppercase text-white/35 hover:text-white hover:border-white/20 transition-colors font-mono">
                How it works
              </a>
            </div>
          </div>

          {/* right */}
          <div
            className="flex flex-col gap-3"
            style={{ animation: "fadeUp 0.7s 0.28s cubic-bezier(.16,1,.3,1) both" }}
          >
            <LiveFeed />
            <div className="grid grid-cols-3 gap-2">
              {[
                { n: "120K+", l: "Signals / day" },
                { n: "6×", l: "Cheaper than Crayon" },
                { n: "< 5min", l: "To first insight" },
              ].map((s, i) => (
                <div key={i} className="border border-white/[0.07] rounded-xl p-4 text-center">
                  <p className="font-display text-2xl font-bold text-white mb-0.5">{s.n}</p>
                  <p className="text-[9px] tracking-widest uppercase text-white/20 font-mono">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT ── */}
      <section id="product" className="relative z-10 border-t border-white/[0.06] px-8 md:px-14 py-28 max-w-[1320px] mx-auto">
        <Reveal>
          <Label text="How it works" />
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,4rem)] font-bold tracking-[-0.02em] leading-[1.05] mb-16">
            Three layers.<br /><span className="text-white/20">One platform.</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              n: "01", title: "Monitor",
              body: "Watches competitors 24/7 — websites, job boards, review sites, social, press. Every change is captured and scored by impact.",
              items: ["Website & pricing changes", "Job posting intelligence", "Review monitoring", "PR & news signals"],
            },
            {
              n: "02", title: "Analyze",
              body: "Raw signals become strategic insight. Spot patterns, predict moves, understand what competitor behaviour means before it hurts you.",
              items: ["Pattern detection", "Trend forecasting", "Competitor profiling", "Win/loss correlation"],
            },
            {
              n: "03", title: "Act",
              body: "Battle cards, daily digests, Slack alerts — intelligence delivered where your team works. Sales ready before the call.",
              items: ["Auto battle cards", "Slack & email digests", "CRM integration", "Custom alert rules"],
            },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 80}>
              <div className="border border-white/[0.08] rounded-2xl p-8 h-full hover:border-white/15 transition-colors">
                <span className="font-mono text-[10px] text-white/15 tracking-widest block mb-6">{item.n}</span>
                <h3 className="font-display text-2xl font-bold tracking-tight mb-3">{item.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed font-light mb-7">{item.body}</p>
                <ul className="space-y-2">
                  {item.items.map(it => (
                    <li key={it} className="flex items-center gap-2.5 text-[11px] text-white/30 font-mono">
                      <span className="w-1 h-1 rounded-full bg-emerald-500/60 shrink-0" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── SIGNALS ── */}
      <section id="signals" className="relative z-10 border-t border-white/[0.06] px-8 md:px-14 py-28 max-w-[1320px] mx-auto">
        <div className="grid md:grid-cols-5 gap-16">
          <Reveal className="md:col-span-2">
            <Label text="Signal sources" />
            <h2 className="font-display text-[clamp(2.2rem,4vw,3.8rem)] font-bold tracking-tight leading-[1.05] mb-5">
              Nothing<br /><span className="text-white/20">missed.</span>
            </h2>
            <p className="text-white/30 text-sm leading-relaxed font-light">
              Six layers of intelligence, monitored continuously. From a homepage headline change to a buried ToS update — Sledix sees it first.
            </p>
          </Reveal>

          <div className="md:col-span-3 grid grid-cols-2 gap-3">
            {[
              { icon: "🌐", title: "Website changes", desc: "Pricing, messaging, navigation — captured the moment it changes." },
              { icon: "💼", title: "Job postings", desc: "Best leading indicator of strategy. We decode what they're building." },
              { icon: "⭐", title: "Review sites", desc: "G2, Trustpilot, App Store. Know their weakness before your prospect does." },
              { icon: "📰", title: "PR & news", desc: "Funding, partnerships, press — in real time." },
              { icon: "🐦", title: "Social signals", desc: "LinkedIn, X, Reddit. Catch the conversation before it trends." },
              { icon: "⚖️", title: "Legal & patents", desc: "ToS changes and new patents — early warning on their roadmap." },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className="border border-white/[0.07] rounded-xl p-5 hover:border-white/14 hover:bg-white/[0.02] transition-all h-full">
                  <span className="text-lg block mb-3">{item.icon}</span>
                  <h3 className="text-xs font-semibold text-white mb-1.5">{item.title}</h3>
                  <p className="text-white/25 text-xs leading-relaxed font-light">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="relative z-10 border-t border-white/[0.06] px-8 md:px-14 py-28 max-w-[1320px] mx-auto">
        <Reveal>
          <Label text="Pricing" />
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,4rem)] font-bold tracking-tight leading-[1.05] mb-2">
            Simple. No surprises.
          </h2>
          <p className="text-white/25 text-sm font-mono mb-14">Crayon charges $15,000/year. We don't.</p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              name: "Starter", price: "$49",
              desc: "For startups tracking 1–3 competitors",
              features: ["5 competitors", "Daily digest", "Website monitoring", "Email alerts"],
              highlight: false,
            },
            {
              name: "Growth", price: "$149",
              desc: "For teams that need real-time edge",
              features: ["20 competitors", "Real-time alerts", "Auto battle cards", "Slack integration", "Win/loss tracking"],
              highlight: true,
            },
            {
              name: "Scale", price: "$499",
              desc: "For companies where CI is a program",
              features: ["Unlimited competitors", "Custom sources", "CRM integration", "API access", "Dedicated support"],
              highlight: false,
            },
          ].map((plan, i) => (
            <Reveal key={i} delay={i * 70}>
              <div className={`rounded-2xl p-8 h-full flex flex-col ${plan.highlight ? "bg-white text-[#080809]" : "border border-white/[0.08]"}`}>
                <div className="mb-7">
                  <p className={`text-[10px] tracking-[0.25em] uppercase font-mono mb-4 ${plan.highlight ? "text-black/30" : "text-white/20"}`}>{plan.name}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="font-display text-5xl font-bold tracking-tight">{plan.price}</span>
                    <span className={`text-sm mb-1.5 font-light ${plan.highlight ? "text-black/35" : "text-white/25"}`}>/mo</span>
                  </div>
                  <p className={`text-xs font-light ${plan.highlight ? "text-black/40" : "text-white/25"}`}>{plan.desc}</p>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2.5 text-xs ${plan.highlight ? "text-black/60" : "text-white/35"}`}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2.5 6.5l2.5 2.5L10.5 3.5" stroke={plan.highlight ? "#000" : "#34d399"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#waitlist" className={`text-center py-3 rounded-xl text-[11px] tracking-[0.15em] uppercase font-mono font-medium transition-colors ${plan.highlight ? "bg-[#080809] text-white hover:bg-black/80" : "border border-white/10 text-white/35 hover:text-white hover:border-white/20"}`}>
                  {plan.highlight ? "Get started" : "Join waitlist"}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── WAITLIST ── */}
      <section id="waitlist" className="relative z-10 border-t border-white/[0.06] px-8 md:px-14 py-36 max-w-[1320px] mx-auto">
        <div className="max-w-xl">
          <Reveal>
            <Label text="Early access" />
            <h2 className="font-display text-[clamp(2.8rem,6vw,5.5rem)] font-bold tracking-[-0.02em] leading-[1.0] mb-4">
              First to know.<br /><span className="text-white/20">First to win.</span>
            </h2>
            <p className="text-white/30 text-sm font-light mb-10 max-w-sm">
              Free for the first 200 users. No credit card. Founder's pricing locked forever.
            </p>
          </Reveal>

          <Reveal delay={100}>
            {!submitted ? (
              <form onSubmit={e => { e.preventDefault(); if (email) setSubmitted(true); }} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t.wait_placeholder}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-sm outline-none focus:border-white/20 transition-colors placeholder-white/15 font-mono font-light"
                />
                <button type="submit" className="bg-white text-[#080809] px-7 py-4 rounded-xl text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-white/90 transition-colors whitespace-nowrap font-mono">
                  Join waitlist
                </button>
              </form>
            ) : (
              <div className="inline-flex items-center gap-3 border border-white/10 rounded-xl px-6 py-4 text-sm text-white/45 font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                You're on the list. We'll reach out before launch.
              </div>
            )}
            <p className="text-[9px] tracking-[0.25em] uppercase text-white/12 font-mono mt-4">No spam · Unsubscribe anytime</p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 md:px-14 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <SledixLogo size={26} />
          <span className="font-display font-bold text-sm tracking-tight">Sledix</span>
        </div>
        <a href="/legal/terms" className="text-[9px] tracking-[0.25em] uppercase text-white/15 font-mono hover:text-white transition-colors">Terms</a>
        <a href="/legal/privacy" className="text-[9px] tracking-[0.25em] uppercase text-white/15 font-mono hover:text-white transition-colors">Privacy</a>
        <span className="text-[9px] tracking-[0.25em] uppercase text-white/15 font-mono">© 2026</span>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(5px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite alternate cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </main>
  );
}