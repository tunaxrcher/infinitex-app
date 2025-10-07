import { NextRequest, NextResponse } from 'next/server'

import { getToken } from 'next-auth/jwt'

// API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth', // NextAuth routes
  '/api/health', // Health check
  '/api/public', // Public endpoints
  '/api/loans/title-deed', // Title deed analysis for public loan applications
  '/api/loans/id-card', // ID card upload for public loan applications
  '/api/loans/property', // Property valuation for public loan applications
  '/api/loans/submit', // Loan submission for public applications
]

// API routes that require specific user types
const customerOnlyApiRoutes = [
  '/api/payments',
  '/api/notifications',
  '/api/profile',
]

const agentOnlyApiRoutes = ['/api/agent', '/api/customers', '/api/applications']

// API routes that both customer and agent can access
const sharedApiRoutes = []

function isRouteMatch(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route))
}

export async function apiMiddleware(
  request: NextRequest
): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Get token first (for both public and protected routes)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Allow public API routes - but still set user headers if token exists
  if (isRouteMatch(pathname, publicApiRoutes)) {
    const response = NextResponse.next()

    // If user is authenticated, add their info to headers even for public routes
    // This allows public routes to optionally use user context (e.g., agent submitting loan)
    if (token) {
      response.headers.set('x-user-id', token.id as string)
      response.headers.set('x-user-type', token.userType as string)
      response.headers.set('x-user-phone', token.phoneNumber as string)
    }

    return response
  }

  // Return 401 if not authenticated for protected routes
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    )
  }

  // Check user type permissions for specific API routes
  if (
    isRouteMatch(pathname, customerOnlyApiRoutes) &&
    token.userType !== 'CUSTOMER'
  ) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Customer access required' },
      { status: 403 }
    )
  }

  if (
    isRouteMatch(pathname, agentOnlyApiRoutes) &&
    token.userType !== 'AGENT'
  ) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Agent access required' },
      { status: 403 }
    )
  }

  // For shared routes, allow both CUSTOMER and AGENT
  if (
    isRouteMatch(pathname, sharedApiRoutes) &&
    !['CUSTOMER', 'AGENT'].includes(token.userType as string)
  ) {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Customer or Agent access required' },
      { status: 403 }
    )
  }

  // Add user info to headers for API routes to use
  const response = NextResponse.next()
  response.headers.set('x-user-id', token.id as string)
  response.headers.set('x-user-type', token.userType as string)
  response.headers.set('x-user-phone', token.phoneNumber as string)

  return response
}
