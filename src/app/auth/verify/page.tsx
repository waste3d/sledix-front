"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { apiRequest } from "../../../lib/api";

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

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("В ссылке нет токена подтверждения.");
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
      setErrorMsg(err.message || "Недействительный или просроченный токен.");
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
            <h1 className="font-display text-2xl font-bold mb-2 tracking-tight">Проверяем ссылку…</h1>
            <p className="text-white/30 text-sm font-light font-mono">Подключаем ваше пространство</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center w-full animate-in zoom-in-95 fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2 tracking-tight">Почта подтверждена</h1>
            <p className="text-white/30 text-sm font-light mb-8">Аккаунт полностью активирован.</p>
            
            <button disabled className="w-full bg-white text-[#080809] py-4 rounded-xl text-[11px] tracking-[0.18em] uppercase font-bold font-mono opacity-80 flex items-center justify-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#080809] animate-pulse" />
              Переход…
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center w-full animate-in zoom-in-95 fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-[#f87171]/10 border border-[#f87171]/20 flex items-center justify-center mb-6">
              <XCircle className="w-8 h-8 text-[#f87171]" />
            </div>
            <h1 className="font-display text-2xl font-bold mb-2 tracking-tight">Не удалось подтвердить</h1>
            <p className="text-[#f87171]/70 text-xs font-mono mb-8 bg-[#f87171]/5 border border-[#f87171]/10 px-4 py-3 rounded-lg w-full">
              {errorMsg}
            </p>
            
            <Link href="/auth/login" className="w-full bg-white/[0.05] border border-white/10 text-white hover:text-black py-4 rounded-xl text-[11px] tracking-[0.18em] uppercase font-bold hover:bg-white transition-colors font-mono block">
              Вернуться ко входу
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