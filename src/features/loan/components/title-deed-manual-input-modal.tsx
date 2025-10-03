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
import { AlertTriangle } from 'lucide-react'

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
  onSkip: () => void
  onConfirm: (data: { pvCode: string; amCode: string; parcelNo: string }) => void
  initialData?: {
    pvCode?: string
    parcelNo?: string
  }
  provinces: Province[]
  amphurs: Amphur[]
}

export function TitleDeedManualInputModal({
  isOpen,
  onClose,
  onSkip,
  onConfirm,
  initialData,
  provinces,
  amphurs,
}: TitleDeedManualInputModalProps) {
  const [selectedProvince, setSelectedProvince] = useState<string>(initialData?.pvCode || '')
  const [selectedAmphur, setSelectedAmphur] = useState<string>('')
  const [parcelNumber, setParcelNumber] = useState<string>(initialData?.parcelNo || '')

  // Filter amphurs based on selected province
  const filteredAmphurs = amphurs.filter(amphur => 
    amphur.pvcode === selectedProvince && amphur.amcode !== '00'
  )

  // Reset amphur when province changes
  useEffect(() => {
    if (!initialData?.pvCode) {
      setSelectedAmphur('')
    }
  }, [selectedProvince, initialData?.pvCode])

  const handleConfirm = () => {
    if (!selectedProvince || !selectedAmphur || !parcelNumber.trim()) {
      return
    }

    onConfirm({
      pvCode: selectedProvince,
      amCode: selectedAmphur,
      parcelNo: parcelNumber.trim(),
    })
  }

  const canConfirm = selectedProvince && selectedAmphur && parcelNumber.trim()

  // Get province name for display
  const selectedProvinceName = provinces.find(p => p.pvcode === selectedProvince)?.pvnamethai || ''

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            ไม่พบข้อมูลโฉนดที่ดิน
          </DialogTitle>
          <DialogDescription>
            ระบบไม่สามารถอ่านข้อมูลจากโฉนดได้ กรุณากรอกข้อมูลด้วยตนเอง
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Province Select */}
          <div className="space-y-2">
            <Label htmlFor="province">จังหวัด *</Label>
            <Select
              value={selectedProvince}
              onValueChange={setSelectedProvince}
              disabled={!!initialData?.pvCode}>
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
          </div>

          {/* Amphur Select */}
          <div className="space-y-2">
            <Label htmlFor="amphur">อำเภอ *</Label>
            <Select
              value={selectedAmphur}
              onValueChange={setSelectedAmphur}
              disabled={!selectedProvince}>
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
            {!selectedProvince && (
              <p className="text-xs text-muted-foreground">
                กรุณาเลือกจังหวัดก่อน
              </p>
            )}
          </div>

          {/* Parcel Number Input */}
          <div className="space-y-2">
            <Label htmlFor="parcelNo">เลขโฉนด *</Label>
            <Input
              id="parcelNo"
              value={parcelNumber}
              onChange={(e) => setParcelNumber(e.target.value)}
              placeholder="กรอกเลขโฉนด"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1">
            ข้าม
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1">
            ยืนยัน
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
