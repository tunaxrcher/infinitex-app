// lib/LandsMapsAPI.ts
import {
  LandsMapsAPIConfig,
  ParcelParams,
  ParcelResult,
} from '@src/shared/types/landsmaps'
import axios, { AxiosResponse } from 'axios'

class LandsMapsAPI {
  private apiKey: string
  private baseUrl: string
  private cookies: Record<string, string> | null = null
  private accessToken: string | null = null
  private sessionId: number | null = null
  private config: LandsMapsAPIConfig
  private debugMode: boolean

  constructor(apiKey: string, options: Partial<LandsMapsAPIConfig> = {}) {
    this.apiKey = apiKey || process.env.ZENROWS_API_KEY || ''
    // โหลด config จากไฟล์ config
    this.config = { ...require('./config'), ...options }
    this.baseUrl = this.config.landsmaps.baseUrl
    this.debugMode = this.config.logging.debug
  }

  private debug(message: string, data: any = null): void {
    if (!this.debugMode) return
    console.log(`[DEBUG] ${message}`)
    if (data) {
      console.log(JSON.stringify(data, null, 2))
    }
    console.log('---')
  }

  private log(level: string, message: string, data: any = null): void {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`)
    if (data && this.debugMode) {
      console.log(JSON.stringify(data, null, 2))
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries?: number,
    delay?: number
  ): Promise<T> {
    const retries = maxRetries || this.config.request.maxRetries
    const retryDelay = delay || this.config.request.retryDelay

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await requestFn()
      } catch (error: any) {
        this.log(
          'warn',
          `Attempt ${attempt}/${retries} failed: ${error.message}`
        )

        if (attempt === retries) {
          throw error
        }

        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * attempt)
        )
      }
    }
    throw new Error('Max retries exceeded')
  }

  private extractCookies(response: AxiosResponse): Record<string, string> {
    const cookies: Record<string, string> = {}
    const headers = response.headers || {}

    const zrCookies = headers['zr-cookies'] || headers['Zr-Cookies']
    if (zrCookies) {
      this.debug('Found Zr-Cookies header', zrCookies)
      const cookiePairs = zrCookies.split(';')
      for (const pair of cookiePairs) {
        const [name, value] = pair.trim().split('=')
        if (name && value) {
          cookies[name] = value
        }
      }
    }
    return cookies
  }

  private cookiesToString(cookies: Record<string, string>): string {
    return Object.entries(cookies)
      .map(([name, value]) => `${name}=${value}`)
      .join('; ')
  }

  private validateParcelParams(
    provinceId: number,
    amphurId: string | number,
    parcelId: number
  ): ParcelParams {
    if (!provinceId || !amphurId || !parcelId) {
      throw new Error('Province ID, Amphur ID, and Parcel ID are required')
    }

    const prov = parseInt(String(provinceId))
    if (isNaN(prov) || prov < 1 || prov > 96) {
      throw new Error('Province ID must be between 1-96')
    }

    const parcel = parseInt(String(parcelId))
    if (isNaN(parcel) || parcel <= 0) {
      throw new Error('Parcel ID must be a positive number')
    }

    return {
      provinceId: prov,
      amphurId: String(amphurId).padStart(2, '0'),
      parcelId: parcel,
    }
  }

  async getParcelInfoComplete(
    provinceId: number,
    amphurId: string | number,
    parcelId: number
  ): Promise<ParcelResult> {
    try {
      const validatedParams = this.validateParcelParams(
        provinceId,
        amphurId,
        parcelId
      )
      this.log(
        'info',
        `Starting complete workflow for Province ${validatedParams.provinceId}, Amphur ${validatedParams.amphurId}, Parcel ${validatedParams.parcelId}`
      )

      await this.getInitialCookies()
      await this.getJWTAccessToken()
      const parcelData = await this.getParcelInfo(
        validatedParams.provinceId,
        validatedParams.amphurId,
        validatedParams.parcelId
      )

      this.log('info', 'Complete workflow finished successfully')
      return parcelData
    } catch (error: any) {
      this.log('error', `Complete workflow failed: ${error.message}`)
      throw error
    }
  }

  // เพิ่ม methods อื่นๆ ที่ต้องการ...
}

export default LandsMapsAPI
