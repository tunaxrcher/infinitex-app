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

  // ============================================================
  // TITLE DEEDS (Multiple deeds support)
  // ============================================================

  /**
   * Get title deeds for an application
   */
  getTitleDeeds: async (applicationId: string): Promise<any> => {
    return api.get(`/api/loans/title-deeds?applicationId=${applicationId}`)
  },

  /**
   * Create a new title deed
   */
  createTitleDeed: async (data: {
    applicationId: string
    imageUrl: string
    imageKey?: string
    deedNumber?: string
    provinceCode?: string
    provinceName?: string
    amphurCode?: string
    amphurName?: string
    parcelNo?: string
    landAreaText?: string
    ownerName?: string
    sortOrder?: number
    isPrimary?: boolean
  }): Promise<any> => {
    return api.post('/api/loans/title-deeds', data)
  },

  /**
   * Update a title deed
   */
  updateTitleDeed: async (
    id: string,
    data: {
      imageUrl?: string
      deedNumber?: string
      provinceCode?: string
      provinceName?: string
      amphurCode?: string
      amphurName?: string
      parcelNo?: string
      landAreaText?: string
      ownerName?: string
      sortOrder?: number
      isPrimary?: boolean
    }
  ): Promise<any> => {
    return api.put(`/api/loans/title-deeds/${id}`, data)
  },

  /**
   * Delete a title deed
   */
  deleteTitleDeed: async (id: string): Promise<any> => {
    return api.delete(`/api/loans/title-deeds/${id}`)
  },
}
