import { api } from '@src/shared/lib/api-client'

export const loanApi = {
  /**
   * Submit loan application
   */
  submitApplication: async (data: any): Promise<any> => {
    return api.post('/api/loans/submit', data)
  },

  /**
   * Analyze title deed image
   */
  analyzeTitleDeed: async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)

    return api.post('/api/loans/title-deed/analyze', formData)
  },

  /**
   * Manual title deed lookup
   */
  manualTitleDeedLookup: async (data: {
    pvCode: string
    amCode: string
    parcelNo: string
  }): Promise<any> => {
    return api.post('/api/loans/title-deed/manual-lookup', data)
  },

  /**
   * Upload ID card
   */
  uploadIdCard: async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)

    return api.post('/api/loans/id-card/upload', formData)
  },

  /**
   * Upload supporting image (single file)
   */
  uploadSupportingImage: async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file_0', file)

    return api.post('/api/loans/supporting-images/upload', formData)
  },

  /**
   * Upload multiple supporting images in one request
   */
  uploadSupportingImages: async (files: File[]): Promise<any> => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file)
    })

    return api.post('/api/loans/supporting-images/upload', formData)
  },

  /**
   * Evaluate property value
   */
  evaluatePropertyValue: async (
    titleDeedImage: File,
    titleDeedData: any,
    supportingImages?: File[]
  ): Promise<any> => {
    const formData = new FormData()
    formData.append('titleDeedImage', titleDeedImage)

    if (titleDeedData) {
      formData.append('titleDeedData', JSON.stringify(titleDeedData))
    }

    if (supportingImages) {
      supportingImages.forEach((image, index) => {
        formData.append(`supportingImage_${index}`, image)
      })
    }

    return api.post('/api/loans/property/valuation', formData)
  },

  /**
   * Get loan applications by agent
   */
  getByAgentId: async (agentId: string): Promise<any> => {
    return api.get(`/api/loans/agent/${agentId}`)
  },

  /**
   * Get loan application by ID
   */
  getById: async (id: string): Promise<any> => {
    return api.get(`/api/loans/${id}`)
  },

  /**
   * Update loan application status
   */
  updateStatus: async (
    id: string,
    status: string,
    reviewNotes?: string
  ): Promise<any> => {
    return api.patch(`/api/loans/${id}/status`, { status, reviewNotes })
  },
}
