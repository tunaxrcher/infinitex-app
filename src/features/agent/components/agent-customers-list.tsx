'use client'

import { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'

import Link from 'next/link'

import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { Progress } from '@src/shared/ui/progress'
import { Input } from '@src/shared/ui/input'
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
  TrendingUp,
  Users,
  Loader2,
  Search,
  Phone,
  User,
} from 'lucide-react'

import { useGetLoansByAgentId } from '@src/features/products/hooks'

// Mock data สำหรับ fallback
const mockCustomerLoans = [
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
    customer: {
      id: '1',
      phoneNumber: '081-234-5678',
      profile: {
        firstName: 'สมชาย',
        lastName: 'ใจดี',
      },
    },
  },
  {
    id: '2',
    loanNumber: 'LN001234568',
    loanType: 'HOUSE_LAND_MORTGAGE',
    currentInstallment: 18,
    totalInstallments: 24,
    monthlyPayment: 3500.0,
    remainingBalance: 21000.0,
    principalAmount: 84000.0,
    nextPaymentDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    status: 'ACTIVE',
    type: 'LOAN',
    displayStatus: 'ACTIVE',
    customer: {
      id: '1',
      phoneNumber: '081-234-5678',
      profile: {
        firstName: 'สมชาย',
        lastName: 'ใจดี',
      },
    },
  },
  {
    id: '3',
    loanNumber: 'LN001234569',
    loanType: 'HOUSE_LAND_MORTGAGE',
    currentInstallment: 2,
    totalInstallments: 36,
    monthlyPayment: 1500.0,
    remainingBalance: 51000.0,
    principalAmount: 54000.0,
    nextPaymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'DEFAULTED',
    type: 'LOAN',
    displayStatus: 'DEFAULTED',
    customer: {
      id: '2',
      phoneNumber: '082-345-6789',
      profile: {
        firstName: 'สมหญิง',
        lastName: 'สวยดี',
      },
    },
  },
  {
    id: '4',
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
    customer: {
      id: '3',
      phoneNumber: '083-456-7890',
      profile: {
        firstName: 'ประชา',
        lastName: 'ดีมาก',
      },
    },
  },
  {
    id: '5',
    loanNumber: 'APP-87654321',
    loanType: 'HOUSE_LAND_MORTGAGE',
    currentInstallment: 0,
    totalInstallments: 0,
    monthlyPayment: 0,
    remainingBalance: 450000.0,
    principalAmount: 450000.0,
    nextPaymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'REJECTED',
    type: 'APPLICATION',
    displayStatus: 'REJECTED',
    reviewNotes: 'รายได้ไม่เพียงพอตามเกณฑ์ที่กำหนด',
    customer: {
      id: '4',
      phoneNumber: '084-567-8901',
      profile: {
        firstName: 'นภัสสร',
        lastName: 'จันทร์เพ็ญ',
      },
    },
  },
  {
    id: '6',
    loanNumber: 'FX-2023-000001',
    loanType: 'HOUSE_LAND_MORTGAGE',
    currentInstallment: 12,
    totalInstallments: 12,
    monthlyPayment: 24800.0,
    remainingBalance: 0,
    principalAmount: 280000.0,
    nextPaymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    status: 'COMPLETED',
    type: 'LOAN',
    displayStatus: 'COMPLETED',
    customer: {
      id: '5',
      phoneNumber: '085-678-9012',
      profile: {
        firstName: 'ประยุทธ',
        lastName: 'มั่นคง',
      },
    },
  },
]

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
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState('')

  // Use real data if available, fallback to mock data
  const agentId = session?.user?.id
  const { data: loansData, isLoading, error } = useGetLoansByAgentId(agentId || '')
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Agent Session:', session?.user)
    console.log('Agent ID:', agentId)
    console.log('Loans Data:', loansData)
    if (error) console.log('API Error:', error)
  }
  
  // Use real data if we have it, otherwise use mock data
  const allLoans = (loansData?.success && loansData?.data) ? loansData.data : mockCustomerLoans

  // Group loans by customer and filter by search term
  const customersWithLoans = useMemo(() => {
    const customerMap = new Map()

    allLoans.forEach((loan) => {
      const customerId = loan.customer?.id
      if (!customerId) return

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          customerName: getCustomerName(loan.customer),
          phoneNumber: loan.customer?.phoneNumber || 'ไม่ระบุ',
          loans: [],
          totalBalance: 0,
          loanCount: 0,
        })
      }

      const customer = customerMap.get(customerId)
      customer.loans.push(loan)
      // Only add to balance if it's an actual loan (not application)
      if (loan.type === 'LOAN') {
        customer.totalBalance += loan.remainingBalance
      }
      customer.loanCount += 1
    })

    const customers = Array.from(customerMap.values())

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return customers.filter((customer) => {
        return (
          customer.customerName.toLowerCase().includes(searchLower) ||
          customer.phoneNumber.includes(searchTerm) ||
          customer.loans.some((loan) =>
            loan.loanNumber.toLowerCase().includes(searchLower)
          )
        )
      })
    }

    return customers
  }, [allLoans, searchTerm])

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
          placeholder="ค้นหาด้วยชื่อลูกค้า, เบอร์โทร หรือเลขที่สัญญา"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-4">
        {customersWithLoans.map((customer) => {
          const isExpanded = expandedCards[customer.id] || false
          const hasOverdueLoans = customer.loans.some((loan) => {
            if (loan.type !== 'LOAN') return false
            const days = getDaysUntilPayment(loan.nextPaymentDate)
            return days < 0 && loan.status === 'DEFAULTED'
          })
          const hasActiveLoans = customer.loans.some(
            (loan) => loan.type === 'LOAN' && loan.status === 'ACTIVE'
          )
          const hasCompletedLoans = customer.loans.some(
            (loan) => loan.type === 'LOAN' && loan.status === 'COMPLETED'
          )
          const hasPendingApplications = customer.loans.some(
            (loan) => loan.type === 'APPLICATION' && ['UNDER_REVIEW', 'SUBMITTED'].includes(loan.status)
          )
          const hasRejectedApplications = customer.loans.some(
            (loan) => loan.type === 'APPLICATION' && loan.status === 'REJECTED'
          )

          return (
            <Card
              key={customer.id}
              className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base text-foreground mb-1 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {customer.customerName}
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
                      ยอดคงเหลือรวม:{' '}
                      {customer.totalBalance.toLocaleString('th-TH', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      บาท
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {/* Priority order: Overdue > Rejected > Pending > Completed > Active */}
                    {hasOverdueLoans && (
                      <Badge variant="destructive" className="text-xs">
                        ค้างชำระ
                      </Badge>
                    )}
                    {!hasOverdueLoans && hasRejectedApplications && (
                      <Badge variant="destructive" className="text-xs">
                        ไม่อนุมัติ
                      </Badge>
                    )}
                    {!hasOverdueLoans && !hasRejectedApplications && hasPendingApplications && (
                      <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                        รออนุมัติ
                      </Badge>
                    )}
                    {!hasOverdueLoans && !hasRejectedApplications && !hasPendingApplications && hasCompletedLoans && (
                      <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">
                        ชำระครบแล้ว
                      </Badge>
                    )}
                    {!hasOverdueLoans && !hasRejectedApplications && !hasPendingApplications && !hasCompletedLoans && hasActiveLoans && (
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
                    {customer.loans.map((loan) => {
                      const progress = loan.totalInstallments > 0 
                        ? (loan.currentInstallment / loan.totalInstallments) * 100 
                        : 0
                      const nextPaymentDays = getDaysUntilPayment(
                        loan.nextPaymentDate
                      )
                      const isOverdue = nextPaymentDays < 0 && loan.type === 'LOAN'
                      const statusInfo = getStatusInfo(loan.displayStatus || loan.status, loan.type)
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
                                  งวดที่ {loan.currentInstallment}/
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
                                จำนวนเงินที่ขอ: {loan.principalAmount.toLocaleString('th-TH', {
                                  minimumFractionDigits: 2,
                                })} บาท
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
                              asChild
                              className="flex-1"
                              variant={isOverdue ? 'default' : 'outline'}>
                              <Link
                                href={isApplication 
                                  ? `/agent/customers/${customer.id}/applications/${loan.id}`
                                  : `/agent/customers/${customer.id}/loans/${loan.id}`
                                }>
                                {isApplication 
                                  ? 'ดูใบสมัคร'
                                  : isOverdue 
                                    ? 'ติดตามการชำระ' 
                                    : 'ดูรายละเอียด'
                                }
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/agent/customers/${customer.id}`}>
                                <User className="h-4 w-4" />
                              </Link>
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
                  {customersWithLoans
                    .reduce((sum, customer) => sum + customer.totalBalance, 0)
                    .toLocaleString('th-TH', {
                      minimumFractionDigits: 2,
                    })}{' '}
                  บาท
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