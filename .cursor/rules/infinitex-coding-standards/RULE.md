---
description: 'Naming conventions และ code style สำหรับ Infinitex App'
alwaysApply: true
---

# Infinitex Coding Standards

## ภาษาและการสื่อสาร

### ใช้ภาษาไทย:

- Error messages: `'ไม่พบข้อมูล'`, `'เกิดข้อผิดพลาด'`
- Toast notifications: `'บันทึกสำเร็จ'`, `'ลบรายการสำเร็จ'`
- Validation messages: `'กรุณากรอกชื่อ'`
- User-facing labels และ text

### ใช้ภาษาอังกฤษ:

- Variable names, function names, class names
- Technical comments
- Code documentation

## Naming Conventions

| Type                       | Format           | Example                                 |
| -------------------------- | ---------------- | --------------------------------------- |
| Variables, functions       | camelCase        | `getUserList`, `loanData`               |
| Components, classes, types | PascalCase       | `LoanCard`, `LoanApplicationRepository` |
| File names                 | kebab-case       | `loan-list.tsx`, `loan-service.ts`      |
| API routes                 | kebab-case       | `/api/loan-application/[id]`            |
| Constants                  | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`                         |
| Entity (singular)          | camelCase        | `loan`, `customer`                      |
| Collections (plural)       | camelCase        | `loans`, `customers`                    |

### Naming Patterns

```typescript
// API Object
loanApi // ไม่ใช่ LoanApi หรือ loan_api

// Hooks
useGetLoanList // use + Get + Entity + Action
useSubmitLoanApplication
useAnalyzeTitleDeed
useUpdateLoanStatus

// Repository
LoanApplicationRepository // PascalCase class
loanApplicationRepository // camelCase instance

// Service
loanService // camelCase object

// Schemas
loanCreateSchema // camelCase + Schema suffix
LoanCreateSchema // PascalCase type (z.infer)

// Keys
loanKeys // for React Query keys
```

## Code Style

### Prettier Config (inferred from codebase)

- Single quotes for imports
- Semicolons at end of statements
- 2 spaces indentation
- Trailing commas in multiline

### TypeScript

- Strict mode enabled
- Use `type` for object shapes, `interface` for extensible contracts
- Prefer `type` imports: `import { type LoanSchema } from './validations'`

### Imports Order

```typescript
// 1. 'use client' directive (ถ้าต้องการ)
'use client'

// 2. External packages (alphabetically within groups)
import { NextRequest, NextResponse } from 'next/server'

import { Prisma } from '@prisma/client'
// 3. Shared modules
import { api } from '@src/shared/lib/api-client'
import { prisma } from '@src/shared/lib/db'
import { Button } from '@src/shared/ui/button'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'

// 4. Feature modules (relative)
import { loanApi } from './api'
import { loanRepository } from './repositories/loanRepository'
import { type LoanCreateSchema } from './validations'

// 1. 'use client' directive (ถ้าต้องการ)

// 1. 'use client' directive (ถ้าต้องการ)

// 1. 'use client' directive (ถ้าต้องการ)

// 1. 'use client' directive (ถ้าต้องการ)

// 1. 'use client' directive (ถ้าต้องการ)

// 1. 'use client' directive (ถ้าต้องการ)
```

## Error Messages (ภาษาไทย)

```typescript
// Common errors
'ไม่พบข้อมูล'
'เกิดข้อผิดพลาด'
'ไม่มีสิทธิ์ดำเนินการ'
'ข้อมูลซ้ำ'
'กรุณาลองใหม่อีกครั้ง'

// Validation errors
'กรุณากรอกชื่อ'
'รูปแบบอีเมลไม่ถูกต้อง'
'เบอร์โทรศัพท์ไม่ถูกต้อง'
'จำนวนต้องเป็นค่าบวก'
'กรุณาเลือกไฟล์'

// Success messages
'บันทึกสำเร็จ'
'สร้างรายการสำเร็จ'
'แก้ไขรายการสำเร็จ'
'ลบรายการสำเร็จ'
'อัปเดตสถานะสำเร็จ'
'ส่งคำขอสินเชื่อเรียบร้อยแล้ว!'
'อัพโหลดสำเร็จ'

// Loan-specific messages
'เกิดข้อผิดพลาดในการส่งคำขอสินเชื่อ'
'เกิดข้อผิดพลาดในการวิเคราะห์โฉนด'
'เกิดข้อผิดพลาดในการอัพโหลดบัตรประชาชน'
```

## File Naming Examples

```
src/features/loan/
├── api.ts                           # loanApi object
├── hooks.ts                         # useGetLoanList, useSubmitLoanApplication
├── validations.ts                   # loanCreateSchema, LoanCreateSchema
├── repositories/
│   └── loanApplicationRepository.ts # LoanApplicationRepository class
├── services/
│   └── server.ts                    # loanService object
└── components/
    ├── loan-application-flow.tsx    # LoanApplicationFlow component
    ├── loan-steps/                  # Step components
    │   ├── title-deed-upload-step.tsx
    │   ├── id-card-step.tsx
    │   └── loan-amount-step.tsx
    └── title-deed-manual-input-modal.tsx
```

## ID Format

**โปรเจคนี้ใช้ String IDs (cuid):**

```typescript
// ✅ ถูก
const loan = await loanRepository.findById(id); // id: string

// ❌ ผิด
const loan = await loanRepository.findById(Number(id)); // ไม่ต้องแปลง
```

## Component Patterns

### Client Component

```typescript
'use client'

import { useState } from 'react'

import { useSubmitLoanApplication } from '@src/features/loan/hooks'
import { Button } from '@src/shared/ui/button'
import { toast } from 'sonner'

export function LoanForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitMutation = useSubmitLoanApplication()

  // ...
}
```

### Server Component (default)

```typescript
// ไม่ต้อง 'use client'
import { loanService } from '@src/features/loan/services/server';

export default async function LoansPage() {
  const loans = await loanService.getList({ page: 1, limit: 10 });

  return <LoanList loans={loans} />;
}
```
