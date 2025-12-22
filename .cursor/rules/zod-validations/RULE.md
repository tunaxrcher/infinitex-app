---
description: 'Pattern สำหรับ Zod validation schemas ใน validations.ts'
globs:
  - '**/validations.ts'
  - '**/validations/*.ts'
alwaysApply: false
---

# Zod Validation Schemas Pattern

## โครงสร้างไฟล์ validations.ts

```typescript
// src/features/[feature-name]/validations.ts
import { baseTableSchema } from '@src/shared/validations/pagination';
import { z } from 'zod';

// ============================================
// Filter Schemas (extend baseTableSchema)
// ============================================

export const entityFiltersSchema = baseTableSchema.extend({
  // Add feature-specific filters
  status: z.string().optional(),
  agentId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type EntityFiltersSchema = z.infer<typeof entityFiltersSchema>;

// ============================================
// Create/Update Schemas
// ============================================

export const entityCreateSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export type EntityCreateSchema = z.infer<typeof entityCreateSchema>;

export const entityUpdateSchema = entityCreateSchema.partial();

export type EntityUpdateSchema = z.infer<typeof entityUpdateSchema>;
```

## baseTableSchema

โปรเจคมี shared schema สำหรับ pagination:

```typescript
// src/shared/validations/pagination.ts
import { z } from 'zod';

export const baseTableSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type BaseTableSchema = z.infer<typeof baseTableSchema>;
```

**ทุก filter schema ควร extend จาก `baseTableSchema`:**

```typescript
import { baseTableSchema } from '@src/shared/validations/pagination';

export const customerFiltersSchema = baseTableSchema.extend({
  status: z.string().optional(),
  agentId: z.string().optional(),
});
```

## ข้อกำหนดสำคัญ

### Naming Convention

- Schema: `entityFiltersSchema`, `entityCreateSchema`, `entityUpdateSchema`
- Type: `EntityFiltersSchema`, `EntityCreateSchema`, `EntityUpdateSchema`
- ใช้ camelCase สำหรับ schema, PascalCase สำหรับ type

### Error Messages ภาษาไทย

```typescript
z.string().min(1, 'กรุณากรอกชื่อ');
z.string().email('รูปแบบอีเมลไม่ถูกต้อง');
z.number().min(1, 'กรุณาระบุจำนวน');
z.string().regex(/^0[0-9]{9}$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง');
z.number().positive('จำนวนต้องเป็นค่าบวก');
z.string().min(1, 'กรุณาเลือก Agent');
z.string().max(50, 'ชื่อต้องไม่เกิน 50 ตัวอักษร');
```

### Common Patterns

#### Phone Number Validation

```typescript
phoneNumber: z
  .string()
  .min(10, 'กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก')
  .refine((val) => {
    const cleaned = val.replace(/\D/g, '');
    return cleaned.length === 10 && cleaned.startsWith('0');
  }, 'เบอร์โทรศัพท์ต้องเป็น 10 หลักและขึ้นต้นด้วย 0'),
```

#### Optional Email

```typescript
email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
```

#### Number with Coerce (สำหรับ query params)

```typescript
page: z.coerce.number().min(1).default(1),
limit: z.coerce.number().min(1).max(100).default(10),
requestedAmount: z.coerce.number().min(0),
```

#### Enum with Default

```typescript
status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']).default('DRAFT'),
userType: z.enum(['CUSTOMER', 'AGENT']),
```

### Update Schema Pattern

```typescript
// วิธีที่แนะนำ: ใช้ .partial()
export const entityUpdateSchema = entityCreateSchema.partial();

export type EntityUpdateSchema = z.infer<typeof entityUpdateSchema>;
```

## ตัวอย่างจริงจากโปรเจค

```typescript
// src/features/customer/validations.ts
import { baseTableSchema } from '@src/shared/validations/pagination';
import { z } from 'zod';

export const customerFiltersSchema = baseTableSchema.extend({
  status: z.string().optional(),
  search: z.string().optional(),
  agentId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export type CustomerFiltersSchema = z.infer<typeof customerFiltersSchema>;

export const customerCreateSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก')
    .refine((val) => {
      const cleaned = val.replace(/\D/g, '');
      return cleaned.length === 10 && cleaned.startsWith('0');
    }, 'เบอร์โทรศัพท์ต้องเป็น 10 หลักและขึ้นต้นด้วย 0'),
  firstName: z
    .string()
    .min(1, 'กรุณากรอกชื่อ')
    .max(50, 'ชื่อต้องไม่เกิน 50 ตัวอักษร'),
  lastName: z.string().max(50, 'นามสกุลต้องไม่เกิน 50 ตัวอักษร').optional(),
  idCardNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  lineId: z.string().optional(),
});

export type CustomerCreateSchema = z.infer<typeof customerCreateSchema>;

export const customerUpdateSchema = customerCreateSchema.partial();

export type CustomerUpdateSchema = z.infer<typeof customerUpdateSchema>;

export const agentCustomerAssignSchema = z.object({
  agentId: z.string().min(1, 'กรุณาเลือก Agent'),
  customerId: z.string().min(1, 'กรุณาเลือกลูกค้า'),
});

export type AgentCustomerAssignSchema = z.infer<typeof agentCustomerAssignSchema>;
```

### Loan Validation Example

```typescript
// src/features/loan/validations.ts
import { z } from 'zod';

export const manualLookupSchema = z.object({
  pvCode: z.string().min(1, 'กรุณาเลือกจังหวัด'),
  amCode: z.string().min(1, 'กรุณาเลือกอำเภอ'),
  parcelNo: z.string().min(1, 'กรุณากรอกเลขที่โฉนด'),
});

export type ManualLookupSchema = z.infer<typeof manualLookupSchema>;

export const loanApplicationSubmissionSchema = z.object({
  customerId: z.string().optional(),
  agentId: z.string().optional(),
  isNewUser: z.boolean().default(false),
  submittedByAgent: z.boolean().default(false),
  titleDeedImage: z.string().optional(),
  titleDeedData: z.any().optional(),
  supportingImages: z.array(z.string()).optional(),
  idCardFrontImage: z.string().optional(),
  idCardBackImage: z.string().optional(),
  requestedAmount: z.coerce.number().min(0),
  hirePurchase: z.boolean().default(false),
});

export type LoanApplicationSubmissionSchema = z.infer<
  typeof loanApplicationSubmissionSchema
>;
```

## Export Checklist

- [ ] Export schema (camelCase)
- [ ] Export type (PascalCase) ด้วย `z.infer<typeof schema>`
- [ ] ใช้ error messages ภาษาไทย
- [ ] Filter schemas ควร extend จาก `baseTableSchema`
- [ ] ใช้ `z.coerce` สำหรับ query params ที่เป็น number
