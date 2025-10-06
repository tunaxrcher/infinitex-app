import { NextRequest, NextResponse } from 'next/server'

import { customerService } from '@src/features/customer/services/server'
import { agentCustomerAssignSchema } from '@src/features/customer/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = agentCustomerAssignSchema.parse(body)

    const result = await customerService.assignToAgent(
      validatedData.customerId,
      validatedData.agentId
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('POST /api/customers/assign-agent error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
