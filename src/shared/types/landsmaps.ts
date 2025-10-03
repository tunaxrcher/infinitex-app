// types/landsmaps.ts
export interface ParcelParams {
  provinceId: number
  amphurId: string
  parcelId: number
}

export interface ParcelResult {
  error: boolean
  message?: string
  result: Array<{
    parcel_no: string
    province_name: string
    amphur_name: string
    tambon_name: string
    village_name?: string
    owner_name: string
    area_rai: number
    area_ngan: number
    area_wa: number
    land_type: string
    // เพิ่ม fields อื่นๆ ตามที่ API ส่งกลับมา
  }>
}

export interface LandsMapsAPIConfig {
  zenrows: {
    apiUrl: string
    defaultApiKey: string
    options: {
      js_render: string
      premium_proxy: string
      proxy_country: string
      custom_headers: string
    }
  }
  landsmaps: {
    baseUrl: string
    endpoints: {
      jwt: string
      parcel: string
    }
  }
  request: {
    timeout: number
    maxRetries: number
    retryDelay: number
    userAgent: string
  }
  logging: {
    debug: boolean
    level: string
  }
  session: {
    sessionIdRange: number
    cookieExpiry: number
  }
}
