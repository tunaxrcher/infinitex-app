'use client'

import type React from 'react'
import { Suspense } from 'react'

import ErrorBoundary from '@src/shared/components/error-boundary'
import { FullPageLoader } from '@src/shared/components/loading-spinner'
import { ThemeProvider } from '@src/shared/components/theme-provider'
import { AuthProvider } from '@src/shared/contexts/auth-context'
import { SessionProvider } from '@src/shared/providers/session-provider'
import { Toaster } from 'react-hot-toast'

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<FullPageLoader />}>
          <SessionProvider>
            <AuthProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange>
                <div className="mobile-container">{children}</div>
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: 'hsl(var(--background))',
                      color: 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--border))',
                    },
                  }}
                />
              </ThemeProvider>
            </AuthProvider>
          </SessionProvider>
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
