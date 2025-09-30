import { PaymentDetails } from '@src/features/payment/components/payment-details'
import { BottomNavigation } from '@src/shared/components/bottom-navigation'
import { MobileHeader } from '@src/shared/components/mobile-header'
import { RouteGuard } from '@src/shared/components/route-guard'

export default function PaymentDetailsPage() {
  return (
    <RouteGuard>
      <MobileHeader title="รายละเอียดการชำระ" showBackButton={true} />
      <main className="flex-1 pb-20">
        <PaymentDetails />
      </main>
      <BottomNavigation />
    </RouteGuard>
  )
}
