// src/app/api/loans/statistics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { loanService } from '../../../../features/products/services/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const filters = Object.fromEntries(searchParams.entries())

    const result = await loanService.getStatistics(filters)
    return NextResponse.json({
      success: true,
      message: 'สำเร็จ',
      data: result,
    })
  } catch (error: any) {
    console.error('[API Error] GET /api/loans/statistics:', error)
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
