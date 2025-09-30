import { PaymentMethodSelection } from '@src/features/payment/components/payment-method-selection'
import { BottomNavigation } from '@src/shared/components/bottom-navigation'
import { MobileHeader } from '@src/shared/components/mobile-header'
import { RouteGuard } from '@src/shared/components/route-guard'

export default function PaymentPage() {
  return (
    <RouteGuard>
      <MobileHeader title="ชำระเงิน" />
      <main className="flex-1 pb-20">
        <PaymentMethodSelection />
      </main>
      <BottomNavigation />
    </RouteGuard>
  )
}
