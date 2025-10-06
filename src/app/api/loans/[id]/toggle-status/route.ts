// src/app/api/loans/[id]/toggle-status/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { loanService } from '../../../../../features/products/services/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await loanService.toggleStatus(id)
    return NextResponse.json({
      success: true,
      message: 'อัปเดตสถานะสำเร็จ',
      data: result,
    })
  } catch (error: any) {
    console.error('[API Error] PATCH /api/loans/[id]/toggle-status:', error)
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
