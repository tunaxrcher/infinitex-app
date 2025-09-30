'use client'

import { useEffect, useState } from 'react'

import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { CheckCircle, Clock, Copy, QrCode, RefreshCw } from 'lucide-react'

const paymentData = {
  amount: 2000.5,
  loanNumber: 'LN001234567',
  dueDate: '30 ก.ย. 68',
  accountNumber: '123-4-56789-0',
  accountName: 'บริษัท อินฟินิตเอ็กซ์ จำกัด',
  bankName: 'ธนาคารกรุงเทพ',
  reference: 'INF001234567',
}

export function QRPayment() {
  const [timeLeft, setTimeLeft] = useState(15 * 60) // 15 minutes in seconds
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4 space-y-6">
      {/* Timer */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                QR Code หมดอายุใน
              </p>
              <p className="text-2xl font-bold text-primary">
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            สแกน QR Code เพื่อชำระเงิน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* QR Code Display */}
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-white border-2 border-border rounded-lg flex items-center justify-center">
              <div className="w-56 h-56 bg-black/10 rounded-lg flex items-center justify-center">
                <QrCode className="h-32 w-32 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              เปิดแอปธนาคารและสแกน QR Code
            </p>
            <Badge variant="outline" className="text-xs">
              PromptPay
            </Badge>
          </div>

          <Button
            variant="outline"
            className="w-full bg-transparent"
            disabled={timeLeft === 0}>
            <RefreshCw className="h-4 w-4 mr-2" />
            {timeLeft === 0 ? 'QR Code หมดอายุ' : 'รีเฟรช QR Code'}
          </Button>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ข้อมูลการชำระเงิน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
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
              <span className="text-sm text-muted-foreground">
                เลขที่สัญญา:
              </span>
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
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ข้อมูลบัญชีรับเงิน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ธนาคาร:</span>
              <span className="text-sm font-medium text-foreground">
                {paymentData.bankName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                เลขที่บัญชี:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {paymentData.accountNumber}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(paymentData.accountNumber)}>
                  {copied ? (
                    <CheckCircle className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ชื่อบัญชี:</span>
              <span className="text-sm font-medium text-foreground">
                {paymentData.accountName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                หมายเลขอ้างอิง:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {paymentData.reference}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(paymentData.reference)}>
                  {copied ? (
                    <CheckCircle className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
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
            <li>เปิดแอปธนาคารของคุณ</li>
            <li>เลือกเมนู "สแกน QR" หรือ "ชำระเงิน"</li>
            <li>สแกน QR Code ด้านบน</li>
            <li>ตรวจสอบยอดเงินและกดยืนยัน</li>
            <li>เก็บหลักฐานการโอนเงินไว้</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
