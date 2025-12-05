'use client'

import { useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

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
import { Briefcase, MapPin, Plus } from 'lucide-react'

interface FloatingActionButtonProps {
  href?: string
}

export function FloatingActionButton({
  href = '/apply',
}: FloatingActionButtonProps) {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [ownerNameInput, setOwnerNameInput] = useState('')
  const [loanTypeInput, setLoanTypeInput] = useState('HOUSE_LAND_MORTGAGE')

  const handleConfirm = () => {
    // Store data in sessionStorage to pass to apply page
    sessionStorage.setItem(
      'loanApplicationData',
      JSON.stringify({
        ownerName: ownerNameInput.trim() || undefined,
        loanType: loanTypeInput,
      })
    )
    setShowDialog(false)
    router.push(href)
  }

  const handleSkip = () => {
    // Store only loan type
    sessionStorage.setItem(
      'loanApplicationData',
      JSON.stringify({
        loanType: loanTypeInput,
      })
    )
    setShowDialog(false)
    router.push(href)
  }

  return (
    <>
      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center gap-4 pb-4">
            <div className="flex justify-center">
              <Image
                src="/images/logo.png"
                alt="Logo"
                width={120}
                height={40}
                className="object-contain"
              />
            </div>
            <DialogTitle className="text-center text-xl gradientText">
              ขอสินเชื่อ
            </DialogTitle>
            {/* <DialogDescription>
          กรุณาเลือกประเภทสินเชื่อและระบุชื่อสถานที่ (ถ้ามี)
          </DialogDescription> */}
            <hr className="w-full border-border" />
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Loan Type Select */}
            <div className="space-y-2">
              <Label htmlFor="loanType">ประเภทสินเชื่อ *</Label>
              <Select value={loanTypeInput} onValueChange={setLoanTypeInput}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทสินเชื่อ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOUSE_LAND_MORTGAGE">
                    สินเชื่อจำนองบ้านและโฉนดที่ดิน
                  </SelectItem>
                  <SelectItem value="CAR_REGISTRATION" disabled>
                    สินเชื่อทะเบียนรถ (เร็วๆ นี้)
                  </SelectItem>
                  <SelectItem value="FINX_PLUS" disabled>
                    สินเชื่อ FinX พลัส (เร็วๆ นี้)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <hr />
            {/* Owner Name Input */}
            <div className="space-y-2">
              <Label htmlFor="ownerName">
                ชื่อสถานที่ / เจ้าของที่ดิน{' '}
                <span className="text-muted-foreground">(ถ้ามี)</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ownerName"
                  placeholder="เช่น นายสมชาย ใจดี, บ้านสวนผึ้ง, งานไถ่"
                  value={ownerNameInput}
                  onChange={(e) => setOwnerNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleConfirm()
                    }
                  }}
                  className="pl-10"
                />
              </div>
              {/* <p className="text-xs text-muted-foreground">
                ข้อมูลนี้จะช่วยในการระบุและจัดการคำขอสินเชื่อ
              </p> */}
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="flex-1">
              ข้าม
            </Button>
            <Button type="button" onClick={handleConfirm} className="flex-1">
              ยืนยัน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Button */}
      <div className="fixed bottom-24 right-4 z-40">
        <Button
          size="lg"
          onClick={() => setShowDialog(true)}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90">
          <Plus className="h-6 w-6" />
          <span className="sr-only">ขอสินเชื่อเพิ่ม</span>
        </Button>
      </div>
    </>
  )
}
