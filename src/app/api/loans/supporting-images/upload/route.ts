import { NextRequest, NextResponse } from 'next/server'

import { loanService } from '@src/features/loan/services/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Supporting images upload started')

    const formData = await request.formData()

    // Get all files from formData
    const files: File[] = []
    let fileIndex = 0
    while (true) {
      const file = formData.get(`file_${fileIndex}`) as File
      if (!file) break
      files.push(file)
      fileIndex++
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ไม่พบไฟล์' },
        { status: 400 }
      )
    }

    console.log(`[API] Uploading ${files.length} files...`)

    // Upload all files
    const result = await loanService.uploadSupportingImages(files)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[API] Supporting images upload failed:', error)

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'เกิดข้อผิดพลาดในการอัพโหลดไฟล์',
      },
      { status: 500 }
    )
  }
}

