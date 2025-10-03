import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@src/shared/lib/storage'

export async function GET(request: NextRequest) {
  try {
    console.log('[Test] Testing storage connection...')
    
    // Test with a simple text file
    const testContent = 'Hello DigitalOcean Spaces!'
    const testBuffer = Buffer.from(testContent, 'utf-8')
    
    const result = await storage.uploadFile(
      testBuffer,
      'text/plain',
      {
        folder: 'test',
        filename: `test_${Date.now()}.txt`,
      }
    )
    
    console.log('[Test] Storage test successful:', result)
    
    return NextResponse.json({
      success: true,
      message: 'Storage connection successful',
      result,
    })
  } catch (error) {
    console.error('[Test] Storage test failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          code: (error as any)?.code,
          statusCode: (error as any)?.statusCode,
          hostname: (error as any)?.hostname,
        }
      },
      { status: 500 }
    )
  }
}
