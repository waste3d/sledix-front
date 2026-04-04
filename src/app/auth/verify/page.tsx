"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { apiRequest } from "../../../lib/api"; // Твой путь до api.ts

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

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("No verification token found in URL.");
      return;
    }


const verifyToken = async () => {
    try {
      const data = await apiRequest("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({ token }),
      });
      
      // 1. Сохраняем токен (теперь юзер сразу авторизован)
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }
      
      setStatus("success");
      
      // 2. Редиректим на персональный дашборд через 2 секунды
      setTimeout(() => {
        if (data.user?.tenant_slug) {
          router.push(`/dashboard/${data.user.tenant_slug}`);
        } else {
          router.push("/auth/login");
        }
      }, 2000);
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Invalid or expired token.");
    }
  };

    verifyToken();
  }, [token, router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-24">
      <div 
        className="w-full max-w-[400px] border border-white/10 rounded-3xl p-10 bg-white/[0.02] backdrop-blur-xl text-center flex flex-col items-center"
        style={{ animation: "fadeUp 0.7s cubic-bezier(.16,1,.3,1) both" }}
      >
        
        {status === "loading" && (
          <div className="flex flex-col items-center animate-in fade-in duration-500">
            <Loader2 className="w-10 h-10 text-white/20 animate-spin mb-6" />
            <h1 className="font-display text-2xl font-bold mb-2 tracking-tight">Verifying link...</h1>
            <p className="text-white/30 text-sm font-light font-mono">Securing your workspace</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center w-full animate-in zoom-in-95 fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2 tracking-tight">Email verified.</h1>
            <p className="text-white/30 text-sm font-light mb-8">Your account is fully activated.</p>
            
            <button disabled className="w-full bg-white text-[#080809] py-4 rounded-xl text-[11px] tracking-[0.18em] uppercase font-bold font-mono opacity-80 flex items-center justify-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#080809] animate-pulse" />
              Redirecting...
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center w-full animate-in zoom-in-95 fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-[#f87171]/10 border border-[#f87171]/20 flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-[#f87171]" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2 tracking-tight">Verification failed.</h1>
            <p className="text-[#f87171]/70 text-xs font-mono mb-8 bg-[#f87171]/5 border border-[#f87171]/10 px-4 py-3 rounded-lg w-full">
              {errorMsg}
            </p>
            
            <Link href="/auth/login" className="w-full bg-white/[0.05] border border-white/10 text-white hover:text-black py-4 rounded-xl text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-white transition-colors font-mono block">
              Back to Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

// Оборачиваем в Suspense, потому что используем useSearchParams
export default function VerifyEmailPage() {
  return (
    <main className="min-h-screen bg-[#080809] text-white font-sans antialiased selection:bg-white/10 flex flex-col items-center">
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-center h-24">
        <Link href="/" className="flex items-center gap-2.5 group opacity-50 hover:opacity-100 transition-opacity">
          <SledixLogo size={28} />
          <span className="font-display text-sm font-bold tracking-tight">Sledix</span>
        </Link>
      </nav>

      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white/20" /></div>}>
        <VerifyEmailContent />
      </Suspense>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}