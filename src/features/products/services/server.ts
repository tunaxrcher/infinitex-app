// src/features/products/services/server.ts
import { prisma } from '@src/shared/lib/db'
import 'server-only'

import { loanRepository } from '../repositories/loanRepository'
import { type LoanCreateSchema, type LoanUpdateSchema } from '../validations'

export const loanService = {
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
    // Get both loans and loan applications for the customer
    const [loans, applications] = await Promise.all([
      loanRepository.findByCustomerId(customerId),
      prisma.loanApplication.findMany({
        where: { customerId },
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
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Combine and format the data
    const combinedData = [
      // Add loans with type indicator
      ...loans.map((loan) => ({
        ...loan,
        type: 'LOAN' as const,
        displayStatus: loan.status,
      })),
      // Add applications with type indicator
      ...applications.map((app) => ({
        ...app,
        type: 'APPLICATION' as const,
        displayStatus: app.status,
        // Map application fields to loan-like structure for consistency
        loanNumber: `APP-${app.id.slice(-8)}`,
        loanType: app.loanType,
        principalAmount: app.requestedAmount,
        monthlyPayment: 0,
        remainingBalance: app.requestedAmount,
        currentInstallment: 0,
        totalInstallments: 0,
        nextPaymentDate: app.submittedAt || app.createdAt,
      })),
    ]

    // Sort by creation date (newest first)
    return combinedData.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async getByAgentId(agentId: string) {
    // Get both loans and loan applications for the agent
    const [loans, applications] = await Promise.all([
      loanRepository.findByAgentId(agentId),
      prisma.loanApplication.findMany({
        where: { agentId },
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
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    // Create a set of application IDs that have corresponding loans
    const loanApplicationIds = new Set(
      loans
        .filter((loan) => loan.applicationId)
        .map((loan) => loan.applicationId)
    )

    // Filter applications based on clear rules:
    // 1. Show applications that are pending approval (SUBMITTED, UNDER_REVIEW, DRAFT)
    // 2. Show applications that are rejected (REJECTED)
    // 3. Hide applications that are approved AND have corresponding loans (to avoid duplicates)
    const filteredApplications = applications.filter((app) => {
      // Always show pending applications (waiting for approval)
      if (['SUBMITTED', 'UNDER_REVIEW', 'DRAFT'].includes(app.status)) {
        return true
      }

      // Always show rejected applications
      if (app.status === 'REJECTED') {
        return true
      }

      // For approved applications, only hide if there's a corresponding loan
      if (app.status === 'APPROVED' && loanApplicationIds.has(app.id)) {
        return false // Hide because the loan will be shown instead
      }

      // Show approved applications that don't have corresponding loans yet
      if (app.status === 'APPROVED' && !loanApplicationIds.has(app.id)) {
        return true
      }

      // Hide other statuses by default
      return false
    })

    // Combine and format the data
    const combinedData = [
      // Add loans with type indicator
      ...loans.map((loan) => ({
        ...loan,
        type: 'LOAN' as const,
        displayStatus: loan.status,
      })),
      // Add filtered applications with type indicator
      ...filteredApplications.map((app) => ({
        ...app,
        type: 'APPLICATION' as const,
        displayStatus: app.status,
        // Map application fields to loan-like structure for consistency
        loanNumber: `APP-${app.id.slice(-8)}`,
        loanType: app.loanType,
        principalAmount: app.requestedAmount,
        monthlyPayment: 0,
        remainingBalance: app.requestedAmount,
        currentInstallment: 0,
        totalInstallments: 0,
        nextPaymentDate: app.submittedAt || app.createdAt,
      })),
    ]

    // Sort by creation date (newest first)
    return combinedData.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async create(data: LoanCreateSchema, createdBy?: string) {
    // Generate loan number
    const loanCount = await loanRepository.model.count()
    const loanNumber = `FX-${new Date().getFullYear()}-${String(loanCount + 1).padStart(6, '0')}`

    // Calculate monthly payment (simple calculation)
    const monthlyInterestRate = data.interestRate / 100 / 12
    const monthlyPayment =
      (data.principalAmount *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, data.termMonths)) /
      (Math.pow(1 + monthlyInterestRate, data.termMonths) - 1)

    return loanRepository.create({
      data: {
        loanNumber,
        customerId: data.customerId,
        loanType: data.loanType as any,
        principalAmount: data.principalAmount,
        interestRate: data.interestRate,
        termMonths: data.termMonths,
        monthlyPayment: Math.round(monthlyPayment * 100) / 100,
        totalInstallments: data.termMonths,
        remainingBalance: data.principalAmount,
        nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        contractDate: new Date(),
        expiryDate: new Date(
          Date.now() + data.termMonths * 30 * 24 * 60 * 60 * 1000
        ),
        titleDeedNumber: data.titleDeedNumber,
        collateralValue: data.collateralValue,
        collateralDetails: data.collateralDetails,
        applicationId: '', // This should be provided from loan application
      },
    })
  },

  async update(id: string, data: LoanUpdateSchema, updatedBy?: string) {
    const existingLoan = await this.getById(id)

    // Recalculate monthly payment if principal amount, interest rate, or term changed
    let monthlyPayment = existingLoan.monthlyPayment
    if (data.principalAmount || data.interestRate || data.termMonths) {
      const principal = data.principalAmount || existingLoan.principalAmount
      const rate = data.interestRate || existingLoan.interestRate
      const term = data.termMonths || existingLoan.termMonths

      const monthlyInterestRate = Number(rate) / 100 / 12
      monthlyPayment =
        (Number(principal) *
          monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, term)) /
        (Math.pow(1 + monthlyInterestRate, term) - 1)
      monthlyPayment = Math.round(monthlyPayment * 100) / 100
    }

    return loanRepository.update({
      where: { id },
      data: {
        ...data,
        monthlyPayment,
        updatedAt: new Date(),
      },
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
