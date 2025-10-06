import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { loanApi } from './api'
import {
  type LoanApplicationSubmissionSchema,
  type ManualLookupSchema,
} from './validations'

export const loanKeys = {
  all: () => ['loans'] as const,
  byAgent: (agentId: string) => ['loans', 'agent', agentId] as const,
  detail: (id: string) => ['loans', 'detail', id] as const,
}

/**
 * Submit loan application
 */
export const useSubmitLoanApplication = () => {
  return useMutation({
    mutationFn: (data: LoanApplicationSubmissionSchema) =>
      loanApi.submitApplication(data),
    onSuccess: (result) => {
      toast.success('ส่งคำขอสินเชื่อเรียบร้อยแล้ว!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการส่งคำขอสินเชื่อ')
    },
  })
}

/**
 * Analyze title deed image
 */
export const useAnalyzeTitleDeed = () => {
  return useMutation({
    mutationFn: (file: File) => loanApi.analyzeTitleDeed(file),
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการวิเคราะห์โฉนด')
    },
  })
}

/**
 * Manual title deed lookup
 */
export const useManualTitleDeedLookup = () => {
  return useMutation({
    mutationFn: (data: ManualLookupSchema) =>
      loanApi.manualTitleDeedLookup(data),
    onSuccess: () => {
      toast.success('ค้นหาข้อมูลโฉนดสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการค้นหาข้อมูลโฉนด')
    },
  })
}

/**
 * Upload ID card
 */
export const useUploadIdCard = () => {
  return useMutation({
    mutationFn: (file: File) => loanApi.uploadIdCard(file),
    onSuccess: () => {
      toast.success('อัพโหลดบัตรประชาชนสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการอัพโหลดบัตรประชาชน')
    },
  })
}

/**
 * Evaluate property value
 */
export const useEvaluatePropertyValue = () => {
  return useMutation({
    mutationFn: ({
      titleDeedImage,
      titleDeedData,
      supportingImages,
    }: {
      titleDeedImage: File
      titleDeedData: any
      supportingImages?: File[]
    }) =>
      loanApi.evaluatePropertyValue(
        titleDeedImage,
        titleDeedData,
        supportingImages
      ),
    onSuccess: () => {
      toast.success('ประเมินมูลค่าทรัพย์สินสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการประเมินมูลค่า')
    },
  })
}

/**
 * Get loan applications by agent ID
 */
export const useGetLoansByAgentId = (agentId: string) => {
  return useQuery({
    queryKey: loanKeys.byAgent(agentId),
    queryFn: () => loanApi.getByAgentId(agentId),
    enabled: !!agentId,
    staleTime: 0,
    gcTime: 0,
  })
}

/**
 * Get loan application by ID
 */
export const useGetLoanById = (id: string) => {
  return useQuery({
    queryKey: loanKeys.detail(id),
    queryFn: () => loanApi.getById(id),
    enabled: !!id,
  })
}

/**
 * Update loan application status
 */
export const useUpdateLoanStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      status,
      reviewNotes,
    }: {
      id: string
      status: string
      reviewNotes?: string
    }) => loanApi.updateStatus(id, status, reviewNotes),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: loanKeys.all() })
      toast.success('อัปเดตสถานะสำเร็จ')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ')
    },
  })
}
