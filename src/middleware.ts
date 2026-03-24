import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Проверяем наличие токена (упрощенно, лучше проверять куки)
  const token = request.cookies.get('refresh_token') 

  // Если пользователь лезет в дашборд без токена
  if (request.nextUrl.pathname.startsWith('/test') && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/test/:path*'],
}