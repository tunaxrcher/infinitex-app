import { NextRequest, NextResponse } from 'next/server'

import { customerService } from '@src/features/customer/services/server'
import { customerUpdateSchema } from '@src/features/customer/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await customerService.getById(params.id)
    return NextResponse.json(result)
  } catch (error) {
    console.error(`GET /api/customers/${params.id} error:`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = customerUpdateSchema.parse(body)

    const result = await customerService.update(params.id, validatedData)
    return NextResponse.json(result)
  } catch (error) {
    console.error(`PUT /api/customers/${params.id} error:`, error)

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await customerService.delete(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`DELETE /api/customers/${params.id} error:`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
