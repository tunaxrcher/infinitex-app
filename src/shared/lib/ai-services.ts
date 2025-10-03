import { GoogleGenerativeAI } from '@google/generative-ai'
import { findProvinceCodeManual, findAmphurCodeManual } from './manual-search'

interface TitleDeedAnalysisResult {
  pvName: string
  amName: string
  parcelNo: string
}

interface ProvinceSearchResult {
  pvCode: string
}

interface AmphurSearchResult {
  pvCode: string
  amCode: string
  parcelNo: string
}

class AIService {
  private genAI: GoogleGenerativeAI
  private availableModels: string[]

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyAofGMt2DSd27lHPwN1ykPRSBHTutfMLZc'
    this.genAI = new GoogleGenerativeAI(apiKey)
    // List of models to try in order of preference
    this.availableModels = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro-vision',
      'gemini-pro'
    ]
  }

  /**
   * Get the best available model for the task
   */
  private async getModel(needsVision: boolean = false) {
    // Simplified model selection - use known working models
    const modelName = needsVision ? 'gemini-pro-vision' : 'gemini-pro'
    
    try {
      console.log(`[AI] Using model: ${modelName}`)
      const model = this.genAI.getGenerativeModel({ model: modelName })
      return model
    } catch (error) {
      console.error(`[AI] Failed to initialize model ${modelName}:`, error)
      throw new Error(`ไม่สามารถเชื่อมต่อ AI model ได้: ${(error as any)?.message}`)
    }
  }

  /**
   * วิเคราะห์รูปโฉนดที่ดินเพื่อหาชื่อจังหวัด อำเภอ และเลขโฉนด
   */
  async analyzeTitleDeedImage(imageBuffer: Buffer, mimeType: string): Promise<TitleDeedAnalysisResult> {
    try {
      console.log('[AI] Analyzing title deed image...')

      const model = await this.getModel(true)

      const prompt = `
        วิเคราะห์รูปโฉนดที่ดินนี้และหาข้อมูลดังต่อไปนี้:
        1. ชื่อจังหวัด
        2. ชื่ออำเภอ
        3. เลขโฉนด

        กรุณาตอบกลับเป็น JSON format เท่านั้น ตามรูปแบบนี้:
        {
          "pvName": "ชื่อจังหวัด",
          "amName": "ชื่ออำเภอ",
          "parcelNo": "เลขโฉนด"
        }

        หากไม่พบข้อมูลใดให้ใส่ค่าว่าง "" สำหรับฟิลด์นั้น ๆ
        ตัวอย่าง: หากไม่เจอจังหวัดและอำเภอ แต่เจอเลขโฉนด 1234
        {
          "pvName": "",
          "amName": "",
          "parcelNo": "1234"
        }
      `

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType,
        },
      }

      const result = await model.generateContent([prompt, imagePart])
      const response = await result.response
      const text = response.text()

      console.log('[AI] Raw response:', text)

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('ไม่สามารถแปลงผลลัพธ์เป็น JSON ได้')
      }

      const analysisResult = JSON.parse(jsonMatch[0]) as TitleDeedAnalysisResult

      console.log('[AI] Analysis result:', analysisResult)

      return {
        pvName: analysisResult.pvName || '',
        amName: analysisResult.amName || '',
        parcelNo: analysisResult.parcelNo || '',
      }
    } catch (error) {
      console.error('[AI] Title deed analysis failed:', error)
      console.log('[AI] Falling back to manual input...')
      
      // Fallback: return empty result to trigger manual input
      return {
        pvName: '',
        amName: '',
        parcelNo: '',
      }
    }
  }

  /**
   * หารหัสจังหวัดจากชื่อจังหวัด
   */
  async findProvinceCode(provinceName: string, provinceData: any[]): Promise<ProvinceSearchResult> {
    try {
      console.log('[AI] Finding province code for:', provinceName)

      const model = await this.getModel(false)

      const prompt = `
        จากชื่อจังหวัด "${provinceName}" และข้อมูลจังหวัดต่อไปนี้:
        ${JSON.stringify(provinceData, null, 2)}

        กรุณาหารหัสจังหวัด (pvcode) ที่ตรงกับชื่อจังหวัดที่ให้มา
        ตอบกลับเป็น JSON format เท่านั้น:
        {
          "pvCode": "รหัสจังหวัด"
        }

        หากไม่พบให้ตอบ:
        {
          "pvCode": ""
        }

        หมายเหตุ: ให้ค้นหาแบบยืดหยุ่น เช่น "ชลบุรี" ควรตรงกับ "ชลบุรี" ใน pvnamethai
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      console.log('[AI] Province search raw response:', text)

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('ไม่สามารถแปลงผลลัพธ์เป็น JSON ได้')
      }

      const searchResult = JSON.parse(jsonMatch[0]) as ProvinceSearchResult

      console.log('[AI] Province search result:', searchResult)

      return {
        pvCode: searchResult.pvCode || '',
      }
    } catch (error) {
      console.error('[AI] Province search failed:', error)
      console.log('[AI] Falling back to manual search...')
      
      // Fallback to manual search
      const pvCode = findProvinceCodeManual(provinceName, provinceData)
      return { pvCode }
    }
  }

  /**
   * หารหัสอำเภอจากชื่ออำเภอและรหัสจังหวัด
   */
  async findAmphurCode(
    amphurName: string,
    provinceCode: string,
    amphurData: any[],
    parcelNo: string
  ): Promise<AmphurSearchResult> {
    try {
      console.log('[AI] Finding amphur code for:', { amphurName, provinceCode })

      // Filter amphur data by province code
      const filteredAmphurs = amphurData.filter(amphur => amphur.pvcode === provinceCode)

      const model = await this.getModel(false)

      const prompt = `
        จากชื่ออำเภอ "${amphurName}" และข้อมูลอำเภอในจังหวัดรหัส "${provinceCode}":
        ${JSON.stringify(filteredAmphurs, null, 2)}

        กรุณาหารหัสอำเภอ (amcode) ที่ตรงกับชื่ออำเภอที่ให้มา
        ตอบกลับเป็น JSON format เท่านั้น:
        {
          "pvCode": "${provinceCode}",
          "amCode": "รหัสอำเภอ",
          "parcelNo": "${parcelNo}"
        }

        หากไม่พบให้ตอบ:
        {
          "pvCode": "${provinceCode}",
          "amCode": "",
          "parcelNo": "${parcelNo}"
        }

        หมายเหตุ: ให้ค้นหาแบบยืดหยุ่น เช่น "ศรีราชา" ควรตรงกับ "ศรีราชา" ใน amnamethai
      `

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      console.log('[AI] Amphur search raw response:', text)

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('ไม่สามารถแปลงผลลัพธ์เป็น JSON ได้')
      }

      const searchResult = JSON.parse(jsonMatch[0]) as AmphurSearchResult

      console.log('[AI] Amphur search result:', searchResult)

      return {
        pvCode: searchResult.pvCode || provinceCode,
        amCode: searchResult.amCode || '',
        parcelNo: searchResult.parcelNo || parcelNo,
      }
    } catch (error) {
      console.error('[AI] Amphur search failed:', error)
      console.log('[AI] Falling back to manual amphur search...')
      
      // Fallback to manual search
      const amCode = findAmphurCodeManual(amphurName, provinceCode, amphurData)
      return {
        pvCode: provinceCode,
        amCode,
        parcelNo,
      }
    }
  }
}

// Export singleton instance
export const aiService = new AIService()
