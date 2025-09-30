import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define route patterns
const customerRoutes = ['/customer']
const agentRoutes = ['/agent']
const sharedRoutes = ['/notifications', '/more', '/bills', '/payment']
const publicRoutes = ['/login', '/']

function isRouteMatch(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route))
}

function getUserFromRequest(request: NextRequest) {
  try {
    // Try to get user from localStorage (this is for demo purposes)
    // In production, you'd validate JWT tokens from cookies
    const userCookie = request.cookies.get('infinitex_user')
    if (userCookie) {
      return JSON.parse(userCookie.value)
    }

    // Fallback: check if there's user data in headers (for API calls)
    const userHeader = request.headers.get('x-user-data')
    if (userHeader) {
      return JSON.parse(userHeader)
    }

    return null
  } catch {
    return null
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next()
  }

  const user = getUserFromRequest(request)

  // Public routes - allow everyone
  if (isRouteMatch(pathname, publicRoutes)) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check user type permissions
  if (isRouteMatch(pathname, customerRoutes) && user.userType !== 'CUSTOMER') {
    // Agent trying to access customer routes - redirect to agent dashboard
    return NextResponse.redirect(new URL('/agent/customers', request.url))
  }

  if (isRouteMatch(pathname, agentRoutes) && user.userType !== 'AGENT') {
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

// Configure which routes should run the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}
