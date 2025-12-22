'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useAuth } from '@src/shared/contexts/auth-context'
import { Badge } from '@src/shared/ui/badge'
import { Button } from '@src/shared/ui/button'
import { Card, CardContent } from '@src/shared/ui/card'
import { Switch } from '@src/shared/ui/switch'
import {
  ChevronRight,
  Coins,
  FileText,
  HelpCircle,
  LogOut,
  Moon,
  Phone,
  Settings,
  Shield,
  Star,
  User,
} from 'lucide-react'
import { useTheme } from 'next-themes'

const userInfo = {
  name: 'คุณ (ข้อมูลทดสอบ)',
  phone: '081-234-5678',
  memberSince: 'มีนาคม 2567',
  coins: 150,
}

const menuSections = [
  {
    title: 'บัญชีของฉัน',
    items: [
      {
        icon: User,
        label: 'โปรไฟล์',
        href: '/profile',
        description: 'ข้อมูลส่วนตัวและการตั้งค่าบัญชี',
        badge: null,
      },
      {
        icon: Coins,
        label: 'InfiniteX Coins',
        href: '/coins',
        description: `${userInfo.coins} Coins`,
        badge: 'ใหม่',
      },
      {
        icon: Settings,
        label: 'ตั้งค่า',
        href: '/settings',
        description: 'การแจ้งเตือน, ความปลอดภัย',
        badge: null,
      },
    ],
  },
  {
    title: 'ความช่วยเหลือ',
    items: [
      {
        icon: HelpCircle,
        label: 'วิธีการใช้งาน',
        href: '/help',
        description: 'คู่มือการใช้งานแอปพลิเคชัน',
        badge: null,
      },
      {
        icon: Phone,
        label: 'ติดต่อเรา',
        href: '/contact',
        description: 'Call Center: 1234',
        badge: null,
      },
      {
        icon: Star,
        label: 'ให้คะแนนแอป',
        href: '/rate',
        description: 'ช่วยเราปรับปรุงแอปให้ดีขึ้น',
        badge: null,
      },
    ],
  },
  {
    title: 'ข้อมูลทั่วไป',
    items: [
      {
        icon: FileText,
        label: 'เงื่อนไขการใช้งาน',
        href: '/terms',
        description: 'ข้อกำหนดและเงื่อนไขการใช้บริการ',
        badge: null,
      },
      {
        icon: Shield,
        label: 'นโยบายความเป็นส่วนตัว',
        href: '/privacy',
        description: 'การคุ้มครองข้อมูลส่วนบุคคล',
        badge: null,
      },
    ],
  },
]

export function MoreMenuList() {
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  // Use user data if available, fallback to mock data
  const displayInfo = {
    name:
      user?.profile?.firstName && user?.profile?.lastName
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : userInfo.name,
    phone: user?.phoneNumber || userInfo.phone,
    memberSince: userInfo.memberSince,
    coins: user?.profile?.coinBalance || userInfo.coins,
    userType: user?.userType,
  }

  return (
    <div className="p-4 space-y-6">
      {/* User Profile Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">
                {displayInfo.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {displayInfo.phone}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  สมาชิกตั้งแต่ {displayInfo.memberSince}
                </p>
                {displayInfo.userType && (
                  <Badge variant="outline" className="text-xs">
                    {displayInfo.userType === 'AGENT' ? 'เอเจนต์' : 'ลูกค้า'}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {displayInfo.coins}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Coins</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dark Mode Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                <Moon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">โหมดมืด</p>
                <p className="text-xs text-muted-foreground">
                  เปลี่ยนธีมแอปพลิเคชัน
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) =>
                setTheme(checked ? 'dark' : 'light')
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground px-2">
            {section.title}
          </h3>
          <Card>
            <CardContent className="p-0">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon
                const isLast = itemIndex === section.items.length - 1

                return (
                  <Link key={itemIndex} href={item.href}>
                    <div
                      className={`flex items-center gap-3 p-4 hover:bg-accent/50 transition-colors ${
                        !isLast ? 'border-b border-border' : ''
                      }`}>
                      <div className="p-2 bg-muted rounded-lg">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground">
                            {item.label}
                          </p>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        </div>
      ))}

      {/* App Version */}
      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground">
          InfiniteX เวอร์ชัน 1.0.0 (ทดสอบ)
        </p>
        <p className="text-xs text-muted-foreground">
          © 2025 InfiniteX. สงวนลิขสิทธิ์
        </p>
      </div>

      {/* Logout Button */}
      <Card className="border-destructive/20">
        <CardContent className="p-4">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4 mr-2" />
            ออกจากระบบ
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
