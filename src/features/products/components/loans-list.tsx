'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

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
  Loader2,
} from 'lucide-react'

import { useGetLoansByCustomerId } from '../hooks'

// Mock data for fallback
const mockLoans = [
  {
    id: '1',
    loanNumber: 'LN001234567',
    loanType: 'HOUSE_LAND_MORTGAGE',
    currentInstallment: 6,
    totalInstallments: 12,
    monthlyPayment: 2000.5,
    remainingBalance: 12000.0,
    principalAmount: 24000.0,
    nextPaymentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'ACTIVE',
    type: 'LOAN',
    displayStatus: 'ACTIVE',
  },
  {
    id: '2',
    loanNumber: 'APP-12345678',
    loanType: 'HOUSE_LAND_MORTGAGE',
    currentInstallment: 0,
    totalInstallments: 0,
    monthlyPayment: 0,
    remainingBalance: 380000.0,
    principalAmount: 380000.0,
    nextPaymentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'UNDER_REVIEW',
    type: 'APPLICATION',
    displayStatus: 'UNDER_REVIEW',
    reviewNotes: null,
  },
  {
    id: '3',
    loanNumber: 'APP-87654321',
    loanType: 'HOUSE_LAND_MORTGAGE',
    currentInstallment: 0,
    totalInstallments: 0,
    monthlyPayment: 0,
    remainingBalance: 450000.0,
    principalAmount: 450000.0,
    nextPaymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    status: 'REJECTED',
    type: 'APPLICATION',
    displayStatus: 'REJECTED',
    reviewNotes: 'รายได้ไม่เพียงพอตามเกณฑ์ที่กำหนด และเอกสารหลักฐานไม่ครบถ้วน',
  },
]

export function LoansList() {
  const { data: session } = useSession()
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  // Use real data if available, fallback to mock data
  const { data: loansData, isLoading } = useGetLoansByCustomerId(
    session?.user?.id || ''
  )
  const loans = loansData?.data || mockLoans

  const toggleCard = (loanId: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [loanId]: !prev[loanId],
    }))
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    })
  }

  const getDaysUntilPayment = (date: Date | string) => {
    const paymentDate = new Date(date)
    const today = new Date()
    const diffTime = paymentDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getLoanTypeName = (loanType: string) => {
    switch (loanType) {
      case 'HOUSE_LAND_MORTGAGE':
        return 'สินเชื่อจำนองบ้านและโฉนดที่ดิน'
      case 'PERSONAL_LOAN':
        return 'สินเชื่อส่วนบุคคล'
      case 'BUSINESS_LOAN':
        return 'สินเชื่อธุรกิจ'
      default:
        return 'สินเชื่อ'
    }
  }

const getStatusInfo = (status: string, type?: string) => {
  // Handle Loan statuses
  if (type === 'LOAN') {
    switch (status) {
      case 'ACTIVE':
        return { text: '', color: 'success', showBadge: false } // ไม่แสดง badge
      case 'COMPLETED':
        return { text: 'ชำระครบแล้ว', color: 'success', showBadge: true }
      case 'DEFAULTED':
        return { text: 'ค้างชำระ', color: 'destructive', showBadge: true }
      case 'CANCELLED':
        return { text: 'ยกเลิก', color: 'destructive', showBadge: true }
      default:
        return { text: '', color: 'success', showBadge: false }
    }
  }
  
  // Handle LoanApplication statuses
  if (type === 'APPLICATION') {
    switch (status) {
      case 'DRAFT':
        return { text: 'ร่าง', color: 'secondary', showBadge: true }
      case 'SUBMITTED':
        return { text: 'รอตรวจสอบ', color: 'warning', showBadge: true }
      case 'UNDER_REVIEW':
        return { text: 'รออนุมัติ', color: 'warning', showBadge: true }
      case 'APPROVED':
        return { text: '', color: 'success', showBadge: false } // ไม่แสดง badge
      case 'REJECTED':
        return { text: 'ไม่อนุมัติ', color: 'destructive', showBadge: true }
      case 'CANCELLED':
        return { text: 'ยกเลิก', color: 'destructive', showBadge: true }
      default:
        return { text: 'รออนุมัติ', color: 'warning', showBadge: true }
    }
  }

  // Fallback for backward compatibility
  switch (status) {
    case 'ACTIVE':
      return { text: '', color: 'success', showBadge: false }
    case 'COMPLETED':
      return { text: 'ชำระครบแล้ว', color: 'success', showBadge: true }
    case 'DEFAULTED':
      return { text: 'ค้างชำระ', color: 'destructive', showBadge: true }
    case 'CANCELLED':
      return { text: 'ยกเลิก', color: 'destructive', showBadge: true }
    default:
      return { text: 'รออนุมัติ', color: 'warning', showBadge: true }
  }
}

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">กำลังโหลด...</span>
      </div>
    )
  }

