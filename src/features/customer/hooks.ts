import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { customerApi } from './api'
import { type CustomerFiltersSchema } from './validations'

export const customerKeys = {
  all: () => ['customer'] as const,
  list: (filters?: CustomerFiltersSchema) => ['customer', 'list', filters] as const,
  listByAgent: (agentId: string, filters?: any) => ['customer', 'list', 'agent', agentId, filters] as const,
  detail: (id: string) => ['customer', 'detail', id] as const,
  search: (searchTerm: string, agentId?: string) => ['customer', 'search', searchTerm, agentId] as const,
}

export const useGetCustomerListByAgent = (filters: any = {}) => {
  return useQuery({
    queryKey: customerKeys.listByAgent('current', filters),
    queryFn: () => customerApi.getListByAgent(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes - ข้อมูลลูกค้าไม่เปลี่ยนบ่อย
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false, // ป้องกัน refetch เมื่อ focus window
    refetchOnMount: false, // ป้องกัน refetch เมื่อ mount component ใหม่
    retry: false, // ปิด retry เพื่อป้องกัน request ซ้ำ
  })
}

export const useGetCustomer = (id: string) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customerApi.getById(id),
    enabled: !!id,
  })
}

export const useCreateCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: customerApi.create,
    retry: false, // ปิด retry เพื่อป้องกัน request ซ้ำ
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all() })
      toast.success('เพิ่มลูกค้าสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการเพิ่มลูกค้า')
    },
  })
}

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => customerApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: customerKeys.all() })
      toast.success('อัปเดตข้อมูลลูกค้าสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล')
    },
  })
}

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: customerApi.delete,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: customerKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: customerKeys.all() })
      toast.success('ลบลูกค้าสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการลบลูกค้า')
    },
  })
}

export const useAssignCustomerToAgent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: customerApi.assignToAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all() })
      toast.success('มอบหมายลูกค้าให้ Agent สำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการมอบหมายลูกค้า')
    },
  })
}

export const useSearchCustomers = (searchTerm: string, agentId?: string) => {
  return useQuery({
    queryKey: customerKeys.search(searchTerm, agentId),
    queryFn: () => customerApi.search(searchTerm, agentId),
    enabled: searchTerm.length >= 2, // Only search if at least 2 characters
    staleTime: 30000, // Cache for 30 seconds
  })
}
