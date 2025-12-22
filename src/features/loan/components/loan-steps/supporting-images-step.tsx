'use client'

import type React from 'react'
import { useEffect, useMemo, useState } from 'react'

import Image from 'next/image'

import { loanApi } from '@src/features/loan/api'
import { Alert, AlertDescription } from '@src/shared/ui/alert'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { Label } from '@src/shared/ui/label'
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  ImageIcon,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

// Max file size per image (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024
// Max total upload size (20MB)
const MAX_TOTAL_SIZE = 20 * 1024 * 1024

interface SupportingImagesStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
}

interface UploadedImage {
  url: string
  key: string
  name: string
}

export function SupportingImagesStep({
  data,
  onUpdate,
  onNext,
  onPrev,
}: SupportingImagesStepProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<{ [key: number]: string }>(
    {}
  )

  // Calculate total size of new files (not yet uploaded)
  const totalSize = useMemo(() => {
    if (!data.supportingImages) return 0
    return data.supportingImages.reduce((sum: number, img: any) => {
      if (img instanceof File) {
        return sum + img.size
      }
      return sum
    }, 0)
  }, [data.supportingImages])

  // Create image previews for File objects
  useEffect(() => {
    if (!data.supportingImages) return

    const newPreviews: { [key: number]: string } = {}
    const objectUrls: string[] = []

    data.supportingImages.forEach((image: any, index: number) => {
      if (image instanceof File) {
        const url = URL.createObjectURL(image)
        newPreviews[index] = url
        objectUrls.push(url)
      }
    })

    setImagePreviews(newPreviews)

    // Cleanup object URLs on unmount or when images change
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [data.supportingImages])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Validate and add files with size checking
  const validateAndAddFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      toast.error('กรุณาเลือกเฉพาะไฟล์รูปภาพ')
      return
    }

    const validFiles: File[] = []
    const oversizedFiles: string[] = []

    for (const file of imageFiles) {
      if (file.size > MAX_FILE_SIZE) {
        oversizedFiles.push(file.name)
      } else {
        validFiles.push(file)
      }
    }

    if (oversizedFiles.length > 0) {
      toast.error(`ไฟล์ต่อไปนี้มีขนาดเกิน 5MB: ${oversizedFiles.join(', ')}`, {
        duration: 5000,
      })
    }

    if (validFiles.length > 0) {
      const currentImages = data.supportingImages || []
      onUpdate({ supportingImages: [...currentImages, ...validFiles] })
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      validateAndAddFiles(files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
      validateAndAddFiles(files)
      // Reset input
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    const currentImages = data.supportingImages || []
    const newImages = currentImages.filter((_: any, i: number) => i !== index)
    onUpdate({ supportingImages: newImages })
  }

  const handleNext = async () => {
    // Upload files when user clicks next
    if (data.supportingImages && data.supportingImages.length > 0) {
      // Separate already uploaded images (have url) from new files (File objects)
      const uploadedImages = data.supportingImages.filter((img: any) => img.url)
      const newFiles = data.supportingImages.filter(
        (img: any) => img instanceof File
      )

      if (newFiles.length === 0) {
        // All images already uploaded, just proceed
        onNext()
        return
      }

      // Check total size before uploading
      const totalSize = newFiles.reduce(
        (sum: number, file: File) => sum + file.size,
        0
      )
      if (totalSize > MAX_TOTAL_SIZE) {
        toast.error(
          `ขนาดไฟล์รวมเกิน 20MB (${(totalSize / 1024 / 1024).toFixed(1)}MB) กรุณาลบไฟล์บางส่วนออก`,
          { duration: 5000 }
        )
        return
      }

      setIsUploading(true)
      try {
        console.log(
          `[SupportingImages] Uploading ${newFiles.length} new files...`
        )

        // Upload only new files
        const result = await loanApi.uploadSupportingImages(newFiles)

        if (result.success && result.images && result.images.length > 0) {
          // Map newly uploaded images with file objects for AI valuation
          const newUploadedImages = result.images.map(
            (img: any, index: number) => ({
              url: img.imageUrl,
              key: img.imageKey,
              name: img.fileName,
              file: newFiles[index], // Keep original file for AI valuation
            })
          )

          // Combine previously uploaded images with newly uploaded ones
          onUpdate({
            supportingImages: [...uploadedImages, ...newUploadedImages],
          })
          toast.success(
            `อัพโหลดสำเร็จ ${result.uploadedCount}/${result.totalCount} ไฟล์`
          )
          onNext()
        } else {
          toast.error('การอัพโหลดล้มเหลว กรุณาลองใหม่อีกครั้ง')
        }
      } catch (error: any) {
        console.error('[SupportingImages] Upload error:', error)

        // Handle 413 error specifically
        if (
          error?.message?.includes('413') ||
          error?.status === 413 ||
          (typeof error?.message === 'string' &&
            error.message.includes('Entity Too Large'))
        ) {
          toast.error(
            'ขนาดไฟล์รวมใหญ่เกินไป กรุณาลดจำนวนไฟล์หรือใช้ไฟล์ขนาดเล็กลง (สูงสุด 20MB)',
            { duration: 5000 }
          )
        } else {
          toast.error(
            error instanceof Error
              ? error.message
              : 'เกิดข้อผิดพลาดในการอัพโหลด'
          )
        }
      } finally {
        setIsUploading(false)
      }
    } else {
      // No images, just proceed
      onNext()
    }
  }

  const canProceed = true // This step is optional, can always proceed

  return (
    <div className="space-y-6">
      {data.titleDeedData &&
        data.titleDeedData.result &&
        data.titleDeedData.result[0] && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">ข้อมูลจากโฉนดที่ดิน:</p>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p>
                        <span className="font-medium">เลขโฉนดที่ดิน:</span>{' '}
                        {data.titleDeedData.result[0].parcelno || 'ไม่พบข้อมูล'}
                      </p>
                      <p>
                        <span className="font-medium">หน้าสำรวจ:</span>{' '}
                        {data.titleDeedData.result[0].surveyno || 'ไม่พบข้อมูล'}
                      </p>
                      <p>
                        <span className="font-medium">เลขที่ดิน:</span>{' '}
                        {data.titleDeedData.result[0].landno || 'ไม่พบข้อมูล'}
                      </p>
                      <p>
                        <span className="font-medium">ระวาง:</span>{' '}
                        {data.titleDeedData.result[0].utm || 'ไม่พบข้อมูล'}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">ตำบล:</span>{' '}
                        {data.titleDeedData.result[0].tumbolname ||
                          'ไม่พบข้อมูล'}
                      </p>
                      <p>
                        <span className="font-medium">อำเภอ:</span>{' '}
                        {data.titleDeedData.result[0].amphurname ||
                          'ไม่พบข้อมูล'}
                      </p>
                      <p>
                        <span className="font-medium">จังหวัด:</span>{' '}
                        {data.titleDeedData.result[0].provname || 'ไม่พบข้อมูล'}
                      </p>
                    </div>
                  </div>
                  <hr className="my-2" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p>
                        <span className="font-medium">เนื้อที่:</span>{' '}
                        {data.titleDeedData.result[0].rai || '0'} ไร่{' '}
                        {data.titleDeedData.result[0].ngan || '0'} งาน{' '}
                        {data.titleDeedData.result[0].wa || '0'} ตารางวา
                      </p>
                      <p>
                        <span className="font-medium">ราคาประเมิน:</span>{' '}
                        {data.titleDeedData.result[0].landprice
                          ? `${data.titleDeedData.result[0].landprice} บาท/ตร.วา`
                          : 'ไม่พบข้อมูล'}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">พิกัดแปลง:</span>
                      </p>
                      <p className="text-xs">
                        Lat:{' '}
                        {data.titleDeedData.result[0].parcellat ||
                          'ไม่พบข้อมูล'}
                      </p>
                      <p className="text-xs">
                        Lon:{' '}
                        {data.titleDeedData.result[0].parcellon ||
                          'ไม่พบข้อมูล'}
                      </p>
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
                <p className="text-sm">
                  จังหวัด: {data.titleDeedAnalysis.pvName}
                </p>
              )}
              {data.titleDeedAnalysis.amName && (
                <p className="text-sm">
                  อำเภอ: {data.titleDeedAnalysis.amName}
                </p>
              )}
              {data.titleDeedAnalysis.parcelNo && (
                <p className="text-sm">
                  เลขโฉนด: {data.titleDeedAnalysis.parcelNo}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                * ไม่สามารถดึงข้อมูลรายละเอียดเพิ่มเติมได้
                แต่สามารถดำเนินการต่อได้
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* {data.titleDeedManualData && !data.titleDeedData && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">ข้อมูลโฉนดที่กรอกด้วยตนเอง:</p>
              {data.titleDeedManualData.pvName && (
                <p className="text-sm">จังหวัด: {data.titleDeedManualData.pvName}</p>
              )}
              {data.titleDeedManualData.amName && (
                <p className="text-sm">อำเภอ: {data.titleDeedManualData.amName}</p>
              )}
              {data.titleDeedManualData.parcelNo && (
                <p className="text-sm">เลขโฉนด: {data.titleDeedManualData.parcelNo}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                * ข้อมูลที่กรอกด้วยตนเองจากขั้นตอนก่อนหน้า
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )} */}

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

          {/* Total Size Warning */}
          {totalSize > MAX_TOTAL_SIZE * 0.8 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ขนาดไฟล์รวม: {(totalSize / 1024 / 1024).toFixed(1)}MB
                {totalSize > MAX_TOTAL_SIZE
                  ? ' (เกินขีดจำกัด 20MB)'
                  : ' (ใกล้ถึงขีดจำกัด 20MB)'}
              </AlertDescription>
            </Alert>
          )}

          {/* Uploaded Images with Thumbnails */}
          {data.supportingImages && data.supportingImages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                ไฟล์ที่เลือก ({data.supportingImages.length})
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {data.supportingImages.map((image: any, index: number) => {
                  // Get image source - either from URL (uploaded) or create object URL (new file)
                  const imageSrc =
                    image.url ||
                    (image instanceof File ? imagePreviews[index] : null)
                  const imageName =
                    image.name ||
                    (image instanceof File ? image.name : 'รูปภาพ')
                  const isUploaded = !!image.url

                  return (
                    <div
                      key={index}
                      className="relative bg-muted rounded-lg overflow-hidden aspect-square">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={imageName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 33vw, 100px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      {/* Uploaded indicator */}
                      {isUploaded && (
                        <div className="absolute bottom-1 left-1 bg-green-500/90 rounded-full p-0.5">
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {/* File name tooltip on hover */}
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 px-1 py-0.5 opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white truncate block">
                          {imageName}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-1 -right-1 h-6 w-6 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => removeImage(index)}
                        disabled={isUploading}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )
                })}
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
          disabled={isUploading}
          className="flex-1 bg-transparent">
          ย้อนกลับ
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed || isUploading}
          className="flex-1">
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              กำลังอัพโหลด...
            </>
          ) : (
            'ถัดไป'
          )}
        </Button>
      </div>
    </div>
  )
}
