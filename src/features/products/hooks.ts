// src/features/products/hooks.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { loanApi } from './api'
import { type ProductsFiltersSchema } from './validations'

export const loanKeys = {
  all: () => ['loans'] as const,
  list: (filters?: ProductsFiltersSchema) => ['loans', 'list', filters] as const,
  detail: (id: string) => ['loans', 'detail', id] as const,
  customer: (customerId: string) => ['loans', 'customer', customerId] as const,
  agent: (agentId: string) => ['loans', 'agent', agentId] as const,
  statistics: (filters?: any) => ['loans', 'statistics', filters] as const,
}

export const useGetLoanList = (filters: ProductsFiltersSchema) => {
  return useQuery({
    queryKey: loanKeys.list(filters),
    queryFn: () => loanApi.getList(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    gcTime: 0,
  })
}

export const useGetLoanById = (id: string) => {
  return useQuery({
    queryKey: loanKeys.detail(id),
    queryFn: () => loanApi.getById(id),
    enabled: !!id,
  })
}

export const useGetLoansByCustomerId = (customerId: string) => {
  return useQuery({
    queryKey: loanKeys.customer(customerId),
    queryFn: () => loanApi.getByCustomerId(customerId),
    enabled: !!customerId,
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    gcTime: 0,
  })
}

export const useGetLoansByAgentId = (agentId: string) => {
  return useQuery({
    queryKey: loanKeys.agent(agentId),
    queryFn: () => loanApi.getByAgentId(agentId),
    enabled: !!agentId,
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    gcTime: 0,
  })
}

export const useGetLoanStatistics = (filters?: any) => {
  return useQuery({
    queryKey: loanKeys.statistics(filters),
    queryFn: () => loanApi.getStatistics(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useCreateLoan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: loanApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanKeys.list() })
      queryClient.invalidateQueries({ queryKey: loanKeys.statistics() })
      toast.success('สร้างสินเชื่อสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    },
  })
}

export const useUpdateLoan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => loanApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: loanKeys.list() })
      queryClient.invalidateQueries({ queryKey: loanKeys.statistics() })
      toast.success('อัปเดตสินเชื่อสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    },
  })
}

export const useToggleLoanStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: loanApi.toggleStatus,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: loanKeys.list() })
      queryClient.invalidateQueries({ queryKey: loanKeys.statistics() })
      toast.success('อัปเดตสถานะสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    },
  })
}

export const useDeleteLoan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: loanApi.delete,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: loanKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: loanKeys.list() })
      queryClient.invalidateQueries({ queryKey: loanKeys.statistics() })
      toast.success('ยกเลิกสินเชื่อสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาด')
    },
  })
}
