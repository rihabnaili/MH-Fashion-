import { NextRequest, NextResponse } from 'next/server';

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/adminSession';

function requiresAdmin(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/admin/')) {
    // The session endpoint handles login itself.
    return !pathname.startsWith('/api/admin/session');
  }

  if (pathname === '/api/orders') {
    // Customers may place orders; only admins may list them.
    return request.method !== 'POST';
  }

  // Reading, updating and deleting individual orders is admin-only.
  return pathname.startsWith('/api/orders/');
}

export async function middleware(request: NextRequest) {
  if (!requiresAdmin(request)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (await verifyAdminSessionToken(token)) {
    return NextResponse.next();
  }

  return NextResponse.json(
    { success: false, message: 'Unauthorized' },
    { status: 401 }
  );
}

export const config = {
  matcher: ['/api/admin/:path*', '/api/orders', '/api/orders/:path*'],
};
