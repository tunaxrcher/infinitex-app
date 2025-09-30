import Image from 'next/image'

import { Badge } from '@src/shared/ui/badge'
import { Card, CardContent } from '@src/shared/ui/card'
import { ChevronRight } from 'lucide-react'

const privileges = [
  {
    id: 1,
    title: 'เครดิตฟรี 100 Coin',
    description: 'สำหรับสมาชิกใหม่',
    badge: 'ใหม่',
  },
  {
    id: 2,
    title: 'ส่วนลด 5% ค่าธรรมเนียม',
    description: 'ชำระตรงเวลา 3 งวดติดต่อกัน',
    badge: 'ฮิต 30 วันนี้',
  },
  {
    id: 3,
    title: 'รางวัลลูกค้าดีเด่น',
    description: 'แลกของรางวัลสุดพิเศษ',
    badge: 'VIP',
  },
  {
    id: 4,
    title: 'อนุมัติเร็วพิเศษ',
    description: 'สำหรับลูกค้าเก่า ใน 1 ชั่วโมง',
    badge: 'เร็ว',
  },
]

export function PrivilegesSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          🎉 สิทธิพิเศษ! สำหรับคุณ (ทดสอบ)
        </h2>
        <Badge variant="outline" className="text-xs">
          4 รายการ
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {privileges.map((privilege) => {
          return (
            <Card
              key={privilege.id}
              className="hover:shadow-md transition-shadow cursor-pointer border-0 shadow-sm overflow-hidden py-0">
              <CardContent className="p-0">
                <div className="grid grid-cols-[120px_1fr_auto] items-stretch min-h-[80px]">
                  {/* Image column - takes up 120px width */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                    <Image
                      src="/images/reward.png"
                      alt="FinX Reward"
                      width={120}
                      height={80}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  {/* Content column */}
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-primary mb-1">
                      {privilege.title}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {privilege.description}
                    </p>
                  </div>

                  {/* Action column */}
                  <div className="flex items-center gap-2 pr-4">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
