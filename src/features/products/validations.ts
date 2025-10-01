// src/features/products/validations.ts
import { baseTableSchema } from '@src/shared/validations/pagination'
import { z } from 'zod'

export const productsFiltersSchema = baseTableSchema.extend({
  status: z.string().optional(),
  loanType: z.string().optional(),
  customerId: z.string().optional(),
  agentId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

export type ProductsFiltersSchema = z.infer<typeof productsFiltersSchema>

export const loanCreateSchema = z.object({
  customerId: z.string().min(1, 'กรุณาเลือกลูกค้า'),
  loanType: z.string().min(1, 'กรุณาเลือกประเภทสินเชื่อ'),
  principalAmount: z.number().min(1, 'กรุณากรอกจำนวนเงินกู้'),
  interestRate: z.number().min(0, 'กรุณากรอกอัตราดอกเบี้ย'),
  termMonths: z.number().min(1, 'กรุณากรอกระยะเวลาผ่อนชำระ'),
  titleDeedNumber: z.string().optional(),
  collateralValue: z.number().optional(),
  collateralDetails: z.any().optional(),
})

export type LoanCreateSchema = z.infer<typeof loanCreateSchema>

export const loanUpdateSchema = loanCreateSchema.partial()

export type LoanUpdateSchema = z.infer<typeof loanUpdateSchema>
