'use client'

import type React from 'react'
import { useState } from 'react'

import amphurData from '@src/data/amphur.json'
import provinceData from '@src/data/province.json'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@src/shared/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@src/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@src/shared/ui/tooltip'
import { Camera, Eye, FileText, Info, Loader2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

import { TitleDeedManualInputModal } from '../title-deed-manual-input-modal'

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
  const [showExampleModal, setShowExampleModal] = useState(false)
  const [manualInputData, setManualInputData] = useState<{
    type: 'full' | 'amphur_only'
    pvCode?: string
    amCode?: string
    parcelNo?: string
    errorMessage?: string
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
      const response = await fetch('/api/loans/title-deed/analyze', {
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

      // Always show modal for user to verify the data
      if (result.needsManualInput) {
        setManualInputData({
          type: result.manualInputType,
          pvCode: result.analysisResult.pvCode,
          amCode: result.analysisResult.amCode,
          parcelNo: result.analysisResult.parcelNo,
          errorMessage: result.errorMessage,
        })
        setShowManualModal(true)
        toast.success('วิเคราะห์โฉนดเสร็จสิ้น กรุณาตรวจสอบข้อมูล')
      } else {
        // Fallback case (should rarely happen now)
        toast.warning('วิเคราะห์โฉนดเสร็จสิ้น')
        setTimeout(() => onNext(), 1000)
      }
    } catch (error) {
      console.error('[TitleDeed] Upload/analysis failed:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการวิเคราะห์โฉนด'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleManualConfirm = async (manualData: {
    pvCode: string
    amCode: string
    parcelNo: string
  }) => {
    try {
      console.log('[TitleDeed] Manual lookup:', manualData)

      const response = await fetch('/api/loans/title-deed/manual-lookup', {
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
      toast.error(
        error instanceof Error
          ? error.message
          : 'เกิดข้อผิดพลาดในการค้นหาข้อมูลโฉนด'
      )
    }
  }

  const handleManualSkip = (formData?: {
    pvCode: string
    amCode: string
    parcelNo: string
  }) => {
    // If form data is provided, save it as manual analysis result
    if (formData && (formData.pvCode || formData.amCode || formData.parcelNo)) {
      const manualAnalysisResult = {
        pvName: '', // We don't have province name from form
        amName: '', // We don't have amphur name from form
        parcelNo: formData.parcelNo || '',
        pvCode: formData.pvCode || '',
        amCode: formData.amCode || '',
      }

      // Find province and amphur names for display
      const provinceName =
        provinceData.find((p) => p.pvcode === formData.pvCode)?.pvnamethai || ''
      const amphurName =
        amphurData.find(
          (a) => a.pvcode === formData.pvCode && a.amcode === formData.amCode
        )?.amnamethai || ''

      onUpdate({
        ...data,
        titleDeedAnalysis: {
          ...manualAnalysisResult,
          pvName: provinceName,
          amName: amphurName,
        },
        titleDeedManualData: {
          pvCode: formData.pvCode,
          amCode: formData.amCode,
          parcelNo: formData.parcelNo,
          pvName: provinceName,
          amName: amphurName,
        },
      })

      toast.info('บันทึกข้อมูลโฉนดที่กรอกไว้แล้ว')
    } else {
      toast.info('ข้ามการค้นหาข้อมูลโฉนด')
    }

    setShowManualModal(false)
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
          <div className="flex items-center justify-between">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExampleModal(true)}
              className="gap-1">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">ดูตัวอย่าง</span>
            </Button>
          </div>
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
              <Button
                variant="outline"
                size="sm"
                asChild
                disabled={isAnalyzing}>
                <label className="cursor-pointer">
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isAnalyzing ? 'กำลังตรวจสอบ...' : 'เลือกไฟล์'}
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
        <Button
          onClick={handleNextStep}
          disabled={!canProceed || isAnalyzing}
          className="flex-1">
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              กำลังตรวจสอบ...
            </>
          ) : (
            'ถัดไป'
          )}
        </Button>
      </div>

      {/* Example Document Modal */}
      <Dialog open={showExampleModal} onOpenChange={setShowExampleModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              ตัวอย่างเอกสารโฉนดที่ดิน
            </DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="example1" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="example1">ตัวอย่างที่ 1</TabsTrigger>
              <TabsTrigger value="example2">ตัวอย่างที่ 2</TabsTrigger>
            </TabsList>
            <TabsContent value="example1" className="space-y-3 mt-4">
              <div
                className="w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center"
                style={{ maxHeight: '400px' }}>
                <img
                  src="/images/title-deed-example1.jpg"
                  alt="ตัวอย่างโฉนดที่ดินแบบที่ 1"
                  className="w-auto h-auto max-w-full max-h-[400px]"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </TabsContent>
            <TabsContent value="example2" className="space-y-3 mt-4">
              <div
                className="w-full bg-muted rounded-lg overflow-hidden flex items-center justify-center"
                style={{ maxHeight: '400px' }}>
                <img
                  src="/images/title-deed-example2.jpg"
                  alt="ตัวอย่างโฉนดที่ดินแบบที่ 2"
                  className="w-auto h-auto max-w-full max-h-[400px]"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </TabsContent>
          </Tabs>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium text-foreground mb-2">
              💡 คำแนะนำ
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• ถ่ายรูปให้เห็นข้อมูลทั้งหมดชัดเจน</li>
              <li>• หลีกเลี่ยงการสะท้อนแสงหรือเงา</li>
              <li>• ถ่ายในที่แสงสว่างเพียงพอ</li>
              <li>• ให้ข้อมูลเลขที่โฉนด จังหวัด และอำเภอ ชัดเจน</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manual Input Modal */}
      {showManualModal && manualInputData && (
        <TitleDeedManualInputModal
          isOpen={showManualModal}
          onClose={() => setShowManualModal(false)}
          onSkip={handleManualSkip}
          onConfirm={handleManualConfirm}
          initialData={{
            pvCode: manualInputData.pvCode,
            amCode: manualInputData.amCode,
            parcelNo: manualInputData.parcelNo,
          }}
          errorMessage={manualInputData.errorMessage}
          provinces={provinceData}
          amphurs={amphurData}
        />
      )}
    </div>
  )
}
