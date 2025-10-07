'use client'

import { useState } from 'react'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

import { type UserType, useAuth } from '@src/shared/contexts/auth-context'
import { cn } from '@src/shared/lib/utils'
import { Button } from '@src/shared/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@src/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@src/shared/ui/dialog'
import { Input } from '@src/shared/ui/input'
import { Label } from '@src/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@src/shared/ui/radio-group'
import {
  Briefcase,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  Phone,
  Shield,
  Sparkles,
  UserRound,
} from 'lucide-react'
import toast from 'react-hot-toast'

export function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [userType, setUserType] = useState<UserType>('AGENT')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPinModal, setShowPinModal] = useState(false)

  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

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
        toast.success('เข้าสู่ระบบสำเร็จ!')

        // Redirect to intended page or homepage
        const redirectTo = searchParams.get('redirect')
        if (redirectTo) {
          router.push(redirectTo)
        } else {
          // Always redirect to homepage after login
          router.push('/')
        }
      } else {
        setError('เบอร์โทรศัพท์, PIN หรือประเภทผู้ใช้ไม่ถูกต้อง')
      }
    } catch (error: any) {
      // Better error handling based on error type
      if (error.message?.includes('Too many attempts')) {
        setError(error.message)
      } else {
        setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
      }
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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`คัดลอก${label}แล้ว: ${text}`)
    } catch (err) {
      toast.error('ไม่สามารถคัดลอกได้')
    }
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="w-24 h-12 mx-auto mb-4">
              <Image
                src="/images/logo.png"
                alt="InfiniteX Logo"
                width={100}
                height={100}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground ai-gradient-text">
              ยินดีต้อนรับ
            </h1>
            <p className="text-muted-foreground">
              เข้าสู่ระบบเพื่อดำเนินการต่อ (demo)
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
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
                    onValueChange={(value) => setUserType(value as UserType)}
                    className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem
                        value="CUSTOMER"
                        id="customer"
                        className="sr-only"
                      />
                      <Label
                        htmlFor="customer"
                        className={cn(
                          'relative flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors',
                          userType === 'CUSTOMER' &&
                            'border-primary bg-primary/5 text-primary'
                        )}>
                        <UserRound className="h-5 w-5" />
                        ลูกค้า
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="AGENT"
                        id="agent"
                        className="sr-only"
                      />
                      <Label
                        htmlFor="agent"
                        className={cn(
                          'relative flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors',
                          userType === 'AGENT' &&
                            'border-primary bg-primary/5 text-primary'
                        )}>
                        <Shield className="h-5 w-5" />
                        เอเจนต์
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <hr />

                {/* Demo Info */}
                <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-primary flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    ข้อมูลสำหรับทดสอบระบบ
                  </p>
                  <div className="">
                    <div className="flex items-center justify-between bg-background/50 rounded-lg py-0 pb-3">
                      <div className="text-sm">
                        <div className="font-medium text-foreground">
                          ลูกค้า
                        </div>
                        <div className="text-muted-foreground">
                          080-123-4567 | PIN: 1234
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                        onClick={() =>
                          copyToClipboard('080-123-4567', 'เบอร์ลูกค้า')
                        }>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between bg-background/50 rounded-lg py-0">
                      <div className="text-sm">
                        <div className="font-medium text-foreground">
                          เอเจนต์
                        </div>
                        <div className="text-muted-foreground">
                          089-123-4567 | PIN: 9999
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-primary/10"
                        onClick={() =>
                          copyToClipboard('089-123-4567', 'เบอร์เอเจนต์')
                        }>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
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
          <div className="text-center">
            <p className="text-xs text-gray-500">
              <a href="#" className="hover:underline">
                Terms of Use
              </a>
              {' | '}
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      <Dialog open={showPinModal} onOpenChange={setShowPinModal}>
        <DialogContent className="w-[90vw] max-w-md [&>button]:hidden">
          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div className="space-y-4 text-center">
              <div className="w-20 h-10 mx-auto">
                <Image
                  src="/images/logo.png"
                  alt="InfiniteX Logo"
                  width={100}
                  height={100}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <h2 className="text-lg font-semibold ai-gradient-text">กรอก PIN ของคุณ</h2>
              <hr />
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm text-muted-foreground">
                รหัส 4 หลักถูกส่งไปที่เบอร์ {phoneNumber}
              </p>
            </div>

            {/* PIN Input */}
            <div className="space-y-2">
              <Label htmlFor="modal-pin" className="sr-only">
                PIN (4 หลัก)
              </Label>
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
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || pin.length < 4}>
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </div>
              ) : (
                'ยืนยัน'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
