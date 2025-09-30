'use client'

import { useEffect } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { type UserType, useAuth } from '@src/shared/contexts/auth-context'

import { FullPageLoader } from './loading-spinner'

interface RouteGuardProps {
  children: React.ReactNode
  allowedUserTypes?: UserType[]
  requireAuth?: boolean
  redirectTo?: string
}

export function RouteGuard({
  children,
  allowedUserTypes = ['CUSTOMER', 'AGENT'],
  requireAuth = true,
  redirectTo = '/login',
}: RouteGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    // Redirect if authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo)
      return
    }

    // Redirect if user type is not allowed
    if (isAuthenticated && user && !allowedUserTypes.includes(user.userType)) {
      // Redirect to appropriate dashboard based on user type
      const dashboardRoute =
        user.userType === 'AGENT' ? '/agent/customers' : '/customer/products'
      router.push(dashboardRoute)
      return
    }
  }, [
    user,
    isLoading,
    isAuthenticated,
    allowedUserTypes,
    requireAuth,
    redirectTo,
    router,
  ])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/20">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 animate-pulse">
            <Image
              src="/images/logo.png"
              alt="InfiniteX Logo"
              width={80}
              height={80}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // Show nothing if user type is not allowed
  if (isAuthenticated && user && !allowedUserTypes.includes(user.userType)) {
    return null
  }

  return <>{children}</>
}

// Convenience components for specific user types
export function CustomerRoute({ children }: { children: React.ReactNode }) {
  return <RouteGuard allowedUserTypes={['CUSTOMER']}>{children}</RouteGuard>
}

export function AgentRoute({ children }: { children: React.ReactNode }) {
  return <RouteGuard allowedUserTypes={['AGENT']}>{children}</RouteGuard>
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  return <RouteGuard requireAuth={false}>{children}</RouteGuard>
}
