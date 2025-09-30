import { BottomNavigation } from '@src/shared/components/bottom-navigation'
import { MobileHeader } from '@src/shared/components/mobile-header'
import { CustomerRoute } from '@src/shared/components/route-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'

export default function CustomerProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <CustomerRoute>
      <MobileHeader title="รายละเอียดสินเชื่อ" showBackButton={true} />
      <main className="flex-1 pb-20">
        <div className="p-4">
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดสินเชื่อ #{params.id}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                รายละเอียดสินเชื่อจะแสดงที่นี่
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <BottomNavigation />
    </CustomerRoute>
  )
}
