'use client'

import type React from 'react'
import { useEffect, useState } from 'react'

import { Button } from '@src/shared/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/shared/ui/select'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface Province {
  pvcode: string
  pvnamethai: string
  pvnameeng: string
}

interface Amphur {
  pvcode: string
  amcode: string
  amnamethai: string
  amnameeng: string
}

interface TitleDeedManualInputModalProps {
  isOpen: boolean
  onClose: () => void
  onSkip: (formData?: { pvCode: string; amCode: string; parcelNo: string }) => void
  onConfirm: (data: { pvCode: string; amCode: string; parcelNo: string }) => Promise<void>
  initialData?: {
    pvCode?: string
    amCode?: string
    parcelNo?: string
  }
  errorMessage?: string
  provinces: Province[]
  amphurs: Amphur[]
}

export function TitleDeedManualInputModal({
  isOpen,
  onClose,
  onSkip,
  onConfirm,
  initialData,
  errorMessage,
  provinces,
  amphurs,
}: TitleDeedManualInputModalProps) {
  const [selectedProvince, setSelectedProvince] = useState<string>(initialData?.pvCode || '')
  const [selectedAmphur, setSelectedAmphur] = useState<string>(initialData?.amCode || '')
  const [parcelNumber, setParcelNumber] = useState<string>(initialData?.parcelNo || '')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Filter amphurs based on selected province
  const filteredAmphurs = amphurs.filter(amphur => 
    amphur.pvcode === selectedProvince && amphur.amcode !== '00'
  )

  // Reset amphur when province changes (but not if we have initial amCode)
  useEffect(() => {
    if (!initialData?.pvCode || !initialData?.amCode) {
      setSelectedAmphur('')
    }
  }, [selectedProvince, initialData?.pvCode, initialData?.amCode])

  const handleConfirm = async () => {
    if (!selectedProvince || !selectedAmphur || !parcelNumber.trim()) {
      return
    }

    setIsLoading(true)
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('การค้นหาข้อมูลใช้เวลานานเกินไป')), 30000)
      )

      await Promise.race([
        onConfirm({
          pvCode: selectedProvince,
          amCode: selectedAmphur,
          parcelNo: parcelNumber.trim(),
        }),
        timeoutPromise
      ])
    } catch (error) {
      console.error('[Modal] Confirm failed:', error)
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    // Send current form data if any fields are filled
    if (selectedProvince || selectedAmphur || parcelNumber.trim()) {
      onSkip({
        pvCode: selectedProvince,
        amCode: selectedAmphur,
        parcelNo: parcelNumber.trim(),
      })
    } else {
      onSkip()
    }
  }

  const canConfirm = selectedProvince && selectedAmphur && parcelNumber.trim() && !isLoading

  // Get province name for display
  const selectedProvinceName = provinces.find(p => p.pvcode === selectedProvince)?.pvnamethai || ''

  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
      <DialogContent className="sm:max-w-md">        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
            <div className="flex flex-col items-center gap-3 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium">กำลังค้นหาข้อมูลโฉนด</p>
                <p className="text-xs text-muted-foreground">
                  กำลังเชื่อมต่อกับระบบกรมที่ดิน กรุณารอสักครู่...
                </p>
                <div className="text-xs text-muted-foreground mt-2 space-y-1">
                  <p>จังหวัด: {selectedProvinceName}</p>
                  <p>อำเภอ: {filteredAmphurs.find(a => a.amcode === selectedAmphur)?.amnamethai}</p>
                  <p>เลขโฉนด: {parcelNumber}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            ไม่พบข้อมูลโฉนดที่ดิน
          </DialogTitle>
          <DialogDescription>
            {isLoading 
              ? 'กำลังค้นหาข้อมูลโฉนดจากระบบกรมที่ดิน กรุณารอสักครู่...'
              : errorMessage || 'ระบบไม่สามารถอ่านข้อมูลจากโฉนดได้ กรุณากรอกข้อมูลด้วยตนเอง'
            }
          </DialogDescription>
        </DialogHeader>

        <div className={`space-y-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Province Select - Always shown first */}
          <div className="space-y-2">
            <Label htmlFor="province">จังหวัด *</Label>
            <Select
              value={selectedProvince}
              onValueChange={setSelectedProvince}
              disabled={!!initialData?.pvCode || isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกจังหวัด" />
              </SelectTrigger>
              <SelectContent>
                {provinces
                  .filter(province => province.pvcode !== '00')
                  .map((province) => (
                    <SelectItem key={province.pvcode} value={province.pvcode}>
                      {province.pvnamethai}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {initialData?.pvCode && (
              <p className="text-xs text-muted-foreground">
                จังหวัดถูกเลือกอัตโนมัติจากการวิเคราะห์รูป: {selectedProvinceName}
              </p>
            )}
            {!selectedProvince && !initialData?.pvCode && !isLoading && (
              <p className="text-xs text-muted-foreground">
                กรุณาเลือกจังหวัดเพื่อดำเนินการต่อ
              </p>
            )}
          </div>

          {/* Amphur Select - Show only after province is selected */}
          {selectedProvince && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <Label htmlFor="amphur">
                อำเภอ * 
                {filteredAmphurs.length > 0 && (
                  <span className="text-xs text-muted-foreground font-normal">
                    ({filteredAmphurs.length} อำเภอ)
                  </span>
                )}
              </Label>
              <Select
                value={selectedAmphur}
                onValueChange={setSelectedAmphur}
                disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกอำเภอ" />
                </SelectTrigger>
                <SelectContent>
                  {filteredAmphurs.map((amphur) => (
                    <SelectItem key={amphur.amcode} value={amphur.amcode}>
                      {amphur.amnamethai}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {initialData?.amCode && selectedAmphur === initialData.amCode && (
                <p className="text-xs text-muted-foreground">
                  อำเภอถูกเลือกอัตโนมัติจากการวิเคราะห์รูป: {filteredAmphurs.find(a => a.amcode === selectedAmphur)?.amnamethai}
                </p>
              )}
              {filteredAmphurs.length === 0 && (
                <p className="text-xs text-amber-600">
                  ไม่พบข้อมูลอำเภอในจังหวัดนี้
                </p>
              )}
              {!selectedAmphur && filteredAmphurs.length > 0 && !isLoading && (
                <p className="text-xs text-muted-foreground">
                  กรุณาเลือกอำเภอ
                </p>
              )}
            </div>
          )}

          {/* Parcel Number Input - Show only after amphur is selected */}
          {selectedProvince && selectedAmphur && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <Label htmlFor="parcelNo">เลขโฉนด *</Label>
              <Input
                id="parcelNo"
                value={parcelNumber}
                onChange={(e) => setParcelNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canConfirm) {
                    handleConfirm()
                  }
                }}
                placeholder="กรอกเลขโฉนด"
                disabled={isLoading}
                autoFocus
              />
              {initialData?.parcelNo && parcelNumber === initialData.parcelNo && (
                <p className="text-xs text-muted-foreground">
                  เลขโฉนดจากการวิเคราะห์รูป: {parcelNumber}
                </p>
              )}
              {!parcelNumber.trim() && !isLoading && (
                <p className="text-xs text-muted-foreground">
                  กรอกเลขโฉนดเพื่อค้นหาข้อมูล
                </p>
              )}
            </div>
          )}

          {/* Summary - Show when all fields are filled */}
          {selectedProvince && selectedAmphur && parcelNumber.trim() && !isLoading && (
            <div className="bg-muted/50 rounded-lg p-3 animate-in slide-in-from-top-2 duration-300">
              <p className="text-sm font-medium mb-2">ข้อมูลที่จะค้นหา:</p>
              <div className="text-xs space-y-1">
                <p>จังหวัด: {selectedProvinceName}</p>
                <p>อำเภอ: {filteredAmphurs.find(a => a.amcode === selectedAmphur)?.amnamethai}</p>
                <p>เลขโฉนด: {parcelNumber}</p>
              </div>
            </div>
          )}

          {/* Loading state message */}
          {isLoading && (
            <div className="text-center py-2">
              <p className="text-xs text-primary font-medium">
                กำลังประมวลผล กรุณาอย่าปิดหน้าต่างนี้
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
            className="flex-1">
            ข้าม
          </Button>
          
          {/* Show confirm button only when all fields are filled */}
          {selectedProvince && selectedAmphur && parcelNumber.trim() && (
            <Button
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="flex-1 animate-in slide-in-from-right-2 duration-300">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  กำลังค้นหา...
                </>
              ) : (
                'ยืนยัน'
              )}
            </Button>
          )}
          
          {/* Show helper text when not all fields are filled */}
          {(!selectedProvince || !selectedAmphur || !parcelNumber.trim()) && !isLoading && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-muted-foreground text-center">
                {!selectedProvince 
                  ? 'เลือกจังหวัดเพื่อดำเนินการต่อ'
                  : !selectedAmphur 
                  ? 'เลือกอำเภอเพื่อดำเนินการต่อ'
                  : 'กรอกเลขโฉนดเพื่อค้นหาข้อมูล'
                }
              </p>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
