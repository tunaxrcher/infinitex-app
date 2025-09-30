import { AgentCustomersList } from '@src/features/agent/components/agent-customers-list'
import { BottomNavigation } from '@src/shared/components/bottom-navigation'
import { FloatingActionButton } from '@src/shared/components/floating-action-button'
import { MobileHeader } from '@src/shared/components/mobile-header'
import { AgentRoute } from '@src/shared/components/route-guard'

export default function AgentCustomersPage() {
  return (
    <AgentRoute>
      <MobileHeader title="ผลิตภัณฑ์ของลูกค้า" />
      <main className="flex-1 pb-20 page-main-bg-animate-gradient bg-gradient-to-b from-transparent via-transparent to-gray-50 dark:to-gray-900 min-h-screen">
        <AgentCustomersList />
        <FloatingActionButton href="/agent/apply" />
      </main>
      <BottomNavigation />
    </AgentRoute>
  )
}
