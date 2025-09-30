'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useAuth } from '@src/shared/contexts/auth-context'
import { cn } from '@src/shared/lib/utils'
import { Bell, CreditCard, Home, Menu, Users } from 'lucide-react'

const getNavigationItems = (userType: 'CUSTOMER' | 'AGENT' | null) => {
  const baseItems = [
    {
      name: 'หน้าหลัก',
      href: '/',
      icon: Home,
    },
    {
      name: 'แจ้งเตือน',
      href: '/notifications',
      icon: Bell,
    },
    {
      name: 'เมนูอื่น ๆ',
      href: '/more',
      icon: Menu,
    },
  ]

  if (userType === 'CUSTOMER') {
    return [
      baseItems[0], // หน้าหลัก
      {
        name: 'ผลิตภัณฑ์ของฉัน',
        href: '/customer/products',
        icon: CreditCard,
      },
      ...baseItems.slice(1), // แจ้งเตือน, เมนูอื่น ๆ
    ]
  } else if (userType === 'AGENT') {
    return [
      baseItems[0], // หน้าหลัก
      {
        name: 'ผลิตภัณฑ์ของลูกค้า',
        href: '/agent/customers',
        icon: Users,
      },
      ...baseItems.slice(1), // แจ้งเตือน, เมนูอื่น ๆ
    ]
  }

  // Default navigation for non-authenticated users
  return baseItems
}

export function BottomNavigation() {
  const pathname = usePathname()
  const { user } = useAuth()

  const navigationItems = getNavigationItems(user?.userType || null)

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-card border-t border-border pb-2">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-primary bg-accent'
                  : 'text-muted-foreground hover:text-foreground'
              )}>
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
