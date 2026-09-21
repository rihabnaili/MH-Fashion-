import { NextRequest, NextResponse } from 'next/server';

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from '@/lib/adminSession';

export const dynamic = 'force-dynamic';

// Basic in-memory brute-force protection (per server instance).
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const failedAttempts = new Map<string, { count: number; firstAttemptAt: number }>();

function getClientIp(request: NextRequest) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.ip || 'unknown';
}

function isRateLimited(ip: string) {
  const entry = failedAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    failedAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip: string) {
  const entry = failedAttempts.get(ip);
  if (!entry || Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    failedAttempts.set(ip, { count: 1, firstAttemptAt: Date.now() });
  } else {
    entry.count += 1;
  }
}

// GET - Is the current browser logged in as admin?
export async function GET(request: NextRequest) {
  const authenticated = await verifyAdminSessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  );
  return NextResponse.json({ success: true, authenticated });
}

// POST - Log in with the admin password
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { success: false, message: 'Trop de tentatives. Réessayez plus tard.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);

  if (!(await verifyAdminPassword(body?.password))) {
    recordFailure(ip);
    return NextResponse.json(
      { success: false, message: 'Mot de passe incorrect' },
      { status: 401 }
    );
  }

  failedAttempts.delete(ip);

  const response = NextResponse.json({ success: true, authenticated: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

// DELETE - Log out
export async function DELETE() {
  const response = NextResponse.json({ success: true, authenticated: false });
  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
