'use client'

import { useState } from 'react'

import Link from 'next/link'

import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { Progress } from '@src/shared/ui/progress'
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
  TrendingUp,
  Users,
} from 'lucide-react'

// Mock data สำหรับลูกค้าของ Agent
const agentCustomers = [
  {
    id: 1,
    customerName: 'นายสมชาย ใจดี',
    phoneNumber: '081-234-5678',
    loanCount: 2,
    totalBalance: 33000.0,
    loans: [
      {
        id: 1,
        name: 'สินเชื่อจำนองบ้านและโฉนดที่ดิน',
        loanNumber: 'LN001234567',
        currentInstallment: 6,
        totalInstallments: 12,
        monthlyPayment: 2000.5,
        remainingBalance: 12000.0,
        dueDate: '30 ก.ย. 68',
        status: 'ปกติ',
        statusColor: 'success',
        nextPaymentDays: 5,
      },
      {
        id: 2,
        name: 'สินเชื่อจำนองบ้านและโฉนดที่ดิน',
        loanNumber: 'LN001234568',
        currentInstallment: 18,
        totalInstallments: 24,
        monthlyPayment: 3500.0,
        remainingBalance: 21000.0,
        dueDate: '15 ต.ค. 68',
        status: 'ปกติ',
        statusColor: 'success',
        nextPaymentDays: 20,
      },
    ],
  },
  {
    id: 2,
    customerName: 'นางสมหญิง สวยดี',
    phoneNumber: '082-345-6789',
    loanCount: 1,
    totalBalance: 51000.0,
    loans: [
      {
        id: 3,
        name: 'สินเชื่อจำนองบ้านและโฉนดที่ดิน',
        loanNumber: 'LN001234569',
        currentInstallment: 2,
        totalInstallments: 36,
        monthlyPayment: 1500.0,
        remainingBalance: 51000.0,
        dueDate: '28 ก.ย. 68',
        status: 'ไม่ผ่าน',
        statusColor: 'destructive',
        nextPaymentDays: -2,
      },
    ],
  },
  {
    id: 3,
    customerName: 'นายประชา ดีมาก',
    phoneNumber: '083-456-7890',
    loanCount: 1,
    totalBalance: 0,
    loans: [
      {
        id: 4,
        name: 'สินเชื่อจำนองบ้านและโฉนดที่ดิน',
        loanNumber: 'LN001234570',
        currentInstallment: 0,
        totalInstallments: 12,
        monthlyPayment: 2500.0,
        remainingBalance: 0,
        dueDate: '-',
        status: 'รออนุมัติ',
        statusColor: 'warning',
        nextPaymentDays: 0,
      },
    ],
  },
]

