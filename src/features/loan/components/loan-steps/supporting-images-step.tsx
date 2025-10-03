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
      const currentImages = data.supportingImages || []
      onUpdate({ supportingImages: [...currentImages, ...files] })
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      const currentImages = data.supportingImages || []
      onUpdate({ supportingImages: [...currentImages, ...files] })
    }
  }

  const removeImage = (index: number) => {
    const currentImages = data.supportingImages || []
    const newImages = currentImages.filter(
      (_: any, i: number) => i !== index
    )
    onUpdate({ supportingImages: newImages })
  }

  const canProceed = true // This step is optional, can always proceed

  return (
    <div className="space-y-6">
      {data.titleDeedData && data.titleDeedData.result && data.titleDeedData.result[0] && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">ข้อมูลจากโฉนดที่ดิน:</p>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">เลขโฉนดที่ดิน:</span> {data.titleDeedData.result[0].parcelno || 'ไม่พบข้อมูล'}</p>
                    <p><span className="font-medium">หน้าสำรวจ:</span> {data.titleDeedData.result[0].surveyno || 'ไม่พบข้อมูล'}</p>
                    <p><span className="font-medium">เลขที่ดิน:</span> {data.titleDeedData.result[0].landno || 'ไม่พบข้อมูล'}</p>
                    <p><span className="font-medium">ระวาง:</span> {data.titleDeedData.result[0].utm || 'ไม่พบข้อมูล'}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">ตำบล:</span> {data.titleDeedData.result[0].tumbolname || 'ไม่พบข้อมูล'}</p>
                    <p><span className="font-medium">อำเภอ:</span> {data.titleDeedData.result[0].amphurname || 'ไม่พบข้อมูล'}</p>
                    <p><span className="font-medium">จังหวัด:</span> {data.titleDeedData.result[0].provname || 'ไม่พบข้อมูล'}</p>
                  </div>
                </div>
                <hr className="my-2" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">เนื้อที่:</span> {data.titleDeedData.result[0].rai || '0'} ไร่ {data.titleDeedData.result[0].ngan || '0'} งาน {data.titleDeedData.result[0].wa || '0'} ตารางวา</p>
                    <p><span className="font-medium">ราคาประเมิน:</span> {data.titleDeedData.result[0].landprice ? `${data.titleDeedData.result[0].landprice} บาท/ตร.วา` : 'ไม่พบข้อมูล'}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">พิกัดแปลง:</span></p>
                    <p className="text-xs">Lat: {data.titleDeedData.result[0].parcellat || 'ไม่พบข้อมูล'}</p>
                    <p className="text-xs">Lon: {data.titleDeedData.result[0].parcellon || 'ไม่พบข้อมูล'}</p>
                  </div>
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {data.titleDeedAnalysis && !data.titleDeedData && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">ข้อมูลที่วิเคราะห์ได้จากโฉนด:</p>
              {data.titleDeedAnalysis.pvName && (
                <p className="text-sm">จังหวัด: {data.titleDeedAnalysis.pvName}</p>
              )}
              {data.titleDeedAnalysis.amName && (
                <p className="text-sm">อำเภอ: {data.titleDeedAnalysis.amName}</p>
              )}
              {data.titleDeedAnalysis.parcelNo && (
                <p className="text-sm">เลขโฉนด: {data.titleDeedAnalysis.parcelNo}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                * ไม่สามารถดึงข้อมูลรายละเอียดเพิ่มเติมได้ แต่สามารถดำเนินการต่อได้
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" />
            อัพโหลดรูปประกอบ (หากมี)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            อัพโหลดภาพประกอบเพิ่มเติม เช่น ภาพบ้าน มุมต่าง ๆ หรือเอกสารอื่นๆ
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
          {data.supportingImages && data.supportingImages.length > 0 && (
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
