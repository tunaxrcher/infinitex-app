import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@src/shared/lib/ai-services'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Property valuation started')

    const formData = await request.formData()
    
    // Get title deed image (required)
    const titleDeedImage = formData.get('titleDeedImage') as File
    if (!titleDeedImage) {
      return NextResponse.json(
        { error: 'ไม่พบรูปโฉนดที่ดิน' },
        { status: 400 }
      )
    }

    // Get title deed data (optional but recommended)
    const titleDeedDataStr = formData.get('titleDeedData') as string
    let titleDeedData = null
    if (titleDeedDataStr) {
      try {
        titleDeedData = JSON.parse(titleDeedDataStr)
      } catch (error) {
        console.warn('[API] Failed to parse title deed data:', error)
      }
    }

    // Get supporting images (optional)
    const supportingImages: Buffer[] = []
    let imageIndex = 0
    while (true) {
      const supportingImage = formData.get(`supportingImage_${imageIndex}`) as File
      if (!supportingImage) break
      
      const arrayBuffer = await supportingImage.arrayBuffer()
      supportingImages.push(Buffer.from(arrayBuffer))
      imageIndex++
    }

    console.log('[API] Processing valuation with:', {
      hasTitleDeedImage: !!titleDeedImage,
      hasTitleDeedData: !!titleDeedData,
      supportingImagesCount: supportingImages.length,
    })

    // Convert title deed image to buffer
    const titleDeedArrayBuffer = await titleDeedImage.arrayBuffer()
    const titleDeedBuffer = Buffer.from(titleDeedArrayBuffer)

    // Call AI service for property valuation
    const valuationResult = await aiService.evaluatePropertyValue(
      titleDeedBuffer,
      titleDeedData,
      supportingImages.length > 0 ? supportingImages : undefined
    )

    console.log('[API] Valuation completed:', valuationResult)

    return NextResponse.json({
      success: true,
      valuation: valuationResult,
    })
  } catch (error) {
    console.error('[API] Property valuation failed:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการประเมินมูลค่า',
        success: false,
      },
      { status: 500 }
    )
  }
}
