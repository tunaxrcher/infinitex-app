'use client'

import { useRef, useState } from 'react'

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
  DialogDescription,
  DialogFooter,
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
  const [pinDigits, setPinDigits] = useState(['', '', '', ''])
  const [showPin, setShowPin] = useState(false)
  const [userType, setUserType] = useState<UserType>('AGENT')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPinDialog, setShowPinDialog] = useState(false)

  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([])

  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.length >= 12) {
      setShowPinDialog(true)
      // Focus first PIN input after a short delay
      setTimeout(() => {
        pinInputRefs.current[0]?.focus()
      }, 100)
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
      requestAnimationFrame(() => {
        const nextInput = pinInputRefs.current[index + 1]
        if (nextInput) {
          nextInput.focus()
          nextInput.select()
        }
      })
    }
  }

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      // Focus previous input on backspace
      requestAnimationFrame(() => {
        const prevInput = pinInputRefs.current[index - 1]
        if (prevInput) {
          prevInput.focus()
          prevInput.select()
        }
      })
    }
  }

  const handlePinPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain')
    const digits = pastedData.replace(/\D/g, '').slice(0, 4).split('')

    if (digits.length > 0) {
      const newPinDigits = [...pinDigits]
      digits.forEach((digit, i) => {
        if (i < 4) {
          newPinDigits[i] = digit
        }
      })
      setPinDigits(newPinDigits)

      // Focus the last filled input or the next empty one
      const focusIndex = Math.min(digits.length, 3)
      requestAnimationFrame(() => {
        pinInputRefs.current[focusIndex]?.focus()
      })
    }
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const pin = pinDigits.join('')
      const success = await login(phoneNumber, pin, userType)
      if (success) {
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
      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              กรอก PIN 4 หลัก
            </DialogTitle>
            <DialogDescription>
              กรุณากรอกรหัส PIN เพื่อเข้าสู่ระบบ
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLoginSubmit}>
            <div className="space-y-4 py-4">
              {/* PIN Input */}
              <div className="flex gap-3 justify-center">
                {pinDigits.map((digit, index) => (
                  <div key={index} className="relative">
                    <Input
                      ref={(el) => {
                        pinInputRefs.current[index] = el
                      }}
                      type={showPin ? 'text' : 'password'}
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinChange(index, e.target.value)}
                      onKeyDown={(e) => handlePinKeyDown(index, e)}
                      onPaste={index === 0 ? handlePinPaste : undefined}
                      className="w-12 h-12 text-center text-lg font-semibold"
                      placeholder="•"
                      autoComplete="off"
                    />
                  </div>
                ))}
              </div>

              {/* Show/Hide PIN Button */}
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

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex gap-2">
              {/* <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPinDialog(false)
                  setPinDigits(['', '', '', ''])
                  setError('')
                }}
                className="flex-1"
                disabled={isLoading}>
                ยกเลิก
              </Button> */}
              <Button
                type="submit"
                className="flex-1"
                disabled={pinDigits.some((d) => !d) || isLoading}>
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </div>
                ) : (
                  'ยืนยัน'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
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
              เข้าสู่ระบบเพื่อดำเนินการต่อ
            </p>
          </div>

          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Phone Number Input */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">เบอร์โทรศัพท์ (demo)</Label>
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
                            'relative flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer',
                            userType === 'CUSTOMER' &&
                              'border-primary bg-primary/5 text-primary'
                          )}>
                          {userType === 'CUSTOMER' && (
                            <CheckCircle className="absolute top-2 right-2 h-4 w-4" />
                          )}
                          <UserRound className="mb-3 h-6 w-6" />
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
                            'relative flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer',
                            userType === 'AGENT' &&
                              'border-primary bg-primary/5 text-primary'
                          )}>
                          {userType === 'AGENT' && (
                            <CheckCircle className="absolute top-2 right-2 h-4 w-4" />
                          )}
                          <Briefcase className="mb-3 h-6 w-6" />
                          เอเจนต์
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Demo Info */}
                  <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-semibold text-primary flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      ข้อมูลสำหรับทดสอบระบบ
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-background/50 rounded-lg p-3">
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
                      <div className="flex items-center justify-between bg-background/50 rounded-lg p-3">
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
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={phoneNumber.length < 12}>
              ถัดไป
            </Button>
          </form>
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
    </>
  )
}
