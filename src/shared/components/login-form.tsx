'use client'

import { useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { type UserType, useAuth } from '@src/shared/contexts/auth-context'
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
import { RadioGroup, RadioGroupItem } from '@src/shared/ui/radio-group'
import { Eye, EyeOff, Phone } from 'lucide-react'

export function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [userType, setUserType] = useState<UserType>('CUSTOMER')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPinModal, setShowPinModal] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.length >= 12) {
      setShowPinModal(true)
    }
  }

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(phoneNumber, pin, userType)
      if (success) {
        setShowPinModal(false)
        router.push('/')
      } else {
        setError('เบอร์โทรศัพท์, PIN หรือประเภทผู้ใช้ไม่ถูกต้อง')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  const closePinModal = () => {
    setShowPinModal(false)
    setPin('')
    setError('')
  }

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const cleaned = value.replace(/\D/g, '')

    // Limit to 10 digits
    const limited = cleaned.slice(0, 10)

    // Format as 0XX-XXX-XXXX
    if (limited.length >= 6) {
      return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`
    } else if (limited.length >= 3) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`
    }
    return limited
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPin(value)
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 via-background to-accent/20">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="w-20 h-10 mx-auto mb-4">
              <Image
                src="/images/logo.png"
                alt="InfiniteX Logo"
                width={80}
                height={80}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
              เข้าสู่ระบบ (Demo)
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              {/* Phone Number Input */}
              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08X-XXX-XXXX"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* User Type Selection */}
              <div className="space-y-3">
                <Label>ประเภทผู้ใช้</Label>
                <RadioGroup
                  value={userType}
                  onValueChange={(value) => setUserType(value as UserType)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CUSTOMER" id="customer" />
                    <Label htmlFor="customer" className="cursor-pointer">
                      ลูกค้า
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="AGENT" id="agent" />
                    <Label htmlFor="agent" className="cursor-pointer">
                      เอเจนต์
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <hr />

              {/* Demo Info */}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  สำหรับทดสอบระบบ:
                </p>
                <div className="text-xs space-y-1">
                  <p>
                    <strong>ลูกค้า:</strong> 081-234-5678 | PIN: 1234
                  </p>
                  <p>
                    <strong>เอเจนต์:</strong> 088-765-4321 | PIN: 1234
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={phoneNumber.length < 12}>
                ถัดไป
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* PIN Modal */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="w-[90vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">กรอก PIN</DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                ส่ง PIN 4 หลักไปยัง
              </p>
              <p className="font-medium text-foreground">{phoneNumber}</p>
            </div>

            {/* PIN Input */}
            <div className="space-y-2">
              <Label htmlFor="modal-pin">PIN (4 หลัก)</Label>
              <div className="relative">
                <Input
                  id="modal-pin"
                  type={showPin ? 'text' : 'password'}
                  placeholder="••••"
                  value={pin}
                  onChange={handlePinChange}
                  className="text-center text-lg tracking-widest pr-10"
                  maxLength={4}
                  autoFocus
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPin(!showPin)}>
                  {showPin ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closePinModal}
                className="flex-1 bg-transparent">
                ยกเลิก
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading || pin.length < 4}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </div>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
