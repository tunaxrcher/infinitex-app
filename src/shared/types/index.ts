// src/shared/types/index.ts
import { EnumAdminStatus } from '@prisma/client'
import { PERMISSIONS } from '@src/shared/lib/constants'

export interface SuccessResponse<T> {
  success: true
  message: string
  data: T
}

export interface ErrorResponse {
  success: false
  message: string
  errors: unknown
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse

export interface ErrorHandlerOptions {
  logError?: boolean
  includeErrorDetails?: boolean
}

export interface ValidationErrorDetail {
  field?: string
  message: string
  code?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    total: number
    totalPages: number
    page: number
    limit: number
    count: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export type SortDirection = 'asc' | 'desc'

export type PermissionType = keyof typeof PERMISSIONS
export type PermissionValue = (typeof PERMISSIONS)[PermissionType]
