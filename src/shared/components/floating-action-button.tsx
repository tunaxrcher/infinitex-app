'use client'

import { useState } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { cn } from '@src/shared/lib/utils'
import { Button } from '@src/shared/ui/button'
import {
  Dialog,
  DialogContent,
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
import { FileText, Files, MapPin, Plus, Sparkles, PenLine } from 'lucide-react'

type DeedMode = 'single' | 'multiple'

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
  const [deedMode, setDeedMode] = useState<DeedMode>('single')

  const handleConfirm = () => {
    // Store data in sessionStorage to pass to apply page
    sessionStorage.setItem(
      'loanApplicationData',
      JSON.stringify({
        ownerName: ownerNameInput.trim() || undefined,
        loanType: loanTypeInput,
        deedMode: deedMode,
      })
    )
    setShowDialog(false)
    router.push(href)
  }

  const handleSkip = () => {
    // Store only loan type and deed mode
    sessionStorage.setItem(
      'loanApplicationData',
      JSON.stringify({
        loanType: loanTypeInput,
        deedMode: deedMode,
      })
    )
    setShowDialog(false)
    router.push(href)
  }

  const handleOpenDialog = () => {
    // Reset state when opening dialog
    setOwnerNameInput('')
    setDeedMode('single')
    setShowDialog(true)
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

            {/* Deed Mode Selection - Only show for HOUSE_LAND_MORTGAGE */}
            {loanTypeInput === 'HOUSE_LAND_MORTGAGE' && (
              <div className="space-y-2">
                <Label>รูปแบบการยื่นโฉนด *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Single Deed Card */}
                  <button
                    type="button"
                    onClick={() => setDeedMode('single')}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                      'hover:border-primary/50 hover:bg-primary/5',
                      deedMode === 'single'
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-card'
                    )}>
                    {deedMode === 'single' && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground text-xs">✓</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        deedMode === 'single'
                          ? 'bg-primary/20'
                          : 'bg-muted'
                      )}>
                      <FileText
                        className={cn(
                          'h-6 w-6',
                          deedMode === 'single'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <div className="text-center">
                      <p
                        className={cn(
                          'font-medium text-sm',
                          deedMode === 'single'
                            ? 'text-primary'
                            : 'text-foreground'
                        )}>
                        โฉนดเดี่ยว
                      </p>
                      <p className="text-xs text-muted-foreground">(1 ใบ)</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3" />
                      <span>AI วิเคราะห์รูป</span>
                    </div>
                  </button>

                  {/* Multiple Deeds Card */}
                  <button
                    type="button"
                    onClick={() => setDeedMode('multiple')}
                    className={cn(
                      'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                      'hover:border-primary/50 hover:bg-primary/5',
                      deedMode === 'multiple'
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-card'
                    )}>
                    {deedMode === 'multiple' && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground text-xs">✓</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center',
                        deedMode === 'multiple'
                          ? 'bg-primary/20'
                          : 'bg-muted'
                      )}>
                      <Files
                        className={cn(
                          'h-6 w-6',
                          deedMode === 'multiple'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        )}
                      />
                    </div>
                    <div className="text-center">
                      <p
                        className={cn(
                          'font-medium text-sm',
                          deedMode === 'multiple'
                            ? 'text-primary'
                            : 'text-foreground'
                        )}>
                        โฉนดชุด
                      </p>
                      <p className="text-xs text-muted-foreground">(หลายใบ)</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <PenLine className="h-3 w-3" />
                      <span>กรอกข้อมูลเอง</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

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
          onClick={handleOpenDialog}
          className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-shadow bg-primary hover:bg-primary/90">
          <Plus className="h-6 w-6" />
          <span className="sr-only">ขอสินเชื่อเพิ่ม</span>
        </Button>
      </div>
    </>
  )
}
