// src/shared/lib/errors.ts
import { ValidationErrorDetail } from '@src/shared/types'

export class ApiError extends Error {
  public statusCode: number
  public code: string | null

  constructor(
    message: string,
    statusCode: number = 500,
    code: string | null = null
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  public details: ValidationErrorDetail[] | null

  constructor(message: string, details: ValidationErrorDetail[] | null = null) {
    super(message, 400, 'VALIDATION_ERROR')
    this.details = details
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string = 'Database error') {
    super(message, 503, 'DATABASE_ERROR')
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT')
  }
}
