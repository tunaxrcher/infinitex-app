import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Loan application submission started')

    // Get agent information from headers (set by middleware)
    const agentId = request.headers.get('x-user-id')
    const userType = request.headers.get('x-user-type')
    const isSubmittedByAgent = userType === 'AGENT' && !!agentId

    console.log('[API] Submission context:', { agentId, userType, isSubmittedByAgent })

    const body = await request.json()
    const {
      phoneNumber,
      pin,
      titleDeedImage,
      titleDeedImageUrl,
      titleDeedImageKey,
      titleDeedData,
      titleDeedAnalysis,
      titleDeedManualData,
      supportingImages,
      idCardImage,
      idCardImageUrl, // Add this for uploaded ID card URL
      requestedLoanAmount,
      loanAmount,
      propertyValuation,
    } = body

    console.log('[API] Processing loan application for phone:', phoneNumber)

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { phoneNumber },
      include: { profile: true }
    })

    let isNewUser = false

    if (!user) {
      // Create new user
      console.log('[API] Creating new user')
      isNewUser = true
      
      const hashedPin = pin ? await bcrypt.hash(pin, 10) : null
      
      user = await prisma.user.create({
        data: {
          phoneNumber,
          pin: hashedPin,
          userType: 'CUSTOMER',
          profile: {
            create: {
              // Will be updated later with ID card data if available
            }
          }
        },
        include: { profile: true }
      })
    } else {
      console.log('[API] User already exists, updating PIN if provided')
      
      // Update PIN if provided
      if (pin) {
        const hashedPin = await bcrypt.hash(pin, 10)
        await prisma.user.update({
          where: { id: user.id },
          data: { pin: hashedPin }
        })
      }
    }

    // Prepare property information from various sources
    let propertyInfo = {}
    
    // From title deed data (LandsMapsAPI)
    if (titleDeedData && titleDeedData.result && titleDeedData.result[0]) {
      const deed = titleDeedData.result[0]
      propertyInfo = {
        propertyLocation: `${deed.tumbolname || ''} ${deed.amphurname || ''} ${deed.provname || ''}`.trim(),
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
        propertyLocation: `${titleDeedManualData.amName || ''} ${titleDeedManualData.pvName || ''}`.trim(),
        landNumber: titleDeedManualData.parcelNo || '',
      }
    }
    
    // From AI analysis
    if (titleDeedAnalysis) {
      propertyInfo = {
        ...propertyInfo,
        propertyLocation: propertyInfo.propertyLocation || `${titleDeedAnalysis.amName || ''} ${titleDeedAnalysis.pvName || ''}`.trim(),
        landNumber: propertyInfo.landNumber || titleDeedAnalysis.parcelNo || '',
      }
    }

    // Create loan application
    const loanApplication = await prisma.loanApplication.create({
      data: {
        customerId: user.id,
        agentId: isSubmittedByAgent ? agentId : null, // Add agent ID if submitted by agent
        loanType: 'HOUSE_LAND_MORTGAGE',
        status: 'UNDER_REVIEW',
        currentStep: 5, // Completed all steps
        completedSteps: [1, 2, 3, 4, 5],
        isNewUser,
        submittedByAgent: isSubmittedByAgent, // Set to true if submitted by agent
        
        // Title deed information
        titleDeedImage: titleDeedImageUrl || null,
        titleDeedData: titleDeedData || {}, // Use empty object instead of null
        
        // Supporting documents
        supportingImages: supportingImages || [],
        
        // ID Card - use actual URL if provided
        idCardFrontImage: idCardImageUrl || (idCardImage ? 'pending_upload' : null),
        
        // Loan amount
        requestedAmount: requestedLoanAmount || 0,
        maxApprovedAmount: loanAmount || 0,
        
        // Property information
        ...propertyInfo,
        propertyValue: propertyValuation?.estimatedValue || null,
        
        // Submission timestamp
        submittedAt: new Date(),
      }
    })

    console.log('[API] Loan application created:', loanApplication.id)

    // Update user profile if ID card image is provided
    if (idCardImage && user.profile) {
      await prisma.userProfile.update({
        where: { id: user.profile.id },
        data: {
          idCardFrontImage: 'pending_upload', // Will be updated after file upload
        }
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        adminId: isSubmittedByAgent ? agentId : null, // Link to agent if submitted by agent
        action: 'LOAN_APPLICATION_SUBMITTED',
        entity: 'LoanApplication',
        entityId: loanApplication.id,
        newData: {
          userId: user.id,
          agentId: isSubmittedByAgent ? agentId : null,
          isNewUser,
          submittedByAgent: isSubmittedByAgent,
          requestedAmount: requestedLoanAmount,
          hasPropertyValuation: !!propertyValuation,
          hasTitleDeedData: !!titleDeedData,
          supportingImagesCount: supportingImages?.length || 0,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    })

    return NextResponse.json({
      success: true,
      loanApplicationId: loanApplication.id,
      userId: user.id,
      agentId: isSubmittedByAgent ? agentId : null,
      isNewUser,
      submittedByAgent: isSubmittedByAgent,
      message: 'ส่งคำขอสินเชื่อเรียบร้อยแล้ว',
    })

  } catch (error) {
    console.error('[API] Loan application submission failed:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งคำขอสินเชื่อ'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
