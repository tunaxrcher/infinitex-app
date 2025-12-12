'use client'

import type React from 'react'
import { useState } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { Input } from '@src/shared/ui/input'
import { Label } from '@src/shared/ui/label'
import { DollarSign, Loader2 } from 'lucide-react'
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
  const router = useRouter()
  // Use AI valuation if available, otherwise use default
  const systemEvaluatedAmount = data.propertyValuation?.estimatedValue || 0
  const hasAIValuation =
    data.propertyValuation && data.propertyValuation.estimatedValue > 0

  const [requestedAmount, setRequestedAmount] = useState(
    data.requestedLoanAmount || ''
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

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

      console.log(
        '[LoanAmount] Loan application submitted successfully:',
        result
      )

      // Update data with submission result
      onUpdate({
        ...data,
        loanApplicationId: result.loanApplicationId,
        userId: result.userId,
        isNewUser: result.isNewUser,
      })

      toast.success('ส่งคำขอสินเชื่อเรียบร้อยแล้ว!')

      // Go to pending step immediately
      onNext()
    } catch (error) {
      console.error('[LoanAmount] Loan application submission failed:', error)
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

  return (
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
  )
}
