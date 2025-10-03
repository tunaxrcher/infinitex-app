import { NextRequest, NextResponse } from 'next/server'
import LandsMapsAPI from '@src/shared/lib/LandsMapsAPI'

interface ManualLookupRequest {
  pvCode: string
  amCode: string
  parcelNo: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Manual title deed lookup started')

    const body = await request.json() as ManualLookupRequest
    const { pvCode, amCode, parcelNo } = body

    if (!pvCode || !amCode || !parcelNo) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ครบถ้วน กรุณากรอกรหัสจังหวัด อำเภอ และเลขโฉนด' },
        { status: 400 }
      )
    }

    console.log('[API] Manual lookup params:', { pvCode, amCode, parcelNo })

    // Fetch title deed data using LandsMapsAPI
    const apiKey = process.env.ZENROWS_API_KEY
    const landsMapsAPI = new LandsMapsAPI(apiKey)
    
    const titleDeedData = await landsMapsAPI.getParcelInfoComplete(
      parseInt(pvCode),
      amCode,
      parseInt(parcelNo)
    )

    console.log('[API] Manual lookup successful:', titleDeedData)

    return NextResponse.json({
      success: true,
      titleDeedData,
    })
  } catch (error) {
    console.error('[API] Manual title deed lookup failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการค้นหาข้อมูลโฉนด' },
      { status: 500 }
    )
  }
}
