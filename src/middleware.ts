import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('refresh_token')?.value
  const { pathname } = request.nextUrl

  // 1. Лог для отладки
  console.log(`[Middleware] Путь: ${pathname}, Токен: ${token ? '✅' : '❌'}`);

  // 2. Если пользователь пытается зайти в дашборд
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      console.log("[Middleware] Редирект на логин: токен отсутствует");
      // Сохраняем URL, куда юзер хотел попасть, чтобы вернуть его после логина (callbackUrl)
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Если залогиненный пользователь лезет на страницу логина/регистрации
  if (token && (pathname === '/auth/login' || pathname === '/auth/register')) {
    // Тут в идеале нужно редиректнуть его на его же дашборд. 
    // Но так как в куке нет слага (он в JWT), можно просто пропустить или редиректнуть на корень /
    return NextResponse.next();
  }

  return NextResponse.next()
}

// ВАЖНО: Обнови matcher здесь
export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: [
    '/dashboard/:path*', // Защищаем дашборд и все вложенные пути
    '/auth/:path*'       // Можно также проверять роуты авторизации
  ],
}