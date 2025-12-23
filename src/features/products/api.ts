// src/features/products/api.ts
import { api } from '@src/shared/lib/api-client'

/**
 * Build URLSearchParams from filters object
 */
function buildSearchParams(filters: Record<string, any> = {}): string {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString())
    }
  })
  return params.toString()
}

export const loanApi = {
  getList: async (filters: any) => {
    return api.get(`/api/loans?${buildSearchParams(filters)}`)
  },

  getById: async (id: string) => api.get(`/api/loans/${id}`),

  getByCustomerId: async (customerId: string) =>
    api.get(`/api/loans/customer/${customerId}`),

  getByAgentId: async (agentId: string) =>
    api.get(`/api/loans/agent/${agentId}`),

  create: async (data: any) => api.post(`/api/loans`, data),

  update: async (id: string, data: any) => api.put(`/api/loans/${id}`, data),

  delete: async (id: string) => api.delete(`/api/loans/${id}`),

  toggleStatus: async (id: string) =>
    api.patch(`/api/loans/${id}/toggle-status`),

  getStatistics: async (filters?: any) => {
    return api.get(`/api/loans/statistics?${buildSearchParams(filters)}`)
  },
}
