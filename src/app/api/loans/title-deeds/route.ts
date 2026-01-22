import { NextRequest, NextResponse } from 'next/server'

import { titleDeedRepository } from '@src/features/loan/repositories/titleDeedRepository'

/**
 * GET /api/loans/title-deeds?applicationId=xxx
 * Get all title deeds for a loan application
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const applicationId = searchParams.get('applicationId')

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุ applicationId' },
        { status: 400 }
      )
    }

    const titleDeeds = await titleDeedRepository.findByApplicationId(applicationId)

    return NextResponse.json({
      success: true,
      message: 'สำเร็จ',
      data: titleDeeds,
    })
  } catch (error: any) {
    console.error('[API Error] GET /api/loans/title-deeds:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาด',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/loans/title-deeds
 * Create a new title deed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      applicationId,
      imageUrl,
      imageKey,
      deedNumber,
      provinceCode,
      provinceName,
      amphurCode,
      amphurName,
      parcelNo,
      landAreaRai,
      landAreaNgan,
      landAreaWa,
      landAreaText,
      ownerName,
      landType,
      analysisResult,
      valuationData,
      estimatedValue,
      latitude,
      longitude,
      linkMap,
      sortOrder,
      isPrimary,
    } = body

    if (!applicationId || !imageUrl) {
      return NextResponse.json(
        { success: false, message: 'กรุณาระบุ applicationId และ imageUrl' },
        { status: 400 }
      )
    }

    const titleDeed = await titleDeedRepository.createTitleDeed({
      applicationId,
      imageUrl,
      imageKey,
      deedNumber,
      provinceCode,
      provinceName,
      amphurCode,
      amphurName,
      parcelNo,
      landAreaRai: landAreaRai ? parseFloat(landAreaRai) : undefined,
      landAreaNgan: landAreaNgan ? parseFloat(landAreaNgan) : undefined,
      landAreaWa: landAreaWa ? parseFloat(landAreaWa) : undefined,
      landAreaText,
      ownerName,
      landType,
      analysisResult,
      valuationData,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
      latitude,
      longitude,
      linkMap,
      sortOrder,
      isPrimary,
    })

    return NextResponse.json({
      success: true,
      message: 'เพิ่มโฉนดสำเร็จ',
      data: titleDeed,
    })
  } catch (error: any) {
    console.error('[API Error] POST /api/loans/title-deeds:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาด',
      },
      { status: 500 }
    )
  }
}
