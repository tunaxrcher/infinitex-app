// src/app/api/loans/agent/[agentId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { loanService } from '../../../../../features/products/services/server'

interface RouteParams {
  params: Promise<{ agentId: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { agentId } = await params
    const result = await loanService.getByAgentId(agentId)
    return NextResponse.json({
      success: true,
      message: 'สำเร็จ',
      data: result,
    })
  } catch (error: any) {
    console.error('[API Error] GET /api/loans/agent/[agentId]:', error)
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
