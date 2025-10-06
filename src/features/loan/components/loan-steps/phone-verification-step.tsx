'use client'

import type React from 'react'
import { useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@src/shared/ui/dialog'
import { Input } from '@src/shared/ui/input'
import { Label } from '@src/shared/ui/label'
import { CheckCircle, Eye, EyeOff, Loader2, Phone, Shield } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

interface PhoneVerificationStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
  skipPhoneVerification?: boolean // For logged-in users
  isAgentFlow?: boolean // For agent submitting for customer
}

export function PhoneVerificationStep({
  data,
  onUpdate,
  onNext,
  onPrev,
  skipPhoneVerification = false,
  isAgentFlow = false,
}: PhoneVerificationStepProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const [showPinModal, setShowPinModal] = useState(false)
  const [pinDigits, setPinDigits] = useState(['', '', '', ''])
  const [showPin, setShowPin] = useState(false)
  
  // For agent flow, always require phone verification
  // For customer flow, skip if logged in
  const shouldSkipVerification = isAgentFlow ? false : (skipPhoneVerification || !!session?.user)
  const [pinVerified, setPinVerified] = useState(shouldSkipVerification)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionComplete, setSubmissionComplete] = useState(false)

  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleConfirmPhone = () => {
    if (data.phoneNumber) {
      setShowPinModal(true)
    }
  }

  const handlePinChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(0, 1)

    const newPinDigits = [...pinDigits]
    newPinDigits[index] = digit
    setPinDigits(newPinDigits)

    // Auto-focus next field if digit entered
    if (digit && index < 3) {
      pinInputRefs.current[index + 1]?.focus()
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus()
    }
  }

  const handlePinSubmit = () => {
    const pin = pinDigits.join('')
    if (pin.length === 4) {
      onUpdate({ pin })
      setPinVerified(true)
      setShowPinModal(false)
    }
  }

  const handleSubmitLoanApplication = async () => {
    setIsSubmitting(true)
    try {
      console.log('[PhoneVerification] Submitting loan application...')

      // Prepare submission data
      const submissionData = {
        phoneNumber: session?.user?.phoneNumber || data.phoneNumber,
        pin: session?.user ? undefined : data.pin, // Don't send PIN for logged-in users

        // Title deed information
        titleDeedImage: data.titleDeedImage?.name || null,
        titleDeedImageUrl: data.titleDeedImageUrl || null,
        titleDeedImageKey: data.titleDeedImageKey || null,
        titleDeedData: data.titleDeedData || null,
        titleDeedAnalysis: data.titleDeedAnalysis || null,
        titleDeedManualData: data.titleDeedManualData || null,

        // Supporting images
        supportingImages:
          data.supportingImages?.map((img: File) => img.name) || [],

        // ID Card
        idCardImage: data.idCardImage?.name || null,
        idCardImageUrl: data.idCardImageUrl || null, // Add ID card image URL

        // Loan amount
        requestedLoanAmount: data.requestedLoanAmount || 0,
        loanAmount: data.loanAmount || 0,

        // Property valuation
        propertyValuation: data.propertyValuation || null,
      }

      console.log('[PhoneVerification] Submission data prepared:', {
        phoneNumber: submissionData.phoneNumber,
        hasPin: !!submissionData.pin,
        hasTitleDeedData: !!submissionData.titleDeedData,
        hasPropertyValuation: !!submissionData.propertyValuation,
        requestedAmount: submissionData.requestedLoanAmount,
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
        '[PhoneVerification] Loan application submitted successfully:',
        result
      )

      // Update data with submission result
      onUpdate({
        ...data,
        loanApplicationId: result.loanApplicationId,
        userId: result.userId,
        isNewUser: result.isNewUser,
      })

      setSubmissionComplete(true)
      toast.success('ส่งคำขอสินเชื่อเรียบร้อยแล้ว!')

      // Auto proceed after 2 seconds
      setTimeout(() => {
        // Redirect to products page if logged in, otherwise continue flow
        if (session?.user) {
          router.push('/customer/products')
        } else {
          onNext()
        }
      }, 2000)
    } catch (error) {
      console.error(
        '[PhoneVerification] Loan application submission failed:',
        error
      )
      toast.error(
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการส่งคำขอสินเชื่อ'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and limit to 10 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
    onUpdate({ phoneNumber: value })
  }

  const canConfirm = data.phoneNumber && data.phoneNumber.length === 10
  const isPinComplete = pinDigits.every((digit) => digit !== '')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            ยืนยันเบอร์โทรศัพท์
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {session?.user && !isAgentFlow ? (
            // Show logged-in customer info (only for customer flow)
            <div className="space-y-2">
              <Label>เบอร์โทรศัพท์ที่ลงทะเบียน</Label>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm font-medium">
                  {session.user.phoneNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  ใช้เบอร์โทรศัพท์ที่ลงทะเบียนไว้แล้ว
                </p>
              </div>
            </div>
          ) : (
            // Show phone input for non-logged users or agent flow
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                {isAgentFlow ? 'เบอร์โทรศัพท์ลูกค้า' : 'เบอร์โทรศัพท์'}
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="0812345678"
                value={data.phoneNumber || ''}
                onChange={handlePhoneNumberChange}
                disabled={pinVerified}
                maxLength={10}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {isAgentFlow 
                    ? 'เบอร์โทรศัพท์ลูกค้าที่จะใช้สำหรับเข้าสู่ระบบ'
                    : 'เบอร์โทรศัพท์นี้จะใช้สำหรับเข้าสู่ระบบและรับการแจ้งเตือน'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {data.phoneNumber?.length || 0}/10
                </p>
              </div>
              {data.phoneNumber && data.phoneNumber.length < 10 && (
                <p className="text-xs text-destructive">
                  เบอร์โทรศัพท์ต้องมี 10 หลัก
                </p>
              )}
            </div>
          )}

          {!pinVerified && (session?.user ? isAgentFlow : true) && (
            <Button
              onClick={handleConfirmPhone}
              disabled={!canConfirm}
              className="w-full">
              {isAgentFlow ? 'ยืนยันเบอร์โทรศัพท์ลูกค้า' : 'ยืนยันเบอร์โทรศัพท์'}
            </Button>
          )}

          {session?.user && !isAgentFlow && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                เข้าสู่ระบบแล้ว พร้อมส่งคำขอสินเชื่อ
              </p>
            </div>
          )}

          {pinVerified && !submissionComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                ยืนยันเบอร์โทรศัพท์และ PIN เรียบร้อยแล้ว
              </p>
            </div>
          )}

          {submissionComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                ส่งคำขอสินเชื่อเรียบร้อยแล้ว กำลังดำเนินการต่อ...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PIN Modal */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {isAgentFlow ? 'สร้าง PIN 4 หลักสำหรับลูกค้า' : 'สร้าง PIN 4 หลัก'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>PIN 4 หลัก (สำหรับเข้าสู่ระบบ)</Label>
              <div className="flex gap-3 justify-center">
                {pinDigits.map((digit, index) => (
                  <div key={index} className="relative">
                    <Input
                      ref={(el) => (pinInputRefs.current[index] = el)}
                      type={showPin ? 'text' : 'password'}
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold"
                      placeholder="•"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPin(!showPin)}
                  className="text-xs">
                  {showPin ? (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      ซ่อน PIN
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      แสดง PIN
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <h4 className="text-sm font-medium text-foreground mb-2">
                ข้อมูลสำคัญเกี่ยวกับ PIN
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• PIN จะใช้สำหรับเข้าสู่ระบบ</li>
                <li>• ไม่ควรใช้เลขที่เดาง่าย เช่น 1234, 0000</li>
                <li>• เก็บ PIN ไว้เป็นความลับ</li>
                <li>• สามารถเปลี่ยน PIN ได้ในภายหลัง</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPinModal(false)}
                className="flex-1">
                ยกเลิก
              </Button>
              <Button
                onClick={handlePinSubmit}
                disabled={!isPinComplete}
                className="flex-1">
                ยืนยัน PIN
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex-1 bg-transparent">
          ย้อนกลับ
        </Button>
        <Button
          onClick={submissionComplete ? onNext : handleSubmitLoanApplication}
          disabled={!pinVerified || isSubmitting}
          className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              กำลังส่งคำขอ...
            </>
          ) : submissionComplete ? (
            'เสร็จสิ้น'
          ) : (
            'ส่งคำขอสินเชื่อ'
          )}
        </Button>
      </div>
    </div>
  )
}
