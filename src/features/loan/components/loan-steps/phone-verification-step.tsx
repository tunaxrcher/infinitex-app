'use client'

import type React from 'react'
import { useRef, useState } from 'react'

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
import { Eye, EyeOff, Phone, Shield } from 'lucide-react'

interface PhoneVerificationStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
}

export function PhoneVerificationStep({
  data,
  onUpdate,
  onNext,
  onPrev,
}: PhoneVerificationStepProps) {
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinDigits, setPinDigits] = useState(['', '', '', ''])
  const [showPin, setShowPin] = useState(false)
  const [pinVerified, setPinVerified] = useState(false)

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

  const canConfirm = data.phoneNumber && data.phoneNumber.length >= 10
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
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="081-234-5678"
              value={data.phoneNumber || ''}
              onChange={(e) => onUpdate({ phoneNumber: e.target.value })}
              disabled={pinVerified}
            />
            <p className="text-xs text-muted-foreground">
              เบอร์โทรศัพท์นี้จะใช้สำหรับเข้าสู่ระบบและรับการแจ้งเตือน
            </p>
          </div>

          {!pinVerified && (
            <Button
              onClick={handleConfirmPhone}
              disabled={!canConfirm}
              className="w-full">
              ยืนยันเบอร์โทรศัพท์
            </Button>
          )}

          {pinVerified && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                ยืนยันเบอร์โทรศัพท์และ PIN เรียบร้อยแล้ว
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
              สร้าง PIN 4 หลัก
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
        <Button onClick={onNext} disabled={!pinVerified} className="flex-1">
          ขั้นตอนถัดไป
        </Button>
      </div>
    </div>
  )
}
