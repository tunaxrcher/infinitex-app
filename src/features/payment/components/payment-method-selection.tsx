'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { LoadingSpinner } from '@src/shared/components/loading-spinner'
import {
  AlertCircle,
  Barcode,
  Calendar,
  CreditCard,
  QrCode,
} from 'lucide-react'

// Mock loan data - in real app this would come from API
const loanData = {
  id: 1,
  name: 'สินเชื่อจำนองบ้านและโฉนดที่ดิน',
  loanNumber: 'LN001234567',
  currentInstallment: 6,
  totalInstallments: 12,
  amount: 2000.5,
  dueDate: '30 ก.ย. 68',
  status: 'ปกติ',
  isOverdue: false,
  daysToDue: 5,
}

const paymentMethods = [
  {
    id: 'qr',
    name: 'QR Code',
    description: 'สแกน QR Code ผ่านแอปธนาคาร',
    icon: QrCode,
    href: '/payment/qr',
    available: true,
    popular: true,
  },
  {
    id: 'barcode',
    name: 'Barcode',
    description: 'นำ Barcode ไปชำระที่เคาน์เตอร์',
    icon: Barcode,
    href: '/payment/barcode',
    available: true,
    popular: false,
  },
  {
    id: 'banking',
    name: 'Internet Banking',
    description: 'โอนผ่านแอปธนาคาร',
    icon: CreditCard,
    href: '#',
    available: false,
    popular: false,
  },
  {
    id: 'wallet',
    name: 'E-Wallet',
    description: 'ชำระผ่าน TrueMoney, ShopeePay',
    icon: CreditCard,
    href: '#',
    available: false,
    popular: false,
  },
]

function PaymentMethodSelectionContent() {
  const searchParams = useSearchParams()
  const loanId = searchParams.get('loanId')

  return (
    <div className="p-4 space-y-6">
      {/* Loan Information */}
      <Card
        className={
          loanData.isOverdue ? 'border-destructive/50 bg-destructive/5' : ''
        }>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base text-foreground mb-1">
                {loanData.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                เลขที่สัญญา: {loanData.loanNumber}
              </p>
            </div>
            <Badge
              variant={loanData.isOverdue ? 'destructive' : 'default'}
              className="text-xs">
              {loanData.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">งวดที่ต้องชำระ</p>
              <p className="text-lg font-bold text-foreground">
                {loanData.currentInstallment}/{loanData.totalInstallments}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">ยอดชำระ</p>
              <p className="text-xl font-bold text-primary">
                {loanData.amount.toLocaleString('th-TH', {
                  minimumFractionDigits: 2,
                })}{' '}
                บาท
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            {loanData.isOverdue ? (
              <AlertCircle className="h-4 w-4 text-destructive" />
            ) : (
              <Calendar className="h-4 w-4 text-primary" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {loanData.isOverdue ? 'เกินกำหนดชำระ' : 'ครบกำหนดชำระ'}
              </p>
              <p className="text-xs text-muted-foreground">
                {loanData.dueDate}
                {loanData.isOverdue
                  ? ` (เกิน ${Math.abs(loanData.daysToDue)} วัน)`
                  : ` (อีก ${loanData.daysToDue} วัน)`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          เลือกช่องทางชำระเงิน
        </h2>

        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon

            return (
              <Card
                key={method.id}
                className={`transition-all ${
                  method.available
                    ? 'hover:shadow-md cursor-pointer'
                    : 'opacity-60 cursor-not-allowed bg-muted/30'
                }`}>
                <CardContent className="p-4">
                  {method.available ? (
                    <Link href={method.href} className="block">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-medium text-foreground">
                              {method.name}
                            </h3>
                            {method.popular && (
                              <Badge variant="secondary" className="text-xs">
                                แนะนำ
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                        <div className="text-primary">
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <Icon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-muted-foreground">
                            {method.name}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            เร็วๆ นี้
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Help Section */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-foreground mb-2">
            ต้องการความช่วยเหลือ?
          </h4>
          <p className="text-xs text-muted-foreground mb-3">
            หากมีปัญหาในการชำระเงิน สามารถติดต่อ Call Center ได้ตลอด 24 ชั่วโมง
          </p>
          <Button variant="outline" size="sm" className="w-full bg-transparent">
            โทร 1234
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function PaymentMethodSelection() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <PaymentMethodSelectionContent />
    </Suspense>
  )
}
