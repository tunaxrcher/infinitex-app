'use client'

import { useMemo, useState, useEffect } from 'react'

import Link from 'next/link'

import { useGetLoansByAgentId } from '@src/features/products/hooks'
import { formatThaiCurrency } from '@src/shared/lib/utils'
import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { Input } from '@src/shared/ui/input'
import { Progress } from '@src/shared/ui/progress'
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Loader2,
  Phone,
  Search,
  TrendingUp,
  User,
  Users,
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
        return { text: 'อนุมัติแล้ว', color: 'success', showBadge: true } // แสดง badge สำหรับที่อนุมัติแล้วแต่ยังไม่มี loan
      case 'REJECTED':
        return { text: 'ถูกปฏิเสธ', color: 'destructive', showBadge: true }
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
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
    {}
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Use real data if available, fallback to mock data
  const agentId = session?.user?.id
  const {
    data: loansData,
    isLoading,
    error,
  } = useGetLoansByAgentId(agentId || '')

  // Use only real data from database
  const allLoans = loansData?.success && loansData?.data ? loansData.data : []

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Agent Session:', session?.user)
    console.log('Agent ID:', agentId)
    console.log('Loans Data:', loansData)
    console.log('All Loans Array:', allLoans)
    console.log('All Loans Length:', allLoans?.length)
    if (allLoans?.length > 0) {
      console.log('Sample Loan:', allLoans[0])
      console.log(
        'Sample remainingBalance type:',
        typeof allLoans[0]?.remainingBalance
      )
      console.log(
        'Sample remainingBalance value:',
        allLoans[0]?.remainingBalance
      )
    }
    if (error) console.log('API Error:', error)
  }

  // Group loans by customer and filter by search term
  const customersWithLoans = useMemo(() => {
    const customerMap = new Map()

    allLoans.forEach((loan: any) => {
      // Handle loans with or without customer data
      const customerId = loan.customer?.id || `no-customer-${loan.id}`
      const isNoCustomer = !loan.customer?.id

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          customerName: isNoCustomer ? 'ไม่ระบุลูกค้า' : getCustomerName(loan.customer),
          phoneNumber: isNoCustomer ? 'ไม่ระบุ' : (loan.customer?.phoneNumber || 'ไม่ระบุ'),
          loans: [],
          totalBalance: 0,
          loanCount: 0,
          isNoCustomer: isNoCustomer,
        })
      }

      const customer = customerMap.get(customerId)
      customer.loans.push(loan)
      // Add to balance for active loans with remaining balance (ensure numeric calculation)
      if (
        loan.type === 'LOAN' &&
        ['ACTIVE', 'DEFAULTED'].includes(loan.status) &&
        Number(loan.remainingBalance) > 0
      ) {
        customer.totalBalance += Number(loan.remainingBalance) || 0
      } else if (loan.type === 'APPLICATION' && loan.status === 'APPROVED') {
        customer.totalBalance += Number(loan.principalAmount) || 0
      }
      customer.loanCount += 1
    })

    const customers = Array.from(customerMap.values())

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const searchNumber = parseFloat(searchTerm.replace(/,/g, '')) // Remove commas for number search
      
      return customers.filter((customer) => {
        // Search by customer name
        const nameMatch = customer.customerName.toLowerCase().includes(searchLower)
        
        // Search by phone number
        const phoneMatch = customer.phoneNumber.includes(searchTerm)
        
        // Search by loan number/ID
        const loanNumberMatch = customer.loans.some((loan: any) =>
          loan.loanNumber.toLowerCase().includes(searchLower) ||
          loan.id.toLowerCase().includes(searchLower)
        )
        
        // Search by loan amount (principal amount, remaining balance, monthly payment)
        const amountMatch = !isNaN(searchNumber) && customer.loans.some((loan: any) => {
          const principal = Number(loan.principalAmount) || 0
          const remaining = Number(loan.remainingBalance) || 0
          const monthly = Number(loan.monthlyPayment) || 0
          
          return principal === searchNumber || 
                 remaining === searchNumber || 
                 monthly === searchNumber ||
                 Math.abs(principal - searchNumber) < 1000 || // Allow some tolerance
                 Math.abs(remaining - searchNumber) < 1000 ||
                 Math.abs(monthly - searchNumber) < 100
        })
        
        return nameMatch || phoneMatch || loanNumberMatch || amountMatch
      })
    }

    return customers
  }, [allLoans, searchTerm])

  // Pagination logic
  const totalPages = Math.ceil(customersWithLoans.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedCustomers = customersWithLoans.slice(startIndex, endIndex)

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const toggleCard = (customerId: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [customerId]: !prev[customerId],
    }))
  }

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
          <h1 className="text-xl font-bold text-white">ผลิตภัณฑ์ของลูกค้า</h1>
          <p className="text-sm text-muted-foreground">
            จำนวน {customersWithLoans.length} ลูกค้า
            {searchTerm && ` (แสดง ${paginatedCustomers.length} รายการ)`}
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
          placeholder="ค้นหาด้วยชื่อลูกค้า, เบอร์โทร, เลขที่สัญญา, หรือยอดเงิน"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {paginatedCustomers.map((customer) => {
          const isExpanded = expandedCards[customer.id] || false
          const hasOverdueLoans = customer.loans.some((loan: any) => {
            if (loan.type !== 'LOAN') return false
            const days = getDaysUntilPayment(loan.nextPaymentDate)
            return days < 0 && loan.status === 'DEFAULTED'
          })
          const hasActiveLoans = customer.loans.some(
            (loan: any) => loan.type === 'LOAN' && loan.status === 'ACTIVE'
          )
          const hasCompletedLoans = customer.loans.some(
            (loan: any) => loan.type === 'LOAN' && loan.status === 'COMPLETED'
          )
          const hasPendingApplications = customer.loans.some(
            (loan: any) =>
              loan.type === 'APPLICATION' &&
              ['UNDER_REVIEW', 'SUBMITTED', 'DRAFT'].includes(loan.status)
          )
          const hasApprovedApplications = customer.loans.some(
            (loan: any) => loan.type === 'APPLICATION' && loan.status === 'APPROVED'
          )
          const hasRejectedApplications = customer.loans.some(
            (loan: any) => loan.type === 'APPLICATION' && loan.status === 'REJECTED'
          )

          return (
            <Card
              key={customer.id}
              className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base text-foreground mb-1 flex items-center gap-2">
                      <User className={`h-4 w-4 ${customer.isNoCustomer ? 'text-muted-foreground' : ''}`} />
                      <span className={customer.isNoCustomer ? 'text-muted-foreground italic' : ''}>
                        {customer.customerName}
                      </span>
                      {customer.isNoCustomer && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                          ไม่มีข้อมูลลูกค้า
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{customer.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        <span>{customer.loanCount} สินเชื่อ</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-primary">
                      ยอดคงเหลือรวม: {formatThaiCurrency(customer.totalBalance)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {/* Priority order: Overdue > Rejected > Pending > Approved > Completed > Active */}
                    {hasOverdueLoans && (
                      <Badge variant="destructive" className="text-xs">
                        ค้างชำระ
                      </Badge>
                    )}
                    {!hasOverdueLoans && hasRejectedApplications && (
                      <Badge variant="destructive" className="text-xs">
                        ถูกปฏิเสธ
                      </Badge>
                    )}
                    {!hasOverdueLoans &&
                      !hasRejectedApplications &&
                      hasPendingApplications && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                          รออนุมัติ
                        </Badge>
                      )}
                    {!hasOverdueLoans &&
                      !hasRejectedApplications &&
                      !hasPendingApplications &&
                      hasApprovedApplications && (
                        <Badge
                          variant="default"
                          className="text-xs bg-green-100 text-green-800 border-green-200">
                          อนุมัติแล้ว
                        </Badge>
                      )}
                    {!hasOverdueLoans &&
                      !hasRejectedApplications &&
                      !hasPendingApplications &&
                      !hasApprovedApplications &&
                      hasCompletedLoans && (
                        <Badge
                          variant="default"
                          className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                          ชำระครบแล้ว
                        </Badge>
                      )}
                    {!hasOverdueLoans &&
                      !hasRejectedApplications &&
                      !hasPendingApplications &&
                      !hasApprovedApplications &&
                      !hasCompletedLoans &&
                      hasActiveLoans && (
                        <Badge variant="default" className="text-xs">
                          มีสินเชื่อ
                        </Badge>
                      )}
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
                      <span className="text-xs">ดูรายละเอียดสินเชื่อ</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              {isExpanded && (
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-3">
                    {customer.loans.map((loan: any) => {
                      // Calculate actual paid installments from installments data
                      const paidInstallments = loan.installments 
                        ? loan.installments.filter((inst: any) => inst.isPaid).length 
                        : loan.currentInstallment || 0
                      
                      const progress =
                        loan.totalInstallments > 0
                          ? (paidInstallments / loan.totalInstallments) * 100
                          : 0
                      const nextPaymentDays = getDaysUntilPayment(
                        loan.nextPaymentDate
                      )
                      const isOverdue =
                        nextPaymentDays < 0 && loan.type === 'LOAN'
                      const statusInfo = getStatusInfo(
                        loan.displayStatus || loan.status,
                        loan.type
                      )
                      const loanTypeName = getLoanTypeName(loan.loanType)
                      const isApplication = loan.type === 'APPLICATION'

                      return (
                        <div
                          key={loan.id}
                          className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">
                                {loanTypeName}
                              </h4>
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

                          {!isApplication && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                  ความคืบหน้า
                                </span>
                                <span className="font-medium text-foreground">
                                  งวดที่ {paidInstallments}/
                                  {loan.totalInstallments}
                                </span>
                              </div>
                              <Progress value={progress} className="h-2" />
                              <p className="text-xs text-muted-foreground">
                                {progress.toFixed(1)}% เสร็จสิ้น
                              </p>
                            </div>
                          )}

                          {isApplication && (
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
                          )}

                          {!isApplication && (
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
                                <p className="text-muted-foreground mb-1">
                                  ยอดคงเหลือ
                                </p>
                                <p className="font-semibold text-foreground">
                                  {formatThaiCurrency(loan.remainingBalance)}
                                </p>
                              </div>
                            </div>
                          )}

                          {!isApplication && (
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
                          )}

                          {isApplication && (
                            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <Calendar className="h-4 w-4 text-blue-600" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-800">
                                  วันที่ส่งใบสมัคร
                                </p>
                                <p className="text-xs text-blue-600">
                                  {formatDate(loan.nextPaymentDate)}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              asChild={!customer.isNoCustomer}
                              className="flex-1"
                              variant={isOverdue ? 'default' : 'outline'}
                              disabled={customer.isNoCustomer}>
                              {!customer.isNoCustomer ? (
                                <Link
                                  href={
                                    isApplication
                                      ? `/agent/customers/${customer.id}/applications/${loan.id}`
                                      : `/agent/customers/${customer.id}/loans/${loan.id}`
                                  }>
                                  {isApplication
                                    ? 'ดูใบสมัคร'
                                    : isOverdue
                                      ? 'ติดตามการชำระ'
                                      : 'ดูรายละเอียด'}
                                </Link>
                              ) : (
                                <span>
                                  {isApplication
                                    ? 'ดูใบสมัคร'
                                    : isOverdue
                                      ? 'ติดตามการชำระ'
                                      : 'ดูรายละเอียด'}
                                  {' (ไม่มีข้อมูลลูกค้า)'}
                                </span>
                              )}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              asChild={!customer.isNoCustomer}
                              disabled={customer.isNoCustomer}>
                              {!customer.isNoCustomer ? (
                                <Link href={`/agent/customers/${customer.id}`}>
                                  <User className="h-4 w-4" />
                                </Link>
                              ) : (
                                <User className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground text-center">
            แสดง {startIndex + 1}-{Math.min(endIndex, customersWithLoans.length)} จาก {customersWithLoans.length} รายการ
          </p>
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}>
              ก่อนหน้า
            </Button>
            <span className="text-sm font-medium">
              หน้า {currentPage} จาก {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}>
              ถัดไป
            </Button>
          </div>
        </div>
      )}

      {customersWithLoans.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm ? 'ไม่พบข้อมูลที่ค้นหา' : 'ไม่มีข้อมูลลูกค้า'}
          </p>
        </div>
      )}

      {/* Summary Card */}
      {customersWithLoans.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
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
                    const totalBalance = allLoans.reduce((sum: any, loan: any) => {
                      const currentSum = Number(sum)
                      if (
                        loan.type === 'LOAN' &&
                        ['ACTIVE', 'DEFAULTED'].includes(loan.status) &&
                        Number(loan.remainingBalance) > 0
                      ) {
                        const amount = Number(loan.remainingBalance || 0)
                        if (process.env.NODE_ENV === 'development') {
                          console.log(
                            `Adding LOAN ${loan.id}: ${amount} (sum: ${currentSum} -> ${currentSum + amount})`
                          )
                        }
                        return currentSum + amount
                      } else if (
                        loan.type === 'APPLICATION' &&
                        loan.status === 'APPROVED'
                      ) {
                        const amount = Number(loan.principalAmount || 0)
                        if (process.env.NODE_ENV === 'development') {
                          console.log(
                            `Adding APPLICATION ${loan.id}: ${amount} (sum: ${currentSum} -> ${currentSum + amount})`
                          )
                        }
                        return currentSum + amount
                      }
                      return currentSum
                    }, 0)

                    if (process.env.NODE_ENV === 'development') {
                      console.log('Final Total Balance:', totalBalance)
                    }

                    return formatThaiCurrency(totalBalance)
                  })()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {customersWithLoans.length} ลูกค้า •{' '}
                  {customersWithLoans.reduce(
                    (sum, customer) => sum + customer.loanCount,
                    0
                  )}{' '}
                  สินเชื่อ
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
