import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_TTL_SECONDS = Number(process.env.JWT_EXPIRES_IN_SEC ?? '180');

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!refreshToken || !refreshToken.startsWith('demo.rt.')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + JWT_TTL_SECONDS;
  const accessToken = `demo.at.${crypto.randomUUID()}`;

  const response = NextResponse.json({ accessToken, expiresAt });

  response.cookies.set({
    name: 'access_token',
    value: accessToken,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: JWT_TTL_SECONDS,
  });

  return response;
}
