import { cn } from '@src/shared/lib/utils'
import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent } from '@src/shared/ui/card'
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  CreditCard,
  FileCheck,
  Gift,
  Megaphone,
} from 'lucide-react'

const notifications = [
  {
    id: 1,
    type: 'payment_due',
    title: 'เตือนครบกำหนดชำระ',
    message:
      'สินเชื่อ LN001234567 ครบกำหนดชำระในวันที่ 30 ก.ย. 68 จำนวน 2,000.50 บาท',
    timestamp: '2 ชั่วโมงที่แล้ว',
    isRead: false,
    priority: 'high',
    icon: AlertTriangle,
    iconColor: 'text-warning',
    bgColor: 'bg-warning/10',
    actionText: 'ชำระเงิน',
    actionHref: '/payment?loanId=1',
  },
  {
    id: 2,
    type: 'approval',
    title: 'อนุมัติสินเชื่อเรียบร้อย',
    message:
      'คำขอสินเชื่อของคุณได้รับการอนุมัติแล้ว วงเงิน 50,000 บาท กรุณาติดต่อรับเงิน',
    timestamp: '1 วันที่แล้ว',
    isRead: false,
    priority: 'high',
    icon: CheckCircle,
    iconColor: 'text-success',
    bgColor: 'bg-success/10',
    actionText: 'ดูรายละเอียด',
    actionHref: '/products',
  },
  {
    id: 3,
    type: 'promotion',
    title: 'โปรโมชั่นพิเศษ!',
    message:
      'ลูกค้าเก่าได้รับส่วนลดค่าธรรมเนียม 50% สำหรับสินเชื่อใหม่ จนถึง 31 ต.ค. 68',
    timestamp: '2 วันที่แล้ว',
    isRead: true,
    priority: 'medium',
    icon: Gift,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10',
    actionText: 'ขอสินเชื่อ',
    actionHref: '/apply',
  },
  {
    id: 4,
    type: 'payment_success',
    title: 'ชำระเงินสำเร็จ',
    message: 'ชำระเงินงวดที่ 5/12 จำนวน 2,000.50 บาท เรียบร้อยแล้ว',
    timestamp: '3 วันที่แล้ว',
    isRead: true,
    priority: 'low',
    icon: CreditCard,
    iconColor: 'text-success',
    bgColor: 'bg-success/10',
    actionText: 'ใบเสร็จ',
    actionHref: '/receipt/123',
  },
  {
    id: 5,
    type: 'document',
    title: 'เอกสารเพิ่มเติม',
    message: 'กรุณาส่งเอกสารเพิ่มเติมสำหรับการพิจารณาสินเชื่อ LN001234570',
    timestamp: '5 วันที่แล้ว',
    isRead: true,
    priority: 'medium',
    icon: FileCheck,
    iconColor: 'text-warning',
    bgColor: 'bg-warning/10',
    actionText: 'อัพโหลด',
    actionHref: '/upload',
  },
  {
    id: 6,
    type: 'announcement',
    title: 'ประกาศจากระบบ',
    message: 'ระบบจะปิดปรับปรุงในวันที่ 1 ต.ค. 68 เวลา 02:00-04:00 น.',
    timestamp: '1 สัปดาห์ที่แล้ว',
    isRead: true,
    priority: 'low',
    icon: Megaphone,
    iconColor: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    actionText: null,
    actionHref: null,
  },
]

const priorityColors = {
  high: 'border-l-destructive',
  medium: 'border-l-warning',
  low: 'border-l-muted-foreground',
}

export function NotificationsList() {
  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            การแจ้งเตือน (ข้อมูลทดสอบ)
          </h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} ข้อความใหม่`
              : 'ไม่มีข้อความใหม่'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-xs">
            {unreadCount}
          </Badge>
        )}
      </div>

      {/* Mark all as read button */}
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="text-xs">
            อ่านทั้งหมดแล้ว
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {notifications.map((notification) => {
          const Icon = notification.icon

          return (
            <Card
              key={notification.id}
              className={cn(
                'border-l-4 hover:shadow-md transition-shadow',
                priorityColors[notification.priority],
                !notification.isRead && 'bg-accent/30'
              )}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${notification.bgColor} flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${notification.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3
                        className={cn(
                          'text-sm font-medium',
                          !notification.isRead
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        )}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {notification.timestamp}
                      </span>
                      {notification.actionText && notification.actionHref && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 bg-transparent">
                          {notification.actionText}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty state if no notifications */}
      {notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            ไม่มีการแจ้งเตือน
          </h3>
          <p className="text-sm text-muted-foreground">
            การแจ้งเตือนใหม่จะปรากฏที่นี่
          </p>
        </div>
      )}
    </div>
  )
}
