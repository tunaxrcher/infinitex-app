'use client'

import type React from 'react'
import { useState } from 'react'

import amphurData from '@src/data/amphur.json'
import provinceData from '@src/data/province.json'
import { loanApi } from '@src/features/loan/api'
import { cn } from '@src/shared/lib/utils'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/shared/ui/dialog'
import { Input } from '@src/shared/ui/input'
import { Label } from '@src/shared/ui/label'
import { Progress } from '@src/shared/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/shared/ui/select'
import {
  Camera,
  Check,
  Edit2,
  FileText,
  ImagePlus,
  Images,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

interface TitleDeedItem {
  id: string
  imageFile?: File
  imageUrl?: string
  imageKey?: string
  provinceName: string
  amphurName: string
  parcelNo: string
  landAreaRai: string
  landAreaNgan: string
  landAreaWa: string
  // For UI select only (not saved to DB)
  _provinceCode?: string
  _amphurCode?: string
}

interface TitleDeedMultipleStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
}

export function TitleDeedMultipleStep({
  data,
  onUpdate,
  onNext,
  onPrev,
  isFirstStep,
}: TitleDeedMultipleStepProps) {
  const [titleDeeds, setTitleDeeds] = useState<TitleDeedItem[]>(
    data.titleDeeds || []
  )
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingCount, setUploadingCount] = useState({ current: 0, total: 0 })
  const [editingDeed, setEditingDeed] = useState<TitleDeedItem | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Form state for editing
  const [formData, setFormData] = useState({
    provinceCode: '',
    amphurCode: '',
    parcelNo: '',
    landAreaRai: '',
    landAreaNgan: '',
    landAreaWa: '',
  })

  const filteredAmphurs = formData.provinceCode
    ? amphurData.filter((a) => a.pvcode === formData.provinceCode)
    : []

  // Upload multiple files at once
  const handleMultipleFilesUpload = async (files: File[]) => {
    if (files.length === 0) return

    try {
      setIsUploading(true)
      setUploadingCount({ current: 0, total: files.length })
      setUploadProgress(0)

      const newDeeds: TitleDeedItem[] = []
      let successCount = 0

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadingCount({ current: i + 1, total: files.length })
        setUploadProgress(((i + 1) / files.length) * 100)

        try {
          console.log(`[TitleDeedMultiple] Uploading file ${i + 1}/${files.length}:`, file.name)

          const result = await loanApi.uploadSupportingImage(file)

          if (result.success && result.images && result.images.length > 0) {
            const uploadedImage = result.images[0]

            newDeeds.push({
              id: crypto.randomUUID(),
              imageFile: file,
              imageUrl: uploadedImage.imageUrl,
              imageKey: uploadedImage.imageKey,
              provinceName: '',
              amphurName: '',
              parcelNo: '',
              landAreaRai: '',
              landAreaNgan: '',
              landAreaWa: '',
              _provinceCode: '',
              _amphurCode: '',
            })
            successCount++
          }
        } catch (error) {
          console.error(`[TitleDeedMultiple] Failed to upload ${file.name}:`, error)
        }
      }

      if (newDeeds.length > 0) {
        const updatedDeeds = [...titleDeeds, ...newDeeds]
        setTitleDeeds(updatedDeeds)
        onUpdate({ titleDeeds: updatedDeeds })
        toast.success(`อัพโหลดสำเร็จ ${successCount}/${files.length} ไฟล์`)
      } else {
        toast.error('ไม่สามารถอัพโหลดไฟล์ได้')
      }
    } catch (error) {
      console.error('[TitleDeedMultiple] Upload failed:', error)
      toast.error('เกิดข้อผิดพลาดในการอัพโหลด')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setUploadingCount({ current: 0, total: 0 })
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files)
      console.log(`[TitleDeedMultiple] ${filesArray.length} files selected`)
      handleMultipleFilesUpload(filesArray)
      // Reset input value to allow selecting same files again
      e.target.value = ''
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files)
      handleMultipleFilesUpload(filesArray)
    }
  }

  const handleEditDeed = (deed: TitleDeedItem) => {
    setEditingDeed(deed)
    setFormData({
      provinceCode: deed._provinceCode || '',
      amphurCode: deed._amphurCode || '',
      parcelNo: deed.parcelNo,
      landAreaRai: deed.landAreaRai,
      landAreaNgan: deed.landAreaNgan,
      landAreaWa: deed.landAreaWa,
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (!editingDeed) return

    // Validate required fields
    if (!formData.provinceCode || !formData.amphurCode || !formData.parcelNo) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น (จังหวัด, อำเภอ, เลขที่โฉนด)')
      return
    }

    // Get province and amphur names
    const province = provinceData.find((p) => p.pvcode === formData.provinceCode)
    const amphur = amphurData.find(
      (a) =>
        a.pvcode === formData.provinceCode && a.amcode === formData.amphurCode
    )

    const updatedDeed: TitleDeedItem = {
      ...editingDeed,
      provinceName: province?.pvnamethai || '',
      amphurName: amphur?.amnamethai || '',
      parcelNo: formData.parcelNo,
      landAreaRai: formData.landAreaRai,
      landAreaNgan: formData.landAreaNgan,
      landAreaWa: formData.landAreaWa,
      // Keep codes for UI select
      _provinceCode: formData.provinceCode,
      _amphurCode: formData.amphurCode,
    }

    const updatedDeeds = titleDeeds.map((d) =>
      d.id === editingDeed.id ? updatedDeed : d
    )
    setTitleDeeds(updatedDeeds)
    onUpdate({ titleDeeds: updatedDeeds })

    setShowEditModal(false)
    setEditingDeed(null)
    toast.success('บันทึกข้อมูลโฉนดสำเร็จ')
  }

  const handleDeleteDeed = (id: string) => {
    const updatedDeeds = titleDeeds.filter((d) => d.id !== id)
    setTitleDeeds(updatedDeeds)
    onUpdate({ titleDeeds: updatedDeeds })
    toast.info('ลบโฉนดสำเร็จ')
  }

  const handleNextStep = () => {
    // Validate all deeds have required info
    const invalidDeeds = titleDeeds.filter(
      (d) => !d.provinceName || !d.amphurName || !d.parcelNo
    )

    if (invalidDeeds.length > 0) {
      toast.error(`กรุณากรอกข้อมูลโฉนดให้ครบทุกใบ (เหลืออีก ${invalidDeeds.length} ใบ)`)
      return
    }

    if (titleDeeds.length === 0) {
      toast.error('กรุณาอัพโหลดโฉนดอย่างน้อย 1 ใบ')
      return
    }

    onNext()
  }

  const completedDeeds = titleDeeds.filter(
    (d) => d.provinceName && d.amphurName && d.parcelNo
  ).length
  const canProceed = titleDeeds.length > 0 && completedDeeds === titleDeeds.length

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            อัพโหลดโฉนดที่ดิน (หลายใบ)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            เลือกรูปโฉนดได้หลายใบพร้อมกัน แล้วค่อยกรอกข้อมูลทีหลัง
          </div>

          {/* Upload Area */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
              isUploading
                ? 'border-primary/50 bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}>
            
            {isUploading ? (
              // Upload Progress
              <div className="space-y-3">
                <Loader2 className="h-8 w-8 text-primary mx-auto animate-spin" />
                <p className="text-sm font-medium text-foreground">
                  กำลังอัพโหลด {uploadingCount.current}/{uploadingCount.total} ไฟล์...
                </p>
                <Progress value={uploadProgress} className="h-2 max-w-xs mx-auto" />
              </div>
            ) : (
              // Upload UI
              <>
                <Images className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium text-foreground mb-1">
                  เลือกรูปโฉนดหลายใบพร้อมกัน
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  ลากไฟล์มาวาง หรือคลิกเพื่อเลือกจากเครื่อง
                </p>

                <div className="flex gap-2 justify-center">
                  <label
                    className={cn(
                      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                      'bg-primary text-primary-foreground shadow hover:bg-primary/90',
                      'h-10 px-6 py-2 cursor-pointer'
                    )}>
                    <ImagePlus className="h-4 w-4" />
                    เลือกรูปโฉนด
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={handleFileInput}
                      disabled={isUploading}
                    />
                  </label>
                  <label
                    className={cn(
                      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                      'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
                      'h-10 px-4 py-2 cursor-pointer'
                    )}>
                    <Camera className="h-4 w-4" />
                    ถ่ายรูป
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="sr-only"
                      onChange={handleFileInput}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Title Deeds List */}
      {titleDeeds.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                รายการโฉนด ({titleDeeds.length} ใบ)
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                กรอกข้อมูลแล้ว {completedDeeds}/{titleDeeds.length}
              </div>
            </div>
            {titleDeeds.length > 0 && completedDeeds < titleDeeds.length && (
              <p className="text-xs text-amber-600 mt-1">
                กรุณากดแก้ไขเพื่อกรอกข้อมูลโฉนดที่ยังไม่ครบ
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {titleDeeds.map((deed, index) => (
              <div
                key={deed.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                  deed.provinceName && deed.amphurName && deed.parcelNo
                    ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                    : 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900'
                )}>
                {/* Thumbnail */}
                <div className="w-14 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                  {deed.imageUrl && (
                    <img
                      src={deed.imageUrl}
                      alt={`โฉนด ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {deed.provinceName && deed.amphurName && deed.parcelNo && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium">
                      โฉนดที่ {index + 1}
                    </span>
                  </div>

                  {deed.provinceName && deed.amphurName && deed.parcelNo ? (
                    <div className="text-xs text-muted-foreground">
                      <div>จ.{deed.provinceName} อ.{deed.amphurName}</div>
                      <div>เลขที่ {deed.parcelNo}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 font-medium">
                      รอกรอกข้อมูล
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant={deed.provinceName && deed.amphurName && deed.parcelNo ? 'ghost' : 'default'}
                    size="sm"
                    className={cn(
                      'h-8',
                      !(deed.provinceName && deed.amphurName && deed.parcelNo) && 'animate-pulse'
                    )}
                    onClick={() => handleEditDeed(deed)}>
                    <Edit2 className="h-4 w-4 mr-1" />
                    {deed.provinceName && deed.amphurName && deed.parcelNo ? 'แก้ไข' : 'กรอกข้อมูล'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDeleteDeed(deed.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Add more button */}
            <label
              className={cn(
                'flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed',
                'text-sm text-muted-foreground hover:text-foreground hover:border-primary/50',
                'cursor-pointer transition-colors'
              )}>
              <Plus className="h-4 w-4" />
              เพิ่มโฉนดเพิ่มเติม
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handleFileInput}
                disabled={isUploading}
              />
            </label>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {!isFirstStep && (
          <Button
            variant="outline"
            onClick={onPrev}
            className="flex-1 bg-transparent">
            ย้อนกลับ
          </Button>
        )}
        <Button 
          onClick={handleNextStep} 
          disabled={!canProceed || isUploading} 
          className="flex-1">
          {titleDeeds.length > 0 && completedDeeds < titleDeeds.length
            ? `กรอกข้อมูลอีก ${titleDeeds.length - completedDeeds} ใบ`
            : 'ถัดไป'}
        </Button>
      </div>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              ข้อมูลโฉนดที่ดิน
            </DialogTitle>
          </DialogHeader>

          {/* Preview Image in Modal */}
          {editingDeed?.imageUrl && (
            <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
              <img
                src={editingDeed.imageUrl}
                alt="โฉนด"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          <div className="space-y-4">
            {/* Province Select */}
            <div className="space-y-2">
              <Label>
                จังหวัด <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.provinceCode}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    provinceCode: value,
                    amphurCode: '',
                  })
                }}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกจังหวัด" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {provinceData.map((province) => (
                    <SelectItem key={province.pvcode} value={province.pvcode}>
                      {province.pvnamethai}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amphur Select */}
            <div className="space-y-2">
              <Label>
                อำเภอ/เขต <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.amphurCode}
                onValueChange={(value) =>
                  setFormData({ ...formData, amphurCode: value })
                }
                disabled={!formData.provinceCode}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      formData.provinceCode
                        ? 'เลือกอำเภอ/เขต'
                        : 'กรุณาเลือกจังหวัดก่อน'
                    }
                  />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {filteredAmphurs.map((amphur) => (
                    <SelectItem key={amphur.amcode} value={amphur.amcode}>
                      {amphur.amnamethai}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parcel No */}
            <div className="space-y-2">
              <Label>
                เลขที่โฉนด <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="เช่น 12345"
                value={formData.parcelNo}
                onChange={(e) =>
                  setFormData({ ...formData, parcelNo: e.target.value })
                }
              />
            </div>

            {/* Land Area - 3 inputs */}
            <div className="space-y-2">
              <Label>เนื้อที่</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.landAreaRai}
                      onChange={(e) =>
                        setFormData({ ...formData, landAreaRai: e.target.value })
                      }
                      className="pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ไร่
                    </span>
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="3"
                      placeholder="0"
                      value={formData.landAreaNgan}
                      onChange={(e) =>
                        setFormData({ ...formData, landAreaNgan: e.target.value })
                      }
                      className="pr-10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      งาน
                    </span>
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      max="99"
                      step="0.01"
                      placeholder="0"
                      value={formData.landAreaWa}
                      onChange={(e) =>
                        setFormData({ ...formData, landAreaWa: e.target.value })
                      }
                      className="pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ตร.ว.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditModal(false)
                setEditingDeed(null)
              }}>
              ยกเลิก
            </Button>
            <Button onClick={handleSaveEdit}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
