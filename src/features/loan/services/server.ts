import { PrismaClient } from '@prisma/client'
import amphurData from '@src/data/amphur.json'
import provinceData from '@src/data/province.json'
import LandsMapsAPI from '@src/shared/lib/LandsMapsAPI'
import { aiService } from '@src/shared/lib/ai-services'
import { sendLoanNotification } from '@src/shared/lib/line-api'
import { storage } from '@src/shared/lib/storage'
import bcrypt from 'bcryptjs'
import 'server-only'

import { loanApplicationRepository } from '../repositories/loanApplicationRepository'
import {
  type LoanApplicationSubmissionSchema,
  type ManualLookupSchema,
} from '../validations'

const prisma = new PrismaClient()

export const loanService = {
  /**
   * Submit loan application with complete workflow
   */
  async submitApplication(
    data: LoanApplicationSubmissionSchema,
    agentId?: string,
    customerId?: string
  ) {
    console.log('[LoanService] Starting loan application submission')
    console.log('[LoanService] Submission context:', {
      agentId,
      customerId,
      phoneNumber: data.phoneNumber,
      isSubmittedByAgent: !!agentId,
      isSubmittedByLoggedInCustomer: !!customerId,
    })

    const isSubmittedByAgent = !!agentId
    const isSubmittedByLoggedInCustomer = !!customerId

    // Step 1: Handle user creation/update
    let user
    let isNewUser = false

    if (isSubmittedByLoggedInCustomer) {
      // Use existing logged-in customer
      console.log('[LoanService] Using logged-in customer')
      user = await prisma.user.findUnique({
        where: { id: customerId },
        include: { profile: true },
      })

      if (!user) {
        throw new Error('ไม่พบข้อมูลผู้ใช้ที่เข้าสู่ระบบ')
      }
    } else {
      // Handle phone-based user creation/update (for both agent and customer flows)
      console.log(
        '[LoanService] Looking up user by phone number:',
        data.phoneNumber
      )
      user = await prisma.user.findUnique({
        where: { phoneNumber: data.phoneNumber },
        include: { profile: true },
      })

      if (!user) {
        console.log(
          '[LoanService] Creating new user for phone:',
          data.phoneNumber
        )
        isNewUser = true

        // Generate PIN based on flow type
        let hashedPin = null
        if (data.pin) {
          // Customer provided PIN
          hashedPin = await bcrypt.hash(data.pin, 10)
        } else if (isSubmittedByAgent) {
          // Agent flow - generate default PIN (last 4 digits of phone number)
          const defaultPin = data.phoneNumber.slice(-4)
          hashedPin = await bcrypt.hash(defaultPin, 10)
          console.log(
            '[LoanService] Generated default PIN for agent flow:',
            defaultPin
          )
        }

        user = await prisma.user.create({
          data: {
            phoneNumber: data.phoneNumber,
            pin: hashedPin,
            userType: 'CUSTOMER',
            profile: {
              create: {},
            },
          },
          include: { profile: true },
        })
      } else if (data.pin) {
        console.log('[LoanService] Updating existing user PIN')
        const hashedPin = await bcrypt.hash(data.pin, 10)
        await prisma.user.update({
          where: { id: user.id },
          data: { pin: hashedPin },
        })
      } else if (isSubmittedByAgent && !user.pin) {
        // Agent flow - set default PIN for existing user who doesn't have PIN
        const defaultPin = data.phoneNumber.slice(-4)
        const hashedPin = await bcrypt.hash(defaultPin, 10)
        console.log(
          '[LoanService] Setting default PIN for existing user in agent flow:',
          defaultPin
        )
        await prisma.user.update({
          where: { id: user.id },
          data: { pin: hashedPin },
        })
      }
    }

    console.log('[LoanService] Final user for loan application:', {
      userId: user.id,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
      isNewUser,
      isSubmittedByAgent,
    })

    // Step 2: Prepare property information
    const propertyInfo = this.extractPropertyInfo(
      data.titleDeedData,
      data.titleDeedManualData,
      data.titleDeedAnalysis
    )

    // Step 3: Determine customerId for loan application
    // If agent flow and phone is 0000000000, find that user
    let finalCustomerId = user.id
    if (isSubmittedByAgent && data.phoneNumber === '0000000000') {
      const defaultCustomer = await prisma.user.findUnique({
        where: { phoneNumber: '0000000000' },
      })
      if (defaultCustomer) {
        finalCustomerId = defaultCustomer.id
        console.log(
          '[LoanService] Using default customer (0000000000) for agent flow'
        )
      }
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

      // Owner name (from agent input)
      ownerName: (data as any).ownerName || null,

      // Title deed information
      titleDeedImage: data.titleDeedImageUrl,
      titleDeedData: data.titleDeedData || {},

      // Supporting documents
      supportingImages: data.supportingImages,

      // ID Card
      idCardFrontImage: data.idCardImageUrl,

      // Loan amount
      requestedAmount: data.requestedLoanAmount,
      maxApprovedAmount: data.loanAmount,

      // Property information
      ...propertyInfo,
      propertyValue: data.propertyValuation?.estimatedValue,

      // Submission timestamp
      submittedAt: new Date(),
    })

    // Step 4: Create audit log
    await this.createAuditLog(loanApplication.id, user.id, agentId, {
      isNewUser,
      submittedByAgent: isSubmittedByAgent,
      requestedAmount: data.requestedLoanAmount,
      hasPropertyValuation: !!data.propertyValuation,
      hasTitleDeedData: !!data.titleDeedData,
      supportingImagesCount: data.supportingImages?.length || 0,
    })

    // Step 5: Update user profile if ID card provided
    if (data.idCardImageUrl && user.profile) {
      await prisma.userProfile.update({
        where: { id: user.profile.id },
        data: {
          idCardFrontImage: data.idCardImageUrl,
        },
      })
    }

    console.log(
      '[LoanService] Loan application created successfully:',
      loanApplication.id
    )

    // Step 6: Run AI property valuation for agent flow
    let propertyValuation = data.propertyValuation || null
    if (isSubmittedByAgent && !propertyValuation) {
      console.log('[LoanService] Running AI property valuation...')
      try {
        const valuationResult = await this.evaluatePropertyValueFromUrls(
          data.titleDeedImageUrl,
          data.titleDeedData,
          data.supportingImages
        )

        if (valuationResult.success && valuationResult.valuation) {
          propertyValuation = valuationResult.valuation
          console.log('[LoanService] AI valuation completed:', propertyValuation)

          // Update LoanApplication with valuation data
          await prisma.loanApplication.update({
            where: { id: loanApplication.id },
            data: {
              propertyValue: propertyValuation.estimatedValue || null,
            },
          })
        } else {
          console.log('[LoanService] AI valuation skipped or failed')
        }
      } catch (valuationError) {
        console.error('[LoanService] AI valuation error:', valuationError)
        // Continue without valuation
      }
    }

    // Step 7: Create Loan record for agent flow (auto-approved)
    let createdLoan = null
    if (isSubmittedByAgent) {
      try {
        // Generate unique loan number: LN + YYMMDD + 4 random digits
        const now = new Date()
        const dateStr = now
          .toISOString()
          .slice(2, 10)
          .replace(/-/g, '')
        const randomDigits = Math.floor(1000 + Math.random() * 9000)
        const loanNumber = `LN${dateStr}${randomDigits}`

        // Get title deed number from titleDeedData
        const titleDeedResult = data.titleDeedData?.result?.[0]
        const titleDeedNumber = titleDeedResult?.parcelno || null

        // Default loan terms
        const defaultInterestRate = 15 // 15% per year
        const defaultTermMonths = 48 // 4 years
        const principalAmount = data.requestedLoanAmount

        // Calculate monthly payment (simple calculation)
        const monthlyInterestRate = defaultInterestRate / 100 / 12
        const monthlyPayment =
          (principalAmount *
            monthlyInterestRate *
            Math.pow(1 + monthlyInterestRate, defaultTermMonths)) /
          (Math.pow(1 + monthlyInterestRate, defaultTermMonths) - 1)

        // Calculate dates
        const contractDate = now
        const expiryDate = new Date(now)
        expiryDate.setMonth(expiryDate.getMonth() + defaultTermMonths)

        const nextPaymentDate = new Date(now)
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

        // Create Loan record with AI valuation data
        createdLoan = await prisma.loan.create({
          data: {
            loanNumber,
            customerId: finalCustomerId,
            agentId: agentId,
            applicationId: loanApplication.id,
            loanType: (data as any).loanType || 'HOUSE_LAND_MORTGAGE',
            status: 'ACTIVE',
            principalAmount,
            interestRate: defaultInterestRate,
            termMonths: defaultTermMonths,
            monthlyPayment: Math.round(monthlyPayment * 100) / 100,
            currentInstallment: 0,
            totalInstallments: defaultTermMonths,
            remainingBalance: principalAmount,
            nextPaymentDate,
            contractDate,
            expiryDate,
            titleDeedNumber,

            // Collateral information
            collateralValue: propertyValuation?.estimatedValue || null,
            collateralDetails: data.titleDeedData || null,

            // Link map from titleDeedData
            linkMap: titleDeedResult?.qrcode_link || null,

            // AI Valuation data
            valuationResult: propertyValuation || null,
            valuationDate: propertyValuation ? now : null,
            estimatedValue: propertyValuation?.estimatedValue || null,
          },
        })

        console.log('[LoanService] Loan created successfully:', createdLoan.id)

        // Update LoanApplication with loan terms (keep status as UNDER_REVIEW for admin approval)
        await prisma.loanApplication.update({
          where: { id: loanApplication.id },
          data: {
            approvedAmount: principalAmount,
            interestRate: defaultInterestRate,
            termMonths: defaultTermMonths,
          },
        })

        console.log('[LoanService] LoanApplication updated with loan terms')
      } catch (loanError) {
        console.error('[LoanService] Failed to create Loan:', loanError)
        // Don't fail the entire request if Loan creation fails
      }
    }

    // Step 8: Send LINE notification for agent flow
    if (isSubmittedByAgent) {
      try {
        // Extract data from titleDeedData
        const titleDeedResult = data.titleDeedData?.result?.[0]
        const parcelNo = titleDeedResult?.parcelno || undefined
        const amphur = titleDeedResult?.amphurname || undefined
        const province = titleDeedResult?.provname || undefined
        const latitude = titleDeedResult?.parcellat || undefined
        const longitude = titleDeedResult?.parcellon || undefined

        // Get owner name and location
        const ownerName = (data as any).ownerName || undefined
        const propertyLocation = propertyInfo.propertyLocation || undefined
        const propertyArea = propertyInfo.propertyArea || undefined

        // Get AI notes from valuation result
        const notes = propertyValuation?.reasoning
          ? `AI ประเมิน: ${propertyValuation.estimatedValue?.toLocaleString() || 0} บาท (${propertyValuation.confidence || 0}% confidence)`
          : undefined

        const lineResult = await sendLoanNotification({
          amount: data.requestedLoanAmount.toLocaleString(),
          ownerName: ownerName,
          propertyLocation: propertyLocation,
          propertyArea: propertyArea,
          parcelNo: parcelNo,
          amphur: amphur,
          province: province,
          latitude: latitude,
          longitude: longitude,
          notes: notes,
          titleDeedImageUrl: data.titleDeedImageUrl || undefined,
          supportingImageUrls: data.supportingImages || undefined,
          loanApplicationId: loanApplication.id,
        })

        if (lineResult.success) {
          console.log('[LoanService] LINE notification sent successfully')
        } else {
          console.error(
            '[LoanService] LINE notification failed:',
            lineResult.error
          )
        }
      } catch (lineError) {
        console.error(
          '[LoanService] Failed to send LINE notification:',
          lineError
        )
        // Don't fail the entire request if LINE notification fails
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
    console.log('[LoanService] Uploading ID card')

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      const uploadResult = await storage.uploadFile(buffer, file.type, {
        folder: 'id-cards',
        filename: `id_card_${Date.now()}_${file.name}`,
      })

      return {
        success: true,
        imageUrl: uploadResult.url,
        imageKey: uploadResult.key,
      }
    } catch (uploadError) {
      console.error('[LoanService] ID card upload failed:', uploadError)

      const fallbackResult = {
        url: `data:${file.type};base64,${buffer.toString('base64')}`,
        key: `temp_${Date.now()}_${file.name}`,
      }

      return {
        success: true,
        imageUrl: fallbackResult.url,
        imageKey: fallbackResult.key,
      }
    }
  },

  /**
   * Upload supporting image (single file - kept for backward compatibility)
   */
  async uploadSupportingImage(file: File) {
    console.log('[LoanService] Uploading supporting image')

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      const uploadResult = await storage.uploadFile(buffer, file.type, {
        folder: 'supporting-images',
        filename: `supporting_${Date.now()}_${file.name}`,
      })

      return {
        success: true,
        imageUrl: uploadResult.url,
        imageKey: uploadResult.key,
      }
    } catch (uploadError) {
      console.error(
        '[LoanService] Supporting image upload failed:',
        uploadError
      )

      // Fallback to base64 if upload fails
      const fallbackResult = {
        url: `data:${file.type};base64,${buffer.toString('base64')}`,
        key: `temp_${Date.now()}_${file.name}`,
      }

      return {
        success: true,
        imageUrl: fallbackResult.url,
        imageKey: fallbackResult.key,
      }
    }
  },

  /**
   * Upload multiple supporting images in batch
   */
  async uploadSupportingImages(files: File[]) {
    console.log(`[LoanService] Uploading ${files.length} supporting images`)

    const uploadResults = await Promise.allSettled(
      files.map(async (file, index) => {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        try {
          const uploadResult = await storage.uploadFile(buffer, file.type, {
            folder: 'supporting-images',
            filename: `supporting_${Date.now()}_${index}_${file.name}`,
          })

          return {
            success: true,
            imageUrl: uploadResult.url,
            imageKey: uploadResult.key,
            fileName: file.name,
          }
        } catch (uploadError) {
          console.error(
            `[LoanService] Supporting image upload failed for ${file.name}:`,
            uploadError
          )

          // Fallback to base64 if upload fails
          const fallbackResult = {
            url: `data:${file.type};base64,${buffer.toString('base64')}`,
            key: `temp_${Date.now()}_${index}_${file.name}`,
          }

          return {
            success: true,
            imageUrl: fallbackResult.url,
            imageKey: fallbackResult.key,
            fileName: file.name,
          }
        }
      })
    )

    // Process results
    const successfulUploads = uploadResults
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<any>).value)

    const failedUploads = uploadResults
      .filter((result) => result.status === 'rejected')
      .map((result) => (result as PromiseRejectedResult).reason)

    if (failedUploads.length > 0) {
      console.error(
        `[LoanService] ${failedUploads.length} uploads failed:`,
        failedUploads
      )
    }

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

    // From title deed data (LandsMapsAPI)
    if (titleDeedData && titleDeedData.result && titleDeedData.result[0]) {
      const deed = titleDeedData.result[0]
      propertyInfo = {
        propertyLocation:
          `${deed.tumbolname || ''} ${deed.amphurname || ''} ${deed.provname || ''}`.trim(),
        propertyArea: `${deed.rai || 0} ไร่ ${deed.ngan || 0} งาน ${deed.wa || 0} ตารางวา`,
        landNumber: deed.parcelno || '',
        ownerName: deed.owner_name || '',
        propertyType: deed.land_type || 'ที่ดิน',
      }
    }

    // From manual data
    if (titleDeedManualData) {
      propertyInfo = {
        ...propertyInfo,
        propertyLocation:
          `${titleDeedManualData.amName || ''} ${titleDeedManualData.pvName || ''}`.trim(),
        landNumber: titleDeedManualData.parcelNo || '',
      }
    }

    // From AI analysis
    if (titleDeedAnalysis) {
      propertyInfo = {
        ...propertyInfo,
        propertyLocation:
          propertyInfo.propertyLocation ||
          `${titleDeedAnalysis.amName || ''} ${titleDeedAnalysis.pvName || ''}`.trim(),
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
            console.warn('[LoanService] Failed to download supporting image:', url)
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
