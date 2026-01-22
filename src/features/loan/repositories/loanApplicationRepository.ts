import type {
  ApplicationStatus,
  DeedMode,
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
        titleDeeds: {
          orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
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
    deedMode?: DeedMode

    // Title deeds (both single and multiple mode - all deeds go here)
    titleDeeds?: Array<{
      imageUrl?: string
      imageKey?: string
      provinceName?: string
      amphurName?: string
      parcelNo?: string
      landAreaText?: string
      ownerName?: string
      titleDeedData?: any
      latitude?: string
      longitude?: string
      sortOrder?: number
      isPrimary?: boolean
    }>

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

    // Property information (kept for AI valuation)
    propertyValue?: number
    ownerName?: string
    totalPropertyValue?: number

    // Submission timestamp
    submittedAt?: Date
  }) {
    // Extract customerId, agentId, and titleDeeds for nested operations
    const { customerId, agentId, titleDeeds, ...restData } = data

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
        deedMode: data.deedMode || 'SINGLE',
        // Create title deeds if provided (both single and multiple mode)
        ...(titleDeeds &&
          titleDeeds.length > 0 && {
            titleDeeds: {
              create: titleDeeds.map((deed, index) => ({
                imageUrl: deed.imageUrl,
                imageKey: deed.imageKey,
                provinceName: deed.provinceName,
                amphurName: deed.amphurName,
                parcelNo: deed.parcelNo,
                landAreaText: deed.landAreaText,
                ownerName: deed.ownerName,
                titleDeedData: deed.titleDeedData || undefined,
                latitude: deed.latitude,
                longitude: deed.longitude,
                sortOrder: deed.sortOrder ?? index,
                isPrimary: deed.isPrimary ?? index === 0,
              })),
            },
          }),
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
        titleDeeds: true,
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

  /**
   * Get title deeds for an application
   * All applications should now have titleDeeds records
   */
  async getTitleDeeds(applicationId: string) {
    const titleDeeds = await prisma.titleDeed.findMany({
      where: { applicationId },
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
    })
    return titleDeeds
  }

  /**
   * Get primary title deed for an application
   */
  async getPrimaryTitleDeed(applicationId: string) {
    return prisma.titleDeed.findFirst({
      where: { applicationId, isPrimary: true },
    })
  }
}

export const loanApplicationRepository = new LoanApplicationRepository()
