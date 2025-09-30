'use client'

import { LoanApplicationFlow } from '@src/features/loan/components/loan-application-flow'
import { BottomNavigation } from '@src/shared/components/bottom-navigation'
import { MobileHeader } from '@src/shared/components/mobile-header'
import { CustomerRoute } from '@src/shared/components/route-guard'

export default function CustomerApplyPage() {
  return (
    <CustomerRoute>
      <MobileHeader title="ขอสินเชื่อ" showNotifications={false} />
      <main className="flex-1 pb-20">
        <LoanApplicationFlow />
      </main>
      <BottomNavigation />
    </CustomerRoute>
  )
}
