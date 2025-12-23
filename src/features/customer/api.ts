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

export const customerApi = {
  getListByAgent: async (filters: any = {}) => {
    return api.get(`/api/customers?${buildSearchParams(filters)}`)
  },

  getById: async (id: string) => api.get(`/api/customers/${id}`),

  create: async (data: any) => api.post(`/api/customers`, data),

  update: async (id: string, data: any) =>
    api.put(`/api/customers/${id}`, data),

  delete: async (id: string) => api.delete(`/api/customers/${id}`),

  assignToAgent: async (data: { customerId: string; agentId: string }) =>
    api.post(`/api/customers/assign-agent`, data),

  search: async (searchTerm: string, agentId?: string) => {
    const params = { search: searchTerm, agentId }
    return api.get(`/api/customers/search?${buildSearchParams(params)}`)
  },
}
