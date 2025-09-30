'use client'

import { useState } from 'react'

import { IdCardStep } from '@src/features/loan/components/loan-steps/id-card-step'
import { LoanAmountStep } from '@src/features/loan/components/loan-steps/loan-amount-step'
import { PendingStep } from '@src/features/loan/components/loan-steps/pending-step'
import { PhoneVerificationStep } from '@src/features/loan/components/loan-steps/phone-verification-step'
import { SupportingImagesStep } from '@src/features/loan/components/loan-steps/supporting-images-step'
import { TitleDeedUploadStep } from '@src/features/loan/components/loan-steps/title-deed-upload-step'
import { Progress } from '@src/shared/ui/progress'

import { AgentCustomerSelectionStep } from './agent-customer-selection-step'

interface ApplicationData {
  customerId?: string
  customerPhone?: string
  customerName?: string
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

export function AgentLoanApplicationFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    supportingImages: [],
    loanAmount: 0,
  })

  // Agent flow is always 7 steps (Customer Selection + 6 standard steps)
  const totalSteps = 7
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
    switch (currentStep) {
      case 1:
        return (
          <AgentCustomerSelectionStep
            data={applicationData}
            onUpdate={updateApplicationData}
            onNext={nextStep}
            onPrev={prevStep}
            isFirstStep={true}
          />
        )
      case 2:
        return (
          <TitleDeedUploadStep
            data={applicationData}
            onUpdate={updateApplicationData}
            onNext={nextStep}
            onPrev={prevStep}
            isFirstStep={false}
          />
        )
      case 3:
        return (
          <SupportingImagesStep
            data={applicationData}
            onUpdate={updateApplicationData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 4:
        return (
          <IdCardStep
            data={applicationData}
            onUpdate={updateApplicationData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 5:
        return (
          <LoanAmountStep
            data={applicationData}
            onUpdate={updateApplicationData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 6:
        return (
          <PhoneVerificationStep
            data={applicationData}
            onUpdate={updateApplicationData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )
      case 7:
        return <PendingStep />
      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'เลือกลูกค้า'
      case 2:
        return 'อัพโหลดโฉนดที่ดิน'
      case 3:
        return 'อัพโหลดรูปประกอบ'
      case 4:
        return 'อัพโหลดบัตรประชาชน'
      case 5:
        return 'กำหนดวงเงิน'
      case 6:
        return 'ยืนยันเบอร์โทรศัพท์'
      case 7:
        return 'รออนุมัติ'
      default:
        return ''
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Progress Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">
            ขอสินเชื่อให้ลูกค้า
          </h1>
          <span className="text-sm text-muted-foreground">
            {currentStep}/{totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{getStepTitle()}</p>
          {applicationData.customerName && (
            <p className="text-sm font-medium text-primary">
              ลูกค้า: {applicationData.customerName}
            </p>
          )}
        </div>
      </div>

      {/* Step Content */}
      {renderStep()}
    </div>
  )
}
