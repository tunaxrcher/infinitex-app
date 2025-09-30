'use client'

import type React from 'react'
import { useState } from 'react'

import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { AlertCircle, Camera, CreditCard, Upload } from 'lucide-react'

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
      onUpdate({ idCardImage: e.dataTransfer.files[0] })
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpdate({ idCardImage: e.target.files[0] })
    }
  }

  const canProceed = data.idCardImage

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
                <li>• รูปแบบไฟล์ JPG หรือ PNG</li>
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
                <CreditCard className="h-12 w-12 text-success mx-auto" />
                <div>
                  <p className="text-sm font-medium text-success">
                    อัพโหลดสำเร็จ
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {data.idCardImage.name}
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
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
