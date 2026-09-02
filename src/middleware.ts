import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Routes that require active membership (redirect expired founding members)
const PROTECTED_PATHS = [
  '/dashboard',
  '/search',
  '/brothers',
  '/marketplace',
  '/events',
  '/seller',
  '/profile',
  '/account',
]

// Paths always allowed (never redirect)
const ALWAYS_ALLOWED = [
  '/reactivate',
  '/login',
  '/register',
  '/api/auth',
  '/api/reactivate',
  '/_next',
  '/favicon',
  '/cmb-logo',
  '/public',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow public/auth paths
  if (ALWAYS_ALLOWED.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Only enforce on protected paths
  if (!PROTECTED_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  // Not logged in → let NextAuth handle redirect to login
  if (!token) {
    return NextResponse.next()
  }

  const now = new Date()
  const freeUntil = token.freeUntil ? new Date(token.freeUntil as string) : null
  const hasActiveSubscription = token.hasActiveSubscription as boolean

  // Founding member whose free period has expired and has no active subscription
  if (freeUntil && now > freeUntil && !hasActiveSubscription) {
    const reactivateUrl = new URL('/reactivate', req.url)
    return NextResponse.redirect(reactivateUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/search/:path*',
    '/brothers/:path*',
    '/marketplace/:path*',
    '/events/:path*',
    '/seller/:path*',
    '/profile/:path*',
    '/account/:path*',
  ],
}
