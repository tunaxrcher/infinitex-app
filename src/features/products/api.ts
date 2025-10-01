// src/features/products/api.ts
import { api } from '@src/shared/lib/api-client'

import { loanService } from './services/server'

export const loanApi = {
  getList: async (filters: any): ReturnType<typeof loanService.getList> => {
    const searchParams = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return api.get(`/api/loans?${searchParams}`)
  },

  getById: async (id: string): Promise<any> => {
    return api.get(`/api/loans/${id}`)
  },

  getByCustomerId: async (customerId: string): Promise<any> => {
    return api.get(`/api/loans/customer/${customerId}`)
  },

  getByAgentId: async (agentId: string): Promise<any> => {
    return api.get(`/api/loans/agent/${agentId}`)
  },

  create: async (data: any): Promise<any> => {
    return api.post(`/api/loans`, data)
  },

  update: async (id: string, data: any): Promise<any> => {
    return api.put(`/api/loans/${id}`, data)
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/api/loans/${id}`)
  },

  toggleStatus: async (id: string): Promise<void> => {
    return api.patch(`/api/loans/${id}/toggle-status`)
  },

  getStatistics: async (filters?: any): Promise<any> => {
    const searchParams = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
    }

    return api.get(`/api/loans/statistics?${searchParams}`)
  },
}
