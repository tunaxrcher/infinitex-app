---
description: 'Pattern สำหรับ React components ใน Infinitex App'
globs:
  - '**/components/**/*.tsx'
  - '**/app/**/*.tsx'
alwaysApply: false
---

# React Components Pattern

## โครงสร้าง Component พื้นฐาน

```tsx
'use client'

// เฉพาะ Client Components
import { useState } from 'react'

import { useGetLoanById } from '@src/features/loan/hooks'
import { cn } from '@src/shared/lib/utils'
import { Button } from '@src/shared/ui/button'
import { Card } from '@src/shared/ui/card'
import { Skeleton } from '@src/shared/ui/skeleton'

interface LoanCardProps {
  loanId: string
  onEdit?: (id: string) => void
  className?: string
}

export function LoanCard({ loanId, onEdit, className }: LoanCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data, isLoading } = useGetLoanById(loanId)

  if (isLoading) {
    return <Skeleton className="h-20 w-full" />
  }

  return <Card className={cn('p-4', className)}>{/* ... */}</Card>
}
```

## Client vs Server Components

### Server Components (default)

```tsx
// ไม่ต้องมี 'use client'
// ใช้ได้: async/await, เรียก service โดยตรง
// ใช้ไม่ได้: useState, useEffect, event handlers
import { loanService } from '@src/features/loan/services/server'

export default async function LoansPage() {
  const loans = await loanService.getList({ page: 1, limit: 10 })

  return (
    <div>
      <LoanList initialData={loans} />
    </div>
  )
}
```

### Client Components

```tsx
'use client';  // บรรทัดแรก!

// ใช้ได้: useState, useEffect, hooks, event handlers
// ใช้ไม่ได้: async component, เรียก service โดยตรง

export function LoanList({ initialData }: Props) {
  const [filter, setFilter] = useState('');
  const { data } = useGetLoanList({ search: filter });

  return (/* ... */);
}
```

## Component Organization

### Feature Components

```
src/features/[feature]/components/
├── [entity]-list.tsx         # List component
├── [entity]-card.tsx         # Card component
├── [entity]-form.tsx         # Create/edit form
├── [entity]-dialog.tsx       # Dialog/modal
├── [entity]-steps/           # Multi-step flow
│   ├── step-1.tsx
│   ├── step-2.tsx
│   └── step-3.tsx
└── [entity]-application-flow.tsx  # Flow container
```

### Naming Conventions

- **Files**: `kebab-case.tsx` (`loan-card.tsx`)
- **Components**: `PascalCase` (`LoanCard`)
- **Props Interface**: `ComponentNameProps` (`LoanCardProps`)

## Props Pattern

### Interface Definition

```tsx
interface LoanDialogProps {
  // Required props
  open: boolean
  onOpenChange: (open: boolean) => void

  // Optional props
  loanId?: string
  mode?: 'create' | 'edit'
  className?: string

  // Callbacks
  onSuccess?: () => void
  onError?: (error: Error) => void
}
```

### Destructuring with Defaults

```tsx
export function LoanDialog({
  open,
  onOpenChange,
  loanId,
  mode = 'create',
  className,
  onSuccess,
}: LoanDialogProps) {
  // ...
}
```

## State Management

### Local State

```tsx
const [isOpen, setIsOpen] = useState(false)
const [selectedId, setSelectedId] = useState<string | undefined>()
```

### Server State (React Query)

```tsx
// ใช้ hooks จาก features
const { data, isLoading, error } = useGetLoansByAgentId(agentId)
const submitMutation = useSubmitLoanApplication()
```

## Loading & Error States

```tsx
// Loading
if (isLoading) {
  return <Skeleton className="h-20 w-full" />;
}

// Error
if (error) {
  return (
    <Alert variant="destructive">
      <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}

// Empty
if (!data || data.length === 0) {
  return <EmptyState message="ไม่พบข้อมูล" />;
}
```

## Event Handlers

```tsx
import { toast } from 'sonner'

// Naming: handle + Action
const handleSubmit = (data: FormData) => {
  submitMutation.mutate(data, {
    onSuccess: () => {
      toast.success('บันทึกสำเร็จ')
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    },
  })
}

const handleDelete = (id: string) => {
  if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
    deleteMutation.mutate(id)
  }
}
```

## Import Order

```tsx
// 1. 'use client' directive
'use client'

// 2. React imports
import { useEffect, useMemo, useState } from 'react'

// 3. External libraries
import { zodResolver } from '@hookform/resolvers/zod'
// 4. Feature hooks/utils
import { useSubmitLoanApplication } from '@src/features/loan/hooks'
import { loanCreateSchema } from '@src/features/loan/validations'
// 5. Shared components
import { Button } from '@src/shared/ui/button'
import { Card } from '@src/shared/ui/card'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

// 6. Local/relative imports
import { LoanCard } from './loan-card'

// 1. 'use client' directive
```

## Common UI Patterns

```tsx
// Buttons
<Button variant="outline">ยกเลิก</Button>
<Button>บันทึก</Button>
<Button disabled={isPending}>
  {isPending ? 'กำลังบันทึก...' : 'บันทึก'}
</Button>

// Dialogs
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>หัวข้อ</DialogTitle>
      <DialogDescription>รายละเอียด</DialogDescription>
    </DialogHeader>
    {/* content */}
    <DialogFooter>
      <Button variant="outline" onClick={() => onOpenChange(false)}>
        ยกเลิก
      </Button>
      <Button type="submit">บันทึก</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Loading spinner
<div className="flex items-center justify-center">
  <LoadingSpinner />
</div>

// Cards
<Card className="p-4">
  <CardHeader>
    <CardTitle>หัวข้อ</CardTitle>
  </CardHeader>
  <CardContent>
    {/* content */}
  </CardContent>
</Card>
```

## Mobile-First Design

โปรเจคนี้เป็น Mobile Web App:

```tsx
// ใช้ mobile-first responsive classes
<div className="p-4 md:p-6 lg:p-8">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* content */}
  </div>
</div>

// Bottom safe area for mobile
<div className="pb-safe">
  <BottomNavigation />
</div>
```
