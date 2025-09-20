import { NextResponse } from 'next/server';

const JWT_TTL_SECONDS = Number(process.env.JWT_EXPIRES_IN_SEC ?? '180');
const REFRESH_TTL_SECONDS = Number(process.env.REFRESH_EXPIRES_IN_SEC ?? '86400');

type LoginPayload = {
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as LoginPayload;
  const email = body.email ?? 'demo@mail.com';

  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + JWT_TTL_SECONDS;
  const refreshExpiresAt = now + REFRESH_TTL_SECONDS;

  const accessToken = `demo.at.${crypto.randomUUID()}`;
  const refreshToken = `demo.rt.${crypto.randomUUID()}`;

  const response = NextResponse.json({
    user: { id: 'u1', name: 'Demo User', email },
    accessToken,
    refreshToken,
    expiresAt,
    refreshExpiresAt,
  });

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
    maxAge: REFRESH_TTL_SECONDS,
  });

  return response;
}
