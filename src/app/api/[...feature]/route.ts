// src/app/[...feature]/route.ts

// 1. /api/[...feature]/route.ts (No params - collection)
import { NextRequest } from "next/server"
import { service } from "@src/features/[...feature]/services/server"
import { createSchema, querySchema, updateSchema } from "@src/features/[...feature]/validations"
import { createSuccessResponse, withAdminValidation } from "@src/shared/lib/api-wrapper"

export const GET = withAdminValidation({
  querySchema, // { page, limit, search }
  requiredPermissions: ["MANAGE_FEATURE"]
})(async (request: NextRequest, { query, session }) => {

  const result = await service.getMany(query)

  return createSuccessResponse({ data: result, message: "สำเร็จ" })
})

export const POST = withAdminValidation({
  bodySchema: createSchema, // { name, description }
  requiredPermissions: ["CREATE_FEATURE"]
})(async (request: NextRequest, { body, session }) => {

  const result = await service.create(body, session.user.userId)

  return createSuccessResponse({ data: result, message: "สำเร็จ" })
})

// 2. /api/[...feature]/[id]/route.ts (With params)
export const GET = withAdminValidation({
  paramsSchema: z.object({ id: z.string().uuid() }),
  requiredPermissions: ["VIEW_FEATURE"]
})(async (request: NextRequest, { params, session }) => {

  const result = await service.getById(params.id)

  return createSuccessResponse({ data: result, message: "สำเร็จ" })
})

export const PUT = withAdminValidation({
  bodySchema: updateSchema,
  paramsSchema: z.object({ id: z.string().uuid() }),
  requiredPermissions: ["UPDATE_FEATURE"]
})(async (request: NextRequest, { body, params, session }) => {

  const result = await service.update(params.id, body, session.user.userId)

  return createSuccessResponse({ data: result, message: "สำเร็จ" })
})

// 3. /api/[...feature]/[featureId]/related/route.ts (Params + Query)
export const GET = withAdminValidation({
  querySchema: z.object({ page: z.coerce.number().default(1) }),
  paramsSchema: z.object({ featureId: z.string().uuid() }),
  requiredPermissions: ["VIEW_RELATED"]
})(async (request: NextRequest, { query, params, session }) => {

  const result = await relatedService.getByFeatureId(params.featureId, query)

  return createSuccessResponse({ data: result, message: "สำเร็จ" })
})

// 4. /api/[...feature]/[featureId]/action/route.ts (Body + Query + Params)
export const POST = withAdminValidation({
  bodySchema: z.object({ message: z.string().optional() }),
  querySchema: z.object({ notify: z.coerce.boolean().default(true) }),
  paramsSchema: z.object({ featureId: z.string().uuid() }),
  requiredPermissions: ["ACTION_FEATURE"]
})(async (request: NextRequest, { body, query, params, session }) => {

  const result = await service.performAction(params.featureId, body, query.notify)

  return createSuccessResponse({ data: result, message: "สำเร็จ" })
})

// 5. /api/[...feature]/analytics/route.ts (Query only)
export const GET = withAdminValidation({
  querySchema: z.object({ 
    startDate: z.string(), 
    endDate: z.string() 
  }),
  requiredPermissions: ["VIEW_ANALYTICS"]
})(async (request: NextRequest, { query, session }) => {

  const result = await analyticsService.getReport(query)

  return createSuccessResponse({ data: result, message: "สำเร็จ" })
})

// 6. /api/[...feature]/bulk-operations/route.ts (Body only)
export const POST = withAdminValidation({
  bodySchema: z.object({ 
    operation: z.string(), 
    resourceIds: z.array(z.string()) 
  }),
  requiredPermissions: ["BULK_OPERATIONS"]
})(async (request: NextRequest, { body, session }) => {

  const result = await bulkService.execute(body, session.user.userId)

  return createSuccessResponse({ data: result, message: "สำเร็จ" })
})

// 7. /api/[...feature]/settings/route.ts (Permissions only)
export const GET = withAdminValidation({
  requiredPermissions: ["VIEW_SETTINGS"]
})(async (request: NextRequest, { session }) => {

  const result = await settingsService.getAll()

  return createSuccessResponse({ data: result, message: "สำเร็จ" })
})

// 8. /api/[...feature]/export/[format]/route.ts (Params + Query, no body)
export const GET = withAdminValidation({
  querySchema: z.object({ table: z.string(), columns: z.string().optional() }),
  paramsSchema: z.object({ format: z.enum(['csv', 'xlsx']) }),
  requiredPermissions: ["EXPORT_DATA"]
})(async (request: NextRequest, { query, params, session }) => {

  const result = await exportService.generate(params.format, query)
  
  return createSuccessResponse({ data: result, message: "สำเร็จ" })
})