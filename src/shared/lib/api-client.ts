// src/shared/lib/api-client.ts
export const api = {
  get: async (url: string) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage =
        errorData.error ||
        errorData.message ||
        `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    return response.json()
  },

  post: async (url: string, data: any) => {
    // Check if data is FormData
    const isFormData = data instanceof FormData

    const response = await fetch(url, {
      method: 'POST',
      headers: isFormData
        ? {} // Let browser set Content-Type with boundary for FormData
        : {
            'Content-Type': 'application/json',
          },
      body: isFormData ? data : JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage =
        errorData.error ||
        errorData.message ||
        `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    return response.json()
  },

  put: async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage =
        errorData.error ||
        errorData.message ||
        `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    return response.json()
  },

  patch: async (url: string, data?: any) => {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage =
        errorData.error ||
        errorData.message ||
        `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    return response.json()
  },

  delete: async (url: string) => {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage =
        errorData.error ||
        errorData.message ||
        `HTTP error! status: ${response.status}`
      throw new Error(errorMessage)
    }

    return response.json()
  },
}
