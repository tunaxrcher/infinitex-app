import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// API routes that don't require authentication
const publicApiRoutes = [
  '/api/auth',      // NextAuth routes
  '/api/health',    // Health check
  '/api/public',    // Public endpoints
]

// API routes that require specific user types
const customerApiRoutes = [
  '/api/loans',
  '/api/payments', 
  '/api/notifications',
  '/api/profile',
]

const agentApiRoutes = [
  '/api/agent',
  '/api/customers',
  '/api/applications',
]

function isRouteMatch(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route))
}

export async function apiMiddleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  // Allow public API routes
  if (isRouteMatch(pathname, publicApiRoutes)) {
    return NextResponse.next()
  }

  // Get token for protected API routes
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  // Return 401 if not authenticated
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    )
  }

  // Check user type permissions for specific API routes
  if (isRouteMatch(pathname, customerApiRoutes) && token.userType !== 'CUSTOMER') {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Customer access required' },
      { status: 403 }
    )
  }

  if (isRouteMatch(pathname, agentApiRoutes) && token.userType !== 'AGENT') {
    return NextResponse.json(
      { error: 'Forbidden', message: 'Agent access required' },
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
