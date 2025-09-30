'use client'

import { AgentLoanApplicationFlow } from '@src/features/agent/components/agent-loan-application-flow'
import { BottomNavigation } from '@src/shared/components/bottom-navigation'
import { MobileHeader } from '@src/shared/components/mobile-header'
import { AgentRoute } from '@src/shared/components/route-guard'

export default function AgentApplyPage() {
  return (
    <AgentRoute>
      <MobileHeader title="ขอสินเชื่อให้ลูกค้า" showNotifications={false} />
      <main className="flex-1 pb-20">
        <AgentLoanApplicationFlow />
      </main>
      <BottomNavigation />
    </AgentRoute>
  )
}
