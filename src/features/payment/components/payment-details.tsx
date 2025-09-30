import Link from 'next/link'

import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { Calendar, CreditCard, FileText, Info } from 'lucide-react'

const paymentDetails = {
  loanName: 'สินเชื่อจำนองบ้านและโฉนดที่ดิน',
  loanNumber: 'LN001234567',
  installment: '6/12',
  principalAmount: 1800.0,
  interestAmount: 150.0,
  feeAmount: 50.5,
  totalAmount: 2000.5,
  dueDate: '30 ก.ย. 68',
  paymentHistory: [
    { installment: 5, date: '30 ส.ค. 68', amount: 2000.5, status: 'ชำระแล้ว' },
    { installment: 4, date: '30 ก.ค. 68', amount: 2000.5, status: 'ชำระแล้ว' },
    { installment: 3, date: '30 มิ.ย. 68', amount: 2000.5, status: 'ชำระแล้ว' },
  ],
}

export function PaymentDetails() {
  return (
    <div className="p-4 space-y-6">
      {/* Current Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            รายละเอียดการชำระงวดปัจจุบัน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">สินเชื่อ:</span>
              <span className="text-sm font-medium text-foreground">
                {paymentDetails.loanName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                เลขที่สัญญา:
              </span>
              <span className="text-sm font-medium text-foreground">
                {paymentDetails.loanNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">งวดที่:</span>
              <span className="text-sm font-medium text-foreground">
                {paymentDetails.installment}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">ครบกำหนด:</span>
              <span className="text-sm font-medium text-foreground">
                {paymentDetails.dueDate}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">เงินต้น:</span>
              <span className="text-sm text-foreground">
                {paymentDetails.principalAmount.toLocaleString('th-TH', {
                  minimumFractionDigits: 2,
                })}{' '}
                บาท
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">ดอกเบีย:</span>
              <span className="text-sm text-foreground">
                {paymentDetails.interestAmount.toLocaleString('th-TH', {
                  minimumFractionDigits: 2,
                })}{' '}
                บาท
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                ค่าธรรมเนียม:
              </span>
              <span className="text-sm text-foreground">
                {paymentDetails.feeAmount.toLocaleString('th-TH', {
                  minimumFractionDigits: 2,
                })}{' '}
                บาท
              </span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between">
                <span className="text-base font-medium text-foreground">
                  รวมทั้งสิ้น:
                </span>
                <span className="text-lg font-bold text-primary">
                  {paymentDetails.totalAmount.toLocaleString('th-TH', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  บาท
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild className="h-12">
          <Link href="/payment/qr">
            <div className="text-center">
              <div className="text-sm font-medium">QR Code</div>
              <div className="text-xs opacity-90">สแกนจ่าย</div>
            </div>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-12 bg-transparent">
          <Link href="/payment/barcode">
            <div className="text-center">
              <div className="text-sm font-medium">Barcode</div>
              <div className="text-xs opacity-70">เคาน์เตอร์</div>
            </div>
          </Link>
        </Button>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            ประวัติการชำระเงิน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {paymentDetails.paymentHistory.map((payment, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    งวดที่ {payment.installment}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payment.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  {payment.amount.toLocaleString('th-TH', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  บาท
                </p>
                <Badge variant="default" className="text-xs">
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                ข้อมูลสำคัญ
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• การชำระเงินจะมีผลหลังจากได้รับการยืนยันจากธนาคาร</li>
                <li>• หากชำระหลังเวลา 15:30 น. จะถือเป็นการชำระในวันถัดไป</li>
                <li>• สามารถขอใบเสร็จรับเงินได้ที่เมนู "ประวัติการชำระ"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
