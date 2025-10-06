import { z } from 'zod'

// Title deed analysis result schema
export const titleDeedAnalysisSchema = z.object({
  pvName: z.string().describe('ชื่อจังหวัดที่พบในโฉนดที่ดิน'),
  amName: z.string().describe('ชื่ออำเภอที่พบในโฉนดที่ดิน'),
  parcelNo: z.string().describe('เลขโฉนดที่ดินที่พบ'),
  pvCode: z.string().optional().describe('รหัสจังหวัด'),
  amCode: z.string().optional().describe('รหัสอำเภอ'),
})

export type TitleDeedAnalysisSchema = z.infer<typeof titleDeedAnalysisSchema>

// Property valuation schema
export const propertyValuationSchema = z.object({
  estimatedValue: z.number().min(0).describe('มูลค่าประเมินของทรัพย์สินในหน่วยบาท'),
  reasoning: z.string().describe('เหตุผลและการวิเคราะห์ที่ใช้ในการประเมินมูลค่า'),
  confidence: z.number().min(0).max(100).describe('ระดับความมั่นใจในการประเมิน (0-100)'),
})

export type PropertyValuationSchema = z.infer<typeof propertyValuationSchema>

// Loan application submission schema
export const loanApplicationSubmissionSchema = z.object({
  phoneNumber: z.string().min(10, 'เบอร์โทรศัพท์ต้องมีอย่างน้อย 10 หลัก'),
  pin: z.string().length(4, 'PIN ต้องมี 4 หลัก').optional(),
  
  // Title deed information
  titleDeedImage: z.string().nullable().optional(),
  titleDeedImageUrl: z.string().url().nullable().optional(),
  titleDeedImageKey: z.string().nullable().optional(),
  titleDeedData: z.any().nullable().optional(),
  titleDeedAnalysis: titleDeedAnalysisSchema.nullable().optional(),
  titleDeedManualData: z.object({
    pvCode: z.string(),
    amCode: z.string(),
    parcelNo: z.string(),
    pvName: z.string(),
    amName: z.string(),
  }).nullable().optional(),
  
  // Supporting images
  supportingImages: z.array(z.string()).default([]),
  
  // ID Card
  idCardImage: z.string().nullable().optional(),
  idCardImageUrl: z.string().url().nullable().optional(),
  idCardImageKey: z.string().nullable().optional(),
  
  // Loan amount
  requestedLoanAmount: z.number().min(1, 'ยอดเงินที่ขอต้องมากกว่า 0'),
  loanAmount: z.number().min(0).default(0),
  
  // Property valuation
  propertyValuation: propertyValuationSchema.nullable().optional(),
})

export type LoanApplicationSubmissionSchema = z.infer<typeof loanApplicationSubmissionSchema>

// Manual lookup schema
export const manualLookupSchema = z.object({
  pvCode: z.string().min(1, 'กรุณาเลือกจังหวัด'),
  amCode: z.string().min(1, 'กรุณาเลือกอำเภอ'),
  parcelNo: z.string().min(1, 'กรุณากรอกเลขโฉนด'),
})

export type ManualLookupSchema = z.infer<typeof manualLookupSchema>

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.any().refine((file) => file instanceof File, 'ต้องเป็นไฟล์'),
})

export type FileUploadSchema = z.infer<typeof fileUploadSchema>
