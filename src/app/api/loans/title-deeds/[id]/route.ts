import { NextRequest, NextResponse } from 'next/server'

import { titleDeedRepository } from '@src/features/loan/repositories/titleDeedRepository'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/loans/title-deeds/[id]
 * Get a single title deed by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const titleDeed = await titleDeedRepository.findById(id)

    if (!titleDeed) {
      return NextResponse.json(
        { success: false, message: 'ไม่พบโฉนดที่ระบุ' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'สำเร็จ',
      data: titleDeed,
    })
  } catch (error: any) {
    console.error('[API Error] GET /api/loans/title-deeds/[id]:', error)
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
 * PUT /api/loans/title-deeds/[id]
 * Update a title deed
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    const {
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

    // Build update object with only provided fields
    const updateData: Record<string, any> = {}
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (imageKey !== undefined) updateData.imageKey = imageKey
    if (deedNumber !== undefined) updateData.deedNumber = deedNumber
    if (provinceCode !== undefined) updateData.provinceCode = provinceCode
    if (provinceName !== undefined) updateData.provinceName = provinceName
    if (amphurCode !== undefined) updateData.amphurCode = amphurCode
    if (amphurName !== undefined) updateData.amphurName = amphurName
    if (parcelNo !== undefined) updateData.parcelNo = parcelNo
    if (landAreaRai !== undefined)
      updateData.landAreaRai = parseFloat(landAreaRai)
    if (landAreaNgan !== undefined)
      updateData.landAreaNgan = parseFloat(landAreaNgan)
    if (landAreaWa !== undefined) updateData.landAreaWa = parseFloat(landAreaWa)
    if (landAreaText !== undefined) updateData.landAreaText = landAreaText
    if (ownerName !== undefined) updateData.ownerName = ownerName
    if (landType !== undefined) updateData.landType = landType
    if (analysisResult !== undefined) updateData.analysisResult = analysisResult
    if (valuationData !== undefined) updateData.valuationData = valuationData
    if (estimatedValue !== undefined)
      updateData.estimatedValue = parseFloat(estimatedValue)
    if (latitude !== undefined) updateData.latitude = latitude
    if (longitude !== undefined) updateData.longitude = longitude
    if (linkMap !== undefined) updateData.linkMap = linkMap
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder
    if (isPrimary !== undefined) updateData.isPrimary = isPrimary

    const titleDeed = await titleDeedRepository.updateTitleDeed(id, updateData)

    return NextResponse.json({
      success: true,
      message: 'อัปเดตโฉนดสำเร็จ',
      data: titleDeed,
    })
  } catch (error: any) {
    console.error('[API Error] PUT /api/loans/title-deeds/[id]:', error)
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
 * DELETE /api/loans/title-deeds/[id]
 * Delete a title deed
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    await titleDeedRepository.deleteTitleDeed(id)

    return NextResponse.json({
      success: true,
      message: 'ลบโฉนดสำเร็จ',
    })
  } catch (error: any) {
    console.error('[API Error] DELETE /api/loans/title-deeds/[id]:', error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'เกิดข้อผิดพลาด',
      },
      { status: 500 }
    )
  }
}
