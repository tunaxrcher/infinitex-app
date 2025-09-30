'use client'

import { useState } from 'react'

import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { Barcode, CheckCircle, Clock, Copy, MapPin } from 'lucide-react'

const paymentData = {
  amount: 2000.5,
  loanNumber: 'LN001234567',
  dueDate: '30 ก.ย. 68',
  barcodeNumber: '1234567890123456789',
  reference: 'INF001234567',
}

const paymentLocations = [
  { name: 'เซเว่น อีเลฟเว่น', available: true },
  { name: 'แฟมิลี่มาร์ท', available: true },
  { name: 'ลอว์สัน 108', available: true },
  { name: 'เทสโก้ โลตัส เอ็กซ์เพรส', available: true },
  { name: 'บิ๊กซี มินิ', available: true },
  { name: 'เคาน์เตอร์ธนาคาร', available: true },
]

export function BarcodePayment() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 space-y-6">
      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ข้อมูลการชำระเงิน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">ยอดชำระ:</span>
            <span className="text-lg font-bold text-primary">
              {paymentData.amount.toLocaleString('th-TH', {
                minimumFractionDigits: 2,
              })}{' '}
              บาท
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">เลขที่สัญญา:</span>
            <span className="text-sm font-medium text-foreground">
              {paymentData.loanNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">ครบกำหนด:</span>
            <span className="text-sm font-medium text-foreground">
              {paymentData.dueDate}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Barcode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-center gap-2">
            <Barcode className="h-5 w-5 text-primary" />
            Barcode สำหรับชำระเงิน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Barcode Display */}
          <div className="flex justify-center">
            <div className="bg-white border-2 border-border rounded-lg p-4">
              <div className="flex justify-center mb-2">
                <div className="flex gap-1">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 ${Math.random() > 0.5 ? 'h-12 bg-black' : 'h-8 bg-black'}`}
                      style={{ height: `${Math.random() * 20 + 30}px` }}
                    />
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs font-mono text-foreground">
                  {paymentData.barcodeNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              แสดง Barcode นี้ที่เคาน์เตอร์เพื่อชำระเงิน
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-mono text-foreground">
                {paymentData.barcodeNumber}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => copyToClipboard(paymentData.barcodeNumber)}>
                {copied ? (
                  <CheckCircle className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Locations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            จุดชำระเงิน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {paymentLocations.map((location, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <span className="text-xs font-medium text-foreground">
                  {location.name}
                </span>
                <Badge variant="default" className="text-xs">
                  เปิด 24 ชม.
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="bg-warning/5 border-warning/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                ข้อมูลสำคัญ
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Barcode มีอายุ 30 วัน นับจากวันที่สร้าง</li>
                <li>• การชำระเงินจะมีผลภายใน 1-2 ชั่วโมง</li>
                <li>• เก็บใบเสร็จจากร้านค้าไว้เป็นหลักฐาน</li>
                <li>• หากมีปัญหา โทร 1234 ตลอด 24 ชั่วโมง</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-foreground mb-2">
            วิธีการชำระเงิน
          </h4>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>ไปที่จุดชำระเงินที่ต้องการ</li>
            <li>แสดง Barcode ให้พนักงาน</li>
            <li>แจ้งยอดเงินที่ต้องชำระ</li>
            <li>ชำระเงินและรับใบเสร็จ</li>
            <li>เก็บใบเสร็จไว้เป็นหลักฐาน</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
