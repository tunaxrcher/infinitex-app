import { api } from '@src/shared/lib/api-client'

import { customerService } from './services/server'

export const customerApi = {
  getListByAgent: async (filters: any = {}): Promise<ReturnType<typeof customerService.getListByAgent>> => {
    const searchParams = new URLSearchParams()

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return api.get(`/api/customers?${searchParams}`)
  },

  getById: async (id: string): Promise<any> => {
    return api.get(`/api/customers/${id}`)
  },

  create: async (data: any): Promise<any> => {
    return api.post(`/api/customers`, data)
  },

  update: async (id: string, data: any): Promise<any> => {
    return api.put(`/api/customers/${id}`, data)
  },

  delete: async (id: string): Promise<void> => {
    return api.delete(`/api/customers/${id}`)
  },

  assignToAgent: async (data: { customerId: string; agentId: string }): Promise<void> => {
    return api.post(`/api/customers/assign-agent`, data)
  },

  search: async (searchTerm: string, agentId?: string): Promise<any> => {
    const searchParams = new URLSearchParams()
    searchParams.append('search', searchTerm)
    if (agentId) {
      searchParams.append('agentId', agentId)
    }

    return api.get(`/api/customers/search?${searchParams}`)
  },
}