const getBadgeVariant = (statusColor: string) => {
  switch (statusColor) {
    case 'success':
      return 'default'
    case 'warning':
      return 'outline'
    case 'destructive':
      return 'destructive'
    case 'secondary':
      return 'secondary'
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
          <h1 className="text-xl font-bold text-white">ผลิตภัณฑ์ของฉัน</h1>
          <p className="text-sm text-muted-foreground">
            จำนวน {loans.length} รายการ
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          ทั้งหมด
        </Badge>
      </div>

      <div className="space-y-4">
        {loans.map((loan) => {
          const progress = loan.totalInstallments > 0 
            ? (loan.currentInstallment / loan.totalInstallments) * 100 
            : 0
          const nextPaymentDays = getDaysUntilPayment(loan.nextPaymentDate)
          const isOverdue = nextPaymentDays < 0 && loan.type === 'LOAN'
          const isExpanded = expandedCards[loan.id] || false
          const statusInfo = getStatusInfo(loan.displayStatus || loan.status, loan.type)
          const loanTypeName = getLoanTypeName(loan.loanType)
          const isApplication = loan.type === 'APPLICATION'

          return (
            <Card key={loan.id} className="hover:shadow-md transition-shadow">
              {!statusInfo.showBadge && !isApplication ? (
                <>
                  <Link href={`/products/${loan.id}`} className="block">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base text-foreground mb-1">
                            {loanTypeName}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            เลขที่สัญญา: {loan.loanNumber}
                          </p>
                        </div>
                        {statusInfo.showBadge && (
                          <Badge
                            variant={getBadgeVariant(statusInfo.color)}
                            className={getBadgeClassName(statusInfo.color)}>
                            {statusInfo.text}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Link>
                  <div className="px-6 pb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleCard(loan.id)
                      }}
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
                </>
              ) : (
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base text-foreground mb-1">
                        {loanTypeName}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        เลขที่สัญญา: {loan.loanNumber}
                      </p>
                    </div>
                    {statusInfo.showBadge && (
                      <Badge
                        variant={getBadgeVariant(statusInfo.color)}
                        className={getBadgeClassName(statusInfo.color)}>
                        {statusInfo.text}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
              )}

              {(statusInfo.showBadge || isApplication) && (
                <div className="px-6 pb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCard(loan.id)}
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
              )}

              {(statusInfo.showBadge || isApplication) && isExpanded && (
                <CardContent className="space-y-4 pt-0">
                  {statusInfo.text === 'รออนุมัติ' || statusInfo.text === 'รอตรวจสอบ' ? (
                    <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800">
                          {statusInfo.text === 'รออนุมัติ' ? 'กำลังตรวจสอบ' : 'รอตรวจสอบ'}
                        </p>
                        <p className="text-xs text-yellow-600">
                          {statusInfo.text === 'รออนุมัติ' 
                            ? 'เอกสารของคุณอยู่ระหว่างการพิจารณา กรุณารอผลการอนุมัติ'
                            : 'ใบสมัครของคุณได้รับการส่งแล้ว รอการตรวจสอบจากเจ้าหน้าที่'
                          }
                        </p>
                      </div>
                    </div>
                  ) : statusInfo.text === 'ไม่อนุมัติ' ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-800 mb-1">
                            เหตุผลที่ไม่อนุมัติ
                          </p>
                          <p className="text-xs text-red-600">
                            {loan.reviewNotes || 'รายได้ไม่เพียงพอตามเกณฑ์ที่กำหนด และเอกสารหลักฐานไม่ครบถ้วน'}
                          </p>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-transparent"
                        variant="outline">
                        ยื่นใหม่
                      </Button>
                    </div>
                  ) : statusInfo.text === 'ร่าง' ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            ใบสมัครยังไม่สมบูรณ์
                          </p>
                          <p className="text-xs text-gray-600">
                            กรุณาเติมข้อมูลให้ครบถ้วนและส่งใบสมัคร
                          </p>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        variant="default">
                        ดำเนินการต่อ
                      </Button>
                    </div>
                  ) : statusInfo.text === 'อนุมัติแล้ว' ? (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          อนุมัติแล้ว
                        </p>
                        <p className="text-xs text-green-600">
                          ใบสมัครของคุณได้รับการอนุมัติแล้ว กำลังดำเนินการสร้างสัญญา
                        </p>
                      </div>
                    </div>
                  ) : statusInfo.text === 'ยกเลิก' || statusInfo.text === 'ค้างชำระ' ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-800 mb-1">
                            เหตุผลที่ไม่อนุมัติ
                          </p>
                          <p className="text-xs text-red-600">
                            รายได้ไม่เพียงพอตามเกณฑ์ที่กำหนด
                            และเอกสารหลักฐานไม่ครบถ้วน
                          </p>
                        </div>
                      </div>
                      <Button
                        className="w-full bg-transparent"
                        variant="outline">
                        ยื่นใหม่
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            ความคืบหน้า
                          </span>
                          <span className="font-medium text-foreground">
                            {loan.currentInstallment}/{loan.totalInstallments}{' '}
                            งวด
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {progress.toFixed(1)}% เสร็จสิ้น
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">
                            ยอดชำระรายเดือน
                          </p>
                          <p className="font-semibold text-foreground">
                            {loan.monthlyPayment.toLocaleString('th-TH', {
                              minimumFractionDigits: 2,
                            })}{' '}
                            บาท
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">
                            ยอดคงเหลือ
                          </p>
                          <p className="font-semibold text-foreground">
                            {loan.remainingBalance.toLocaleString('th-TH', {
                              minimumFractionDigits: 2,
                            })}{' '}
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
                            {isOverdue ? 'เกินกำหนดชำระ' : 'ครบกำหนดชำระ'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(loan.nextPaymentDate)}
                            {isOverdue
                              ? ` (เกิน ${Math.abs(nextPaymentDays)} วัน)`
                              : ` (อีก ${nextPaymentDays} วัน)`}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          asChild
                          className="flex-1"
                          variant={isOverdue ? 'default' : 'outline'}>
                          <Link href={`/payment?loanId=${loan.id}`}>
                            {isOverdue ? 'ชำระด่วน' : 'ชำระเงิน'}
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/customer/products/${loan.id}`}>
                            <TrendingUp className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              )}

              {!statusInfo.showBadge && !isApplication && isExpanded && (
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">ความคืบหน้า</span>
                      <span className="font-medium text-foreground">
                        งวดที่ {loan.currentInstallment}/
                        {loan.totalInstallments}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {progress.toFixed(1)}% เสร็จสิ้น
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">
                        ยอดชำระรายเดือน
                      </p>
                      <p className="font-semibold text-foreground">
                        {loan.monthlyPayment.toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                        })}{' '}
                        บาท
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">ยอดคงเหลือ</p>
                      <p className="font-semibold text-foreground">
                        {loan.remainingBalance.toLocaleString('th-TH', {
                          minimumFractionDigits: 2,
                        })}{' '}
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
                      <p className="text-sm font-medium text-red-500">
                        วันครบกำหนดชำระ {formatDate(loan.nextPaymentDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isOverdue
                          ? `เกิน ${Math.abs(nextPaymentDays)} วัน`
                          : `อีก ${nextPaymentDays} วัน`}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      asChild
                      className="flex-1"
                      variant={isOverdue ? 'default' : 'outline'}>
                      <Link href={`/payment?loanId=${loan.id}`}>
                        {isOverdue ? 'ชำระด่วน' : 'ชำระเงิน'}
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/customer/products/${loan.id}`}>
                        <TrendingUp className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
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
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-foreground">
                สรุปยอดรวม
              </h3>
              <p className="text-xs text-muted-foreground">ยอดคงเหลือทั้งหมด</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                {loans
                  .reduce((sum, loan) => sum + loan.remainingBalance, 0)
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
