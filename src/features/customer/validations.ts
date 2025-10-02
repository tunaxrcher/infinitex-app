import { baseTableSchema } from '@src/shared/validations/pagination'
import { z } from 'zod'

export const customerFiltersSchema = baseTableSchema.extend({
  // Add customer-specific filters
  status: z.string().optional(),
  search: z.string().optional(),
  agentId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

export type CustomerFiltersSchema = z.infer<typeof customerFiltersSchema>

export const customerCreateSchema = z.object({
  phoneNumber: z.string()
    .min(10, 'กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก')
    .refine((val) => {
      const cleaned = val.replace(/\D/g, '')
      return cleaned.length === 10 && cleaned.startsWith('0')
    }, 'เบอร์โทรศัพท์ต้องเป็น 10 หลักและขึ้นต้นด้วย 0'),
  firstName: z.string().min(1, 'กรุณากรอกชื่อ').max(50, 'ชื่อต้องไม่เกิน 50 ตัวอักษร'),
  lastName: z.string().max(50, 'นามสกุลต้องไม่เกิน 50 ตัวอักษร').optional(), // ทำให้นามสกุลเป็น optional
  idCardNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง').optional().or(z.literal('')),
  lineId: z.string().optional(),
})

export type CustomerCreateSchema = z.infer<typeof customerCreateSchema>

export const customerUpdateSchema = customerCreateSchema.partial()

export type CustomerUpdateSchema = z.infer<typeof customerUpdateSchema>

export const agentCustomerAssignSchema = z.object({
  agentId: z.string().min(1, 'กรุณาเลือก Agent'),
  customerId: z.string().min(1, 'กรุณาเลือกลูกค้า'),
})

export type AgentCustomerAssignSchema = z.infer<typeof agentCustomerAssignSchema>
