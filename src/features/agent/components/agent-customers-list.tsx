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
    loanNumber: 'LN001234570',
    loanType: 'HOUSE_LAND_MORTGAGE',
    currentInstallment: 0,
    totalInstallments: 12,
    monthlyPayment: 2500.0,
    remainingBalance: 30000.0,
    principalAmount: 30000.0,
    nextPaymentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    status: 'ACTIVE',
    customer: {
      id: '3',
      phoneNumber: '083-456-7890',
      profile: {
        firstName: 'ประชา',
        lastName: 'ดีมาก',
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

const getStatusInfo = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return { text: 'ปกติ', color: 'success' }
    case 'COMPLETED':
      return { text: 'เสร็จสิ้น', color: 'success' }
    case 'DEFAULTED':
      return { text: 'ค้างชำระ', color: 'destructive' }
    case 'CANCELLED':
      return { text: 'ยกเลิก', color: 'destructive' }
    default:
      return { text: 'รออนุมัติ', color: 'warning' }
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
  const { data: loansData, isLoading } = useGetLoansByAgentId(
    session?.user?.id || ''
  )
  const allLoans = loansData?.data || mockCustomerLoans

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
      customer.totalBalance += loan.remainingBalance
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
            const days = getDaysUntilPayment(loan.nextPaymentDate)
            return days < 0
          })
          const hasActiveLoans = customer.loans.some(
            (loan) => loan.status === 'ACTIVE'
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
                    {hasOverdueLoans && (
                      <Badge variant="destructive" className="text-xs">
                        ค้างชำระ
                      </Badge>
                    )}
                    {hasActiveLoans && (
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
                      const progress =
                        (loan.currentInstallment / loan.totalInstallments) * 100
                      const nextPaymentDays = getDaysUntilPayment(
                        loan.nextPaymentDate
                      )
                      const isOverdue = nextPaymentDays < 0
                      const statusInfo = getStatusInfo(loan.status)
                      const loanTypeName = getLoanTypeName(loan.loanType)

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
                            <Badge
                              variant={getBadgeVariant(statusInfo.color)}
                              className={getBadgeClassName(statusInfo.color)}>
                              {statusInfo.text}
                            </Badge>
                          </div>

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
                              <Link
                                href={`/agent/customers/${customer.id}/loans/${loan.id}`}>
                                {isOverdue ? 'ติดตามการชำระ' : 'ดูรายละเอียด'}
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/agent/customers/${customer.id}`}>
                                <TrendingUp className="h-4 w-4" />
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