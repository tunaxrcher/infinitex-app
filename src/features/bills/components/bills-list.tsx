'use client'

import Link from 'next/link'

import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { CreditCard } from 'lucide-react'

const billsData = [
  {
    id: 1,
    name: 'สินเชื่อจำนองบ้านและโฉนดที่ดิน',
    currentInstallment: 6,
    totalInstallments: 12,
    amount: 2000.5,
    dueDate: '30 ก.ย. 68',
  },
  // Add more bills here if needed
]

export function BillsList() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">สินเชื่อของฉัน</h2>
      </div>

      <div className="space-y-4">
        {billsData.map((bill) => (
          <Card key={bill.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  {bill.name}
                </CardTitle>
              </div>
              <hr className="border-gray-200" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    งวดที่ {bill.currentInstallment}/{bill.totalInstallments}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    ยอดรวมที่ต้องชำระ
                  </span>
                  <span className="font-semibold text-foreground">
                    {bill.amount.toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                    })}{' '}
                    บาท
                  </span>
                </div>
                <p className="text-sm text-red-500">
                  วันครบกำหนดชำระ {bill.dueDate}
                </p>
              </div>

              <div className="flex gap-2">
                <Button asChild className="flex-1 text-white">
                  <Link href="/payment">จ่ายบิล</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
