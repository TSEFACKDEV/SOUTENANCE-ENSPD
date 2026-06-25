import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

const protectedRoutes = ['/dashboard', '/orders', '/profile', '/soutenances']
const adminRoutes = ['/admin']
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const pathname = nextUrl.pathname

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAdmin = adminRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Require auth for protected routes
  if ((isProtected || isAdmin) && !session) {
    const loginUrl = new URL('/auth/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Require ADMIN or GRAPHISTE role for admin routes
  if (isAdmin && session) {
    const role = session.user?.role
    if (role !== 'ADMIN' && role !== 'GRAPHISTE') {
      return NextResponse.redirect(new URL('/dashboard', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
}
