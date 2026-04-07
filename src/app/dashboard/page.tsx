"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const redirectToTenant = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      try {
        // Запрашиваем данные пользователя, чтобы узнать его tenant_slug
        const user = await apiRequest("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (user && user.tenant_slug) {
          // Перекидываем на правильный адрес
          router.replace(`/dashboard/${user.tenant_slug}`);
        } else {
          window.location.href = "/auth/login";
        }
      } catch (err) {
        localStorage.clear();
        window.location.href = "/auth/login";
      }
    };

    redirectToTenant();
  }, [router]);

  return (
    <div className="h-screen bg-[#060608] flex items-center justify-center">
      <div className="text-white/10 font-mono text-[10px] uppercase tracking-[0.5em] animate-pulse">
        Идентификация сессии...
      </div>
    </div>
  );
}