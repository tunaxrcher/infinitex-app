'use client'

import type React from 'react'
import { useState } from 'react'

import { Alert, AlertDescription } from '@src/shared/ui/alert'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { Input } from '@src/shared/ui/input'
import { Label } from '@src/shared/ui/label'
import { DollarSign } from 'lucide-react'

interface LoanAmountStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
}

export function LoanAmountStep({
  data,
  onUpdate,
  onNext,
  onPrev,
}: LoanAmountStepProps) {
  const systemEvaluatedAmount = 2500000 // 2.5 million baht
  const [requestedAmount, setRequestedAmount] = useState(
    data.requestedLoanAmount || ''
  )

  const handleConfirm = () => {
    const amount = Number(requestedAmount) || 0
    if (amount > 0) {
      onUpdate({
        loanAmount: systemEvaluatedAmount,
        requestedLoanAmount: amount,
      })
      onNext()
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
            วงเงินที่ระบบประเมินให้ (จาก AI)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {systemEvaluatedAmount.toLocaleString()} บาท
                  </p>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    * วงเงินและเงื่อนไขนี้เป็นการประเมินเบื้องต้น
                    อาจมีการปรับเปลี่ยนหลังจากการตรวจสอบจริงอีกครั้ง
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
<hr />
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
            <p className="text-xs text-muted-foreground">
              สามารถขอได้สูงสุด {systemEvaluatedAmount.toLocaleString()} บาท
            </p>
            {!canProceed && (
              <p className="text-xs text-destructive">
                * กรุณาระบุยอดเงินที่ต้องการก่อนดำเนินการต่อ
              </p>
            )}
          </div>

          {/* {data.titleDeedData && (
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">
                ข้อมูลหลักทรัพย์ที่ใช้ประกอบการพิจารณา:
              </p>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>เจ้าของ: {data.titleDeedData.ownerName}</p>
                <p>เนื้อที่: {data.titleDeedData.area}</p>
                <p>ที่ตั้ง: {data.titleDeedData.location}</p>
              </div>
            </div>
          )} */}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex-1 bg-transparent">
          ย้อนกลับ
        </Button>
        <Button onClick={handleConfirm} disabled={!canProceed} className="flex-1">
          ยืนยันและดำเนินการต่อ
        </Button>
      </div>
    </div>
  )
}
