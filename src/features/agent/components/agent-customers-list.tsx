'use client'

import { useEffect, useMemo, useState } from 'react'

import Link from 'next/link'

import { useGetLoansByAgentId } from '@src/features/products/hooks'
import { formatThaiCurrency } from '@src/shared/lib/utils'
import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent } from '@src/shared/ui/card'
import { Input } from '@src/shared/ui/input'
import { Progress } from '@src/shared/ui/progress'
import {
  AlertCircle,
  Calendar,
  CreditCard,
  Loader2,
  Phone,
  Search,
  TrendingUp,
  User,
} from 'lucide-react'
import { useSession } from 'next-auth/react'

// Helper functions
const getCustomerName = (customer: any) => {
  if (!customer?.profile) return 'ไม่ระบุ'
  return `${customer.profile.firstName || ''} ${customer.profile.lastName || ''}`.trim()
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
    case 'CAR_REGISTRATION':
      return 'สินเชื่อทะเบียนรถ'
    case 'FINX_PLUS':
      return 'สินเชื่อ FinX พลัส'
    default:
      return 'สินเชื่อ'
  }
}

const getStatusInfo = (status: string, type?: string) => {
  // Handle Loan statuses
  if (type === 'LOAN') {
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
        return { text: 'อนุมัติแล้ว', color: 'success', showBadge: true }
      case 'REJECTED':
        return { text: 'ถูกปฏิเสธ', color: 'destructive', showBadge: true }
      case 'CANCELLED':
        return { text: 'ยกเลิก', color: 'destructive', showBadge: true }
      default:
        return { text: 'รออนุมัติ', color: 'warning', showBadge: true }
    }
  }

  // Fallback
  return { text: 'รออนุมัติ', color: 'warning', showBadge: true }
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

