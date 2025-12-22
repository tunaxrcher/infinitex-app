---
description: 'Template สำหรับสร้าง feature ใหม่ตาม Infinitex architecture'
alwaysApply: false
---

# New Feature Generator

ใช้ rule นี้เมื่อต้องการสร้าง feature ใหม่ โดย @mention ในการสนทนา: `@new-feature-generator`

## คำสั่งสร้าง Feature ใหม่

เมื่อผู้ใช้ขอสร้าง feature ใหม่ ให้สร้างไฟล์ตามโครงสร้างนี้:

```
src/features/[feature-name]/
├── api.ts                    # Client-side API calls
├── hooks.ts                  # React Query hooks
├── validations.ts            # Zod schemas
├── repositories/
│   └── [entity]Repository.ts # Prisma database operations (extends BaseRepository)
├── services/
│   └── server.ts             # Server-side business logic
└── components/               # Feature-specific components

src/app/api/[entity]/
├── route.ts                  # GET, POST
└── [id]/
    └── route.ts              # GET, PUT, DELETE
```

## Checklist สำหรับสร้าง Feature ใหม่

### 1. Database (ถ้าต้องการ)

- [ ] เพิ่ม model ใน `prisma/schema.prisma`
- [ ] รัน `npx prisma migrate dev`
- [ ] รัน `npx prisma generate`

### 2. Feature Files

- [ ] สร้าง `validations.ts` ก่อน (extends `baseTableSchema` สำหรับ filters)
- [ ] สร้าง `repositories/[entity]Repository.ts` (extends `BaseRepository`)
- [ ] สร้าง `services/server.ts`
- [ ] สร้าง `api.ts`
- [ ] สร้าง `hooks.ts`

### 3. API Routes

- [ ] สร้าง `src/app/api/[entity]/route.ts` (GET, POST)
- [ ] สร้าง `src/app/api/[entity]/[id]/route.ts` (GET, PUT, DELETE)
- [ ] เพิ่ม routes พิเศษตามความต้องการ

### 4. Components & Pages (optional)

- [ ] สร้าง components ใน `src/features/[feature]/components/`
- [ ] สร้าง page ใน `src/app/(layout)/[user-type]/[feature]/page.tsx`

## Template Files

### 1. validations.ts

```typescript
// src/features/[feature]/validations.ts
import { baseTableSchema } from '@src/shared/validations/pagination'
import { z } from 'zod'

export const entityFiltersSchema = baseTableSchema.extend({
  status: z.string().optional(),
  agentId: z.string().optional(),
})

export type EntityFiltersSchema = z.infer<typeof entityFiltersSchema>

export const entityCreateSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
})

export type EntityCreateSchema = z.infer<typeof entityCreateSchema>

export const entityUpdateSchema = entityCreateSchema.partial()

export type EntityUpdateSchema = z.infer<typeof entityUpdateSchema>
```

### 2. Repository

```typescript
// src/features/[feature]/repositories/entityRepository.ts
import { prisma } from '@src/shared/lib/db'
import { BaseRepository } from '@src/shared/repositories/baseRepository'

export class EntityRepository extends BaseRepository<typeof prisma.entity> {
  constructor() {
    super(prisma.entity)
  }

  async findWithDetails(id: string) {
    return this.model.findUnique({
      where: { id },
      include: {
        /* relations */
      },
    })
  }

  async findByUserId(userId: string) {
    return this.model.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  }
}

export const entityRepository = new EntityRepository()
```

### 3. Service

