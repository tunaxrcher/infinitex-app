'use client'

import type React from 'react'
import { useState } from 'react'

import { loanApi } from '@src/features/loan/api'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import {
  AlertCircle,
  Camera,
  CheckCircle,
  CreditCard,
  FileText,
  Loader2,
  Upload,
} from 'lucide-react'
import { toast } from 'sonner'

interface IdCardStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
}

export function IdCardStep({
  data,
  onUpdate,
  onNext,
  onPrev,
}: IdCardStepProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false)

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
      const file = e.dataTransfer.files[0]

      // Only validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกเฉพาะไฟล์รูปภาพ')
        return
      }

      // Just store the file, don't upload yet
      onUpdate({ idCardImage: file })
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Only validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกเฉพาะไฟล์รูปภาพ')
        return
      }

      // Just store the file, don't upload yet
      onUpdate({ idCardImage: file })

      // Reset input
      e.target.value = ''
    }
  }

  const handleNext = async () => {
    // Step 1: Upload ID card if not uploaded yet
    if (data.idCardImage && !data.idCardImageUrl) {
      setIsUploading(true)
      try {
        console.log('[IdCard] Uploading ID card:', data.idCardImage.name)

        const result = await loanApi.uploadIdCard(data.idCardImage)

        if (result.success) {
          // Update with upload result
          onUpdate({
            idCardImage: data.idCardImage,
            idCardImageUrl: result.imageUrl,
            idCardImageKey: result.imageKey,
          })

          console.log('[IdCard] ID card uploaded successfully')
        } else {
          throw new Error('การอัพโหลดล้มเหลว')
        }
      } catch (error) {
        console.error('[IdCard] Upload failed:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'เกิดข้อผิดพลาดในการอัพโหลดบัตรประชาชน'
        )
        setIsUploading(false)
        return
      } finally {
        setIsUploading(false)
      }
    }

    // Step 2: Proceed with property valuation
    await handlePropertyValuation()
  }

  const handlePropertyValuation = async () => {
    // Check if we have sufficient data for valuation
    const hasTitleDeedData =
      data.titleDeedData &&
      data.titleDeedData.result &&
      data.titleDeedData.result.length > 0
    const hasSupportingImages =
      data.supportingImages && data.supportingImages.length > 0

    // Skip valuation if we only have title deed image without additional data
    if (!data.titleDeedImage || (!hasTitleDeedData && !hasSupportingImages)) {
      console.log('[IdCard] Insufficient data for valuation, skipping...', {
        hasTitleDeedImage: !!data.titleDeedImage,
        hasTitleDeedData,
        hasSupportingImages,
      })

      // Set empty valuation result to indicate no valuation was performed
      onUpdate({
        ...data,
        propertyValuation: null,
      })
      onNext()
      return
    }

    setIsEvaluating(true)
    try {
      console.log('[IdCard] Starting property valuation...')

      // Prepare form data
      const formData = new FormData()
      formData.append('titleDeedImage', data.titleDeedImage)

      // Add title deed data if available
      if (data.titleDeedData) {
        formData.append('titleDeedData', JSON.stringify(data.titleDeedData))
      }

      // Add supporting images if available
      if (data.supportingImages && data.supportingImages.length > 0) {
        let imageCount = 0
        data.supportingImages.forEach((image: any) => {
          // Check if image is UploadedImage object with file property or just a File
          const file = image.file || image
          if (file instanceof File) {
            formData.append(`supportingImage_${imageCount}`, file)
            imageCount++
          }
        })
      }

      // Call valuation API
      const response = await fetch('/api/loans/property/valuation', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      console.log('[IdCard] Valuation result:', result)

      if (!response.ok || !result.success) {
        // Handle insufficient data case
        if (result.valuation && result.valuation.estimatedValue === 0) {
          console.log('[IdCard] Insufficient data for valuation')
          onUpdate({
            ...data,
            propertyValuation: null,
          })
          toast.info('ข้อมูลไม่เพียงพอสำหรับการประเมิน AI')
          onNext()
          return
        }

        throw new Error(result.error || 'การประเมินมูลค่าล้มเหลว')
      }

      // Update data with valuation result
      onUpdate({
        ...data,
        propertyValuation: result.valuation,
      })

      toast.success('ประเมินมูลค่าทรัพย์สินสำเร็จ')
      onNext()
    } catch (error) {
      console.error('[IdCard] Property valuation failed:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการประเมินมูลค่า'
      )

      // Continue without valuation
      onUpdate({
        ...data,
        propertyValuation: null,
      })
      onNext()
    } finally {
      setIsEvaluating(false)
    }
  }

  const canProceed = data.idCardImage && !isUploading && !isEvaluating
  const isProcessing = isUploading || isEvaluating

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            อัพโหลดบัตรประชาชน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <div className="text-xs text-warning-foreground">
              <p className="font-medium mb-1">คำแนะนำในการถ่ายรูป:</p>
              <ul className="space-y-1">
                <li>• ถ่ายรูปในที่แสงสว่างเพียงพอ</li>
                <li>• ให้เห็นข้อมูลในบัตรชัดเจน</li>
                <li>• ไม่มีแสงสะท้อนหรือเงา</li>
                {/* <li>• รูปแบบไฟล์ JPG หรือ PNG</li> */}
              </ul>
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}>
            {data.idCardImage ? (
              <div className="space-y-3">
                <CheckCircle className="h-12 w-12 text-primary mx-auto" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    เลือกไฟล์แล้ว
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <FileText className="h-3 w-3" />
                    {data.idCardImage.name}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUploading || isEvaluating}
                  asChild>
                  <label className="cursor-pointer">
                    เปลี่ยนรูป
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                  </label>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    อัพโหลดบัตรประชาชน
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    ลากไฟล์มาวางที่นี่ หรือเลือกไฟล์
                  </p>
                </div>

                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      เลือกไฟล์
                      <input
                        type="file"
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-foreground mb-2">
            การคุ้มครองข้อมูลส่วนบุคคล
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            ข้อมูลบัตรประชาชนของคุณจะถูกเข้ารหัสและเก็บรักษาอย่างปลอดภัย
            ใช้เพื่อการตรวจสอบตัวตนและการพิจารณาสินเชื่อเท่านั้น
            เราจะไม่เปิดเผยข้อมูลของคุณให้กับบุคคลที่สาม
          </p>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={isProcessing}
          className="flex-1 bg-transparent">
          ย้อนกลับ
        </Button>
        <Button onClick={handleNext} disabled={!canProceed} className="flex-1">
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              กำลังอัพโหลด...
            </>
          ) : isEvaluating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              กำลังประเมินมูลค่า...
            </>
          ) : (
            'ถัดไป'
          )}
        </Button>
      </div>
    </div>
  )
}