export function AgentCustomersList() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Use real data if available
  const agentId = session?.user?.id
  const {
    data: loansData,
    isLoading,
  } = useGetLoansByAgentId(agentId || '')

  // Use only real data from database
  const allLoans = loansData?.success && loansData?.data ? loansData.data : []

  // Filter and search loans directly
  const filteredLoans = useMemo(() => {
    if (!searchTerm) return allLoans

    const searchLower = searchTerm.toLowerCase()
    const searchNumber = parseFloat(searchTerm.replace(/,/g, ''))

    return allLoans.filter((loan: any) => {
      // Search by property location
      const locationMatch = loan.propertyLocation?.toLowerCase().includes(searchLower)

      // Search by owner name (from agent input)
      const ownerNameMatch = loan.ownerName?.toLowerCase().includes(searchLower)

      // Search by loan number/ID
      const loanNumberMatch =
        loan.loanNumber?.toLowerCase().includes(searchLower) ||
        loan.id?.toLowerCase().includes(searchLower)

      // Search by loan amount
      const principal = Number(loan.principalAmount) || 0
      const remaining = Number(loan.remainingBalance) || 0
      const monthly = Number(loan.monthlyPayment) || 0

      const amountMatch =
        !isNaN(searchNumber) &&
        (principal === searchNumber ||
          remaining === searchNumber ||
          monthly === searchNumber ||
          Math.abs(principal - searchNumber) < 1000 ||
          Math.abs(remaining - searchNumber) < 1000 ||
          Math.abs(monthly - searchNumber) < 100)

      return (
        locationMatch ||
        ownerNameMatch ||
        loanNumberMatch ||
        amountMatch
      )
    })
  }, [allLoans, searchTerm])

  // Pagination logic
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedLoans = filteredLoans.slice(startIndex, endIndex)

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  if (isLoading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">กำลังโหลด...</span>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">รายการสินเชื่อของฉัน</h1>
          <p className="text-sm text-muted-foreground">
            จำนวน {filteredLoans.length} สินเชื่อ
            {searchTerm && ` (แสดง ${paginatedLoans.length} รายการ)`}
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          ทั้งหมด
        </Badge>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาด้วยสถานที่, เลขที่สัญญา, หรือยอดเงิน"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3">
        {paginatedLoans.map((loan: any) => {
          const isApplication = loan.type === 'APPLICATION'
          const propertyLocation = loan.propertyLocation || loan.ownerName || 'ไม่ระบุสถานที่'
          const customerId = loan.customer?.id
          const isNoCustomer = !customerId

          return (
            <Card key={loan.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-sm">
                        {getLoanTypeName(loan.loanType)}
                      </h4>
                      {getStatusInfo(
                        loan.displayStatus || loan.status,
                        loan.type
                      ).showBadge && (
                        <Badge
                          variant={getBadgeVariant(
                            getStatusInfo(
                              loan.displayStatus || loan.status,
                              loan.type
                            ).color
                          )}
                          className={getBadgeClassName(
                            getStatusInfo(
                              loan.displayStatus || loan.status,
                              loan.type
                            ).color
                          )}>
                          {
                            getStatusInfo(
                              loan.displayStatus || loan.status,
                              loan.type
                            ).text
                          }
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      เลขที่: {loan.loanNumber}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CreditCard className="h-3 w-3" />
                      <span className="line-clamp-1">{propertyLocation}</span>
                    </div>
                  </div>
                </div>

                {!isApplication && (
                  <>
                    {/* Loan Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          ความคืบหน้า
                        </span>
                        <span className="font-medium text-foreground">
                          งวดที่{' '}
                          {loan.installments
                            ? loan.installments.filter(
                                (inst: any) => inst.isPaid
                              ).length
                            : loan.currentInstallment || 0}
                          /{loan.totalInstallments}
                        </span>
                      </div>
                      <Progress
                        value={
                          loan.totalInstallments > 0
                            ? ((loan.installments
                                ? loan.installments.filter(
                                    (inst: any) => inst.isPaid
                                  ).length
                                : loan.currentInstallment || 0) /
                                loan.totalInstallments) *
                              100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>

                    {/* Loan Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">
                          ยอดชำระรายเดือน
                        </p>
                        <p className="font-semibold text-foreground">
                          {formatThaiCurrency(loan.monthlyPayment)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">ยอดคงเหลือ</p>
                        <p className="font-semibold text-foreground">
                          {formatThaiCurrency(loan.remainingBalance)}
                        </p>
                      </div>
                    </div>

                    {/* Next Payment */}
                    <div
                      className={`flex items-center gap-2 p-3 rounded-lg ${
                        loan.status === 'COMPLETED'
                          ? 'bg-green-50 border border-green-200'
                          : getDaysUntilPayment(loan.nextPaymentDate) < 0 &&
                              loan.status !== 'COMPLETED'
                            ? 'bg-red-50 border border-red-200'
                            : 'bg-muted/50'
                      }`}>
                      {loan.status === 'COMPLETED' ? (
                        <Calendar className="h-4 w-4 text-green-600" />
                      ) : getDaysUntilPayment(loan.nextPaymentDate) < 0 &&
                        loan.status !== 'COMPLETED' ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Calendar className="h-4 w-4 text-primary" />
                      )}
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            loan.status === 'COMPLETED'
                              ? 'text-green-800'
                              : getDaysUntilPayment(loan.nextPaymentDate) < 0 &&
                                  loan.status !== 'COMPLETED'
                                ? 'text-red-800'
                                : 'text-foreground'
                          }`}>
                          {loan.status === 'COMPLETED'
                            ? 'ชำระครบแล้ว'
                            : getDaysUntilPayment(loan.nextPaymentDate) < 0
                              ? 'เกินกำหนดชำระ'
                              : 'ครบกำหนดชำระ'}
                        </p>
                        <p
                          className={`text-xs ${
                            loan.status === 'COMPLETED'
                              ? 'text-green-600'
                              : getDaysUntilPayment(loan.nextPaymentDate) < 0 &&
                                  loan.status !== 'COMPLETED'
                                ? 'text-red-600'
                                : 'text-muted-foreground'
                          }`}>
                          {loan.status === 'COMPLETED'
                            ? `ชำระครบเมื่อ ${formatDate(loan.nextPaymentDate)}`
                            : `${formatDate(loan.nextPaymentDate)}${
                                getDaysUntilPayment(loan.nextPaymentDate) < 0
                                  ? ` (เกิน ${Math.abs(getDaysUntilPayment(loan.nextPaymentDate))} วัน)`
                                  : ` (อีก ${getDaysUntilPayment(loan.nextPaymentDate)} วัน)`
                              }`}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {isApplication && (
                  <>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium text-foreground mb-1">
                        ใบสมัครสินเชื่อ
                      </p>
                      <p className="text-xs text-muted-foreground">
                        จำนวนเงินที่ขอ:{' '}
                        {formatThaiCurrency(loan.principalAmount)}
                      </p>
                      {loan.reviewNotes && (
                        <p className="text-xs text-red-600 mt-1">
                          หมายเหตุ: {loan.reviewNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800">
                          วันที่ส่งใบสมัคร
                        </p>
                        <p className="text-xs text-blue-600">
                          {formatDate(loan.nextPaymentDate || loan.createdAt)}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button
                    asChild={!isNoCustomer}
                    className="flex-1"
                    variant={
                      !isApplication &&
                      getDaysUntilPayment(loan.nextPaymentDate) < 0 &&
                      loan.status !== 'COMPLETED'
                        ? 'default'
                        : 'outline'
                    }
                    disabled={isNoCustomer}>
                    {!isNoCustomer ? (
                      <Link
                        href={
                          isApplication
                            ? `/agent/customers/${customerId}/applications/${loan.id}`
                            : `/agent/customers/${customerId}/loans/${loan.id}`
                        }>
                        {isApplication
                          ? 'ดูใบสมัคร'
                          : !isApplication &&
                              getDaysUntilPayment(loan.nextPaymentDate) < 0 &&
                              loan.status !== 'COMPLETED'
                            ? 'ติดตามการชำระ'
                            : 'ดูรายละเอียด'}
                      </Link>
                    ) : (
                      <span>debug: ไม่มีข้อมูลลูกค้า</span>
                    )}
                  </Button>
                  {!isNoCustomer && (
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/agent/customers/${customerId}`}>
                        <User className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            แสดง {startIndex + 1}-{Math.min(endIndex, filteredLoans.length)} จาก{' '}
            {filteredLoans.length} รายการ
          </p>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}>
              ก่อนหน้า
            </Button>
            <span className="text-sm font-medium">
              หน้า {currentPage} จาก {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}>
              ถัดไป
            </Button>
          </div>
        </div>
      )}

      {filteredLoans.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีสินเชื่อ'}
          </p>
        </div>
      )}

      {/* Summary Card */}
      {allLoans.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">
                  สรุปภาพรวม
                </h3>
                <p className="text-xs text-muted-foreground">
                  ยอดคงเหลือรวมทั้งหมด
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  {(() => {
                    const totalBalance = allLoans.reduce(
                      (sum: any, loan: any) => {
                        const currentSum = Number(sum)
                        if (
                          loan.type === 'LOAN' &&
                          ['ACTIVE', 'DEFAULTED'].includes(loan.status) &&
                          Number(loan.remainingBalance) > 0
                        ) {
                          return currentSum + (Number(loan.remainingBalance) || 0)
                        } else if (
                          loan.type === 'APPLICATION' &&
                          loan.status === 'APPROVED'
                        ) {
                          return currentSum + (Number(loan.principalAmount) || 0)
                        }
                        return currentSum
                      },
                      0
                    )
                    return formatThaiCurrency(totalBalance)
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {allLoans.length} สินเชื่อ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
