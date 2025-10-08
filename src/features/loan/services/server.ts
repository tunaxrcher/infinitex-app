import { PrismaClient } from '@prisma/client'
import amphurData from '@src/data/amphur.json'
import provinceData from '@src/data/province.json'
import LandsMapsAPI from '@src/shared/lib/LandsMapsAPI'
import { aiService } from '@src/shared/lib/ai-services'
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
      // Handle phone-based user creation/update
      user = await prisma.user.findUnique({
        where: { phoneNumber: data.phoneNumber },
        include: { profile: true },
      })

      if (!user) {
        console.log('[LoanService] Creating new user')
        isNewUser = true

        const hashedPin = data.pin ? await bcrypt.hash(data.pin, 10) : null

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
      }
    }

    // Step 2: Prepare property information
    const propertyInfo = this.extractPropertyInfo(
      data.titleDeedData,
      data.titleDeedManualData,
      data.titleDeedAnalysis
    )

    // Step 3: Create loan application
    const loanApplication = await loanApplicationRepository.createWithFullData({
      customerId: user.id,
      agentId: isSubmittedByAgent ? agentId : undefined,
      loanType: 'HOUSE_LAND_MORTGAGE',
      status: 'UNDER_REVIEW',
      currentStep: 5,
      completedSteps: [1, 2, 3, 4, 5],
      isNewUser,
      submittedByAgent: isSubmittedByAgent,

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

    return {
      loanApplicationId: loanApplication.id,
      userId: user.id,
      agentId: isSubmittedByAgent ? agentId : null,
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
}
