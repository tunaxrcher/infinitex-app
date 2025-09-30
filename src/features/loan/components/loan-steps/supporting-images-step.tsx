'use client'

import type React from 'react'
import { useState } from 'react'

import { Alert, AlertDescription } from '@src/shared/ui/alert'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { Label } from '@src/shared/ui/label'
import {
  Camera,
  CheckCircle,
  FileText,
  ImageIcon,
  Upload,
  X,
} from 'lucide-react'

interface SupportingImagesStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
}

export function SupportingImagesStep({
  data,
  onUpdate,
  onNext,
  onPrev,
}: SupportingImagesStepProps) {
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

    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files)
      onUpdate({ supportingImages: [...data.supportingImages, ...files] })
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      onUpdate({ supportingImages: [...data.supportingImages, ...files] })
    }
  }

  const removeImage = (index: number) => {
    const newImages = data.supportingImages.filter(
      (_: any, i: number) => i !== index
    )
    onUpdate({ supportingImages: newImages })
  }

  const canProceed = true // This step is optional, can always proceed

  return (
    <div className="space-y-6">
      {data.titleDeedData && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">ข้อมูลจากโฉนดที่ดิน:</p>
              <p className="text-sm">
                ชื่อเจ้าของ: {data.titleDeedData.ownerName}
              </p>
              <p className="text-sm">
                เลขที่ดิน: {data.titleDeedData.landNumber}
              </p>
              <p className="text-sm">เนื้อที่: {data.titleDeedData.area}</p>
              <p className="text-sm">ที่ตั้ง: {data.titleDeedData.location}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            อัพโหลดภาพประกอบ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            อัพโหลดภาพประกอบเพิ่มเติม เช่น ภาพถ่ายที่ดิน ภาพบ้าน หรือเอกสารอื่นๆ
            (ไม่บังคับ)
          </p>

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
              หรือเลือกไฟล์จากเครื่อง (สามารถเลือกหลายไฟล์)
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
          {data.supportingImages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                ไฟล์ที่อัพโหลด ({data.supportingImages.length})
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {data.supportingImages.map((file: File, index: number) => (
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

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex-1 bg-transparent">
          ย้อนกลับ
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="flex-1">
          ถัดไป
        </Button>
      </div>
    </div>
  )
}
