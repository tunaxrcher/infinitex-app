'use client'

import type React from 'react'
import { Suspense } from 'react'

import { useSearchParams } from 'next/navigation'

import ErrorBoundary from '@src/shared/components/error-boundary'
import { FullPageLoader } from '@src/shared/components/loading-spinner'
import { ThemeProvider } from '@src/shared/components/theme-provider'
import { AuthProvider } from '@src/shared/contexts/auth-context'

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const searchParams = useSearchParams()

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<FullPageLoader />}>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange>
              <div className="mobile-container">{children}</div>
            </ThemeProvider>
          </AuthProvider>
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
