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

| Layer      | ✅ ทำได้                         | ❌ ห้ามทำ                              |
| ---------- | -------------------------------- | -------------------------------------- |
| Component  | ใช้ hooks, handle UI events      | เรียก API โดยตรง, เข้าถึง DB           |
| Hooks      | เรียก api.ts, จัดการ cache       | เรียก service โดยตรง                   |
| API Client | HTTP requests, handle response   | Business logic                         |
| API Route  | Validate, เรียก service          | Query DB โดยตรง, Business logic        |
| Service    | Business logic, เรียก repository | เข้าถึง Prisma โดยตรง (ใช้ repository) |
| Repository | Database queries                 | Business logic                         |

## 2. Type Safety

### Always use Zod for validation

```typescript
// ✅ ถูก
const validatedData = loanCreateSchema.parse(body);
const result = await loanService.create(validatedData);

// ❌ ผิด
const result = await loanService.create(body); // ไม่ validate
```

### Export types from Zod schemas

```typescript
export const loanCreateSchema = z.object({ ... });
export type LoanCreateSchema = z.infer<typeof loanCreateSchema>;
```

## 3. Error Handling

### Service layer - throw with Thai message

```typescript
if (!entity) {
  throw new Error('ไม่พบข้อมูล');
}

if (entity.status !== 'DRAFT') {
  throw new Error('สถานะไม่ถูกต้องสำหรับการดำเนินการนี้');
}
```

### Hook layer - sonner toast notification

```typescript
import { toast } from 'sonner';

onError: (error: Error) => {
  toast.error(error.message || 'เกิดข้อผิดพลาด');
};
```

### API route - JSON response with logging

```typescript
catch (error: any) {
  console.error('[API Error] POST /api/loans:', error);
  return NextResponse.json(
    { success: false, message: error.message || 'เกิดข้อผิดพลาด' },
    { status: 500 }
  );
}
```

## 4. Soft Delete Pattern

**ห้ามลบข้อมูลจริง - ใช้ soft delete เสมอ:**

```typescript
// ✅ Soft delete
async delete(id: string, userId?: string) {
  return prisma.entity.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}

// Query ต้องกรอง deletedAt
const where = { deletedAt: null, ...otherFilters };
```

## 5. ID Format

**ใช้ String ID (cuid) ไม่ใช่ Number:**

```typescript
// ✅ ถูก - String ID
async findById(id: string) {
  return prisma.entity.findUnique({ where: { id } });
}

// ❌ ผิด - Number ID
async findById(id: number) {
  return prisma.entity.findUnique({ where: { id } });
}
```

## 6. React Query Best Practices

### Query configuration

```typescript
{
  placeholderData: (prev) => prev,  // ป้องกัน loading flash
  staleTime: 30000,                 // 30 seconds
  gcTime: 5 * 60 * 1000,            // 5 minutes
  refetchOnWindowFocus: false,
  retry: 1,
  enabled: !!requiredParam,         // Conditional fetching
}
```

### After mutations - invalidate queries

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['loans'] });
  toast.success('บันทึกสำเร็จ');
};
```

## 7. Server-Only Directive

**ทุก service file ต้องมี:**

```typescript
// src/features/[feature]/services/server.ts
import 'server-only'; // บรรทัดแรก!

// ...rest of code
```

## 8. Response Format (API)

### Success response

```typescript
{
  success: true,
  message: 'สำเร็จ',
  data: result,
  meta: { page, limit, total, totalPages }  // for pagination
}
```

### Error response

```typescript
{
  success: false,
  message: error.message || 'เกิดข้อผิดพลาด',
  error?: errorDetails  // optional, for debugging
}
```

## 9. Toast Notifications

ใช้ `sonner` สำหรับ toast:

```typescript
import { toast } from 'sonner';

// Success
toast.success('บันทึกสำเร็จ');

// Error
toast.error('เกิดข้อผิดพลาด');

// Loading
toast.loading('กำลังดำเนินการ...');
```

## 10. Code Organization

### Keep files focused

- 1 entity per feature folder
- 1 responsibility per file
- Extract complex logic to separate functions

### Import Order

```typescript
// 1. React/Next imports
'use client';

// 2. External packages
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// 3. Shared modules
import { api } from '@src/shared/lib/api-client';
import { Button } from '@src/shared/ui/button';

// 4. Feature modules (relative)
import { loanApi } from './api';
import { type LoanCreateSchema } from './validations';
```

### Avoid

- ❌ Giant files > 500 lines
- ❌ Mixed concerns (UI + business logic)
- ❌ Duplicated code across features
