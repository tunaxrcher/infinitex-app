// src/features/products/repositories/loanRepository.ts
import { prisma } from '@src/shared/lib/db'
import { BaseRepository } from '@src/shared/repositories/baseRepository'

export class LoanRepository extends BaseRepository<typeof prisma.loan> {
  constructor() {
    super(prisma.loan)
  }

  // Find loans by customer ID
  async findByCustomerId(customerId: string) {
    return this.model.findMany({
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
    })
  }

  // Find loans by agent ID
  async findByAgentId(agentId: string) {
    return this.model.findMany({
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
    })
  }

  // Find loan with full details
  async findWithFullDetails(id: string) {
    return this.model.findUnique({
      where: { id },
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
        },
        installments: {
          orderBy: { dueDate: 'asc' },
        },
      },
    })
  }

  // Find loans by status
  async findByStatus(status: string) {
    return this.model.findMany({
      where: { status: status as any },
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
    })
  }

  // Get loan statistics
  async getStatistics(filters?: any) {
    const where = this.buildWhereClause(filters)

    const [
      totalLoans,
      activeLoans,
      completedLoans,
      defaultedLoans,
      totalPrincipal,
      totalRemaining,
    ] = await Promise.all([
      this.model.count({ where }),
      this.model.count({ where: { ...where, status: 'ACTIVE' } }),
      this.model.count({ where: { ...where, status: 'COMPLETED' } }),
      this.model.count({ where: { ...where, status: 'DEFAULTED' } }),
      this.model.aggregate({
        where,
        _sum: { principalAmount: true },
      }),
      this.model.aggregate({
        where,
        _sum: { remainingBalance: true },
      }),
    ])

    return {
      totalLoans,
      activeLoans,
      completedLoans,
      defaultedLoans,
      totalPrincipal: totalPrincipal._sum.principalAmount || 0,
      totalRemaining: totalRemaining._sum.remainingBalance || 0,
    }
  }

  private buildWhereClause(filters?: any) {
    if (!filters) return {}

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

    return where
  }
}

export const loanRepository = new LoanRepository()
