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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// หรือ toast from 'react-hot-toast'

import { entityApi } from './api'
import { type EntityFiltersSchema } from './validations'

// ============================================
// Query Keys
// ============================================

export const entityKeys = {
  all: () => ['entity'] as const,
  list: (filters?: EntityFiltersSchema) => ['entity', 'list', filters] as const,
  listByAgent: (agentId: string, filters?: any) =>
    ['entity', 'list', 'agent', agentId, filters] as const,
  detail: (id: string) => ['entity', 'detail', id] as const,
  search: (term: string, agentId?: string) =>
    ['entity', 'search', term, agentId] as const,
}

// ============================================
// Query Hooks
// ============================================

export const useGetEntityList = (filters?: EntityFiltersSchema) => {
  return useQuery({
    queryKey: entityKeys.list(filters),
    queryFn: () => entityApi.getList(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
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

// ============================================
// Mutation Hooks
// ============================================

export const useCreateEntity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: entityApi.create,
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

export const useUpdateEntity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      entityApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: entityKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: entityKeys.all() })
      toast.success('แก้ไขรายการสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    },
  })
}

export const useDeleteEntity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: entityApi.delete,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: entityKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: entityKeys.all() })
      toast.success('ลบรายการสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    },
  })
}
```

## ข้อกำหนดสำคัญ

### Toast Library

โปรเจคใช้ทั้ง `sonner` และ `react-hot-toast`:

```typescript
// แนะนำ: ใช้ sonner
import { toast } from 'sonner';
toast.success('สำเร็จ');
toast.error('เกิดข้อผิดพลาด');

// หรือ react-hot-toast (ใช้ในบาง features)
import toast from 'react-hot-toast';
toast.success('สำเร็จ');
toast.error('เกิดข้อผิดพลาด');
```

### Query Keys Pattern

- ใช้ factory function สำหรับ query keys
- Structure: `[entity, 'list'/'detail', params]`
- Export เป็น `entityKeys` object

### Query Hooks Naming

- `useGet[Entity]List` - ดึงรายการ
- `useGet[Entity]ById` / `useGet[Entity]` - ดึงรายละเอียด
- `useCreate[Entity]` - สร้างใหม่
- `useUpdate[Entity]` - แก้ไข
- `useDelete[Entity]` - ลบ
- `useSearch[Entities]` - ค้นหา
- `use[Action][Entity]` - custom actions

### Query Options ที่แนะนำ

```typescript
{
  queryKey: entityKeys.list(filters),
  queryFn: () => entityApi.getList(filters),
  placeholderData: (previousData) => previousData, // ป้องกัน loading flash
  staleTime: 5 * 60 * 1000,     // 5 minutes - ข้อมูลไม่เปลี่ยนบ่อย
  gcTime: 10 * 60 * 1000,       // 10 minutes
  refetchOnWindowFocus: false,  // ป้องกัน refetch เมื่อ focus window
  refetchOnMount: false,        // ป้องกัน refetch เมื่อ mount component ใหม่
  retry: false,                 // ปิด retry เพื่อป้องกัน request ซ้ำ
  enabled: !!requiredParam,     // Conditional fetching
}
```

### Mutation Options

```typescript
{
  mutationFn: entityApi.create,
  retry: false,  // ปิด retry เพื่อป้องกัน request ซ้ำ
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: entityKeys.all() });
    toast.success('สำเร็จ');
  },
  onError: (error: Error) => {
    toast.error(error.message || 'เกิดข้อผิดพลาด');
  },
}
```

## Toast Messages ที่ใช้บ่อย

```typescript
// Success
toast.success('เพิ่มลูกค้าสำเร็จ')
toast.success('อัปเดตข้อมูลลูกค้าสำเร็จ')
toast.success('ลบลูกค้าสำเร็จ')
toast.success('มอบหมายลูกค้าให้ Agent สำเร็จ')
toast.success('ส่งคำขอสินเชื่อเรียบร้อยแล้ว!')
toast.success('อัพโหลดบัตรประชาชนสำเร็จ')
toast.success('ค้นหาข้อมูลโฉนดสำเร็จ')

// Error
toast.error(error.message || 'เกิดข้อผิดพลาด')
toast.error('เกิดข้อผิดพลาดในการเพิ่มลูกค้า')
toast.error('เกิดข้อผิดพลาดในการส่งคำขอสินเชื่อ')
```

## ตัวอย่างจริงจากโปรเจค

```typescript
// src/features/customer/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { customerApi } from './api'
import { type CustomerFiltersSchema } from './validations'

export const customerKeys = {
  all: () => ['customer'] as const,
  list: (filters?: CustomerFiltersSchema) =>
    ['customer', 'list', filters] as const,
  listByAgent: (agentId: string, filters?: any) =>
    ['customer', 'list', 'agent', agentId, filters] as const,
  detail: (id: string) => ['customer', 'detail', id] as const,
  search: (searchTerm: string, agentId?: string) =>
    ['customer', 'search', searchTerm, agentId] as const,
}

export const useGetCustomerListByAgent = (filters: any = {}) => {
  return useQuery({
    queryKey: customerKeys.listByAgent('current', filters),
    queryFn: () => customerApi.getListByAgent(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: false,
  })
}

export const useSearchCustomers = (searchTerm: string, agentId?: string) => {
  return useQuery({
    queryKey: customerKeys.search(searchTerm, agentId),
    queryFn: () => customerApi.search(searchTerm, agentId),
    enabled: searchTerm.length >= 2, // Only search if at least 2 characters
    staleTime: 30000,
  })
}
```

## Conditional Fetching

```typescript
// Fetch only when parameter exists
export const useGetLoansByAgentId = (agentId: string) => {
  return useQuery({
    queryKey: loanKeys.byAgent(agentId),
    queryFn: () => loanApi.getByAgentId(agentId),
    enabled: !!agentId,
  })
}

// Fetch only when search term is long enough
export const useSearchCustomers = (searchTerm: string) => {
  return useQuery({
    queryKey: customerKeys.search(searchTerm),
    queryFn: () => customerApi.search(searchTerm),
    enabled: searchTerm.length >= 2,
  })
}
```
