import { prisma } from '@src/shared/lib/db'
import { BaseRepository } from '@src/shared/repositories/baseRepository'

export class CustomerRepository extends BaseRepository<typeof prisma.user> {
  constructor() {
    super(prisma.user)
  }

  // Find customers by agent ID
  async findByAgentId(agentId: string) {
    return prisma.agentCustomer.findMany({
      where: { 
        agentId,
        isActive: true 
      },
      include: {
        customer: {
          include: {
            profile: true,
            loanApplications: {
              select: {
                id: true,
                status: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc'
              }
            },
            loans: {
              select: {
                id: true,
                status: true,
                loanNumber: true,
              }
            }
          }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    })
  }

  // Find customer with profile and loan info
  async findWithDetails(id: string) {
    return this.model.findUnique({
      where: { id },
      include: {
        profile: true,
        loanApplications: {
          orderBy: { createdAt: 'desc' }
        },
        loans: {
          orderBy: { createdAt: 'desc' }
        },
        customerAgents: {
          where: { isActive: true },
          include: {
            agent: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    })
  }

  // Create customer with profile
  async createWithProfile(customerData: any, profileData: any) {
    return this.model.create({
      data: {
        ...customerData,
        userType: 'CUSTOMER',
        profile: {
          create: profileData
        }
      },
      include: {
        profile: true
      }
    })
  }

  // Search customers by name or phone
  async searchCustomers(searchTerm: string, agentId?: string) {
    const whereClause: any = {
      userType: 'CUSTOMER',
      OR: [
        {
          phoneNumber: {
            contains: searchTerm
          }
        },
        {
          profile: {
            OR: [
              {
                firstName: {
                  contains: searchTerm
                }
              },
              {
                lastName: {
                  contains: searchTerm
                }
              }
            ]
          }
        }
      ]
    }

    // If agentId is provided, filter by agent's customers
    if (agentId) {
      whereClause.customerAgents = {
        some: {
          agentId,
          isActive: true
        }
      }
    }

    return this.model.findMany({
      where: whereClause,
      include: {
        profile: true,
        loanApplications: {
          select: {
            id: true,
            status: true,
          }
        },
        loans: {
          select: {
            id: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  // Check if customer exists by phone number
  async findByPhoneNumber(phoneNumber: string) {
    return this.model.findUnique({
      where: { phoneNumber },
      include: {
        profile: true
      }
    })
  }
}

export const customerRepository = new CustomerRepository()
