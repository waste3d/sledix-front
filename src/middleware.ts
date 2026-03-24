import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('refresh_token')?.value // Берем именно .value

  // Лог для отладки (увидите в docker compose logs sledix_frontend)
  console.log("Middleware check:", request.nextUrl.pathname, "Token exists:", !!token);

  if (request.nextUrl.pathname.startsWith('/test')) {
    if (!token) {
      console.log("Redirecting to login: No token");
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/test/:path*'],
}