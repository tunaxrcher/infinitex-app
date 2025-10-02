import { NextRequest, NextResponse } from 'next/server'

import { customerService } from '@src/features/customer/services/server'
import { customerCreateSchema } from '@src/features/customer/validations'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    
    // Get agent ID from headers (set by middleware)
    const agentId = request.headers.get('x-user-id')
    const userType = request.headers.get('x-user-type')

    if (!agentId || userType !== 'AGENT') {
      return NextResponse.json({ error: 'Agent access required' }, { status: 403 })
    }

    const filters = {
      search: search || undefined,
    }

    const result = await customerService.getListByAgent(agentId, filters)
    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/customers error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = customerCreateSchema.parse(body)
    
    // Get agent ID from headers (set by middleware)
    const agentId = request.headers.get('x-user-id')
    const userType = request.headers.get('x-user-type')

    if (!agentId || userType !== 'AGENT') {
      return NextResponse.json({ error: 'Agent access required' }, { status: 403 })
    }

    const result = await customerService.create(validatedData, agentId)
    return NextResponse.json(result)
  } catch (error) {
    console.error('POST /api/customers error:', error)
    
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
