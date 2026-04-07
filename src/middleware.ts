import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Проверяем наличие refresh_token в куках (ты его ставишь в Go как HttpOnly)
  const token = request.cookies.get('refresh_token')?.value

  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')

  if (isDashboardPage) {
    if (!token) {
      // Если токена нет, СРАЗУ редиректим на логин. Браузер даже не начнет рендерить дашборд.
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
  
}

export const config = {
  matcher: ['/dashboard/:path*'],
}