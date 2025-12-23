'use client'

import { useCallback, useRef, useState } from 'react'

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
import { Input } from '@src/shared/ui/input'
import { Label } from '@src/shared/ui/label'
import { RadioGroup, RadioGroupItem } from '@src/shared/ui/radio-group'
import {
  Briefcase,
  CheckCircle,
  Copy,
  Delete,
  Eye,
  EyeOff,
  Phone,
  Shield,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import toast from 'react-hot-toast'

const PIN_LENGTH = 4

export function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [pin, setPin] = useState('')
  const [userType, setUserType] = useState<UserType>('AGENT')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPinScreen, setShowPinScreen] = useState(false)
  const [shake, setShake] = useState(false)

  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phoneNumber.length >= 12) {
      setShowPinScreen(true)
      setPin('')
      setError('')
    }
  }

  const handleNumberPress = useCallback(
    async (num: string) => {
      if (pin.length >= PIN_LENGTH || isLoading) return

      const newPin = pin + num
      setPin(newPin)
      setError('')

      // Auto-submit when PIN is complete
      if (newPin.length === PIN_LENGTH) {
        setIsLoading(true)
        try {
          const success = await login(phoneNumber, newPin, userType)
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
            setShake(true)
            setTimeout(() => setShake(false), 500)
            setError('เบอร์โทรศัพท์, PIN หรือประเภทผู้ใช้ไม่ถูกต้อง')
            setPin('')
          }
        } catch (err: any) {
          setShake(true)
          setTimeout(() => setShake(false), 500)
          if (err.message?.includes('Too many attempts')) {
            setError(err.message)
          } else {
            setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
          }
          setPin('')
        } finally {
          setIsLoading(false)
        }
      }
    },
    [pin, isLoading, login, phoneNumber, userType, router, searchParams]
  )

  const handleDelete = useCallback(() => {
    if (isLoading) return
    setPin((prev) => prev.slice(0, -1))
    setError('')
  }, [isLoading])

  const handleCancel = useCallback(() => {
    setShowPinScreen(false)
    setPin('')
    setError('')
  }, [])

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

  const keypadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete'],
  ]

  const letterMap: Record<string, string> = {
    '2': 'ABC',
    '3': 'DEF',
    '4': 'GHI',
    '5': 'JKL',
    '6': 'MNO',
    '7': 'PQRS',
    '8': 'TUV',
    '9': 'WXYZ',
  }

  return (
    <>
      {/* iOS-style PIN Entry Screen */}
      <AnimatePresence>
        {showPinScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-9999 isolate flex items-center justify-center overflow-hidden">
            {/* Background - transparent with blur to see content behind */}
            <div
              className="absolute inset-0 z-0 bg-black/70"
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-8">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-6">
                <Image
                  src="/images/logo.png"
                  alt="InfiniteX"
                  width={80}
                  height={80}
                  className="rounded-2xl shadow-lg"
                />
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-light text-white mb-8 tracking-wider">
                PIN ของคุณ
              </motion.h1>

              {/* PIN Dots */}
              <motion.div
                className="flex gap-4 mb-4"
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}>
                {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      backgroundColor:
                        i < pin.length
                          ? 'rgba(255, 255, 255, 1)'
                          : 'transparent',
                    }}
                    transition={{ delay: i * 0.05 }}
                    className="w-3.5 h-3.5 rounded-full border-2 border-white/80"
                  />
                ))}
              </motion.div>

              {/* Error Message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-red-300 text-sm mb-6 h-5 text-center">
                    {error}
                  </motion.p>
                )}
                {!error && <div className="h-5 mb-6" />}
              </AnimatePresence>

              {/* Keypad */}
              <div className="grid gap-y-4 mt-4">
                {keypadNumbers.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-6 justify-center">
                    {row.map((key) => {
                      if (key === '') {
                        return <div key="empty" className="w-20 h-20" />
                      }

                      if (key === 'delete') {
                        return (
                          <motion.button
                            key="delete"
                            whileTap={{ scale: 0.9 }}
                            onClick={handleDelete}
                            disabled={isLoading || pin.length === 0}
                            className="w-20 h-20 flex items-center justify-center text-white disabled:opacity-30">
                            <Delete className="w-7 h-7" />
                          </motion.button>
                        )
                      }

                      return (
                        <motion.button
                          key={key}
                          whileTap={{ scale: 0.95 }}
                          whileHover={{
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          }}
                          onClick={() => handleNumberPress(key)}
                          disabled={isLoading}
                          className="w-20 h-20 rounded-full flex flex-col items-center justify-center bg-white/10 border border-white/20 backdrop-blur-sm disabled:opacity-50 transition-colors">
                          <span className="text-3xl font-light text-white">
                            {key}
                          </span>
                          {letterMap[key] && (
                            <span className="text-[10px] font-medium text-white/70 tracking-[0.2em] mt-0.5">
                              {letterMap[key]}
                            </span>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </motion.div>
              )}

              {/* Bottom buttons */}
              <div className="flex justify-center w-full mt-12 px-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="text-white/80 text-base font-light tracking-wide disabled:opacity-50">
                  ยกเลิก
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
