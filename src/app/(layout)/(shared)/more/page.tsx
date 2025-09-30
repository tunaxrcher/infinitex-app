'use client'

import { MoreMenuList } from '@src/features/more/components/more-menu-list'
import { BottomNavigation } from '@src/shared/components/bottom-navigation'
import { MobileHeader } from '@src/shared/components/mobile-header'
import { RouteGuard } from '@src/shared/components/route-guard'

export default function MorePage() {
  return (
    <RouteGuard>
      <MobileHeader title="เมนูอื่น ๆ" />
      <main className="flex-1 pb-20">
        <MoreMenuList />
      </main>
      <BottomNavigation />
    </RouteGuard>
  )
}
