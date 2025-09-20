// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protegemos /dashboard, /cards y /transactions.
// Si no hay cookie "access_token", redirigimos a /login?next=<ruta original>
export function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;

  const isProtected =
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/cards') ||
    req.nextUrl.pathname.startsWith('/transactions');

  if (isProtected && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/cards/:path*', '/transactions/:path*'],
};
