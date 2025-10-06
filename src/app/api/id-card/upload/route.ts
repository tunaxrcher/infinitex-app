import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@src/shared/lib/storage'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] ID card upload started')

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'ไม่พบไฟล์ที่อัพโหลด' },
        { status: 400 }
      )
    }

    console.log('[API] File received:', { name: file.name, type: file.type, size: file.size })

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to DigitalOcean Storage
    console.log('[API] Uploading ID card to storage...')
    let uploadResult
    try {
      uploadResult = await storage.uploadFile(
        buffer,
        file.type,
        {
          folder: 'id-cards',
          filename: `id_card_${Date.now()}_${file.name}`,
        }
      )
      console.log('[API] ID card upload successful:', uploadResult)
    } catch (uploadError) {
      console.error('[API] Storage upload failed:', uploadError)
      // Fallback to base64
      uploadResult = {
        url: `data:${file.type};base64,${buffer.toString('base64')}`,
        key: `temp_${Date.now()}_${file.name}`,
      }
      console.log('[API] Using base64 fallback for ID card')
    }

    return NextResponse.json({
      success: true,
      imageUrl: uploadResult.url,
      imageKey: uploadResult.key,
      message: 'อัพโหลดบัตรประชาชนสำเร็จ',
    })

  } catch (error) {
    console.error('[API] ID card upload failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการอัพโหลดบัตรประชาชน' },
      { status: 500 }
    )
  }
}
