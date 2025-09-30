'use client'

import { useState } from 'react'

import { Progress } from '@src/shared/ui/progress'

import { IdCardStep } from './loan-steps/id-card-step'
import { LoanAmountStep } from './loan-steps/loan-amount-step'
import { PendingStep } from './loan-steps/pending-step'
import { PhoneVerificationStep } from './loan-steps/phone-verification-step'
import { SupportingImagesStep } from './loan-steps/supporting-images-step'
import { TitleDeedUploadStep } from './loan-steps/title-deed-upload-step'

// Mock user authentication status
const isLoggedIn = false // Change this to test different flows

interface ApplicationData {
  titleDeedImage?: File
  titleDeedData?: {
    ownerName: string
    landNumber: string
    area: string
    location: string
  }
  supportingImages: File[]
  idCardImage?: File
  loanAmount: number
  phoneNumber?: string
  pin?: string
}

export function LoanApplicationFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    supportingImages: [],
    loanAmount: 0,
  })

  const totalSteps = isLoggedIn ? 4 : 6
  const progress = (currentStep / totalSteps) * 100

  const updateApplicationData = (data: Partial<ApplicationData>) => {
    setApplicationData((prev) => ({ ...prev, ...data }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStep = () => {
    if (isLoggedIn) {
      // 4 steps for logged-in users
      switch (currentStep) {
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
            <LoanAmountStep
              data={applicationData}
              onUpdate={updateApplicationData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )
        case 4:
          return <PendingStep />
        default:
          return null
      }
    } else {
      // 6 steps for new users
      switch (currentStep) {
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
          return (
            <PhoneVerificationStep
              data={applicationData}
              onUpdate={updateApplicationData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )
        case 6:
          return <PendingStep />
        default:
          return null
      }
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">
            {isLoggedIn ? 'ขอสินเชื่อเพิ่มเติม' : 'สมัครสมาชิกและขอสินเชื่อ'}
          </h1>
          <span className="text-sm text-muted-foreground">
            {currentStep}/{totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground">
          {isLoggedIn
            ? 'กรอกข้อมูลเพื่อขอสินเชื่อเพิ่มเติม'
            : 'สร้างบัญชีใหม่และขอสินเชื่อในขั้นตอนเดียว'}
        </p>
      </div>

      {/* Step Content */}
      {renderStep()}
    </div>
  )
}
