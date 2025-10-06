import { PrismaClient } from '@prisma/client'
import { BaseRepository } from '@src/shared/repositories/baseRepository'
import type { LoanApplication, ApplicationStatus, LoanType } from '@prisma/client'

const prisma = new PrismaClient()

export class LoanApplicationRepository extends BaseRepository<typeof prisma.loanApplication> {
  constructor() {
    super(prisma.loanApplication)
  }

  /**
   * Find loan application by customer phone number
   */
  async findByCustomerPhone(phoneNumber: string) {
    return this.model.findFirst({
      where: {
        customer: {
          phoneNumber
        }
      },
      include: {
        customer: {
          include: {
            profile: true
          }
        },
        agent: {
          include: {
            profile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  /**
   * Find loan applications by agent ID
   */
  async findByAgentId(agentId: string) {
    return this.model.findMany({
      where: {
        agentId
      },
      include: {
        customer: {
          include: {
            profile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
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
            profile: true
          }
        },
        agent: {
          include: {
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
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
    
    // Property information
    propertyType?: string
    propertyValue?: number
    propertyArea?: string
    propertyLocation?: string
    landNumber?: string
    ownerName?: string
    
    // Submission timestamp
    submittedAt?: Date
  }) {
    return this.model.create({
      data: {
        ...data,
        completedSteps: data.completedSteps,
        supportingImages: data.supportingImages || [],
        titleDeedData: data.titleDeedData || {},
      },
      include: {
        customer: {
          include: {
            profile: true
          }
        },
        agent: {
          include: {
            profile: true
          }
        }
      }
    })
  }

  /**
   * Update application status
   */
  async updateStatus(id: string, status: ApplicationStatus, reviewedBy?: string, reviewNotes?: string) {
    return this.model.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy,
        reviewNotes,
      }
    })
  }
}

export const loanApplicationRepository = new LoanApplicationRepository()
