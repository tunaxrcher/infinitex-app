'use client'

import { NotificationsList } from '@src/features/notifications/components/notifications-list'
import { BottomNavigation } from '@src/shared/components/bottom-navigation'
import { MobileHeader } from '@src/shared/components/mobile-header'
import { RouteGuard } from '@src/shared/components/route-guard'

export default function NotificationsPage() {
  return (
    <RouteGuard>
      <MobileHeader title="แจ้งเตือน" />
      <main className="flex-1 pb-20">
        <NotificationsList />
      </main>
      <BottomNavigation />
    </RouteGuard>
  )
}
