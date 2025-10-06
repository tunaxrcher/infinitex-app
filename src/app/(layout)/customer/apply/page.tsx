'use client'

import { CustomerLoanApplicationFlow } from '@src/features/loan/components/customer-loan-application-flow'
import { BottomNavigation } from '@src/shared/components/bottom-navigation'
import { MobileHeader } from '@src/shared/components/mobile-header'
import { PublicRoute } from '@src/shared/components/route-guard'
import { useSession } from 'next-auth/react'

export default function CustomerApplyPage() {
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user

  return (
    <PublicRoute>
      {/* Show header and navigation only for logged-in users */}
      {isLoggedIn && (
        <MobileHeader title="ขอสินเชื่อ" showNotifications={false} />
      )}

      <main className={isLoggedIn ? 'flex-1 pb-20' : 'min-h-screen'}>
        <CustomerLoanApplicationFlow />
      </main>

      {isLoggedIn && <BottomNavigation />}
    </PublicRoute>
  )
}
