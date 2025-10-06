'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Progress } from '@src/shared/ui/progress'
import { useSession } from 'next-auth/react'

import { IdCardStep } from './loan-steps/id-card-step'
import { LoanAmountStep } from './loan-steps/loan-amount-step'
import { PendingStep } from './loan-steps/pending-step'
import { PhoneVerificationStep } from './loan-steps/phone-verification-step'
import { SupportingImagesStep } from './loan-steps/supporting-images-step'
import { TitleDeedUploadStep } from './loan-steps/title-deed-upload-step'

interface ApplicationData {
  titleDeedImage?: File
  titleDeedImageUrl?: string
  titleDeedImageKey?: string
  titleDeedData?: any
  titleDeedAnalysis?: any
  titleDeedManualData?: any
  supportingImages?: File[]
  idCardImage?: File
  idCardImageUrl?: string
  idCardImageKey?: string
  requestedLoanAmount?: number
  loanAmount?: number
  propertyValuation?: any
  phoneNumber?: string
  pin?: string
  loanApplicationId?: string
  userId?: string
  isNewUser?: boolean
}

export function CustomerLoanApplicationFlow() {
  const { data: session } = useSession()
  const router = useRouter()

  // Determine if user is logged in
  const userIsLoggedIn = !!session?.user

  // Calculate total steps based on login status
  const totalSteps = userIsLoggedIn ? 5 : 6 // Skip phone verification if logged in
  const [currentStep, setCurrentStep] = useState(1)

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    supportingImages: [],
    // Pre-fill user data if logged in
    phoneNumber: userIsLoggedIn ? session?.user?.phoneNumber : undefined,
    userId: userIsLoggedIn ? session?.user?.id : undefined,
  })

  const progress = (currentStep / totalSteps) * 100

  const updateApplicationData = (data: Partial<ApplicationData>) => {
    setApplicationData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    } else {
      // Redirect to products page after completion
      router.push('/customer/products')
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    // Adjust step numbers based on login status
    const stepNumber = userIsLoggedIn ? currentStep : currentStep

    switch (stepNumber) {
      case 1:
        return (
          <TitleDeedUploadStep
            data={applicationData}
            onUpdate={updateApplicationData}
            onNext={nextStep}
            onPrev={prevStep}
            isFirstStep={true}
          />
        )
      case 2:
        return (
          <SupportingImagesStep
            data={applicationData}
            onUpdate={updateApplicationData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 3:
        return (
          <IdCardStep
            data={applicationData}
            onUpdate={updateApplicationData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 4:
        return (
          <LoanAmountStep
            data={applicationData}
            onUpdate={updateApplicationData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 5:
        // For logged-in users, submit directly and show pending
        if (userIsLoggedIn) {
          return (
            <PhoneVerificationStep
              data={applicationData}
              onUpdate={updateApplicationData}
              onNext={nextStep}
              onPrev={prevStep}
              skipPhoneVerification={true}
            />
          )
        } else {
          return (
            <PhoneVerificationStep
              data={applicationData}
              onUpdate={updateApplicationData}
              onNext={nextStep}
              onPrev={prevStep}
              skipPhoneVerification={false}
            />
          )
        }
      case 6:
        // Only for non-logged-in users
        return <PendingStep />
      default:
        return null
    }
  }

  const getStepTitle = () => {
    const stepNumber = userIsLoggedIn ? currentStep : currentStep

    switch (stepNumber) {
      case 1:
        return 'อัพโหลดโฉนดที่ดิน'
      case 2:
        return 'รูปประกอบเพิ่มเติม'
      case 3:
        return 'อัพโหลดบัตรประชาชน'
      case 4:
        return 'ระบุจำนวนเงิน'
      case 5:
        if (userIsLoggedIn) {
          return 'ส่งคำขอสินเชื่อ'
        } else {
          return 'ยืนยันเบอร์โทรศัพท์'
        }
      case 6:
        return 'เสร็จสิ้น'
      default:
        return ''
    }
  }

  return (
    <div
      className={
        userIsLoggedIn ? 'p-4 space-y-6' : 'max-w-2xl mx-auto p-6 space-y-6'
      }>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            ขั้นตอนที่ {currentStep} จาก {totalSteps}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Title */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">
          {getStepTitle()}
        </h2>
        {userIsLoggedIn && session?.user && (
          <p className="text-sm text-muted-foreground mt-1">
            สวัสดี {session.user.name || session.user.phoneNumber}
          </p>
        )}
        {!userIsLoggedIn && (
          <p className="text-sm text-muted-foreground mt-1">
            สมัครสินเชื่อจำนองบ้านและที่ดิน
          </p>
        )}
      </div>

      {/* Step Content */}
      {renderStep()}
    </div>
  )
}

// Export as default for dynamic import
export default CustomerLoanApplicationFlow
