import type {
  ApplicationStatus,
  LoanApplication,
  LoanType,
} from '@prisma/client'
import { prisma } from '@src/shared/lib/db'
import { BaseRepository } from '@src/shared/repositories/baseRepository'

export class LoanApplicationRepository extends BaseRepository<
  typeof prisma.loanApplication
> {
  constructor() {
    super(prisma.loanApplication)
  }

  /**
   * Find loan application by ID
   */
  async findById(id: string) {
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
      },
    })
  }

  /**
   * Find loan application by customer phone number
   */
  async findByCustomerPhone(phoneNumber: string) {
    return this.model.findFirst({
      where: {
        customer: {
          phoneNumber,
        },
      },
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
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Find loan applications by agent ID
   */
  async findByAgentId(agentId: string) {
    return this.model.findMany({
      where: {
        agentId,
      },
      include: {
        customer: {
          include: {
            profile: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * Find loan applications by status
   */
  async findByStatus(status: ApplicationStatus) {
    return this.model.findMany({
      where: { status },
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

  /**
   * Create loan application with full data
   */
  async createWithFullData(data: {
    customerId: string
    agentId?: string
    loanType: LoanType
    status: ApplicationStatus
    currentStep: number
    completedSteps: number[]
    isNewUser: boolean
    submittedByAgent: boolean

    // Title deed information
    titleDeedImage?: string
    titleDeedData?: any

    // Supporting documents
    supportingImages?: string[]

    // ID Card
    idCardFrontImage?: string
    idCardBackImage?: string

    // Loan amount
    requestedAmount: number
    maxApprovedAmount?: number

    // Loan terms (default 0, set by admin later)
    termMonths?: number
    interestRate?: number

    // Property information
    propertyType?: string
    propertyValue?: number
    propertyArea?: string
    propertyLocation?: string
    propertyAddress?: string
    landNumber?: string
    ownerName?: string

    // Submission timestamp
    submittedAt?: Date
  }) {
    // Extract customerId and agentId for nested connect
    const { customerId, agentId, ...restData } = data

    return this.model.create({
      data: {
        ...restData,
        customer: {
          connect: { id: customerId },
        },
        ...(agentId && {
          agent: {
            connect: { id: agentId },
          },
        }),
        completedSteps: data.completedSteps,
        supportingImages: data.supportingImages || [],
        titleDeedData: data.titleDeedData || {},
      },
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
    })
  }

  /**
   * Update application status
   */
  async updateStatus(
    id: string,
    status: ApplicationStatus,
    reviewedBy?: string,
    reviewNotes?: string
  ) {
    return this.model.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy,
        reviewNotes,
      },
    })
  }
}

export const loanApplicationRepository = new LoanApplicationRepository()
