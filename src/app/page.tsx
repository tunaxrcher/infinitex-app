'use client'

import { BannerCarousel } from '@src/features/home/components/banner-carousel'
import { PrivilegesSection } from '@src/features/home/components/privileges-section'
import { QuickActions } from '@src/features/home/components/quick-actions'
import { BottomNavigation } from '@src/shared/components/bottom-navigation'
import { RouteGuard } from '@src/shared/components/route-guard'
import { useAuth } from '@src/shared/contexts/auth-context'

export default function HomePage() {
  const { user } = useAuth()

  const renderAgentHomepage = () => {
    return (
      <main className="min-h-screen flex items-center justify-center pb-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold ai-gradient-text">
            คุณกำลังเข้าใช้งานเอเจนต์
          </h1>
          <hr />
          <div className="text-sm text-muted-foreground">Demo</div>
        </div>
      </main>
    )
  }

  const renderCustomerHomepage = () => {
    return (
      <main className="flex-1 pb-20 relative">
        {/* Animated gradient background for top section only */}
        <div className="absolute top-0 left-0 right-0 h-[35vh] page-main-bg-animate-gradient"></div>
        {/* Light background for bottom section */}
        <div className="absolute top-[35vh] left-0 right-0 bottom-0 bg-gray-50"></div>

        {/* Content with relative positioning to appear above backgrounds */}
        <div className="relative p-4 space-y-6">
          {/* Banner Section */}
          <BannerCarousel />

          {/* Quick Actions Section */}
          <QuickActions />

          {/* Privileges Section */}
          <PrivilegesSection />
        </div>
      </main>
    )
  }

  return (
    <RouteGuard>
      {user?.userType === 'AGENT'
        ? renderAgentHomepage()
        : renderCustomerHomepage()}
      <BottomNavigation />
    </RouteGuard>
  )
}
