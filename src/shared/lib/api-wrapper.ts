import type { NextRequest } from 'next/server'

import { Session } from 'next-auth'
import { z } from 'zod'

import type {
  ErrorHandlerOptions,
  ApiResponse as IApiResponse,
} from '@/shared/types'

import { requireAdmin, requirePermissions } from './auth-helpers'
import { ApiError, ValidationError } from './errors'
import { validateBody, validateQuery } from './validation-helpers'

const defaultOptions: ErrorHandlerOptions = {
  logError: true,
  includeErrorDetails: process.env.NODE_ENV !== 'production',
}

// API Response Helpers - รองรับทั้งแบบ positional และ object
export function createSuccessResponse<T>(
  dataOrOptions: T | { data: T; message?: string; statusCode?: number },
  message = 'Success',
  statusCode = 200
): Response {
  let finalData: T
  let finalMessage: string
  let finalStatusCode: number

  // ตรวจสอบว่าเป็น object ที่มี data property หรือไม่
  if (
    typeof dataOrOptions === 'object' &&
    dataOrOptions !== null &&
    'data' in dataOrOptions &&
    !Array.isArray(dataOrOptions)
  ) {
    // ถ้าเป็น options object
    const options = dataOrOptions as {
      data: T
      message?: string
      statusCode?: number
    }
    finalData = options.data
    finalMessage = options.message || 'Success'
    finalStatusCode = options.statusCode || 200
  } else {
    // ถ้าเป็น data ธรรมดา (แบบเดิม)
    finalData = dataOrOptions as T
    finalMessage = message
    finalStatusCode = statusCode
  }

  const response: IApiResponse<T> = {
    success: true,
    message: finalMessage,
    data: finalData,
  }
  return Response.json(response, { status: finalStatusCode })
}

export function createErrorResponse(
  message: string,
  statusCode = 500,
  errors?: unknown
): Response {
  const response: IApiResponse<never> = {
    success: false,
    message,
    errors,
  }
  return Response.json(response, { status: statusCode })
}

// Basic Error Handler
export function withErrorHandler(
  handler: any,
  options: ErrorHandlerOptions = {}
) {
  const config = { ...defaultOptions, ...options }

  return async (request: NextRequest, context: any): Promise<Response> => {
    try {
      // Resolve params if it's a Promise (Next.js v15+)
      if (context?.params instanceof Promise) {
        context.params = await context.params
      }

      const result = await handler(request, context)

      // If already a Response, return it
      if (result instanceof Response) {
        return result
      }

      // ถ้าเป็น object ให้ return โดยตรง ไม่ wrap
      if (result && typeof result === 'object') {
        return Response.json(result)
      }

      // ถ้าไม่ใช่ object (string, number, boolean, etc.) ให้ wrap
      return createSuccessResponse(result)
    } catch (error: any) {
      if (config.logError) {
        console.error('[API Error]', error)
      }

      let errorMessage = 'Internal Server Error'
      let statusCode = 500
      let errorDetails: unknown = undefined

      if (error instanceof ApiError) {
        errorMessage = error.message
        statusCode = error.statusCode
      } else if (error instanceof ValidationError) {
        errorMessage = error.message
        statusCode = 422
        errorDetails = error.details
      } else if (error instanceof Error) {
        errorMessage = error.message
        if (config.includeErrorDetails) {
          errorDetails = { name: error.name, stack: error.stack }
        }
      }

      return createErrorResponse(errorMessage, statusCode, errorDetails)
    }
  }
}

// Simple Auth Wrapper
export function withAdmin(handler: any, options: ErrorHandlerOptions = {}) {
  return withErrorHandler(async (request: NextRequest, context: any) => {
    const session = await requireAdmin()
    return await handler(request, { ...context, session })
  }, options)
}

// Type-Safe Admin Validation
export function withAdminValidation<
  TBody extends z.ZodSchema = z.ZodNever,
  TQuery extends z.ZodSchema = z.ZodNever,
  TParams extends z.ZodSchema = z.ZodNever,
