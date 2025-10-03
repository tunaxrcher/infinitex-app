import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET(request: NextRequest) {
  try {
    console.log('[Test] Testing Gemini API and listing models...')
    
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyAofGMt2DSd27lHPwN1ykPRSBHTutfMLZc'
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Try to list available models
    try {
      const models = await genAI.listModels()
      console.log('[Test] Available models:', models)
      
      return NextResponse.json({
        success: true,
        message: 'Gemini API connection successful',
        models: models,
      })
    } catch (listError) {
      console.error('[Test] Failed to list models:', listError)
      
      // Try with a simple text generation instead
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
      const result = await model.generateContent('Hello, test message')
      const response = await result.response
      const text = response.text()
      
      return NextResponse.json({
        success: true,
        message: 'Gemini API connection successful (fallback test)',
        testResponse: text,
        note: 'Could not list models, but basic generation works'
      })
    }
  } catch (error) {
    console.error('[Test] Gemini API test failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: {
          code: (error as any)?.code,
          status: (error as any)?.status,
        }
      },
      { status: 500 }
    )
  }
}
