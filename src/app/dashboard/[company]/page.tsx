// app/dashboard/[company]/page.tsx
"use client";

import { apiRequest } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const companySlug = params.company as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        router.push("/auth/login");
        return;
      }

      try {
        // Используем твой хелпер apiRequest
        // Он сам подставит https://api.sledix.tech и вытащит поле .data
        const data = await apiRequest(`/api/dashboard/${companySlug}`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log("Доступ разрешен для:", data.company);
        setIsLoading(false);
      } catch (err: any) {
        // Если apiRequest выкинет ошибку (например 403), мы попадем сюда
        console.error("Dashboard error:", err);
        setError(err.message === "Forbidden" ? "У вас нет доступа к этой компании." : err.message);
      }
    };

    if (companySlug) checkAccess();
  }, [companySlug, router]);

  if (error) return <div className="p-10 text-red-500 font-bold text-center">{error}</div>;
  if (isLoading) return <div className="p-10 text-center">Загрузка дашборда {companySlug}...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Шапка дашборда */}
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Дашборд: {companySlug}</h1>
          <p className="text-gray-500 text-sm">Добро пожаловать в панель управления вашей компанией</p>
        </div>
        <div className="flex gap-4">
            <button className="px-4 py-2 bg-white border rounded-lg shadow-sm text-sm">Настройки</button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm text-sm">Добавить данные</button>
        </div>
      </header>

      {/* Сетка пустого дашборда (Заглушки) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-gray-100 rounded-full mb-4 animate-pulse" />
            <div className="h-4 w-24 bg-gray-100 rounded mb-2 animate-pulse" />
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Центральный пустой блок */}
      <div className="mt-10 border-2 border-dashed border-gray-200 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
        <div className="text-5xl mb-4">📊</div>
        <h2 className="text-xl font-medium text-gray-700">Здесь пока пусто</h2>
        <p className="text-gray-400 max-w-xs mx-auto mt-2">
            Подключите источники данных, чтобы увидеть аналитику вашей компании.
        </p>
      </div>
    </div>
  );
}