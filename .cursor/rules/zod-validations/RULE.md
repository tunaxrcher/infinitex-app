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
import { z } from 'zod';

// ============================================
// Filter Schemas
// ============================================

export const entityFiltersSchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  // Add feature-specific filters
  status: z.string().optional(),
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
  amount: z.number().optional().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export type EntityCreateSchema = z.infer<typeof entityCreateSchema>;

export const entityUpdateSchema = entityCreateSchema.partial();

export type EntityUpdateSchema = z.infer<typeof entityUpdateSchema>;
```

## ข้อกำหนดสำคัญ

### Naming Convention

- Schema: `entityFiltersSchema`, `entityCreateSchema`, `entityUpdateSchema`
- Type: `EntityFiltersSchema`, `EntityCreateSchema`, `EntityUpdateSchema`
- ใช้ camelCase สำหรับ schema, PascalCase สำหรับ type

### Filter Schema - Pagination Fields มาตรฐาน

```typescript
export const entityFiltersSchema = z.object({
  // Pagination (ต้องมีทุก filter schema)
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),

  // Sorting
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),

  // Search
  search: z.string().optional(),

  // Date range
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),

  // Feature-specific filters
  status: z.string().optional(),
  customerId: z.string().optional(),
  agentId: z.string().optional(),
});
```

### Error Messages ภาษาไทย

```typescript
z.string().min(1, 'กรุณากรอกชื่อ');
z.string().email('รูปแบบอีเมลไม่ถูกต้อง');
z.number().min(1, 'กรุณาระบุจำนวน');
z.string().regex(/^0[0-9]{9}$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง');
z.number().positive('จำนวนต้องเป็นค่าบวก');
z.string().min(1, 'กรุณาเลือกบัญชี');
z.string().length(13, 'เลขบัตรประชาชนต้องมี 13 หลัก');
```

### Common Patterns

#### Number with Coerce (สำหรับ query params)

```typescript
page: z.coerce.number().min(1).optional().default(1),
amount: z.coerce.number().positive('จำนวนเงินต้องมากกว่า 0'),
requestedAmount: z.coerce.number().min(0),
```

#### Enum with Default

```typescript
status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']).default('DRAFT'),
userType: z.enum(['CUSTOMER', 'AGENT']),
loanType: z.enum(['HOUSE_LAND_MORTGAGE', 'CAR_REGISTRATION']),
```

#### Optional with Default

```typescript
hirePurchase: z.boolean().optional().default(false),
limit: z.coerce.number().min(1).max(100).optional().default(10),
```

### Update Schema Pattern

```typescript
// วิธี 1: ใช้ .partial() (ทุก field เป็น optional)
export const entityUpdateSchema = entityCreateSchema.partial();

// วิธี 2: pick เฉพาะ fields ที่แก้ไขได้
export const entityUpdateSchema = entityCreateSchema
  .pick({
    name: true,
    description: true,
    status: true,
  })
  .partial();

// วิธี 3: กำหนดแยกกับ optional fields
export const entityUpdateSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ').optional(),
  description: z.string().optional(),
  amount: z.number().optional(),
});
```

### ตัวอย่างจริงจากโปรเจค

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

  // Title deed
  titleDeedImage: z.string().optional(),
  titleDeedData: z.any().optional(),

  // Supporting documents
  supportingImages: z.array(z.string()).optional(),

  // ID Card (for new users)
  idCardFrontImage: z.string().optional(),
  idCardBackImage: z.string().optional(),

  // Loan details
  requestedAmount: z.coerce.number().min(0),
  hirePurchase: z.boolean().default(false),
});

export type LoanApplicationSubmissionSchema = z.infer<
  typeof loanApplicationSubmissionSchema
>;
```

### Refinement Pattern

```typescript
export const dateRangeSchema = z
  .object({
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.dateFrom && data.dateTo) {
        return new Date(data.dateFrom) <= new Date(data.dateTo);
      }
      return true;
    },
    { message: 'วันที่เริ่มต้นต้องน้อยกว่าวันที่สิ้นสุด' }
  );
```

### Phone Number Validation

```typescript
export const phoneNumberSchema = z
  .string()
  .regex(/^0[0-9]{9}$/, 'เบอร์โทรศัพท์ไม่ถูกต้อง');

// Usage
phoneNumber: phoneNumberSchema,
```

## Export Checklist

- [ ] Export schema (camelCase)
- [ ] Export type (PascalCase) ด้วย `z.infer<typeof schema>`
- [ ] ใช้ error messages ภาษาไทย
- [ ] มี pagination fields สำหรับ filter schemas (page, limit)
- [ ] ใช้ `z.coerce` สำหรับ query params ที่เป็น number