```typescript
// src/features/[feature]/services/server.ts
import { prisma } from '@src/shared/lib/db'
import 'server-only'

import { entityRepository } from '../repositories/entityRepository'
import {
  type EntityCreateSchema,
  type EntityUpdateSchema,
} from '../validations'

export const entityService = {
  async getById(id: string) {
    const entity = await entityRepository.findWithDetails(id)
    if (!entity) {
      throw new Error('ไม่พบข้อมูล')
    }
    return entity
  },

  async getList(userId: string, filters: any = {}) {
    try {
      return entityRepository.findByUserId(userId)
    } catch (error) {
      console.error('Error fetching entities:', error)
      throw new Error('ไม่สามารถดึงข้อมูลได้')
    }
  },

  async create(data: EntityCreateSchema, userId?: string) {
    try {
      return entityRepository.create({ data })
    } catch (error) {
      console.error('Error creating entity:', error)
      if (error instanceof Error) throw error
      throw new Error('ไม่สามารถสร้างข้อมูลได้')
    }
  },

  async update(id: string, data: EntityUpdateSchema) {
    try {
      await this.getById(id)
      return entityRepository.update({
        where: { id },
        data: { ...data, updatedAt: new Date() },
      })
    } catch (error) {
      console.error('Error updating entity:', error)
      if (error instanceof Error) throw error
      throw new Error('ไม่สามารถอัปเดตข้อมูลได้')
    }
  },

  async delete(id: string) {
    try {
      return entityRepository.update({
        where: { id },
        data: { isActive: false, updatedAt: new Date() },
      })
    } catch (error) {
      console.error('Error deleting entity:', error)
      throw new Error('ไม่สามารถลบข้อมูลได้')
    }
  },
}
```

### 4. API Client

```typescript
// src/features/[feature]/api.ts
import { api } from '@src/shared/lib/api-client'

import { type EntityCreateSchema, type EntityUpdateSchema } from './validations'

export const entityApi = {
  getList: async (filters: any = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString())
      }
    })
    return api.get(`/api/entities?${searchParams}`)
  },

  getById: async (id: string) => {
    return api.get(`/api/entities/${id}`)
  },

  create: async (data: EntityCreateSchema) => {
    return api.post('/api/entities', data)
  },

  update: async (id: string, data: EntityUpdateSchema) => {
    return api.put(`/api/entities/${id}`, data)
  },

  delete: async (id: string) => {
    return api.delete(`/api/entities/${id}`)
  },
}
```

### 5. Hooks

```typescript
// src/features/[feature]/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// หรือ react-hot-toast

import { entityApi } from './api'
import {
  type EntityCreateSchema,
  type EntityFiltersSchema,
} from './validations'

export const entityKeys = {
  all: () => ['entity'] as const,
  list: (filters?: EntityFiltersSchema) => ['entity', 'list', filters] as const,
  detail: (id: string) => ['entity', 'detail', id] as const,
}

export const useGetEntityList = (filters: any = {}) => {
  return useQuery({
    queryKey: entityKeys.list(filters),
    queryFn: () => entityApi.getList(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  })
}

export const useGetEntityById = (id: string) => {
  return useQuery({
    queryKey: entityKeys.detail(id),
    queryFn: () => entityApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateEntity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: EntityCreateSchema) => entityApi.create(data),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityKeys.all() })
      toast.success('สร้างรายการสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    },
  })
}
```

## Naming Convention Summary

| Type                | Format                | Example                       |
| ------------------- | --------------------- | ----------------------------- |
| Feature folder      | kebab-case            | `customer`, `loan`            |
| Entity name         | camelCase             | `customer`, `loanApplication` |
| Repository class    | PascalCase            | `CustomerRepository`          |
| Repository instance | camelCase             | `customerRepository`          |
| Service object      | camelCase             | `customerService`             |
| API object          | camelCase             | `customerApi`                 |
| Hooks               | camelCase + usePrefix | `useGetCustomerList`          |
| Schema              | camelCase + Suffix    | `customerCreateSchema`        |
| Type                | PascalCase + Suffix   | `CustomerCreateSchema`        |

## ID Format

**ใช้ String ID (cuid) ไม่ใช่ Number:**

```prisma
model Entity {
  id String @id @default(cuid())
  // ...
}
```
