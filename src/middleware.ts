import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { UI_SESSION_COOKIE, UI_SESSION_JWT_TYP } from '@/lib/auth-constants';
import { removeSensitiveAuthQueryParams } from '@/lib/sanitize-auth-url';

const LEGACY_AUTH_COOKIE = 'sms_authenticated';

function uiSigningSecretBytes(): Uint8Array | null {
  const s = process.env.SMS_UI_SESSION_SECRET ?? process.env.JWT_ACCESS_SECRET;
  if (!s) return null;
  return new TextEncoder().encode(s);
}

async function isUiSessionValid(request: NextRequest): Promise<boolean> {
  const secret = uiSigningSecretBytes();
  const raw = request.cookies.get(UI_SESSION_COOKIE)?.value;
  if (secret && raw) {
    try {
      const { payload } = await jwtVerify(raw, secret);
      return payload.typ === UI_SESSION_JWT_TYP;
    } catch {
      return false;
    }
  }
  if (secret) {
    return false;
  }
  return request.cookies.get(LEGACY_AUTH_COOKIE)?.value === '1';
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-School-Id');
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200 });
    }
    return response;
  }

  const path = request.nextUrl.pathname;
  if ((path === '/login' || path === '/register') && request.method === 'GET') {
    const clean = request.nextUrl.clone();
    if (removeSensitiveAuthQueryParams(clean, path)) {
      return NextResponse.redirect(clean);
    }
  }

  const authed = await isUiSessionValid(request);

  if ((path.startsWith('/dashboard') || path.startsWith('/admin')) && !authed) {
    const login = new URL('/login', request.url);
    login.searchParams.set('from', path);
    return NextResponse.redirect(login);
  }

  if ((path === '/login' || path === '/register') && authed) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/api/:path*',
  ],
};
