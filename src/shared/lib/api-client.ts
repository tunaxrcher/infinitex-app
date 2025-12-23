// src/shared/lib/api-client.ts

const JSON_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Handle response and throw error if not ok
 */
async function handleResponse(response: Response) {
  if (response.ok) {
    return response.json()
  }

  // Handle specific status codes
  if (response.status === 413) {
    throw new Error('ขนาดไฟล์ใหญ่เกินไป กรุณาลดจำนวนหรือขนาดไฟล์ (สูงสุด 20MB)')
  }

  const errorData = await response.json().catch(() => ({}))
  const errorMessage =
    errorData.error ||
    errorData.message ||
    `HTTP error! status: ${response.status}`
  throw new Error(errorMessage)
}

export const api = {
  get: async (url: string) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: JSON_HEADERS,
    })
    return handleResponse(response)
  },

  post: async (url: string, data: any) => {
    const isFormData = data instanceof FormData
    const response = await fetch(url, {
      method: 'POST',
      headers: isFormData ? {} : JSON_HEADERS,
      body: isFormData ? data : JSON.stringify(data),
    })
    return handleResponse(response)
  },

  put: async (url: string, data: any) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: JSON_HEADERS,
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },

  patch: async (url: string, data?: any) => {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: JSON_HEADERS,
      body: data ? JSON.stringify(data) : undefined,
    })
    return handleResponse(response)
  },

  delete: async (url: string) => {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: JSON_HEADERS,
    })
    return handleResponse(response)
  },
}
