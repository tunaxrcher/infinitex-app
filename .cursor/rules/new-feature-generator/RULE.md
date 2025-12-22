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
│   └── [entity]Repository.ts # Prisma database operations
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

- [ ] สร้าง `validations.ts` ก่อน (เพราะ files อื่นต้อง import types)
- [ ] สร้าง `repositories/[entity]Repository.ts`
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
import { z } from 'zod';

export const entityFiltersSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  status: z.string().optional(),
});

export type EntityFiltersSchema = z.infer<typeof entityFiltersSchema>;

export const entityCreateSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export type EntityCreateSchema = z.infer<typeof entityCreateSchema>;

export const entityUpdateSchema = entityCreateSchema.partial();

export type EntityUpdateSchema = z.infer<typeof entityUpdateSchema>;
```

### 2. Repository

```typescript
// src/features/[feature]/repositories/entityRepository.ts
import { Prisma } from '@prisma/client';

import { prisma } from '@src/shared/lib/db';

export class EntityRepository {
  async findById(id: string) {
    return prisma.entity.findUnique({
      where: { id },
    });
  }

  async findMany(where?: Prisma.EntityWhereInput) {
    return prisma.entity.findMany({
      where: { ...where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: Prisma.EntityCreateInput) {
    return prisma.entity.create({ data });
  }

  async update(id: string, data: Prisma.EntityUpdateInput) {
    return prisma.entity.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.entity.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const entityRepository = new EntityRepository();
```

### 3. Service

```typescript
// src/features/[feature]/services/server.ts
import 'server-only';

import { entityRepository } from '../repositories/entityRepository';
import {
  type EntityCreateSchema,
  type EntityUpdateSchema,
} from '../validations';

export const entityService = {
  async getById(id: string) {
    const entity = await entityRepository.findById(id);
    if (!entity || entity.deletedAt) {
      throw new Error('ไม่พบข้อมูล');
    }
    return entity;
  },

  async getList() {
    return entityRepository.findMany();
  },

  async create(data: EntityCreateSchema) {
    return entityRepository.create(data);
  },

  async update(id: string, data: EntityUpdateSchema) {
    await this.getById(id);
    return entityRepository.update(id, data);
  },

  async delete(id: string) {
    await this.getById(id);
    return entityRepository.delete(id);
  },
};
```

### 4. API Client

```typescript
// src/features/[feature]/api.ts
import { api } from '@src/shared/lib/api-client';

import { type EntityCreateSchema, type EntityUpdateSchema } from './validations';

export const entityApi = {
  getList: async () => {
    return api.get('/api/entities');
  },

  getById: async (id: string) => {
    return api.get(`/api/entities/${id}`);
  },

  create: async (data: EntityCreateSchema) => {
    return api.post('/api/entities', data);
  },

  update: async (id: string, data: EntityUpdateSchema) => {
    return api.put(`/api/entities/${id}`, data);
  },

  delete: async (id: string) => {
    return api.delete(`/api/entities/${id}`);
  },
};
```

### 5. Hooks

```typescript
// src/features/[feature]/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { entityApi } from './api';
import { type EntityCreateSchema } from './validations';

export const entityKeys = {
  all: () => ['entities'] as const,
  list: () => ['entities', 'list'] as const,
  detail: (id: string) => ['entities', 'detail', id] as const,
};

export const useGetEntityList = () => {
  return useQuery({
    queryKey: entityKeys.list(),
    queryFn: () => entityApi.getList(),
  });
};

export const useGetEntityById = (id: string) => {
  return useQuery({
    queryKey: entityKeys.detail(id),
    queryFn: () => entityApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EntityCreateSchema) => entityApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: entityKeys.all() });
      toast.success('สร้างรายการสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาด');
    },
  });
};
```

## Naming Convention Summary

| Type                | Format                | Example                        |
| ------------------- | --------------------- | ------------------------------ |
| Feature folder      | kebab-case            | `loan`, `payment`, `customer`  |
| Entity name         | camelCase             | `loanApplication`, `payment`   |
| Repository class    | PascalCase            | `LoanApplicationRepository`    |
| Repository instance | camelCase             | `loanApplicationRepository`    |
| Service object      | camelCase             | `loanService`                  |
| API object          | camelCase             | `loanApi`                      |
| Hooks               | camelCase + usePrefix | `useSubmitLoanApplication`     |
| Schema              | camelCase + Suffix    | `loanApplicationCreateSchema`  |
| Type                | PascalCase + Suffix   | `LoanApplicationCreateSchema`  |

## ID Format

**ใช้ String ID (cuid) ไม่ใช่ Number:**

```prisma
model Entity {
  id String @id @default(cuid())
  // ...
}
```

## ตัวอย่างการใช้งาน

ผู้ใช้: "สร้าง feature notifications สำหรับจัดการการแจ้งเตือน"

AI จะสร้าง:

1. `src/features/notifications/validations.ts`
2. `src/features/notifications/repositories/notificationRepository.ts`
3. `src/features/notifications/services/server.ts`
4. `src/features/notifications/api.ts`
5. `src/features/notifications/hooks.ts`
6. `src/app/api/notifications/route.ts`
7. `src/app/api/notifications/[id]/route.ts`
