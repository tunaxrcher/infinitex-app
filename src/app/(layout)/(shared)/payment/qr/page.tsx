import { QRPayment } from '@src/features/payment/components/qr-payment'
import { BottomNavigation } from '@src/shared/components/bottom-navigation'
import { MobileHeader } from '@src/shared/components/mobile-header'
import { RouteGuard } from '@src/shared/components/route-guard'

export default function QRPaymentPage() {
  return (
    <RouteGuard>
      <MobileHeader title="ชำระเงินผ่าน QR Code" showBackButton={true} />
      <main className="flex-1 pb-20">
        <QRPayment />
      </main>
      <BottomNavigation />
    </RouteGuard>
  )
}
