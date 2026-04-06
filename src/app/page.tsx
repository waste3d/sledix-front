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

const TAG_COLORS = {
  PRICING: "#f59e0b", HIRING: "#60a5fa", REVIEWS: "#f87171", PRODUCT: "#34d399", LEGAL: "#a78bfa",
} as const;

type FeedItem = { co: string; msg: string; tagKey: keyof typeof TAG_COLORS; tagLabel: string; time: string };
type StatItem = { n: string; l: string };

const T: Record<Lang, {
  badge: string; hero_title: string[]; hero_sub: string;
  cta: string; cta2: string; live: string;
  feed: FeedItem[];
  stats: StatItem[];
  nav: string[]; how_badge: string; how_title: string; how_sub: string;
  steps: { n: string; title: string; body: string; items: string[] }[];
  sig_badge: string; sig_title: string; sig_sub: string; sig_desc: string;
  signals: { icon: string; title: string; desc: string }[];
  price_badge: string; price_title: string; price_sub: string; price_period: string;
  plans: { name: string; price: string; desc: string; features: string[]; cta: string }[];
  wait_badge: string; wait_title: string; wait_title_sub: string; wait_sub: string;
  wait_placeholder: string; wait_btn: string; wait_fine: string; wait_success: string;
  early: string;
  footer_terms: string; footer_privacy: string;
  alert_error: string; alert_network: string;
}> = {
  EN: {
    badge: "AI-native competitive intelligence",
    hero_title: ["Know every move", "your competitor", "make."],
    hero_sub: "Sledix monitors your entire competitive landscape autonomously — pricing, hiring, reviews, messaging — and delivers structured intelligence daily.",
    cta: "Get early access", cta2: "How it works",
    live: "Live signal feed",
    feed: [
      { co: "Notion", msg: "Pricing page — removed free tier mention", tagKey: "PRICING", tagLabel: "PRICING", time: "2m ago" },
      { co: "Linear", msg: "New posting: VP of Enterprise Sales", tagKey: "HIRING", tagLabel: "HIRING", time: "14m ago" },
      { co: "Figma", msg: "12 negative G2 reviews in 24 hours", tagKey: "REVIEWS", tagLabel: "REVIEWS", time: "31m ago" },
      { co: "Vercel", msg: "Blog: 'Announcing AI-native infrastructure'", tagKey: "PRODUCT", tagLabel: "PRODUCT", time: "1h ago" },
      { co: "Stripe", msg: "Terms of Service — section 4.2 modified", tagKey: "LEGAL", tagLabel: "LEGAL", time: "2h ago" },
    ],
    stats: [
      { n: "120K+", l: "Signals / day" },
      { n: "6×", l: "Cheaper than Crayon" },
      { n: "< 5min", l: "To first insight" },
    ],
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
    price_badge: "Pricing", price_title: "Simple. No surprises.", price_sub: "Peoples charges $3500/month. We don't.", price_period: "/mo",
    plans: [
      { name: "Starter", price: "$49", desc: "For startups tracking 1–3 competitors", features: ["5 competitors","Daily digest","Website monitoring","Email alerts"], cta: "Join waitlist" },
      { name: "Growth",  price: "$149", desc: "For teams that need real-time edge",    features: ["20 competitors","Real-time alerts","Auto battle cards","Slack integration","Win/loss tracking"], cta: "Get started" },
      { name: "Scale",   price: "$499", desc: "For companies where CI is a program",   features: ["Unlimited competitors","Custom sources","CRM integration","API access","Dedicated support"], cta: "Join waitlist" },
    ],
    wait_badge: "Early access", wait_title: "First to know.", wait_title_sub: "First to win.", wait_sub: "Free for the first 200 users. No credit card. Founder's pricing locked forever.",
    wait_placeholder: "you@company.com", wait_btn: "Join waitlist", wait_fine: "No spam · Unsubscribe anytime",
    wait_success: "You're on the list. We'll reach out before launch.",
    early: "Early access",
    footer_terms: "Terms", footer_privacy: "Privacy",
    alert_error: "Something went wrong. Please try again.",
    alert_network: "Network error. Check your connection.",
  },
  RU: {
    badge: "AI-мониторинг конкурентов нового поколения",
    hero_title: ["Узнайте о каждом", "шаге ваших", "конкурентов."],
    hero_sub: "Sledix автономно мониторит всё ваше конкурентное поле — цены, найм, отзывы, позиционирование — и доставляет структурированную аналитику ежедневно.",
    cta: "Получить ранний доступ", cta2: "Как это работает",
    live: "Живой поток сигналов",
    feed: [
      { co: "Notion", msg: "Страница с ценами — убрали упоминание бесплатного тарифа", tagKey: "PRICING", tagLabel: "ЦЕНЫ", time: "2 мин назад" },
      { co: "Linear", msg: "Новая вакансия: VP Enterprise Sales", tagKey: "HIRING", tagLabel: "НАЙМ", time: "14 мин назад" },
      { co: "Figma", msg: "12 негативных отзывов на G2 за сутки", tagKey: "REVIEWS", tagLabel: "ОТЗЫВЫ", time: "31 мин назад" },
      { co: "Vercel", msg: "Блог: «AI-native infrastructure»", tagKey: "PRODUCT", tagLabel: "ПРОДУКТ", time: "1 ч назад" },
      { co: "Stripe", msg: "Условия использования — изменён пункт 4.2", tagKey: "LEGAL", tagLabel: "ПРАВО", time: "2 ч назад" },
    ],
    stats: [
      { n: "120K+", l: "Сигналов в сутки" },
      { n: "6×", l: "Дешевле аналогов" },
      { n: "< 5 мин", l: "До первого инсайта" },
    ],
    nav: ["Продукт", "Сигналы", "Цены"],
    how_badge: "Как это работает", how_title: "Несколько уровней.", how_sub: "Одна платформа.",
    steps: [
      { n: "01", title: "Мониторинг", body: "Следит за конкурентами 24/7 — сайты, вакансии, отзывы, соцсети, пресса. Каждое изменение фиксируется и оценивается по степени влияния.", items: ["Изменения цен и сайта","Разведка вакансий и найма","Мониторинг отзывов","PR и новости"] },
      { n: "02", title: "Анализ", body: "Сырые сигналы превращаются в стратегические инсайты. Находите паттерны, предсказывайте ходы и понимайте логику конкурентов раньше всех.", items: ["Обнаружение паттернов","Прогнозирование трендов","Профилирование конкурентов","Анализ причин побед/поражений"] },
      { n: "03", title: "Действие", body: "Баттл-карты, дайджесты, алерты в Slack — разведка там, где работает ваша команда. Продажи готовы к возражениям еще до звонка.", items: ["Авто-баттл-карты","Дайджесты в Slack и почту","Интеграция с CRM","Настраиваемые правила уведомлений"] },
    ],
    sig_badge: "Источники сигналов", sig_title: "Ничего", sig_sub: "не упустим.",
    sig_desc: "Шесть уровней разведки под непрерывным наблюдением. От смены заголовка на главной до правок в условиях использования — Sledix увидит это первым.",
    signals: [
      { icon: "🌐", title: "Изменения сайтов", desc: "Цены, месседжинг, навигация — фиксируем в момент изменения." },
      { icon: "💼", title: "Вакансии", desc: "Лучший индикатор стратегии. Мы расшифруем, что они строят." },
      { icon: "⭐", title: "Сайты отзывов", desc: "G2, Trustpilot, App Store. Знайте их слабые места раньше клиента." },
      { icon: "📰", title: "PR и новости", desc: "Инвестиции, партнерства, пресса — в реальном времени." },
      { icon: "🐦", title: "Соцсети", desc: "LinkedIn, X, Reddit. Перехватывайте инфоповоды до того, как они станут трендом." },
      { icon: "⚖️", title: "Право и патенты", desc: "Изменения ToS и новые патенты — раннее предупреждение о роадмапе." },
    ],
    price_badge: "Цены", price_title: "Просто. Без сюрпризов.", price_sub: "Конкуренты берут $15,000 в год. Мы — нет.", price_period: "/мес",
    plans: [
      { name: "Starter", price: "$49", desc: "Для стартапов, отслеживающих 1–3 конкурентов", features: ["5 конкурентов","Ежедневный дайджест","Мониторинг сайтов","Почтовые уведомления"], cta: "В лист ожидания" },
      { name: "Growth",  price: "$149", desc: "Для команд, которым важна скорость реакции",    features: ["20 конкурентов","Алерты в реальном времени","Авто-баттл-карты","Интеграция со Slack","Трекинг побед/поражений"], cta: "Начать сейчас" },
      { name: "Scale",   price: "$499", desc: "Для корпораций с развитой культурой CI",   features: ["Безлимитные конкуренты","Кастомные источники","Интеграция с CRM","Доступ к API","Выделенная поддержка"], cta: "В лист ожидания" },
    ],
    wait_badge: "Ранний доступ", wait_title: "Узнайте первым.", wait_title_sub: "Выиграйте первыми.", wait_sub: "Бесплатно для первых 200 пользователей. Карта не нужна. Цена основателя фиксируется навсегда.",
    wait_placeholder: "you@company.ru", wait_btn: "В лист ожидания", wait_fine: "Без спама · Отписка в один клик",
    wait_success: "Вы в списке. Напишем перед запуском.",
    early: "Ранний доступ",
    footer_terms: "Условия", footer_privacy: "Конфиденциальность",
    alert_error: "Что-то пошло не так. Попробуйте ещё раз.",
    alert_network: "Ошибка сети. Проверьте подключение.",
  },
  ZH: {
    badge: "AI竞争情报平台",
    hero_title: ["掌握竞争对手", "的每一步动态", "。"],
    hero_sub: "Sledix 全天候自动监控您的竞争对手——定价、招聘、评价、营销——每天为您推送结构化情报。",
    cta: "获取早期访问", cta2: "了解产品",
    live: "实时信号流",
    feed: [
      { co: "Notion", msg: "定价页 — 移除免费版描述", tagKey: "PRICING", tagLabel: "定价", time: "2分钟前" },
      { co: "Linear", msg: "新职位：企业销售副总裁", tagKey: "HIRING", tagLabel: "招聘", time: "14分钟前" },
      { co: "Figma", msg: "24 小时内 12 条 G2 差评", tagKey: "REVIEWS", tagLabel: "评价", time: "31分钟前" },
      { co: "Vercel", msg: "博客：宣布 AI 原生基础设施", tagKey: "PRODUCT", tagLabel: "产品", time: "1小时前" },
      { co: "Stripe", msg: "服务条款 — 第 4.2 节已修改", tagKey: "LEGAL", tagLabel: "法务", time: "2小时前" },
    ],
    stats: [
      { n: "120K+", l: "每日信号" },
      { n: "6×", l: "低于 Crayon 价格" },
      { n: "< 5分钟", l: "获得首个洞察" },
    ],
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
    price_badge: "定价", price_title: "简单透明，无隐藏费用。", price_sub: "Crayon 每年收费 $15,000。我们不是。", price_period: "/月",
    plans: [
      { name: "入门版", price: "$49", desc: "适合追踪1–3个竞争对手的初创企业", features: ["5个竞争对手","每日摘要","网站监控","邮件提醒"], cta: "加入等待列表" },
      { name: "成长版", price: "$149", desc: "适合需要实时优势的团队", features: ["20个竞争对手","实时提醒","自动战斗卡片","Slack集成","胜负追踪"], cta: "立即开始" },
      { name: "规模版", price: "$499", desc: "适合将CI作为核心项目的企业", features: ["无限竞争对手","自定义来源","CRM集成","API访问","专属支持"], cta: "加入等待列表" },
    ],
    wait_badge: "早期访问", wait_title: "抢先一步。", wait_title_sub: "领先竞品。", wait_sub: "前200名用户免费。无需信用卡。创始人定价永久锁定。",
    wait_placeholder: "您的邮箱", wait_btn: "加入等待列表", wait_fine: "无垃圾邮件 · 随时取消订阅",
    wait_success: "已加入列表。上线前我们会联系您。",
    early: "早期访问",
    footer_terms: "条款", footer_privacy: "隐私",
    alert_error: "出错了，请重试。",
    alert_network: "网络错误，请检查连接。",
  },
};


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
function LiveFeed({ live, items }: { live: string; items: FeedItem[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!items.length) return;
    const tick = setInterval(() => setIdx((p) => (p + 1) % items.length), 2800);
    return () => clearInterval(tick);
  }, [items.length]);
  const s = items[idx] ?? items[0];
  if (!s) return null;
  return (
    <div className="border border-white/10 rounded-2xl p-5 bg-white/[0.03] backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-[9px] tracking-[0.25em] uppercase text-white/25 font-mono">{live}</span>
      </div>
      <div key={idx} style={{ animation: "slideIn 0.3s ease both" }}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <span className="text-white text-sm font-medium">{s.co}</span>
            <p className="text-white/40 text-sm font-light mt-0.5 leading-snug">{s.msg}</p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
            <span className="text-[9px] font-mono font-bold tracking-widest" style={{ color: TAG_COLORS[s.tagKey] }}>{s.tagLabel}</span>
            <span className="text-white/20 text-[9px] font-mono">{s.time}</span>
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
  const [lang, setLang] = useState<Lang>("RU");
  const [langOpen, setLangOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


const handleJoinWaitlist = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!email) return;

  setIsLoading(true);

  try {
    const response = await fetch("https://formspree.io/f/mpqoongy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({email: email, language: lang, source: "Sledix Landing Page"}),
    });

    if (response.ok) {
      setSubmitted(true);
    } else {
      alert(T[lang].alert_error);
    }
  } catch (error) {
    console.error("Error submitting form:", error);
    alert(T[lang].alert_network);
  } finally {
    setIsLoading(false);
  }
};


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
              {t.hero_sub}
            </p>

            <div
              className="flex gap-3"
              style={{ animation: "fadeUp 0.7s 0.21s cubic-bezier(.16,1,.3,1) both" }}
            >
              <a href="#waitlist" className="inline-flex items-center gap-2 bg-white text-[#080809] px-6 py-3.5 rounded-xl text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-white/90 transition-colors font-mono">
                {t.cta}
              </a>
              <a href="#product" className="inline-flex items-center gap-2 border border-white/10 px-6 py-3.5 rounded-xl text-[11px] tracking-[0.18em] uppercase text-white/35 hover:text-white hover:border-white/20 transition-colors font-mono">
                {t.cta2}
              </a>
            </div>
          </div>

          {/* right */}
          <div
            className="flex flex-col gap-3"
            style={{ animation: "fadeUp 0.7s 0.28s cubic-bezier(.16,1,.3,1) both" }}
          >
            <LiveFeed live={t.live} items={t.feed} />
            <div className="grid grid-cols-3 gap-2">
              {t.stats.map((s, i) => (
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
          <Label text={t.how_badge} />
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,4rem)] font-bold tracking-[-0.02em] leading-[1.05] mb-16">
            {t.how_title}<br /><span className="text-white/20">{t.how_sub}</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4">
          {t.steps.map((item, i) => (
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
            <Label text={t.sig_badge} />
            <h2 className="font-display text-[clamp(2.2rem,4vw,3.8rem)] font-bold tracking-tight leading-[1.05] mb-5">
              {t.sig_title}<br /><span className="text-white/20">{t.sig_sub}</span>
            </h2>
            <p className="text-white/30 text-sm leading-relaxed font-light">
              {t.sig_desc}
            </p>
          </Reveal>

          <div className="md:col-span-3 grid grid-cols-2 gap-3">
            {t.signals.map((item, i) => (
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
          <Label text={t.price_badge} />
          <h2 className="font-display text-[clamp(2.2rem,4.5vw,4rem)] font-bold tracking-tight leading-[1.05] mb-2">
            {t.price_title}
          </h2>
          <p className="text-white/25 text-sm font-mono mb-14">{t.price_sub}</p>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4">
          {t.plans.map((plan, i) => {
            const highlight = i === 1;
            return (
            <Reveal key={i} delay={i * 70}>
              <div className={`rounded-2xl p-8 h-full flex flex-col ${highlight ? "bg-white text-[#080809]" : "border border-white/[0.08]"}`}>
                <div className="mb-7">
                  <p className={`text-[10px] tracking-[0.25em] uppercase font-mono mb-4 ${highlight ? "text-black/30" : "text-white/20"}`}>{plan.name}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="font-display text-5xl font-bold tracking-tight">{plan.price}</span>
                    <span className={`text-sm mb-1.5 font-light ${highlight ? "text-black/35" : "text-white/25"}`}>{t.price_period}</span>
                  </div>
                  <p className={`text-xs font-light ${highlight ? "text-black/40" : "text-white/25"}`}>{plan.desc}</p>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className={`flex items-center gap-2.5 text-xs ${highlight ? "text-black/60" : "text-white/35"}`}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2.5 6.5l2.5 2.5L10.5 3.5" stroke={highlight ? "#000" : "#34d399"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#waitlist" className={`text-center py-3 rounded-xl text-[11px] tracking-[0.15em] uppercase font-mono font-medium transition-colors ${highlight ? "bg-[#080809] text-white hover:bg-black/80" : "border border-white/10 text-white/35 hover:text-white hover:border-white/20"}`}>
                  {plan.cta}
                </a>
              </div>
            </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── WAITLIST ── */}
      <section id="waitlist" className="relative z-10 border-t border-white/[0.06] px-8 md:px-14 py-36 max-w-[1320px] mx-auto">
        <div className="max-w-xl">
          <Reveal>
            <Label text={t.wait_badge} />
            <h2 className="font-display text-[clamp(2.8rem,6vw,5.5rem)] font-bold tracking-[-0.02em] leading-[1.0] mb-4">
              {t.wait_title}<br /><span className="text-white/20">{t.wait_title_sub}</span>
            </h2>
            <p className="text-white/30 text-sm font-light mb-10 max-w-sm">
              {t.wait_sub}
            </p>
          </Reveal>

          <Reveal delay={100}>
            {!submitted ? (
              <form onSubmit={handleJoinWaitlist} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t.wait_placeholder}
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-5 py-4 text-sm outline-none focus:border-white/20 transition-colors placeholder-white/15 font-mono font-light"
                />
                <button type="submit" disabled={isLoading} className="bg-white text-[#080809] px-7 py-4 rounded-xl text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-white/90 transition-colors whitespace-nowrap font-mono disabled:opacity-60">
                  {t.wait_btn}
                </button>
              </form>
            ) : (
              <div className="inline-flex items-center gap-3 border border-white/10 rounded-xl px-6 py-4 text-sm text-white/45 font-light">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                {t.wait_success}
              </div>
            )}
            <p className="text-[9px] tracking-[0.25em] uppercase text-white/12 font-mono mt-4">{t.wait_fine}</p>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/[0.06] px-8 md:px-14 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <SledixLogo size={26} />
          <span className="font-display text-xl font-bold tracking-tight">ledix</span>

        </div>
        <a href="/legal/terms" className="text-[9px] tracking-[0.25em] uppercase text-white/15 font-mono hover:text-white transition-colors">{t.footer_terms}</a>
        <a href="/legal/privacy" className="text-[9px] tracking-[0.25em] uppercase text-white/15 font-mono hover:text-white transition-colors">{t.footer_privacy}</a>
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
