import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rateLimit, rateLimitPresets } from '@/lib/rate-limit';
import { addSecurityHeaders, getClientIP } from '@/lib/security';

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/api/auth'];

// Routes with custom rate limits
const rateLimitedRoutes: Record<string, typeof rateLimitPresets.api> = {
  '/api/auth': rateLimitPresets.auth,
  '/api/register': rateLimitPresets.auth,
  '/api/upload': rateLimitPresets.upload,
  '/api/workspaces': rateLimitPresets.api,
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply security headers to all responses
  let response = NextResponse.next();
  response = addSecurityHeaders(response);

  // Check authentication for protected routes
  if (!publicRoutes.some(route => pathname.startsWith(route))) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    // Find matching rate limit config
    const limitConfig = Object.entries(rateLimitedRoutes).find(([route]) =>
      pathname.startsWith(route)
    )?.[1] || rateLimitPresets.api;

    const result = await rateLimit(request, limitConfig);

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.reset.toString());
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
