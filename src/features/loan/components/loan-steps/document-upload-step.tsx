'use client'

import type React from 'react'
import { useState } from 'react'

import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { Input } from '@src/shared/ui/input'
import { Label } from '@src/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/shared/ui/select'
import { Camera, FileText, Upload, X } from 'lucide-react'

interface DocumentUploadStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
}

export function DocumentUploadStep({
  data,
  onUpdate,
  onNext,
  onPrev,
  isFirstStep,
}: DocumentUploadStepProps) {
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files)
      onUpdate({ propertyImages: [...data.propertyImages, ...files] })
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      onUpdate({ propertyImages: [...data.propertyImages, ...files] })
    }
  }

  const removeImage = (index: number) => {
    const newImages = data.propertyImages.filter(
      (_: any, i: number) => i !== index
    )
    onUpdate({ propertyImages: newImages })
  }

  const canProceed =
    data.propertyImages.length > 0 && data.loanAmount > 0 && data.propertyType

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            อัพโหลดเอกสารโฉนดที่ดิน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}>
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground mb-1">
              ลากไฟล์มาวางที่นี่
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              หรือเลือกไฟล์จากเครื่อง
            </p>

            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" asChild>
                <label className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  เลือกไฟล์
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </label>
              </Button>
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                ถ่ายรูป
              </Button>
            </div>
          </div>

          {/* Uploaded Images */}
          {data.propertyImages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                ไฟล์ที่อัพโหลด ({data.propertyImages.length})
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {data.propertyImages.map((file: File, index: number) => (
                  <div key={index} className="relative bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-foreground truncate">
                        {file.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-1 -right-1 h-6 w-6 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => removeImage(index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loan Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">รายละเอียดสินเชื่อ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="propertyType">ประเภทหลักทรัพย์</Label>
            <Select
              value={data.propertyType}
              onValueChange={(value) => onUpdate({ propertyType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภทหลักทรัพย์" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="house">บ้านเดี่ยว</SelectItem>
                <SelectItem value="condo">คอนโดมิเนียม</SelectItem>
                <SelectItem value="land">ที่ดินเปล่า</SelectItem>
                <SelectItem value="townhouse">ทาวน์เฮาส์</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyValue">มูลค่าประเมินหลักทรัพย์ (บาท)</Label>
            <Input
              id="propertyValue"
              type="number"
              placeholder="0"
              value={data.propertyValue || ''}
              onChange={(e) =>
                onUpdate({ propertyValue: Number(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="loanAmount">วงเงินที่ต้องการ (บาท)</Label>
            <Input
              id="loanAmount"
              type="number"
              placeholder="0"
              value={data.loanAmount || ''}
              onChange={(e) => onUpdate({ loanAmount: Number(e.target.value) })}
            />
            {data.propertyValue > 0 && data.loanAmount > 0 && (
              <p className="text-xs text-muted-foreground">
                อัตราส่วนสินเชื่อ:{' '}
                {((data.loanAmount / data.propertyValue) * 100).toFixed(1)}%
              </p>
            )}
          </div>
        </CardContent>
      </Card>

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
        <Button onClick={onNext} disabled={!canProceed} className="flex-1">
          ถัดไป
        </Button>
      </div>
    </div>
  )
}
