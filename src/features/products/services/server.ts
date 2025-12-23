// src/features/products/services/server.ts
import { prisma } from '@src/shared/lib/db'
import 'server-only'

import { loanRepository } from '../repositories/loanRepository'
import { type LoanCreateSchema, type LoanUpdateSchema } from '../validations'

export const loanService = {
  // ============================================================
  // PRIVATE HELPER FUNCTIONS
  // ============================================================

  /**
   * Map application to loan-like structure for consistent display
   */
  _mapApplicationToLoanLike(app: any) {
    return {
      ...app,
      type: 'APPLICATION' as const,
      displayStatus: app.status,
      loanNumber: `APP-${app.id.slice(-8)}`,
      loanType: app.loanType,
      principalAmount: app.requestedAmount,
      monthlyPayment: 0,
      remainingBalance: app.requestedAmount,
      currentInstallment: 0,
      totalInstallments: 0,
      nextPaymentDate: app.submittedAt || app.createdAt,
    }
  },

  /**
   * Combine loans and applications, then sort by creation date
   */
  _combineLoansAndApplications(loans: any[], applications: any[]) {
    const combinedData = [
      ...loans.map((loan) => ({
        ...loan,
        type: 'LOAN' as const,
        displayStatus: loan.status,
      })),
      ...applications.map((app) => this._mapApplicationToLoanLike(app)),
    ]

    return combinedData.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  /**
   * Filter applications for agent view (exclude duplicates with loans)
   */
  _filterApplicationsForAgentView(applications: any[], loans: any[]) {
    const loanApplicationIds = new Set(
      loans.filter((l) => l.applicationId).map((l) => l.applicationId)
    )

    return applications.filter((app) => {
      const isPending = ['SUBMITTED', 'UNDER_REVIEW', 'DRAFT'].includes(
        app.status
      )
      const isRejected = app.status === 'REJECTED'
      const isApprovedWithoutLoan =
        app.status === 'APPROVED' && !loanApplicationIds.has(app.id)

      return isPending || isRejected || isApprovedWithoutLoan
    })
  },

  /**
   * Calculate monthly payment using standard amortization formula
   */
  _calculateMonthlyPayment(
    principal: number,
    interestRate: number,
    termMonths: number
  ): number {
    if (interestRate === 0 || termMonths === 0) return 0
    const monthlyRate = interestRate / 100 / 12
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
      (Math.pow(1 + monthlyRate, termMonths) - 1)
    return Math.round(payment * 100) / 100
  },

  // ============================================================
  // PUBLIC API
  // ============================================================

  async getList(filters: any) {
    // Build where clause for filtering
    const where: any = {}

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.loanType) {
      where.loanType = filters.loanType
    }

    if (filters.customerId) {
      where.customerId = filters.customerId
    }

    if (filters.agentId) {
      where.agentId = filters.agentId
    }

    if (filters.search) {
      where.OR = [
        { loanNumber: { contains: filters.search } },
        { titleDeedNumber: { contains: filters.search } },
        {
          customer: {
            OR: [
              { phoneNumber: { contains: filters.search } },
              {
                profile: {
                  OR: [
                    { firstName: { contains: filters.search } },
                    { lastName: { contains: filters.search } },
                  ],
                },
              },
            ],
          },
        },
      ]
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo)
      }
    }

    return loanRepository.paginate({
      where,
      include: {
        customer: {
          include: {
            profile: true,
          },
        },
        agent: {
          include: {
            profile: true,
          },
        },
        application: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        installments: {
          orderBy: { dueDate: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      page: filters.page || 1,
      limit: filters.limit || 10,
    })
  },

  async getById(id: string) {
    const loan = await loanRepository.findWithFullDetails(id)
    if (!loan) {
      throw new Error('ไม่พบข้อมูลสินเชื่อ')
    }
    return loan
  },

  async getByCustomerId(customerId: string) {
    const [loans, applications] = await Promise.all([
      loanRepository.findByCustomerId(customerId),
      prisma.loanApplication.findMany({
        where: { customerId },
        include: {
          customer: { include: { profile: true } },
          agent: { include: { profile: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return this._combineLoansAndApplications(loans, applications)
  },

  async getByAgentId(agentId: string) {
    const [loans, applications] = await Promise.all([
      loanRepository.findByAgentId(agentId),
      prisma.loanApplication.findMany({
        where: { agentId },
        include: {
          customer: { include: { profile: true } },
          agent: { include: { profile: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const filteredApplications = this._filterApplicationsForAgentView(
      applications,
      loans
    )
    return this._combineLoansAndApplications(loans, filteredApplications)
  },

  async create(data: LoanCreateSchema, createdBy?: string) {
    const loanCount = await loanRepository.model.count()
    const loanNumber = `FX-${new Date().getFullYear()}-${String(loanCount + 1).padStart(6, '0')}`
    const monthlyPayment = this._calculateMonthlyPayment(
      data.principalAmount,
      data.interestRate,
      data.termMonths
    )

    return loanRepository.create({
      data: {
        loanNumber,
        customerId: data.customerId,
        loanType: data.loanType as any,
        principalAmount: data.principalAmount,
        interestRate: data.interestRate,
        termMonths: data.termMonths,
        monthlyPayment,
        totalInstallments: data.termMonths,
        remainingBalance: data.principalAmount,
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        contractDate: new Date(),
        expiryDate: new Date(
          Date.now() + data.termMonths * 30 * 24 * 60 * 60 * 1000
        ),
        titleDeedNumber: data.titleDeedNumber,
        collateralValue: data.collateralValue,
        collateralDetails: data.collateralDetails,
        applicationId: '',
      },
    })
  },

  async update(id: string, data: LoanUpdateSchema, updatedBy?: string) {
    const existingLoan = await this.getById(id)

    let monthlyPayment = existingLoan.monthlyPayment
    if (data.principalAmount || data.interestRate || data.termMonths) {
      const principal = data.principalAmount || existingLoan.principalAmount
      const rate = data.interestRate || existingLoan.interestRate
      const term = data.termMonths || existingLoan.termMonths
      monthlyPayment = this._calculateMonthlyPayment(
        Number(principal),
        Number(rate),
        term
      )
    }

    return loanRepository.update({
      where: { id },
      data: { ...data, monthlyPayment, updatedAt: new Date() },
    })
  },

  async delete(id: string, deletedBy?: string) {
    // Soft delete - update status to CANCELLED
    return loanRepository.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    })
  },

  async toggleStatus(id: string, updatedBy?: string) {
    const loan = await this.getById(id)
    const newStatus = loan.status === 'ACTIVE' ? 'CANCELLED' : 'ACTIVE'

    return this.update(id, { status: newStatus as any }, updatedBy)
  },

  async getStatistics(filters?: any) {
    return loanRepository.getStatistics(filters)
  },
}
