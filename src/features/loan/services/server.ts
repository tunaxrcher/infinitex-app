import amphurData from '@src/data/amphur.json'
import provinceData from '@src/data/province.json'
import LandsMapsAPI from '@src/shared/lib/LandsMapsAPI'
import { aiService } from '@src/shared/lib/ai-services'
import { prisma } from '@src/shared/lib/db'
import { sendLoanNotification } from '@src/shared/lib/line-api'
import { storage } from '@src/shared/lib/storage'
import bcrypt from 'bcryptjs'
import 'server-only'

import { loanApplicationRepository } from '../repositories/loanApplicationRepository'
import {
  type LoanApplicationSubmissionSchema,
  type ManualLookupSchema,
} from '../validations'

export const loanService = {
  // ============================================================
  // PRIVATE HELPER FUNCTIONS
  // ============================================================

  /**
   * Find or create user for loan application
   */
  async _findOrCreateUser(
    phoneNumber: string,
    pin: string | undefined,
    isSubmittedByAgent: boolean,
    customerId?: string
  ) {
    // Use existing logged-in customer
    if (customerId) {
      const user = await prisma.user.findUnique({
        where: { id: customerId },
        include: { profile: true },
      })
      if (!user) throw new Error('ไม่พบข้อมูลผู้ใช้ที่เข้าสู่ระบบ')
      return { user, isNewUser: false }
    }

    // Lookup by phone number
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
      include: { profile: true },
    })

    if (existingUser) {
      return { user: existingUser, isNewUser: false }
    }

    // Create new user
    const hashedPin = await this._generateHashedPin(
      pin,
      phoneNumber,
      isSubmittedByAgent
    )

    const newUser = await prisma.user.create({
      data: {
        phoneNumber,
        pin: hashedPin,
        userType: 'CUSTOMER',
        profile: { create: { updatedAt: new Date() } },
      },
      include: { profile: true },
    })

    return { user: newUser, isNewUser: true }
  },

  /**
   * Generate hashed PIN for user
   */
  async _generateHashedPin(
    pin: string | undefined,
    phoneNumber: string,
    isSubmittedByAgent: boolean
  ): Promise<string | null> {
    if (pin) {
      return bcrypt.hash(pin, 10)
    }
    if (isSubmittedByAgent) {
      const defaultPin = phoneNumber.slice(-4)
      return bcrypt.hash(defaultPin, 10)
    }
    return null
  },

  /**
   * Run AI valuation and update loan application
   */
  async _runAgentFlowValuation(
    loanApplicationId: string,
    existingValuation: any,
    titleDeedImageUrl: string | null | undefined,
    titleDeedData: any,
    supportingImages?: string[]
  ) {
    if (existingValuation) return existingValuation

    try {
      const result = await this.evaluatePropertyValueFromUrls(
        titleDeedImageUrl,
        titleDeedData,
        supportingImages
      )

      if (result.success && result.valuation) {
        await prisma.loanApplication.update({
          where: { id: loanApplicationId },
          data: { propertyValue: result.valuation.estimatedValue || null },
        })
        return result.valuation
      }
    } catch (error) {
      console.error('[LoanService] AI valuation error:', error)
    }
    return null
  },

  /**
   * Create loan record for agent flow
   */
  async _createLoanForAgentFlow(
    loanApplicationId: string,
    customerId: string,
    agentId: string,
    data: LoanApplicationSubmissionSchema,
    propertyValuation: any
  ) {
    const now = new Date()
    const titleDeedResult = data.titleDeedData?.result?.[0]

    // Generate loan number: LN + YYMMDD + 4 random digits
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '')
    const randomDigits = Math.floor(1000 + Math.random() * 9000)
    const loanNumber = `LN${dateStr}${randomDigits}`

    const principalAmount = data.requestedLoanAmount
    const nextPaymentDate = new Date(now)
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

    const loan = await prisma.loan.create({
      data: {
        loanNumber,
        customerId,
        agentId,
        applicationId: loanApplicationId,
        loanType: (data as any).loanType || 'HOUSE_LAND_MORTGAGE',
        status: 'ACTIVE',
        principalAmount,
        interestRate: 0,
        termMonths: 0,
        monthlyPayment: 0,
        currentInstallment: 0,
        totalInstallments: 0,
        remainingBalance: principalAmount,
        nextPaymentDate,
        contractDate: now,
        expiryDate: now,
        titleDeedNumber:
          data.titleDeedManualData?.parcelNo ||
          titleDeedResult?.parcelno ||
          null,
        collateralValue: propertyValuation?.estimatedValue || null,
        collateralDetails: data.titleDeedData || null,
        linkMap: titleDeedResult?.qrcode_link || null,
        valuationResult: propertyValuation ?? undefined,
        valuationDate: propertyValuation ? now : null,
        estimatedValue: propertyValuation?.estimatedValue ?? null,
        latitude: titleDeedResult?.parcellat || null,
        longitude: titleDeedResult?.parcellon || null,
      },
    })

    // Update loan application with loan terms
    await prisma.loanApplication.update({
      where: { id: loanApplicationId },
      data: { approvedAmount: principalAmount, interestRate: 0, termMonths: 0 },
    })

    return loan
  },

  /**
   * Send LINE notification for agent flow
   */
  async _sendLineNotificationForAgentFlow(
    data: LoanApplicationSubmissionSchema,
    loanApplicationId: string,
    propertyInfo: any,
    propertyValuation: any
  ) {
    const titleDeedResult = data.titleDeedData?.result?.[0]

    const notes = propertyValuation?.reasoning
      ? `AI ประเมิน: ${propertyValuation.estimatedValue?.toLocaleString() || 0} บาท (${propertyValuation.confidence || 0}% confidence)`
      : undefined

    const result = await sendLoanNotification({
      amount: data.requestedLoanAmount.toLocaleString(),
      ownerName: (data as any).ownerName || undefined,
      propertyLocation: propertyInfo.propertyLocation || undefined,
      propertyArea: propertyInfo.propertyArea || undefined,
      parcelNo: titleDeedResult?.parcelno || undefined,
      amphur: titleDeedResult?.amphurname || undefined,
      province: titleDeedResult?.provname || undefined,
      latitude: titleDeedResult?.parcellat || undefined,
      longitude: titleDeedResult?.parcellon || undefined,
      notes,
      titleDeedImageUrl: data.titleDeedImageUrl || undefined,
      supportingImageUrls: data.supportingImages || undefined,
      loanApplicationId,
    })

    if (!result.success) {
      console.error('[LoanService] LINE notification failed:', result.error)
    }
  },

  /**
   * Upload file with fallback to base64
   */
  async _uploadFileWithFallback(
    file: File,
    folder: string,
    filenamePrefix: string
  ) {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      const result = await storage.uploadFile(buffer, file.type, {
        folder,
        filename: `${filenamePrefix}_${Date.now()}_${file.name}`,
      })
      return { success: true, imageUrl: result.url, imageKey: result.key }
    } catch (error) {
      console.error(`[LoanService] Upload failed for ${folder}:`, error)
      return {
        success: true,
        imageUrl: `data:${file.type};base64,${buffer.toString('base64')}`,
        imageKey: `temp_${Date.now()}_${file.name}`,
      }
    }
  },

  // ============================================================
  // PUBLIC API
  // ============================================================

  /**
   * Submit loan application with complete workflow
   */
  async submitApplication(
    data: LoanApplicationSubmissionSchema,
    agentId?: string,
    customerId?: string
  ) {
    const isSubmittedByAgent = !!agentId

    // Step 1: Find or create user
    const { user, isNewUser } = await this._findOrCreateUser(
      data.phoneNumber,
      data.pin,
      isSubmittedByAgent,
      customerId
    )

    // Step 2: Prepare property information
    const propertyInfo = this.extractPropertyInfo(
      data.titleDeedData,
      data.titleDeedManualData,
      data.titleDeedAnalysis
    )

    // Step 3: Determine final customer ID
    let finalCustomerId = user.id
    if (isSubmittedByAgent && data.phoneNumber === '0000000000') {
      const defaultCustomer = await prisma.user.findUnique({
        where: { phoneNumber: '0000000000' },
      })
      if (defaultCustomer) finalCustomerId = defaultCustomer.id
    }

    // Step 4: Create loan application
    const loanApplication = await loanApplicationRepository.createWithFullData({
      customerId: finalCustomerId,
      agentId: isSubmittedByAgent ? agentId : undefined,
      loanType: (data as any).loanType || 'HOUSE_LAND_MORTGAGE',
      status: 'UNDER_REVIEW',
      currentStep: 5,
      completedSteps: [1, 2, 3, 4, 5],
      isNewUser,
      submittedByAgent: isSubmittedByAgent,
      ownerName: (data as any).ownerName || null,
      titleDeedImage: data.titleDeedImageUrl,
      titleDeedData: data.titleDeedData || {},
      supportingImages: data.supportingImages,
      idCardFrontImage: data.idCardImageUrl,
      requestedAmount: data.requestedLoanAmount,
      maxApprovedAmount: data.loanAmount,
      ...propertyInfo,
      propertyValue: data.propertyValuation?.estimatedValue,
      submittedAt: new Date(),
    })

    // Step 5: Create audit log
    await this.createAuditLog(loanApplication.id, user.id, agentId, {
      isNewUser,
      submittedByAgent: isSubmittedByAgent,
      requestedAmount: data.requestedLoanAmount,
      hasPropertyValuation: !!data.propertyValuation,
      hasTitleDeedData: !!data.titleDeedData,
      supportingImagesCount: data.supportingImages?.length || 0,
    })

    // Step 6: Update user profile if ID card provided
    if (data.idCardImageUrl && user.profile) {
      await prisma.userProfile.update({
        where: { id: user.profile.id },
        data: { idCardFrontImage: data.idCardImageUrl },
      })
    }

    // Step 7-9: Agent flow specific operations
    let propertyValuation = data.propertyValuation || null
    let createdLoan = null

    if (isSubmittedByAgent) {
      // Run AI valuation
      propertyValuation = await this._runAgentFlowValuation(
        loanApplication.id,
        propertyValuation,
        data.titleDeedImageUrl,
        data.titleDeedData,
        data.supportingImages
      )

      // Create loan record
      try {
        createdLoan = await this._createLoanForAgentFlow(
          loanApplication.id,
          finalCustomerId,
          agentId!,
          data,
          propertyValuation
        )
      } catch (error) {
        console.error('[LoanService] Failed to create Loan:', error)
      }

      // Send LINE notification
      try {
        await this._sendLineNotificationForAgentFlow(
          data,
          loanApplication.id,
          propertyInfo,
          propertyValuation
        )
      } catch (error) {
        console.error('[LoanService] Failed to send LINE notification:', error)
      }
    }

    return {
      loanApplicationId: loanApplication.id,
      loanId: createdLoan?.id || null,
      loanNumber: createdLoan?.loanNumber || null,
      userId: user.id,
      agentId: isSubmittedByAgent ? agentId : undefined,
      isNewUser,
      submittedByAgent: isSubmittedByAgent,
    }
  },

  /**
   * Analyze title deed image
   */
  async analyzeTitleDeed(file: File) {
    console.log('[LoanService] Starting title deed analysis')

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Step 1: Upload to storage
    let uploadResult
    try {
      uploadResult = await storage.uploadFile(buffer, file.type, {
        folder: 'title-deeds',
        filename: `title_deed_${Date.now()}_${file.name}`,
      })
    } catch (uploadError) {
      console.error('[LoanService] Storage upload failed:', uploadError)
      uploadResult = {
        url: `data:${file.type};base64,${buffer.toString('base64')}`,
        key: `temp_${Date.now()}_${file.name}`,
      }
    }

    // Step 2: Analyze with AI
    let analysisResult
    try {
      analysisResult = await aiService.analyzeTitleDeedImage(buffer, file.type)
    } catch (aiError) {
      console.error('[LoanService] AI analysis failed:', aiError)
      analysisResult = {
        pvName: '',
        amName: '',
        parcelNo: '',
      }
    }

    // Step 3: Process analysis result
    return this.processTitleDeedAnalysis(analysisResult, uploadResult)
  },

  /**
   * Manual title deed lookup
   */
  async manualTitleDeedLookup(data: ManualLookupSchema) {
    console.log('[LoanService] Manual title deed lookup')

    const apiKey = process.env.ZENROWS_API_KEY
    const landsMapsAPI = new LandsMapsAPI(apiKey)

    const titleDeedData = await landsMapsAPI.getParcelInfoComplete(
      parseInt(data.pvCode),
      data.amCode,
      parseInt(data.parcelNo)
    )

    return {
      success: true,
      titleDeedData,
    }
  },

  /**
   * Upload and process ID card
   */
  async uploadIdCard(file: File) {
    return this._uploadFileWithFallback(file, 'id-cards', 'id_card')
  },

  /**
   * Upload supporting image (single file - kept for backward compatibility)
   */
  async uploadSupportingImage(file: File) {
    return this._uploadFileWithFallback(file, 'supporting-images', 'supporting')
  },

  /**
   * Upload multiple supporting images in batch
   */
  async uploadSupportingImages(files: File[]) {
    const uploadResults = await Promise.allSettled(
      files.map(async (file, index) => {
        const result = await this._uploadFileWithFallback(
          file,
          'supporting-images',
          `supporting_${index}`
        )
        return { ...result, fileName: file.name }
      })
    )

    const successfulUploads = uploadResults
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<any>).value)

    return {
      success: true,
      uploadedCount: successfulUploads.length,
      totalCount: files.length,
      images: successfulUploads,
    }
  },

  /**
   * Evaluate property value with AI
   */
  async evaluatePropertyValue(
    titleDeedImage: File,
    titleDeedData: any,
    supportingImages?: File[]
  ) {
    console.log('[LoanService] Starting property valuation')

    // Check if we have sufficient data
    const hasTitleDeedData =
      titleDeedData && titleDeedData.result && titleDeedData.result.length > 0
    const hasSupportingImages = supportingImages && supportingImages.length > 0

    if (!hasTitleDeedData && !hasSupportingImages) {
      return {
        success: false,
        error: 'ข้อมูลไม่เพียงพอสำหรับการประเมิน',
        valuation: {
          estimatedValue: 0,
          reasoning:
            'ข้อมูลไม่เพียงพอสำหรับการประเมิน - ต้องมีข้อมูลโฉนดหรือรูปประกอบเพิ่มเติม',
          confidence: 0,
        },
      }
    }

    // Convert images to buffers
    const titleDeedArrayBuffer = await titleDeedImage.arrayBuffer()
    const titleDeedBuffer = Buffer.from(titleDeedArrayBuffer)

    const supportingBuffers: Buffer[] = []
    if (supportingImages) {
      for (const image of supportingImages) {
        const arrayBuffer = await image.arrayBuffer()
        supportingBuffers.push(Buffer.from(arrayBuffer))
      }
    }

    // Call AI service
    const valuationResult = await aiService.evaluatePropertyValue(
      titleDeedBuffer,
      titleDeedData,
      supportingBuffers.length > 0 ? supportingBuffers : undefined
    )

    return {
      success: true,
      valuation: valuationResult,
    }
  },

  /**
   * Extract property information from various sources
   */
  extractPropertyInfo(
    titleDeedData: any,
    titleDeedManualData: any,
    titleDeedAnalysis: any
  ) {
    let propertyInfo: any = {}

    // From title deed data (LandsMapsAPI) - get location info (but NOT landNumber)
    if (titleDeedData && titleDeedData.result && titleDeedData.result[0]) {
      const deed = titleDeedData.result[0]
      propertyInfo = {
        propertyLocation:
          `${deed.tumbolname || ''} ${deed.amphurname || ''} ${deed.provname || ''}`.trim(),
        propertyArea: `${deed.rai || 0} ไร่ ${deed.ngan || 0} งาน ${deed.wa || 0} ตารางวา`,
        // Don't use landNumber from LandMaps API - will use user manual input
        ownerName: deed.owner_name || '',
        propertyType: deed.land_type || 'ที่ดิน',
      }
    }

    // From manual data (user input) - PRIORITIZE parcelNo from here
    if (titleDeedManualData) {
      propertyInfo = {
        ...propertyInfo,
        propertyLocation:
          `${titleDeedManualData.amName || ''} ${titleDeedManualData.pvName || ''}`.trim() ||
          propertyInfo.propertyLocation,
        // Use user-entered parcelNo as landNumber (this is what user typed)
        landNumber:
          titleDeedManualData.parcelNo || propertyInfo.landNumber || '',
      }
    }

    // From AI analysis - only use if no other data available
    if (titleDeedAnalysis) {
      propertyInfo = {
        ...propertyInfo,
        propertyLocation:
          propertyInfo.propertyLocation ||
          `${titleDeedAnalysis.amName || ''} ${titleDeedAnalysis.pvName || ''}`.trim(),
        // Only use AI analysis parcelNo if manual data not available
        landNumber: propertyInfo.landNumber || titleDeedAnalysis.parcelNo || '',
      }
    }

    return propertyInfo
  },

  /**
   * Process title deed analysis result
   */
  async processTitleDeedAnalysis(analysisResult: any, uploadResult: any) {
    let finalResult = {
      imageUrl: uploadResult.url,
      imageKey: uploadResult.key,
      analysisResult,
      titleDeedData: null as any,
      needsManualInput: false,
      manualInputType: '' as 'full' | 'amphur_only' | '',
      errorMessage: undefined as string | undefined,
    }

    // Process based on AI analysis result
    if (!analysisResult.pvName) {
      finalResult.needsManualInput = true
      finalResult.manualInputType = 'full'
    } else {
      try {
        const provinceSearchResult = await aiService.findProvinceCode(
          analysisResult.pvName,
          provinceData
        )

        if (!provinceSearchResult.pvCode) {
          finalResult.needsManualInput = true
          finalResult.manualInputType = 'full'
        } else {
          try {
            const amphurSearchResult = await aiService.findAmphurCode(
              analysisResult.amName,
              provinceSearchResult.pvCode,
              amphurData,
              analysisResult.parcelNo
            )

            if (!amphurSearchResult.amCode) {
              finalResult.needsManualInput = true
              finalResult.manualInputType = 'amphur_only'
              finalResult.analysisResult = {
                ...finalResult.analysisResult,
                pvCode: provinceSearchResult.pvCode,
              }
            } else {
              // Successfully found all codes, show modal for user confirmation
              finalResult.needsManualInput = true
              finalResult.manualInputType = 'full'
              finalResult.analysisResult = {
                ...finalResult.analysisResult,
                pvCode: amphurSearchResult.pvCode,
                amCode: amphurSearchResult.amCode,
                parcelNo: amphurSearchResult.parcelNo,
              }
              finalResult.errorMessage =
                'กรุณาตรวจสอบความถูกต้องของข้อมูลที่ระบบวิเคราะห์ได้'
            }
          } catch (amphurError) {
            finalResult.needsManualInput = true
            finalResult.manualInputType = 'amphur_only'
            finalResult.analysisResult = {
              ...finalResult.analysisResult,
              pvCode: provinceSearchResult.pvCode,
            }
          }
        }
      } catch (provinceError) {
        finalResult.needsManualInput = true
        finalResult.manualInputType = 'full'
      }
    }

    return finalResult
  },

  /**
   * Create audit log for loan application
   */
  async createAuditLog(
    loanApplicationId: string,
    userId: string,
    agentId: string | undefined,
    details: any
  ) {
    await prisma.auditLog.create({
      data: {
        adminId: agentId || null,
        action: 'LOAN_APPLICATION_SUBMITTED',
        entity: 'LoanApplication',
        entityId: loanApplicationId,
        newData: {
          userId,
          agentId: agentId || null,
          ...details,
        },
        ipAddress: 'unknown', // Will be set by API route
        userAgent: 'unknown', // Will be set by API route
      },
    })
  },

  /**
   * Get loan applications by agent ID
   */
  async getByAgentId(agentId: string) {
    return loanApplicationRepository.findByAgentId(agentId)
  },

  /**
   * Get loan application by ID
   */
  async getById(id: string) {
    const application = await loanApplicationRepository.findById(id)
    if (!application) {
      throw new Error('ไม่พบคำขอสินเชื่อ')
    }
    return application
  },

  /**
   * Update loan application status
   */
  async updateStatus(
    id: string,
    status: any,
    reviewedBy?: string,
    reviewNotes?: string
  ) {
    return loanApplicationRepository.updateStatus(
      id,
      status,
      reviewedBy,
      reviewNotes
    )
  },

  /**
   * Evaluate property value from URLs (for submission flow)
   * Downloads images from URLs and calls AI service
   */
  async evaluatePropertyValueFromUrls(
    titleDeedImageUrl: string | null | undefined,
    titleDeedData: any,
    supportingImageUrls?: string[]
  ) {
    console.log('[LoanService] Starting property valuation from URLs')

    // Check if we have sufficient data
    const hasTitleDeedData =
      titleDeedData && titleDeedData.result && titleDeedData.result.length > 0
    const hasSupportingImages =
      supportingImageUrls && supportingImageUrls.length > 0

    if (!titleDeedImageUrl) {
      console.log('[LoanService] No title deed image URL provided')
      return {
        success: false,
        valuation: null,
      }
    }

    if (!hasTitleDeedData && !hasSupportingImages) {
      console.log('[LoanService] Insufficient data for valuation')
      return {
        success: false,
        valuation: {
          estimatedValue: 0,
          reasoning:
            'ข้อมูลไม่เพียงพอสำหรับการประเมิน - ต้องมีข้อมูลโฉนดหรือรูปประกอบเพิ่มเติม',
          confidence: 0,
        },
      }
    }

    try {
      // Download title deed image
      console.log('[LoanService] Downloading title deed image...')
      const titleDeedResponse = await fetch(titleDeedImageUrl)
      if (!titleDeedResponse.ok) {
        throw new Error('Failed to download title deed image')
      }
      const titleDeedArrayBuffer = await titleDeedResponse.arrayBuffer()
      const titleDeedBuffer = Buffer.from(titleDeedArrayBuffer)

      // Download supporting images
      const supportingBuffers: Buffer[] = []
      if (hasSupportingImages) {
        console.log(
          `[LoanService] Downloading ${supportingImageUrls!.length} supporting images...`
        )
        for (const url of supportingImageUrls!) {
          try {
            const response = await fetch(url)
            if (response.ok) {
              const arrayBuffer = await response.arrayBuffer()
              supportingBuffers.push(Buffer.from(arrayBuffer))
            }
          } catch (err) {
            console.warn(
              '[LoanService] Failed to download supporting image:',
              url
            )
          }
        }
      }

      // Call AI service for valuation
      console.log('[LoanService] Calling AI service for property valuation...')
      const valuationResult = await aiService.evaluatePropertyValue(
        titleDeedBuffer,
        titleDeedData,
        supportingBuffers.length > 0 ? supportingBuffers : undefined
      )

      console.log('[LoanService] Property valuation result:', valuationResult)

      return {
        success: true,
        valuation: valuationResult,
      }
    } catch (error) {
      console.error('[LoanService] Property valuation failed:', error)
      return {
        success: false,
        valuation: null,
      }
    }
  },
}
