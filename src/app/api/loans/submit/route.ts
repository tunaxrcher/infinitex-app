import { NextRequest, NextResponse } from 'next/server'

import { loanService } from '@src/features/loan/services/server'
import { loanApplicationSubmissionSchema } from '@src/features/loan/validations'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Loan application submission started')

    // Get agent information from headers (set by middleware)
    const agentId = request.headers.get('x-user-id')
    const userType = request.headers.get('x-user-type')
    const isSubmittedByAgent = userType === 'AGENT' && !!agentId

    const body = await request.json()

    // Validate request body
    const validatedData = loanApplicationSubmissionSchema.parse(body)

    console.log('[API] Submission context:', {
      agentId,
      userType,
      isSubmittedByAgent,
    })

    // Call service layer
    const result = await loanService.submitApplication(
      validatedData,
      isSubmittedByAgent ? agentId! : undefined
    )

    return NextResponse.json({
      success: true,
      ...result,
      message: 'ส่งคำขอสินเชื่อเรียบร้อยแล้ว',
    })
  } catch (error) {
    console.error('[API] Loan application submission failed:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'ข้อมูลไม่ถูกต้อง',
          details: error.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'เกิดข้อผิดพลาดในการส่งคำขอสินเชื่อ',
      },
      { status: 500 }
    )
  }
}
