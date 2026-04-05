"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";

const SECTIONS = [
  { id: "acceptance", title: "Acceptance of Terms" },
  { id: "description", title: "Description of Service" },
  { id: "responsibilities", title: "User Responsibilities" },
  { id: "security", title: "Account Security" },
  { id: "liability", title: "Limitation of Liability" },
];

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
        <Link href="/" className="font-display text-lg font-bold tracking-tight hover:text-white/80 transition-colors flex items-center gap-3">
          <svg width="24" height="24" viewBox="0 0 120 120" fill="none"><path d="M76 32 C76 20 64 14 52 18 C40 22 36 32 42 40 C48 48 68 50 74 60 C80 70 74 84 60 88 C46 92 36 84 36 74" stroke="currentColor" strokeWidth="10" strokeLinecap="square" fill="none" /></svg>
          Sledix
        </Link>
        <Link href="/auth/register" className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors">
          Get Started
        </Link>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-40 pb-32 flex flex-col md:flex-row gap-16 lg:gap-32">
        
        {/* Боковое меню (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-32">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-6 pl-4">Contents</p>
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
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/60">Legal Protocol / 01</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
              Terms of Service
            </h1>
            <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Effective Date: April 2026</p>
          </div>

          <div className="space-y-24 text-white/70 leading-[1.8] font-light text-[15px]" style={{ animation: "fadeUp 1s cubic-bezier(.16,1,.3,1) both 0.1s" }}>
            
            <section id="acceptance" className="scroll-mt-32 group">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-mono text-indigo-400/50 bg-indigo-400/10 px-2 py-1 rounded">01</span>
                <h2 className="text-xl font-medium text-white tracking-tight">Acceptance of Terms</h2>
              </div>
              <p className="mb-4">
                By accessing and using Sledix ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform. We reserve the right to update these terms at any time without prior notice. Continued use of the platform indicates your ongoing consent to any modifications.
              </p>
            </section>

            <section id="description" className="scroll-mt-32 group">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-mono text-indigo-400/50 bg-indigo-400/10 px-2 py-1 rounded">02</span>
                <h2 className="text-xl font-medium text-white tracking-tight">Description of Service</h2>
              </div>
              <p className="mb-4">
                Sledix provides an automated competitive intelligence hub. The Service uses automated algorithms to monitor publicly available data across global networks. You understand that Sledix does not guarantee the absolute accuracy of the scraped data, as third-party website structures, CDNs, and anti-bot measures may temporarily impact data synchronization.
              </p>
            </section>

            <section id="responsibilities" className="scroll-mt-32 group">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-mono text-indigo-400/50 bg-indigo-400/10 px-2 py-1 rounded">03</span>
                <h2 className="text-xl font-medium text-white tracking-tight">User Responsibilities</h2>
              </div>
              <p className="mb-4">
                You agree to use Sledix only for lawful purposes. You are solely responsible for ensuring that your monitoring activities comply with applicable local and international laws. You must not use our infrastructure to launch DDoS attacks, distribute malware, or engage in any form of cyber sabotage against the targets you monitor.
              </p>
            </section>

            <section id="security" className="scroll-mt-32 group">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-mono text-indigo-400/50 bg-indigo-400/10 px-2 py-1 rounded">04</span>
                <h2 className="text-xl font-medium text-white tracking-tight">Account Security</h2>
              </div>
              <p className="mb-4">
                You are responsible for safeguarding the cryptographic password that you use to access the Service and for any activities or actions under your workspace environment. We enforce strict session policies, but we cannot and will not be liable for any loss or damage arising from your failure to secure your endpoints.
              </p>
            </section>

            <section id="liability" className="scroll-mt-32 group">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-[10px] font-mono text-indigo-400/50 bg-indigo-400/10 px-2 py-1 rounded">05</span>
                <h2 className="text-xl font-medium text-white tracking-tight">Limitation of Liability</h2>
              </div>
              <p className="mb-4">
                In no event shall Sledix, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
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