import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only handle root path
  if (pathname !== '/') {
    return NextResponse.next();
  }

  // Get IP country from Vercel header
  const country = request.headers.get('x-vercel-ip-country') || '';

  // Determine redirect based on country
  // CN → /zh, non-CN or no header (localhost) → /zh for dev convenience
  // Only redirect to /en when we explicitly detect a non-CN country
  const redirectLang = !country || country === 'CN' ? 'zh' : 'en';

  // Redirect to the appropriate locale
  const url = request.nextUrl.clone();
  url.pathname = `/${redirectLang}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: '/',
};
