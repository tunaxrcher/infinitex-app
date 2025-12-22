'use client'

import type React from 'react'
import { useEffect, useState } from 'react'

import Image from 'next/image'

import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { Dialog, DialogContent } from '@src/shared/ui/dialog'
import { Input } from '@src/shared/ui/input'
import { Label } from '@src/shared/ui/label'
import { Progress } from '@src/shared/ui/progress'
import { Check, DollarSign, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface LoanAmountStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
  isAgentFlow?: boolean
}

export function LoanAmountStep({
  data,
  onUpdate,
  onNext,
  onPrev,
  isAgentFlow = false,
}: LoanAmountStepProps) {
  // Use AI valuation if available, otherwise use default
  const systemEvaluatedAmount = data.propertyValuation?.estimatedValue || 0

  const [requestedAmount, setRequestedAmount] = useState(
    data.requestedLoanAmount || ''
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  const [aiStatus, setAiStatus] = useState<
    'evaluating' | 'submitting' | 'sending' | 'done'
  >('evaluating')

  // Progress animation when dialog is open
  useEffect(() => {
    if (!showAIDialog) {
      setAiProgress(0)
      return
    }

    const interval = setInterval(() => {
      setAiProgress((prev) => {
        // Progress based on status
        if (aiStatus === 'evaluating') {
          // Slow progress during AI evaluation (0-60%)
          if (prev < 60) return prev + Math.random() * 2
          return prev
        } else if (aiStatus === 'submitting') {
          // Medium progress during submission (60-85%)
          if (prev < 85) return prev + Math.random() * 3
          return prev
        } else if (aiStatus === 'sending') {
          // Fast progress during LINE sending (85-95%)
          if (prev < 95) return prev + Math.random() * 2
          return prev
        } else if (aiStatus === 'done') {
          // Complete
          if (prev < 100) return 100
          return 100
        }
        return prev
      })
    }, 200)

    return () => clearInterval(interval)
  }, [showAIDialog, aiStatus])

  const handleConfirm = async () => {
    const amount = Number(requestedAmount) || 0
    if (amount > 0) {
      onUpdate({
        loanAmount: systemEvaluatedAmount,
        requestedLoanAmount: amount,
      })

      // If agent flow, submit immediately
      if (isAgentFlow) {
        await handleSubmitLoanApplication(amount)
      } else {
        onNext()
      }
    }
  }

  const handleSubmitLoanApplication = async (amount: number) => {
    setIsSubmitting(true)
    setShowAIDialog(true)
    setAiProgress(0)
    setAiStatus('evaluating')

    try {
      console.log('[LoanAmount] Submitting loan application for agent...')

      // Prepare submission data
      const submissionData = {
        // Use default customer (phone 0000000000)
        phoneNumber: '0000000000',
        ownerName: data.ownerName || null,
        loanType: data.loanType || 'HOUSE_LAND_MORTGAGE',

        // Title deed information
        titleDeedImage: data.titleDeedImage?.name || null,
        titleDeedImageUrl: data.titleDeedImageUrl || null,
        titleDeedImageKey: data.titleDeedImageKey || null,
        titleDeedData: data.titleDeedData || null,
        titleDeedAnalysis: data.titleDeedAnalysis || null,
        titleDeedManualData: data.titleDeedManualData || null,

        // Supporting images
        supportingImages:
          data.supportingImages?.map((img: any) => img.url || img) || [],

        // ID Card
        idCardImage: data.idCardImage?.name || null,
        idCardImageUrl: data.idCardImageUrl || null,

        // Loan amount
        requestedLoanAmount: amount,
        loanAmount: systemEvaluatedAmount || amount,

        // Property valuation
        propertyValuation: data.propertyValuation || null,

        // Agent flow flag
        isAgentFlow: true,
      }

      console.log('[LoanAmount] Submission data prepared:', {
        phoneNumber: submissionData.phoneNumber,
        ownerName: submissionData.ownerName,
        requestedAmount: submissionData.requestedLoanAmount,
        hasTitleDeedData: !!submissionData.titleDeedData,
        hasPropertyValuation: !!submissionData.propertyValuation,
      })

      // Update status to submitting
      setAiStatus('submitting')

      // Submit to API
      const response = await fetch('/api/loans/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'การส่งคำขอสินเชื่อล้มเหลว')
      }

      // Update status to sending LINE
      setAiStatus('sending')
      await new Promise((resolve) => setTimeout(resolve, 500))

      console.log(
        '[LoanAmount] Loan application submitted successfully:',
        result
      )

      // Update data with submission result
      onUpdate({
        ...data,
        loanApplicationId: result.loanApplicationId,
        loanId: result.loanId,
        loanNumber: result.loanNumber,
        userId: result.userId,
        isNewUser: result.isNewUser,
      })

      // Show completion
      setAiStatus('done')
      setAiProgress(100)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success('ส่งคำขอสินเชื่อเรียบร้อยแล้ว!')

      // Close dialog and go to pending step
      setShowAIDialog(false)
      onNext()
    } catch (error) {
      console.error('[LoanAmount] Loan application submission failed:', error)
      setShowAIDialog(false)
      toast.error(
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการส่งคำขอสินเชื่อ'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if user has entered a valid amount
  const canProceed = requestedAmount && Number(requestedAmount) > 0

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    setRequestedAmount(value)
  }

  const formatNumber = (num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  const getStatusText = () => {
    switch (aiStatus) {
      case 'evaluating':
        return 'AI กำลังประเมินมูลค่าทรัพย์สิน'
      case 'submitting':
        return 'กำลังบันทึกข้อมูลคำขอสินเชื่อ'
      case 'sending':
        return 'กำลังส่งแจ้งเตือนไปยัง LINE'
      case 'done':
        return 'ดำเนินการเสร็จสิ้น!'
      default:
        return 'กำลังดำเนินการ...'
    }
  }

  const getStatusDescription = () => {
    switch (aiStatus) {
      case 'evaluating':
        return 'ระบบ AI กำลังวิเคราะห์ข้อมูลโฉนดและรูปประกอบเพื่อประเมินมูลค่าทรัพย์สิน'
      case 'submitting':
        return 'กำลังสร้างคำขอสินเชื่อและบันทึกข้อมูลลงระบบ'
      case 'sending':
        return 'กำลังส่งข้อมูลคำขอสินเชื่อไปยัง LINE Group'
      case 'done':
        return 'ส่งคำขอสินเชื่อเรียบร้อยแล้ว กำลังนำไปยังหน้าถัดไป'
      default:
        return 'กรุณารอสักครู่...'
    }
  }

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              ยอดเงินที่ต้องการขอสินเชื่อ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="requestedAmount" className="text-sm font-medium">
                ยอดเงินที่ต้องการ (บาท)
              </Label>
              <Input
                id="requestedAmount"
                type="text"
                placeholder="กรอกยอดเงินที่ต้องการ"
                value={requestedAmount ? formatNumber(requestedAmount) : ''}
                onChange={handleAmountChange}
                className="text-lg"
              />
              {!canProceed && (
                <p className="text-xs text-destructive">
                  * กรุณาระบุยอดเงินที่ต้องการก่อนดำเนินการต่อ
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                กรุณาระบุยอดเงินที่ลูกค้าต้องการกู้
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={isSubmitting}
            className="flex-1 bg-transparent">
            ย้อนกลับ
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canProceed || isSubmitting}
            className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังส่งคำขอ...
              </>
            ) : isAgentFlow ? (
              'ส่งคำขอสินเชื่อ'
            ) : (
              'ยืนยันและดำเนินการต่อ'
            )}
          </Button>
        </div>
      </div>

      {/* AI Evaluation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <div className="flex flex-col items-center space-y-6 text-center px-4 py-6">
            {/* Logo */}
            <div className="w-16 h-16 relative">
              <Image
                src="/images/logo.png"
                alt="InfiniteX Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
              {/* {aiStatus !== 'done' && (
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                  <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
                </div>
              )} */}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold ai-gradient-text">
                {getStatusText()}
              </h3>
              <p className="text-sm text-muted-foreground">
                {getStatusDescription()}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">กำลังดำเนินการ...</span>
                <span className="font-medium">{Math.round(aiProgress)}%</span>
              </div>
              <Progress value={aiProgress} className="h-2" />

              {/* Progress Steps */}
              <div className="text-xs text-muted-foreground space-y-2 text-left mt-4">
                {aiProgress > 5 && (
                  <div className="flex items-center animate-in fade-in slide-in-from-left-2">
                    <Check className="h-3 w-3 mr-2 text-green-400 flex-shrink-0" />
                    <span>เริ่มต้นกระบวนการ</span>
                  </div>
                )}
                {aiProgress > 15 && (
                  <div className="flex items-center animate-in fade-in slide-in-from-left-2">
                    <Check className="h-3 w-3 mr-2 text-green-400 flex-shrink-0" />
                    <span>ดาวน์โหลดรูปภาพเพื่อวิเคราะห์</span>
                  </div>
                )}
                {aiProgress > 30 && (
                  <div className="flex items-center animate-in fade-in slide-in-from-left-2">
                    {aiStatus === 'evaluating' && aiProgress < 60 ? (
                      <Loader2 className="h-3 w-3 mr-2 text-blue-400 flex-shrink-0 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3 mr-2 text-green-400 flex-shrink-0" />
                    )}
                    <span>AI กำลังประเมินมูลค่าทรัพย์สิน</span>
                  </div>
                )}
                {aiProgress > 60 && (
                  <div className="flex items-center animate-in fade-in slide-in-from-left-2">
                    {aiStatus === 'submitting' && aiProgress < 85 ? (
                      <Loader2 className="h-3 w-3 mr-2 text-blue-400 flex-shrink-0 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3 mr-2 text-green-400 flex-shrink-0" />
                    )}
                    <span>บันทึกข้อมูลคำขอสินเชื่อ</span>
                  </div>
                )}
                {aiProgress > 85 && (
                  <div className="flex items-center animate-in fade-in slide-in-from-left-2">
                    {aiStatus === 'sending' && aiProgress < 95 ? (
                      <Loader2 className="h-3 w-3 mr-2 text-blue-400 flex-shrink-0 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3 mr-2 text-green-400 flex-shrink-0" />
                    )}
                    <span>ส่งแจ้งเตือนไปยัง LINE</span>
                  </div>
                )}
                {aiProgress >= 100 && (
                  <div className="flex items-center animate-in fade-in slide-in-from-left-2">
                    <Check className="h-3 w-3 mr-2 text-green-400 flex-shrink-0" />
                    <span className="font-medium text-green-400">
                      ดำเนินการเสร็จสิ้น!
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Warning */}
            <p className="text-xs text-primary font-medium">
              กรุณาอย่าปิดหน้าต่างนี้
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
