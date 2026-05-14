import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';
import { UI_SESSION_COOKIE, UI_SESSION_JWT_TYP } from '@/lib/auth-constants';

const UI_SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

function accessSecret(): Uint8Array | null {
  const s = process.env.JWT_ACCESS_SECRET;
  if (!s) return null;
  return new TextEncoder().encode(s);
}

function uiSigningSecret(): Uint8Array | null {
  const s = process.env.SMS_UI_SESSION_SECRET ?? process.env.JWT_ACCESS_SECRET;
  if (!s) return null;
  return new TextEncoder().encode(s);
}

export async function POST(req: NextRequest) {
  const acc = accessSecret();
  const ui = uiSigningSecret();
  if (!acc || !ui) {
    return NextResponse.json({ error: 'Missing JWT_ACCESS_SECRET (and optional SMS_UI_SESSION_SECRET)' }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const accessToken =
    body && typeof body === 'object' && 'accessToken' in body && typeof (body as { accessToken: unknown }).accessToken === 'string'
      ? (body as { accessToken: string }).accessToken
      : null;
  if (!accessToken) {
    return NextResponse.json({ error: 'Missing accessToken' }, { status: 400 });
  }

  let sub = '';
  try {
    const { payload } = await jwtVerify(accessToken, acc);
    sub = typeof payload.sub === 'string' ? payload.sub : '';
  } catch {
    return NextResponse.json({ error: 'Invalid access token' }, { status: 401 });
  }

  const now = Math.floor(Date.now() / 1000);
  const sessionJwt = await new SignJWT({ typ: UI_SESSION_JWT_TYP, sub })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + UI_SESSION_MAX_AGE_SEC)
    .sign(ui);

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: UI_SESSION_COOKIE,
    value: sessionJwt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: UI_SESSION_MAX_AGE_SEC,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: UI_SESSION_COOKIE,
    value: '',
    path: '/',
    maxAge: 0,
  });
  return res;
}
