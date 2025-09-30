'use client'

import Link from 'next/link'

import { useAuth } from '@src/shared/contexts/auth-context'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@src/shared/ui/card'
import { CheckCircle, Clock, Mail, Phone } from 'lucide-react'

export function PendingStep() {
  const { user } = useAuth()

  // Determine the correct URL based on user type
  const myLoansUrl =
    user?.userType === 'AGENT' ? '/agent/customers' : '/customer/products'
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-4">
        <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            ส่งคำขอสำเร็จ !
          </h2>
          <p className="text-sm text-muted-foreground">
            คำขอสินเชื่อของคุณได้รับการส่งเรียบร้อยแล้ว
            <br />
            เราจะดำเนินการพิจารณาและแจ้งผลให้ทราบ
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            ขั้นตอนถัดไป
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">1</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  ตรวจสอบเอกสาร
                </p>
                <p className="text-xs text-muted-foreground">
                  ใช้เวลา 1-2 ชั่วโมง
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">2</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  ประเมินหลักทรัพย์
                </p>
                <p className="text-xs text-muted-foreground">
                  ใช้เวลา 4-6 ชั่วโมง
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-primary">3</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  อนุมัติและแจ้งผล
                </p>
                <p className="text-xs text-muted-foreground">
                  ภายใน 24 ชั่วโมง
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-foreground mb-3">
            ติดตามสถานะได้ที่
          </h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              asChild>
              <Link href="/notifications">
                <Mail className="h-4 w-4 mr-2" />
                แจ้งเตือน
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-transparent"
              asChild>
              <Link href="/contact">
                <Phone className="h-4 w-4 mr-2" />
                โทรสอบถาม
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button asChild className="w-full">
          <Link href="/">กลับหน้าหลัก</Link>
        </Button>
        <Button variant="outline" asChild className="w-full bg-transparent">
          <Link href={myLoansUrl}>ดูสินเชื่อของฉัน</Link>
        </Button>
      </div>
    </div>
  )
}
