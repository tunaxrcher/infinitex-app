'use client'

import type React from 'react'
import { useState } from 'react'

import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@src/shared/ui/tooltip'
import { Camera, FileText, Info, Upload, X, Loader2 } from 'lucide-react'
import { TitleDeedManualInputModal } from '../title-deed-manual-input-modal'
import provinceData from '@src/data/province.json'
import amphurData from '@src/data/amphur.json'
import { toast } from 'sonner'

interface TitleDeedUploadStepProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrev: () => void
  isFirstStep: boolean
}

export function TitleDeedUploadStep({
  data,
  onUpdate,
  onNext,
  onPrev,
  isFirstStep,
}: TitleDeedUploadStepProps) {
  const [dragActive, setDragActive] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showManualModal, setShowManualModal] = useState(false)
  const [manualInputData, setManualInputData] = useState<{
    type: 'full' | 'amphur_only'
    pvCode?: string
    parcelNo?: string
  } | null>(null)

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
      // Just store the file, don't upload yet
      onUpdate({ titleDeedImage: file })
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      // Just store the file, don't upload yet
      onUpdate({ titleDeedImage: file })
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setIsAnalyzing(true)
      console.log('[TitleDeed] Starting file upload and analysis:', file.name)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)

      // Call API to analyze title deed
      const response = await fetch('/api/title-deed/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'การวิเคราะห์โฉนดล้มเหลว')
      }

      const result = await response.json()
      console.log('[TitleDeed] Analysis result:', result)

      // Update component data with image and analysis result
      onUpdate({
        titleDeedImage: file,
        titleDeedImageUrl: result.imageUrl,
        titleDeedImageKey: result.imageKey,
        titleDeedAnalysis: result.analysisResult,
        titleDeedData: result.titleDeedData,
      })

      // Handle manual input cases
      if (result.needsManualInput) {
        setManualInputData({
          type: result.manualInputType,
          pvCode: result.analysisResult.pvCode,
          parcelNo: result.analysisResult.parcelNo,
        })
        setShowManualModal(true)
      } else if (result.titleDeedData) {
        toast.success('วิเคราะห์โฉนดสำเร็จ')
        // Auto proceed to next step when successful
        setTimeout(() => onNext(), 1000)
      } else {
        toast.warning('วิเคราะห์โฉนดเสร็จสิ้น แต่ไม่พบข้อมูลรายละเอียด')
        // Auto proceed to next step
        setTimeout(() => onNext(), 1000)
      }
    } catch (error) {
      console.error('[TitleDeed] Upload/analysis failed:', error)
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการวิเคราะห์โฉนด')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleManualConfirm = async (manualData: { pvCode: string; amCode: string; parcelNo: string }) => {
    try {
      console.log('[TitleDeed] Manual lookup:', manualData)

      const response = await fetch('/api/title-deed/manual-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(manualData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'การค้นหาข้อมูลโฉนดล้มเหลว')
      }

      const result = await response.json()
      console.log('[TitleDeed] Manual lookup result:', result)

      // Update with manual lookup result
      onUpdate({
        ...data,
        titleDeedData: result.titleDeedData,
      })

      setShowManualModal(false)
      toast.success('ค้นหาข้อมูลโฉนดสำเร็จ')
      onNext() // Proceed to next step
    } catch (error) {
      console.error('[TitleDeed] Manual lookup failed:', error)
      toast.error(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการค้นหาข้อมูลโฉนด')
    }
  }

  const handleManualSkip = () => {
    setShowManualModal(false)
    toast.info('ข้ามการค้นหาข้อมูลโฉนด')
    onNext() // Proceed to next step
  }

  const handleNextStep = async () => {
    // If we have an image but haven't analyzed it yet, analyze first
    if (data.titleDeedImage && !data.titleDeedAnalysis && !data.titleDeedData) {
      await handleFileUpload(data.titleDeedImage)
    } else {
      // Already analyzed or no image, proceed to next step
      onNext()
    }
  }

  const removeImage = () => {
    onUpdate({ 
      titleDeedImage: null, 
      titleDeedData: null,
      titleDeedAnalysis: null,
      titleDeedImageUrl: null,
      titleDeedImageKey: null,
    })
  }

  const canProceed = data.titleDeedImage

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            อัพโหลดโฉนดที่ดิน
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground hover:text-primary cursor-help transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-center">
                  หลังจากยืนยันระบบจะตรวจสอบโฉนด และประเมินข้อมูลเบื้องต้น
                </p>
              </TooltipContent>
            </Tooltip>
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
              <Button variant="outline" size="sm" asChild disabled={isAnalyzing}>
                <label className="cursor-pointer">
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isAnalyzing ? 'กำลังวิเคราะห์...' : 'เลือกไฟล์'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInput}
                    disabled={isAnalyzing}
                  />
                </label>
              </Button>
              <Button variant="outline" size="sm" disabled={isAnalyzing}>
                <Camera className="h-4 w-4 mr-2" />
                ถ่ายรูป
              </Button>
            </div>
          </div>

          {/* Uploaded Image */}
          {data.titleDeedImage && (
            <div className="space-y-3">
              <div className="relative bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground truncate">
                    {data.titleDeedImage.name}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-1 -right-1 h-6 w-6 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={removeImage}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
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
        <Button onClick={handleNextStep} disabled={!canProceed || isAnalyzing} className="flex-1">
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              กำลังวิเคราะห์...
            </>
          ) : (
            'ถัดไป'
          )}
        </Button>
      </div>

      {/* Manual Input Modal */}
      {showManualModal && manualInputData && (
        <TitleDeedManualInputModal
          isOpen={showManualModal}
          onClose={() => setShowManualModal(false)}
          onSkip={handleManualSkip}
          onConfirm={handleManualConfirm}
          initialData={{
            pvCode: manualInputData.pvCode,
            parcelNo: manualInputData.parcelNo,
          }}
          provinces={provinceData}
          amphurs={amphurData}
        />
      )}
    </div>
  )
}
