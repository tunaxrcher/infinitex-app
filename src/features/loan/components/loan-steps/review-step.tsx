'use client'

import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { CheckCircle, DollarSign, Home } from 'lucide-react'

interface ReviewStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
  isLoggedIn: boolean
}

const propertyTypeLabels: Record<string, string> = {
  house: 'บ้านเดี่ยว',
  condo: 'คอนโดมิเนียม',
  land: 'ที่ดินเปล่า',
  townhouse: 'ทาวน์เฮาส์',
}

export function ReviewStep({
  data,
  onUpdate,
  onNext,
  onPrev,
  isLoggedIn,
}: ReviewStepProps) {
  const loanToValueRatio =
    data.propertyValue > 0 ? (data.loanAmount / data.propertyValue) * 100 : 0
  const estimatedMonthlyPayment =
    data.loanAmount > 0 ? (data.loanAmount * 0.05) / 12 : 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            ตรวจสอบข้อมูล
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน
          </p>

          {/* Property Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">
                ข้อมูลหลักทรัพย์
              </h3>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ประเภท:</span>
                <span className="text-sm font-medium text-foreground">
                  {propertyTypeLabels[data.propertyType] || data.propertyType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  มูลค่าประเมิน:
                </span>
                <span className="text-sm font-medium text-foreground">
                  {data.propertyValue.toLocaleString('th-TH')} บาท
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  เอกสารแนบ:
                </span>
                <span className="text-sm font-medium text-foreground">
                  {data.propertyImages.length} ไฟล์
                </span>
              </div>
            </div>
          </div>

          {/* Loan Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">
                ข้อมูลสินเชื่อ
              </h3>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  วงเงินที่ขอ:
                </span>
                <span className="text-sm font-bold text-primary">
                  {data.loanAmount.toLocaleString('th-TH')} บาท
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  อัตราส่วนสินเชื่อ:
                </span>
                <Badge
                  variant={loanToValueRatio > 80 ? 'destructive' : 'default'}
                  className="text-xs">
                  {loanToValueRatio.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  ผ่อนชำระประมาณ:
                </span>
                <span className="text-sm font-medium text-foreground">
                  {estimatedMonthlyPayment.toLocaleString('th-TH', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  บาท/เดือน
                </span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <h4 className="text-sm font-medium text-foreground mb-2">
              ข้อมูลสำคัญ
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>
                • อัตราดอกเบียเริ่มต้น 5% ต่อปี (อาจปรับเปลี่ยนตามเงื่อนไข)
              </li>
              <li>• ระยะเวลาผ่อนชำระสูงสุด 30 ปี</li>
              <li>• ไม่มีค่าธรรมเนียมแรกเข้า</li>
              <li>• สามารถชำระก่อนกำหนดได้โดยไม่มีค่าปรับ</li>
            </ul>
          </div>
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
        <Button onClick={onNext} className="flex-1">
          {isLoggedIn ? 'ยืนยันการขอสินเชื่อ' : 'ถัดไป'}
        </Button>
      </div>
    </div>
  )
}
