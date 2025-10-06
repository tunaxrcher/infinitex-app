import { NextRequest, NextResponse } from 'next/server'
import { aiService } from '@src/shared/lib/ai-services'
import { storage } from '@src/shared/lib/storage'
import LandsMapsAPI from '@src/shared/lib/LandsMapsAPI'
import provinceData from '@src/data/province.json'
import amphurData from '@src/data/amphur.json'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Title deed analysis started')

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

    // Step 1: Upload to DigitalOcean Storage
    console.log('[API] Uploading to storage...')
    let uploadResult
    try {
      uploadResult = await storage.uploadFile(
        buffer,
        file.type,
        {
          folder: 'title-deeds',
          filename: `title_deed_${Date.now()}_${file.name}`,
        }
      )
      console.log('[API] Upload successful:', uploadResult)
    } catch (uploadError) {
      console.error('[API] Storage upload failed:', uploadError)
      // Continue without storage - use base64 for AI analysis
      uploadResult = {
        url: `data:${file.type};base64,${buffer.toString('base64')}`,
        key: `temp_${Date.now()}_${file.name}`,
      }
      console.log('[API] Using base64 fallback for AI analysis')
    }

    // Step 2: Analyze image with AI
    console.log('[API] Analyzing image with AI...')
    let analysisResult
    try {
      analysisResult = await aiService.analyzeTitleDeedImage(buffer, file.type)
      console.log('[API] AI analysis result:', analysisResult)
    } catch (aiError) {
      console.error('[API] AI analysis failed:', aiError)
      // Fallback: return empty analysis result
      analysisResult = {
        pvName: '',
        amName: '',
        parcelNo: '',
      }
      console.log('[API] Using fallback analysis result')
    }

    let finalResult = {
      imageUrl: uploadResult.url,
      imageKey: uploadResult.key,
      analysisResult: analysisResult as any, // Allow additional properties
      titleDeedData: null as any,
      needsManualInput: false,
      manualInputType: '' as 'full' | 'amphur_only' | '',
      errorMessage: undefined as string | undefined,
    }

    // Step 3: Process based on AI analysis result
    if (!analysisResult.pvName) {
      // Case 3.2: No province name found - need full manual input
      console.log('[API] No province found - requiring full manual input')
      finalResult.needsManualInput = true
      finalResult.manualInputType = 'full'
      } else {
        // Case 3.1: Province name found - search for province code
        console.log('[API] Province found, searching for province code...')
        try {
          const provinceSearchResult = await aiService.findProvinceCode(
            analysisResult.pvName,
            provinceData
          )

          console.log('[API] Province search result:', provinceSearchResult)

          if (!provinceSearchResult.pvCode) {
            // Province code not found - need full manual input
            console.log('[API] Province code not found - requiring full manual input')
            finalResult.needsManualInput = true
            finalResult.manualInputType = 'full'
          } else {
            // Province code found - search for amphur code
            console.log('[API] Province code found, searching for amphur code...')
            try {
              const amphurSearchResult = await aiService.findAmphurCode(
                analysisResult.amName,
                provinceSearchResult.pvCode,
                amphurData,
                analysisResult.parcelNo
              )

              console.log('[API] Amphur search result:', amphurSearchResult)

              if (!amphurSearchResult.amCode) {
                // Amphur code not found - need amphur selection only
                console.log('[API] Amphur code not found - requiring amphur selection')
                finalResult.needsManualInput = true
                finalResult.manualInputType = 'amphur_only'
                finalResult.analysisResult = {
                  ...finalResult.analysisResult,
                  pvCode: provinceSearchResult.pvCode,
                }
              } else {
                // All codes found - fetch title deed data
                console.log('[API] All codes found, fetching title deed data...')
                try {
                  const apiKey = process.env.ZENROWS_API_KEY
                  const landsMapsAPI = new LandsMapsAPI(apiKey)
                  
                  const titleDeedData = await landsMapsAPI.getParcelInfoComplete(
                    parseInt(amphurSearchResult.pvCode),
                    amphurSearchResult.amCode,
                    parseInt(amphurSearchResult.parcelNo)
                  )

                  console.log('[API] Title deed data retrieved:', titleDeedData)
                  finalResult.titleDeedData = titleDeedData
                } catch (landsMapError) {
                  console.error('[API] LandsMapsAPI failed:', landsMapError)
                  
                  // LandsMapsAPI failed - show manual input modal with AI data as initial values
                  console.log('[API] LandsMapsAPI failed - requiring manual input with AI data')
                  finalResult.needsManualInput = true
                  finalResult.manualInputType = 'full'
                  finalResult.analysisResult = {
                    ...finalResult.analysisResult,
                    pvCode: amphurSearchResult.pvCode,
                    amCode: amphurSearchResult.amCode,
                    parcelNo: amphurSearchResult.parcelNo,
                  }
                  
                  // Add error message for user context
                  finalResult.errorMessage = 'ไม่สามารถค้นหาข้อมูลโฉนดจากระบบกรมที่ดินได้ กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง'
                }
              }
            } catch (amphurError) {
              console.error('[API] Amphur search failed:', amphurError)
              // Fallback to manual amphur selection
              finalResult.needsManualInput = true
              finalResult.manualInputType = 'amphur_only'
              finalResult.analysisResult = {
                ...finalResult.analysisResult,
                pvCode: provinceSearchResult.pvCode,
              }
            }
          }
        } catch (provinceError) {
          console.error('[API] Province search failed:', provinceError)
          // Fallback to full manual input
          finalResult.needsManualInput = true
          finalResult.manualInputType = 'full'
        }
      }

    console.log('[API] Final result:', finalResult)

    return NextResponse.json(finalResult)
  } catch (error) {
    console.error('[API] Title deed analysis failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการวิเคราะห์โฉนด' },
      { status: 500 }
    )
  }
}
