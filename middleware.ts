import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/cards', '/transactions'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value ?? '';
  const pathname = req.nextUrl.pathname;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !token) {
    const nextValue = pathname + req.nextUrl.search;
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('next', nextValue);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/cards/:path*', '/transactions/:path*'],
};
