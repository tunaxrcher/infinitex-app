import { BarcodePayment } from '@src/features/payment/components/barcode-payment'
import { BottomNavigation } from '@src/shared/components/bottom-navigation'
import { MobileHeader } from '@src/shared/components/mobile-header'
import { RouteGuard } from '@src/shared/components/route-guard'

export default function BarcodePaymentPage() {
  return (
    <RouteGuard>
      <MobileHeader title="ชำระเงินผ่าน Barcode" showBackButton={true} />
      <main className="flex-1 pb-20">
        <BarcodePayment />
      </main>
      <BottomNavigation />
    </RouteGuard>
  )
}
