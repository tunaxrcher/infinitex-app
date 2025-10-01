// src/shared/validations/pagination.ts
import { z } from 'zod'

export const baseTableSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type BaseTableSchema = z.infer<typeof baseTableSchema>
