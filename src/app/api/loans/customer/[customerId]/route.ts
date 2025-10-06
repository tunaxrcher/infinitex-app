// src/app/api/loans/customer/[customerId]/route.ts
import { NextRequest, NextResponse } from 'next/server'

import { loanService } from '../../../../../features/products/services/server'

interface RouteParams {
  params: Promise<{ customerId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { customerId } = await params
    const result = await loanService.getByCustomerId(customerId)
    return NextResponse.json({
      success: true,
      message: 'สำเร็จ',
      data: result,
    })
  } catch (error: any) {
    console.error('[API Error] GET /api/loans/customer/[customerId]:', error)
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
