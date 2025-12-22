---
description: 'Pattern สำหรับ React Query hooks ใน feature hooks.ts'
globs:
  - '**/features/**/hooks.ts'
alwaysApply: false
---

# React Query Hooks Pattern

## โครงสร้างไฟล์ hooks.ts

```typescript
// src/features/[feature-name]/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { entityApi } from './api';
import { type EntityCreateSchema, type EntityFiltersSchema } from './validations';

// ============================================
// Query Keys
// ============================================

export const entityKeys = {
  all: () => ['entities'] as const,
  list: (filters?: EntityFiltersSchema) =>
    ['entities', 'list', filters] as const,
  detail: (id: string) => ['entities', 'detail', id] as const,
};

// ============================================
// Query Hooks
// ============================================

export const useGetEntityList = (filters?: EntityFiltersSchema) => {
  return useQuery({
    queryKey: entityKeys.list(filters),
    queryFn: () => entityApi.getList(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useGetEntityById = (id: string) => {
  return useQuery({
    queryKey: entityKeys.detail(id),
    queryFn: () => entityApi.getById(id),
    enabled: !!id,
  });
};

// ============================================
// Mutation Hooks
// ============================================

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

export const useUpdateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EntityUpdateSchema }) =>
      entityApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: entityKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: entityKeys.all() });
      toast.success('แก้ไขรายการสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาด');
    },
  });
};

export const useDeleteEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => entityApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: entityKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: entityKeys.all() });
      toast.success('ลบรายการสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาด');
    },
  });
};
```

## ข้อกำหนดสำคัญ

### Query Keys Pattern

- ใช้ factory function สำหรับ query keys
- Structure: `[entity, 'list'/'detail', params]`
- Export เป็น `entityKeys` object

### Query Hooks Naming

- `useGet[Entity]List` - ดึงรายการ
- `useGet[Entity]ById` - ดึงรายละเอียด
- `useCreate[Entity]` - สร้างใหม่
- `useUpdate[Entity]` - แก้ไข
- `useDelete[Entity]` - ลบ
- `use[Action][Entity]` - custom actions (e.g., `useSubmitLoanApplication`)

### Query Options ที่แนะนำ

```typescript
{
  queryKey: entityKeys.list(filters),
  queryFn: () => entityApi.getList(filters),
  placeholderData: (previousData) => previousData, // ป้องกัน loading flash
  staleTime: 30000,           // 30 seconds
  gcTime: 5 * 60 * 1000,      // 5 minutes
  refetchOnWindowFocus: false,
  retry: 1,
  enabled: !!requiredParam,   // Conditional fetching
}
```

### Mutation Pattern

1. `invalidateQueries` - ทำให้ cache หมดอายุ
2. `removeQueries` - ลบ cache สำหรับ delete operations
3. Toast notifications ภาษาไทย (ใช้ `sonner`)

## Toast Messages ที่ใช้บ่อย

```typescript
import { toast } from 'sonner';

// Success
toast.success('สร้างรายการสำเร็จ');
toast.success('แก้ไขรายการสำเร็จ');
toast.success('ลบรายการสำเร็จ');
toast.success('อัปเดตสถานะสำเร็จ');
toast.success('บันทึกสำเร็จ');
toast.success('ส่งคำขอสินเชื่อเรียบร้อยแล้ว!');

// Error
toast.error(error.message || 'เกิดข้อผิดพลาด');

// Loading (for long operations)
toast.loading('กำลังดำเนินการ...');
```

## Custom Mutation Examples

```typescript
/**
 * Submit loan application
 */
export const useSubmitLoanApplication = () => {
  return useMutation({
    mutationFn: (data: LoanApplicationSubmissionSchema) =>
      loanApi.submitApplication(data),
    onSuccess: (result) => {
      toast.success('ส่งคำขอสินเชื่อเรียบร้อยแล้ว!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการส่งคำขอสินเชื่อ');
    },
  });
};

/**
 * Analyze title deed image
 */
export const useAnalyzeTitleDeed = () => {
  return useMutation({
    mutationFn: (file: File) => loanApi.analyzeTitleDeed(file),
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการวิเคราะห์โฉนด');
    },
  });
};

/**
 * Update status
 */
export const useUpdateLoanStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }: UpdateStatusParams) =>
      loanApi.updateStatus(id, status, notes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: loanKeys.all() });
      toast.success('อัปเดตสถานะสำเร็จ');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    },
  });
};
```

## Queries with Dependencies

```typescript
/**
 * Get loans by agent ID (enabled only when agentId exists)
 */
export const useGetLoansByAgentId = (agentId: string) => {
  return useQuery({
    queryKey: loanKeys.byAgent(agentId),
    queryFn: () => loanApi.getByAgentId(agentId),
    enabled: !!agentId,
    staleTime: 0,
    gcTime: 0,
  });
};
```

## ตัวอย่างการใช้งานใน Component

```typescript
'use client';

import { useGetLoansByAgentId, useSubmitLoanApplication } from '@src/features/loan/hooks';

export function LoanList({ agentId }: { agentId: string }) {
  const { data, isLoading, error } = useGetLoansByAgentId(agentId);
  const submitMutation = useSubmitLoanApplication();

  const handleSubmit = (data: LoanData) => {
    submitMutation.mutate(data, {
      onSuccess: () => {
        // Additional success handling
      },
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div>
      {data?.data?.map((loan) => (
        <LoanCard key={loan.id} loan={loan} />
      ))}
    </div>
  );
}
```
