---
description: 'Best practices และแนวทางปฏิบัติที่ดีสำหรับ Infinitex App'
alwaysApply: true
---

# Infinitex Best Practices

## 1. Layer Separation (สำคัญมาก!)

**ทุก layer ต้องทำหน้าที่ของตัวเองเท่านั้น:**

```
Components  →  Hooks  →  API Client  →  API Route  →  Service  →  Repository
     ↓           ↓           ↓              ↓            ↓            ↓
   UI Logic   Cache     HTTP calls    Validate     Business    Database
```

| Layer      | ✅ ทำได้                         | ❌ ห้ามทำ                            |
| ---------- | -------------------------------- | ------------------------------------ |
| Component  | ใช้ hooks, handle UI events      | เรียก API โดยตรง, เข้าถึง DB         |
| Hooks      | เรียก api.ts, จัดการ cache       | เรียก service โดยตรง                 |
| API Client | HTTP requests, handle response   | Business logic                       |
| API Route  | Validate, เรียก service          | Query DB โดยตรง, Business logic      |
| Service    | Business logic, เรียก repository | เข้าถึง Prisma โดยตรง (ยกเว้นจำเป็น) |
| Repository | Database queries (extends Base)  | Business logic                       |

## 2. Type Safety

### Always use Zod for validation

```typescript
// ✅ ถูก
const validatedData = customerCreateSchema.parse(body);
const result = await customerService.create(validatedData);

// ❌ ผิด
const result = await customerService.create(body); // ไม่ validate
```

### Export types from Zod schemas

```typescript
export const customerCreateSchema = z.object({ ... });
export type CustomerCreateSchema = z.infer<typeof customerCreateSchema>;
```

### Use baseTableSchema for filters

```typescript
import { baseTableSchema } from '@src/shared/validations/pagination'

export const customerFiltersSchema = baseTableSchema.extend({
  status: z.string().optional(),
  agentId: z.string().optional(),
})
```

## 3. Error Handling

### Service layer - try-catch with Thai message

```typescript
async create(data: any) {
  try {
    // Business logic...
    return result;
  } catch (error) {
    console.error('Error creating entity:', error);
    if (error instanceof Error) {
      throw error;  // Re-throw known errors
    }
    throw new Error('ไม่สามารถสร้างข้อมูลได้');
  }
}
```

### Hook layer - toast notification

```typescript
// ใช้ sonner (แนะนำ)
import { toast } from 'sonner';

// หรือ react-hot-toast
import toast from 'react-hot-toast';

onError: (error: Error) => {
  toast.error(error.message || 'เกิดข้อผิดพลาด');
};
```

### API route - JSON error response

```typescript
catch (error) {
  console.error('POST /api/customers error:', error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
    { status: 500 }
  );
}
```

## 4. Soft Delete Pattern

**ห้ามลบข้อมูลจริง - ใช้ soft delete:**

```typescript
// ใช้ isActive: false
async delete(id: string) {
  return repository.update({
    where: { id },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  });
}

// หรือใช้ deletedAt
async delete(id: string) {
  return repository.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
```

## 5. ID Format

**ใช้ String ID (cuid) ไม่ใช่ Number:**

```typescript
// ✅ ถูก - String ID
async findById(id: string) {
  return prisma.entity.findUnique({ where: { id } });
}

// ❌ ผิด - Number ID
async findById(id: number) { ... }
```

## 6. React Query Best Practices

### Query configuration

```typescript
{
  placeholderData: (prev) => prev,  // ป้องกัน loading flash
  staleTime: 5 * 60 * 1000,         // 5 minutes
  gcTime: 10 * 60 * 1000,           // 10 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  retry: false,                      // ป้องกัน request ซ้ำ
  enabled: !!requiredParam,
}
```

### After mutations - invalidate queries

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: entityKeys.all() })
  toast.success('บันทึกสำเร็จ')
}
```

## 7. Server-Only Directive

**Service files ต้องมี:**

```typescript
// src/features/[feature]/services/server.ts
import { prisma } from '@src/shared/lib/db'
import 'server-only'

// ...rest of code
```

## 8. Repository Pattern

**Extend BaseRepository:**

```typescript
import { prisma } from '@src/shared/lib/db'
import { BaseRepository } from '@src/shared/repositories/baseRepository'

export class CustomerRepository extends BaseRepository<typeof prisma.user> {
  constructor() {
    super(prisma.user)
  }

  // Custom methods...
}

export const customerRepository = new CustomerRepository()
```

## 9. API Response Format

**โปรเจคนี้ใช้ 2 รูปแบบ:**

```typescript
// แบบ 1: Return data โดยตรง (ใช้บ่อย)
return NextResponse.json(result);

// แบบ 2: Wrapped response
return NextResponse.json({ success: true, data: result });

// Error response
return NextResponse.json(
  { error: 'เกิดข้อผิดพลาด' },
  { status: 500 }
);
```

## 10. Auth Pattern

**ใช้ headers จาก middleware:**

```typescript
const userId = request.headers.get('x-user-id');
const userType = request.headers.get('x-user-type');

if (!userId || userType !== 'AGENT') {
  return NextResponse.json({ error: 'Agent access required' }, { status: 403 });
}
```

## 11. Code Organization

### Keep files focused

- 1 entity per feature folder
- 1 responsibility per file
- Extract complex logic to separate functions

### Import Order

```typescript
// 1. 'use client' directive (ถ้าต้องการ)
'use client'

// 2. External packages
// 3. Shared modules
import { api } from '@src/shared/lib/api-client'
import { Button } from '@src/shared/ui/button'
import { baseTableSchema } from '@src/shared/validations/pagination'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

// 4. Feature modules (relative)
import { entityApi } from './api'
import { type EntityCreateSchema } from './validations'

// 1. 'use client' directive (ถ้าต้องการ)

// 1. 'use client' directive (ถ้าต้องการ)

// 1. 'use client' directive (ถ้าต้องการ)

// 1. 'use client' directive (ถ้าต้องการ)

// 1. 'use client' directive (ถ้าต้องการ)

// 1. 'use client' directive (ถ้าต้องการ)

// 1. 'use client' directive (ถ้าต้องการ)

// 1. 'use client' directive (ถ้าต้องการ)
```

### Avoid

- ❌ Giant files > 500 lines
- ❌ Mixed concerns (UI + business logic)
- ❌ Duplicated code across features
