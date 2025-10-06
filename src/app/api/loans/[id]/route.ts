// src/app/api/loans/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { loanService } from '../../../../features/products/services/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await loanService.getById(id)
    return NextResponse.json({
      success: true,
      message: 'สำเร็จ',
      data: result,
    })
  } catch (error: any) {
    console.error('[API Error] GET /api/loans/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาด',
        errors: error,
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const result = await loanService.update(id, body)
    return NextResponse.json({
      success: true,
      message: 'อัปเดตสินเชื่อสำเร็จ',
      data: result,
    })
  } catch (error: any) {
    console.error('[API Error] PUT /api/loans/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาด',
        errors: error,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await loanService.delete(id)
    return NextResponse.json({
      success: true,
      message: 'ยกเลิกสินเชื่อสำเร็จ',
      data: result,
    })
  } catch (error: any) {
    console.error('[API Error] DELETE /api/loans/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาด',
        errors: error,
      },
      { status: 500 }
    )
  }
}