>(
  config: {
    bodySchema?: TBody
    querySchema?: TQuery
    paramsSchema?: TParams
    requiredPermissions?: string[]
  },
  options: ErrorHandlerOptions = {}
) {
  return function <TReturn>(
    handler: (
      request: NextRequest,
      context: {
        session: Session
        body: TBody extends z.ZodNever ? never : z.infer<TBody>
        query: TQuery extends z.ZodNever ? never : z.infer<TQuery>
        params: TParams extends z.ZodNever ? any : z.infer<TParams>
      }
    ) => Promise<TReturn | Response>
  ) {
    return withErrorHandler(async (request: NextRequest, context: any) => {
      // Check admin auth
      const session = await requireAdmin()

      // Check permissions if provided
      if (config.requiredPermissions && config.requiredPermissions.length > 0) {
        await requirePermissions(session, config.requiredPermissions)
      }

      // Resolve params
      const params = context?.params || {}

      let body: any
      let query: any
      let validatedParams: any = params

      // Validate body
      if (
        config.bodySchema &&
        request.method !== 'GET' &&
        request.method !== 'DELETE'
      ) {
        body = await validateBody(config.bodySchema, request)
      }

      // Validate query
      if (config.querySchema) {
        query = validateQuery(config.querySchema, request)
      }

      // Validate params
      if (config.paramsSchema) {
        try {
          validatedParams = config.paramsSchema.parse(params)
        } catch (error: any) {
          if (error instanceof z.ZodError) {
            const details = error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            }))
            throw new ValidationError('Params validation failed', details)
          }
          throw error
        }
      }

      // Call handler with validated data
      return await handler(request, {
        session,
        body,
        query,
        params: validatedParams,
      } as any) // Type assertion needed here because of conditional types
    }, options)
  }
}

// Quick Response Helpers - รองรับทั้ง 2 แบบ
export const ApiResponse = {
  success: <T>(
    dataOrOptions: T | { data: T; message?: string; statusCode?: number },
    message = 'Success'
  ) => createSuccessResponse(dataOrOptions, message),
  error: (message: string, statusCode = 500) =>
    createErrorResponse(message, statusCode),
  notFound: (message = 'Resource not found') =>
    createErrorResponse(message, 404),
  unauthorized: (message = 'Unauthorized') => createErrorResponse(message, 401),
  forbidden: (message = 'Forbidden') => createErrorResponse(message, 403),
  badRequest: (message = 'Bad Request') => createErrorResponse(message, 400),
}

/* 
Usage Examples - AUTO-DETECT OBJECT RESPONSE:

// 1. Return object -> ไม่ wrap ✅
export const GET = withAdminValidation({
  querySchema: z.object({ page: z.coerce.number() })
})(async (request, { query }) => {
  return {
    data: [1, 2, 3],
    pagination: { page: query.page, total: 100 }
  }
  // จะได้: { data: [1,2,3], pagination: { page: 1, total: 100 } }
})

// 2. Return primitive -> wrap ✅  
export const GET = withAdminValidation({})(async (request, { session }) => {
  return "Hello World"
  // จะได้: { success: true, data: "Hello World", message: "Success" }
})

// 3. Return array -> wrap ✅
export const GET = withAdminValidation({})(async (request, { session }) => {
  return [1, 2, 3]
  // จะได้: { success: true, data: [1,2,3], message: "Success" }
})

// 4. Use createSuccessResponse -> ได้ Response object ✅
export const POST = withAdminValidation({
  bodySchema: z.object({ name: z.string() })
})(async (request, { body }) => {
  const user = await createUser(body)
  return createSuccessResponse({
    data: user,
    message: "สร้างผู้ใช้สำเร็จ"
  })
  // จะได้: { success: true, data: user, message: "สร้างผู้ใช้สำเร็จ" }
})

// 5. Return object with any structure -> ไม่ wrap ✅
export const GET = withAdminValidation({})(async (request, { session }) => {
  return {
    user: { id: 1, name: "John" },
    settings: { theme: "dark" },
    meta: { version: "1.0" }
  }
  // จะได้ structure นี้เป็นต: { user: {...}, settings: {...}, meta: {...} }
})
*/
