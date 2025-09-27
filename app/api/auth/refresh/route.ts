import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const JWT_TTL_SECONDS = Number(process.env.JWT_EXPIRES_IN_SEC ?? '180');

export async function POST() {
  const cookieStore = await cookies();
  const existingRefreshToken = cookieStore.get('refresh_token')?.value;
  const refreshToken = existingRefreshToken && existingRefreshToken.startsWith('demo.rt.')
    ? existingRefreshToken
    : `demo.rt.${crypto.randomUUID()}`;

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + JWT_TTL_SECONDS;
  const accessToken = `demo.at.${crypto.randomUUID()}`;

  const response = NextResponse.json({ accessToken, expiresAt, refreshToken });

  response.cookies.set({
    name: 'access_token',
    value: accessToken,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: JWT_TTL_SECONDS,
  });

  response.cookies.set({
    name: 'refresh_token',
    value: refreshToken,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: Number(process.env.REFRESH_EXPIRES_IN_SEC ?? '86400'),
  });

  return response;
}
