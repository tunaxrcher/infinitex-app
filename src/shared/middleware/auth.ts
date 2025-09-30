import { NextRequest, NextResponse } from 'next/server'

import { getToken } from 'next-auth/jwt'

// Define route patterns
const customerRoutes = ['/customer']
const agentRoutes = ['/agent']
const sharedRoutes = ['/', '/notifications', '/more', '/bills', '/payment']
const publicRoutes = ['/login', '/about', '/contact']

function isRouteMatch(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route))
}

export async function authMiddleware(
  request: NextRequest
): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') // Static files like .css, .js, .ico
  ) {
    return NextResponse.next()
  }

  // Public routes - allow everyone
  if (isRouteMatch(pathname, publicRoutes)) {
    return NextResponse.next()
  }

  // Get token from NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check user type permissions
  if (isRouteMatch(pathname, customerRoutes) && token.userType !== 'CUSTOMER') {
    // Agent trying to access customer routes - redirect to agent dashboard
    return NextResponse.redirect(new URL('/agent/customers', request.url))
  }

  if (isRouteMatch(pathname, agentRoutes) && token.userType !== 'AGENT') {
    // Customer trying to access agent routes - redirect to customer dashboard
    return NextResponse.redirect(new URL('/customer/products', request.url))
  }

  // Shared routes - allow all authenticated users
  if (isRouteMatch(pathname, sharedRoutes)) {
    return NextResponse.next()
  }

  // Default: allow the request
  return NextResponse.next()
}
