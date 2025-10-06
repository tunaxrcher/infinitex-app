import { NextRequest, NextResponse } from 'next/server'

import { customerService } from '@src/features/customer/services/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const searchTerm = searchParams.get('search')
    const agentId = searchParams.get('agentId')

    if (!searchTerm || searchTerm.length < 2) {
      return NextResponse.json(
        { error: 'Search term must be at least 2 characters' },
        { status: 400 }
      )
    }

    const result = await customerService.searchCustomers(
      searchTerm,
      agentId || undefined
    )
    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/customers/search error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' },
      { status: 500 }
    )
  }
}
