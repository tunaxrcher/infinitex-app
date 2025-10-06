import { prisma } from '@src/shared/lib/db'
import 'server-only'

import { customerRepository } from '../repositories/customerRepository'
import {
  type CustomerCreateSchema,
  type CustomerUpdateSchema,
} from '../validations'

export const customerService = {
  async getListByAgent(agentId: string, filters: any = {}) {
    try {
      const agentCustomers = await customerRepository.findByAgentId(agentId)

      // Transform data for frontend
      const customers = agentCustomers.map((ac) => ({
        id: ac.customer.id,
        name: ac.customer.profile
          ? `${ac.customer.profile.firstName || ''} ${ac.customer.profile.lastName || ''}`.trim()
          : 'ไม่ระบุชื่อ',
        phoneNumber: ac.customer.phoneNumber,
        loanCount: ac.customer.loans.length,
        applicationCount: ac.customer.loanApplications.length,
        lastApplicationStatus: ac.customer.loanApplications[0]?.status || null,
        assignedAt: ac.assignedAt,
        profile: ac.customer.profile,
        isActive: ac.customer.isActive,
      }))

      // Apply search filter if provided
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        return customers.filter(
          (customer) =>
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.phoneNumber.includes(searchTerm)
        )
      }

      return customers
    } catch (error) {
      console.error('Error fetching agent customers:', error)
      throw new Error('ไม่สามารถดึงข้อมูลลูกค้าได้')
    }
  },

  async getById(id: string) {
    const customer = await customerRepository.findWithDetails(id)
    if (!customer) {
      throw new Error('ไม่พบข้อมูลลูกค้า')
    }
    return customer
  },

  async create(data: CustomerCreateSchema, agentId?: string) {
    try {
      // Normalize phone number (remove all non-digits)
      const normalizedPhone = data.phoneNumber.replace(/\D/g, '')

      // Check if phone number already exists
      const existingCustomer =
        await customerRepository.findByPhoneNumber(normalizedPhone)
      if (existingCustomer) {
        throw new Error('เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว')
      }

      // Check if name already exists (for the same agent)
      if (agentId) {
        const existingName = await prisma.agentCustomer.findFirst({
          where: {
            agentId,
            isActive: true,
            customer: {
              profile: {
                firstName: data.firstName,
                lastName: data.lastName || null,
              },
            },
          },
          include: {
            customer: {
              include: {
                profile: true,
              },
            },
          },
        })

        if (existingName) {
          const fullName = data.lastName
            ? `${data.firstName} ${data.lastName}`
            : data.firstName
          throw new Error(`ลูกค้าชื่อ "${fullName}" มีอยู่ในระบบแล้ว`)
        }
      }

      // Prepare customer data
      const customerData = {
        phoneNumber: normalizedPhone,
        userType: 'CUSTOMER' as const,
        isActive: true,
      }

      // Prepare profile data
      const profileData = {
        firstName: data.firstName,
        lastName: data.lastName || null, // จัดการกับ lastName ที่เป็น optional
        idCardNumber: data.idCardNumber || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        address: data.address || null,
        email: data.email || null,
        lineId: data.lineId || null,
        preferredLanguage: 'th',
        notificationEnabled: true,
        coinBalance: 0,
      }

      // Create customer with profile
      const customer = await customerRepository.createWithProfile(
        customerData,
        profileData
      )

      // If agentId is provided, create agent-customer relationship
      if (agentId) {
        await prisma.agentCustomer.create({
          data: {
            agentId,
            customerId: customer.id,
            isActive: true,
          },
        })
      }

      return customer
    } catch (error) {
      console.error('Error creating customer:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('ไม่สามารถสร้างลูกค้าได้')
    }
  },

  async update(id: string, data: CustomerUpdateSchema) {
    try {
      const existingCustomer = await customerRepository.findById(id)
      if (!existingCustomer) {
        throw new Error('ไม่พบข้อมูลลูกค้า')
      }

      // Check if phone number is being changed and already exists
      if (
        data.phoneNumber &&
        data.phoneNumber !== existingCustomer.phoneNumber
      ) {
        const phoneExists = await customerRepository.findByPhoneNumber(
          data.phoneNumber
        )
        if (phoneExists) {
          throw new Error('เบอร์โทรศัพท์นี้มีอยู่ในระบบแล้ว')
        }
      }

      // Update customer
      const customerUpdate: any = {}
      if (data.phoneNumber) customerUpdate.phoneNumber = data.phoneNumber

      // Update profile
      const profileUpdate: any = {}
      if (data.firstName !== undefined) profileUpdate.firstName = data.firstName
      if (data.lastName !== undefined) profileUpdate.lastName = data.lastName
      if (data.idCardNumber !== undefined)
        profileUpdate.idCardNumber = data.idCardNumber
      if (data.dateOfBirth !== undefined)
        profileUpdate.dateOfBirth = data.dateOfBirth
          ? new Date(data.dateOfBirth)
          : null
      if (data.address !== undefined) profileUpdate.address = data.address
      if (data.email !== undefined) profileUpdate.email = data.email
      if (data.lineId !== undefined) profileUpdate.lineId = data.lineId

      return customerRepository.update({
        where: { id },
        data: {
          ...customerUpdate,
          profile: {
            update: profileUpdate,
          },
        },
        include: {
          profile: true,
        },
      })
    } catch (error) {
      console.error('Error updating customer:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('ไม่สามารถอัปเดตข้อมูลลูกค้าได้')
    }
  },

  async delete(id: string) {
    try {
      // Soft delete by setting isActive to false
      return customerRepository.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Error deleting customer:', error)
      throw new Error('ไม่สามารถลบลูกค้าได้')
    }
  },

  async assignToAgent(customerId: string, agentId: string) {
    try {
      // Check if relationship already exists
      const existing = await prisma.agentCustomer.findUnique({
        where: {
          agentId_customerId: {
            agentId,
            customerId,
          },
        },
      })

      if (existing) {
        // Reactivate if exists but inactive
        if (!existing.isActive) {
          return prisma.agentCustomer.update({
            where: { id: existing.id },
            data: { isActive: true },
          })
        }
        throw new Error('ลูกค้านี้อยู่ภายใต้ Agent นี้อยู่แล้ว')
      }

      // Create new relationship
      return prisma.agentCustomer.create({
        data: {
          agentId,
          customerId,
          isActive: true,
        },
      })
    } catch (error) {
      console.error('Error assigning customer to agent:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('ไม่สามารถมอบหมายลูกค้าให้ Agent ได้')
    }
  },

  async searchCustomers(searchTerm: string, agentId?: string) {
    try {
      return customerRepository.searchCustomers(searchTerm, agentId)
    } catch (error) {
      console.error('Error searching customers:', error)
      throw new Error('ไม่สามารถค้นหาลูกค้าได้')
    }
  },
}