export function AgentCustomersList() {
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>(
    {}
  )

  const toggleCard = (customerId: number) => {
    setExpandedCards((prev) => ({
      ...prev,
      [customerId]: !prev[customerId],
    }))
  }

  const getBadgeVariant = (statusColor: string) => {
    switch (statusColor) {
      case 'success':
        return 'default'
      case 'warning':
        return 'outline'
      case 'destructive':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const getBadgeClassName = (statusColor: string) => {
    if (statusColor === 'warning') {
      return 'text-xs bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200'
    }
    return 'text-xs'
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">ผลิตภัณฑ์ของลูกค้า</h1>
          <p className="text-sm text-muted-foreground">
            จำนวน {agentCustomers.length} ลูกค้า
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          ทั้งหมด
        </Badge>
      </div>

      <div className="space-y-4">
        {agentCustomers.map((customer) => {
          const isExpanded = expandedCards[customer.id] || false
          const hasOverdueLoans = customer.loans.some(
            (loan) => loan.nextPaymentDays < 0
          )
          const hasActiveLoans = customer.loans.some(
            (loan) => loan.status === 'ปกติ'
          )

          return (
            <Card
              key={customer.id}
              className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base text-foreground mb-1 flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      {customer.customerName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      เบอร์: {customer.phoneNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      สินเชื่อ: {customer.loanCount} รายการ
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {customer.totalBalance.toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      บาท
                    </p>
                    <p className="text-xs text-muted-foreground">ยอดคงเหลือ</p>
                  </div>
                </div>
              </CardHeader>

              <div className="px-6 pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleCard(customer.id)}
                  className="w-full justify-center gap-2 text-muted-foreground hover:text-foreground">
                  {isExpanded ? (
                    <>
                      <span className="text-xs">ซ่อนรายละเอียด</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span className="text-xs">ดูรายละเอียด</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {isExpanded && (
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-foreground">
                      รายการสินเชื่อ
                    </h4>
                    {customer.loans.map((loan) => {
                      const progress =
                        loan.totalInstallments > 0
                          ? (loan.currentInstallment / loan.totalInstallments) *
                            100
                          : 0
                      const isOverdue = loan.nextPaymentDays < 0

                      return (
                        <div
                          key={loan.id}
                          className="p-3 bg-muted/30 rounded-lg space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {loan.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                เลขที่: {loan.loanNumber}
                              </p>
                            </div>
                            <Badge
                              variant={getBadgeVariant(loan.statusColor)}
                              className={getBadgeClassName(loan.statusColor)}>
                              {loan.status}
                            </Badge>
                          </div>

                          {loan.status === 'ปกติ' && (
                            <>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    ความคืบหน้า
                                  </span>
                                  <span className="font-medium text-foreground">
                                    งวดที่ {loan.currentInstallment}/
                                    {loan.totalInstallments}
                                  </span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-muted-foreground mb-1">
                                    ยอดชำระรายเดือน
                                  </p>
                                  <p className="font-semibold text-foreground">
                                    {loan.monthlyPayment.toLocaleString(
                                      'th-TH',
                                      {
                                        minimumFractionDigits: 2,
                                      }
                                    )}{' '}
                                    บาท
                                  </p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground mb-1">
                                    ยอดคงเหลือ
                                  </p>
                                  <p className="font-semibold text-foreground">
                                    {loan.remainingBalance.toLocaleString(
                                      'th-TH',
                                      {
                                        minimumFractionDigits: 2,
                                      }
                                    )}{' '}
                                    บาท
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                                {isOverdue ? (
                                  <AlertCircle className="h-4 w-4 text-destructive" />
                                ) : (
                                  <Calendar className="h-4 w-4 text-primary" />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-foreground">
                                    {isOverdue
                                      ? 'เกินกำหนดชำระ'
                                      : 'ครบกำหนดชำระ'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {loan.dueDate}
                                    {isOverdue
                                      ? ` (เกิน ${Math.abs(loan.nextPaymentDays)} วัน)`
                                      : ` (อีก ${loan.nextPaymentDays} วัน)`}
                                  </p>
                                </div>
                              </div>
                            </>
                          )}

                          {loan.status === 'รออนุมัติ' && (
                            <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <AlertCircle className="h-5 w-5 text-yellow-600" />
                              <div>
                                <p className="text-sm font-medium text-yellow-800">
                                  กำลังตรวจสอบ
                                </p>
                                <p className="text-xs text-yellow-600">
                                  เอกสารอยู่ระหว่างการพิจารณา
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {hasActiveLoans && (
                    <div className="flex gap-2">
                      <Button
                        asChild
                        className="flex-1"
                        variant={hasOverdueLoans ? 'default' : 'outline'}>
                        <Link href={`/payment?customerId=${customer.id}`}>
                          {hasOverdueLoans ? 'ดูบิลเกินกำหนด' : 'ดูบิลลูกค้า'}
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/agent/customers/${customer.id}`}>
                          <TrendingUp className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-foreground">
                สรุปยอดรวมลูกค้า
              </h3>
              <p className="text-xs text-muted-foreground">ยอดคงเหลือทั้งหมด</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                {agentCustomers
                  .reduce((sum, customer) => sum + customer.totalBalance, 0)
                  .toLocaleString('th-TH', {
                    minimumFractionDigits: 2,
                  })}{' '}
                บาท
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
