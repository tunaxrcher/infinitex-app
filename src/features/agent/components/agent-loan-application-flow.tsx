'use client'

import { useEffect, useState } from 'react'

import { LoanAmountStep } from '@src/features/loan/components/loan-steps/loan-amount-step'
import { PendingStep } from '@src/features/loan/components/loan-steps/pending-step'
import { SupportingImagesStep } from '@src/features/loan/components/loan-steps/supporting-images-step'
import { TitleDeedUploadStep } from '@src/features/loan/components/loan-steps/title-deed-upload-step'
import { Progress } from '@src/shared/ui/progress'

interface ApplicationData {
  customerId?: string
  customerPhone?: string
  customerName?: string
  ownerName?: string
  loanType?: string
  titleDeedImage?: File
  titleDeedData?: {
    ownerName: string
    landNumber: string
    area: string
    location: string
  }
  supportingImages: File[]
  loanAmount: number
  phoneNumber?: string
  pin?: string
}

export function AgentLoanApplicationFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    supportingImages: [],
    loanAmount: 0,
    loanType: 'HOUSE_LAND_MORTGAGE', // Default
  })

  // Load data from sessionStorage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('loanApplicationData')
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        updateApplicationData(parsed)
        // Clear after loading
        sessionStorage.removeItem('loanApplicationData')
      } catch (error) {
        console.error('Failed to parse loan application data:', error)
      }
    }
  }, [])

  // Agent flow is now 4 steps (without ID Card, Customer Selection and Phone Verification)
  const totalSteps = 4
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
            isAgentFlow={true}
          />
        )
      case 4:
        return <PendingStep />
      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'อัพโหลด | โฉนดที่ดิน'
      case 2:
        return 'อัพโหลด | รูปประกอบ (หากมี)'
      case 3:
        return 'กำหนดวงเงินและส่งคำขอ'
      case 4:
        return 'รออนุมัติ'
      default:
        return ''
    }
  }

  return (
    <>
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
            {applicationData.ownerName && (
              <p className="text-sm font-medium text-primary">
                {applicationData.ownerName}
              </p>
            )}
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}
      </div>
    </>
  )
}
