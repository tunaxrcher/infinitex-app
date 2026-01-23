'use client'

import { useEffect, useState } from 'react'

import { LoanAmountStep } from '@src/features/loan/components/loan-steps/loan-amount-step'
import { PendingStep } from '@src/features/loan/components/loan-steps/pending-step'
import { SupportingImagesStep } from '@src/features/loan/components/loan-steps/supporting-images-step'
import { TitleDeedMultipleStep } from '@src/features/loan/components/loan-steps/title-deed-multiple-step'
import { TitleDeedUploadStep } from '@src/features/loan/components/loan-steps/title-deed-upload-step'
import { Progress } from '@src/shared/ui/progress'

type DeedMode = 'single' | 'multiple'

interface TitleDeedItem {
  id: string
  imageFile?: File
  imageUrl?: string
  imageKey?: string
  provinceName: string
  amphurName: string
  parcelNo: string
  landAreaRai: string
  landAreaNgan: string
  landAreaWa: string
  // For UI select only
  _provinceCode?: string
  _amphurCode?: string
}

interface ApplicationData {
  customerId?: string
  customerPhone?: string
  customerName?: string
  ownerName?: string
  loanType?: string
  deedMode?: DeedMode
  // Single deed mode
  titleDeedImage?: File
  titleDeedData?: {
    ownerName: string
    landNumber: string
    area: string
    location: string
  }
  // Multiple deeds mode
  titleDeeds?: TitleDeedItem[]
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
  const [isInitialized, setIsInitialized] = useState(false)

  // Load data from sessionStorage on mount
  useEffect(() => {
    const savedData = sessionStorage.getItem('loanApplicationData')
    const savedStep = sessionStorage.getItem('loanApplicationStep')
    console.log('[AgentFlow] Loading from sessionStorage:', savedData, 'step:', savedStep)
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        console.log('[AgentFlow] Parsed data:', parsed)
        setApplicationData((prev) => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to parse loan application data:', error)
      }
    }
    
    if (savedStep) {
      const step = parseInt(savedStep, 10)
      if (step >= 1 && step <= 4) {
        setCurrentStep(step)
      }
    }
    
    setIsInitialized(true)
  }, [])

  // Save to sessionStorage whenever data or step changes
  useEffect(() => {
    if (!isInitialized) return
    
    // Clear sessionStorage when reaching final step (pending)
    if (currentStep === 4) {
      sessionStorage.removeItem('loanApplicationData')
      sessionStorage.removeItem('loanApplicationStep')
      console.log('[AgentFlow] Cleared sessionStorage (reached final step)')
      return
    }
    
    // Save application data (excluding File objects which can't be serialized)
    const dataToSave = {
      ...applicationData,
      // Exclude File objects
      titleDeedImage: undefined,
      supportingImages: [],
      // Exclude imageFile from each title deed
      titleDeeds: applicationData.titleDeeds?.map(({ imageFile, ...rest }) => rest),
    }
    sessionStorage.setItem('loanApplicationData', JSON.stringify(dataToSave))
    sessionStorage.setItem('loanApplicationStep', currentStep.toString())
    
    console.log('[AgentFlow] Saved to sessionStorage:', { deedMode: applicationData.deedMode, currentStep })
  }, [applicationData, currentStep, isInitialized])

  // Agent flow is now 4 steps (without ID Card, Customer Selection and Phone Verification)
  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const updateApplicationData = (data: Partial<ApplicationData>) => {
    console.log('[AgentFlow] Updating applicationData with:', data)
    setApplicationData((prev) => {
      const newData = { ...prev, ...data }
      console.log('[AgentFlow] New applicationData:', {
        deedMode: newData.deedMode,
        hasTitleDeeds: !!newData.titleDeeds,
        titleDeedsLength: newData.titleDeeds?.length || 0,
      })
      return newData
    })
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
    const isMultipleMode = applicationData.deedMode === 'multiple'

    switch (currentStep) {
      case 1:
        // Title deed upload - different component based on mode
        if (isMultipleMode) {
          return (
            <TitleDeedMultipleStep
              data={applicationData}
              onUpdate={updateApplicationData}
              onNext={nextStep}
              onPrev={prevStep}
              isFirstStep={true}
            />
          )
        }
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
    const isMultipleMode = applicationData.deedMode === 'multiple'

    switch (currentStep) {
      case 1:
        return isMultipleMode
          ? 'อัพโหลด | โฉนดที่ดิน (หลายใบ)'
          : 'อัพโหลด | โฉนดที่ดิน'
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
