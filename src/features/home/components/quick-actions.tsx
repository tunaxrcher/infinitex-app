'use client'

import Link from 'next/link'

import { useAuth } from '@src/shared/contexts/auth-context'
import { Card, CardContent } from '@src/shared/ui/card'
import { CreditCard, Package, Phone } from 'lucide-react'

export function QuickActions() {
  const { user } = useAuth()

  // Dynamic links based on user type
  const getQuickActionLinks = () => {
    if (user?.userType === 'CUSTOMER') {
      return {
        bills: '/bills',
        products: '/customer/products',
        contact: '/contact',
      }
    } else if (user?.userType === 'AGENT') {
      return {
        bills: '/bills',
        products: '/agent/customers',
        contact: '/contact',
      }
    }
    // Default for non-authenticated users
    return {
      bills: '/bills',
      products: '/login',
      contact: '/contact',
    }
  }

  const links = getQuickActionLinks()
  const productsLabel =
    user?.userType === 'AGENT' ? 'ผลิตภัณฑ์ของลูกค้า' : 'ผลิตภัณฑ์ของฉัน'

  return (
    <div className="space-y-4">
      <Card className="hover:shadow-md transition-shadow py-4">
        <CardContent className="p-0">
          <div className="grid grid-cols-3 divide-x divide-border">
            <Link
              href={links.bills}
              className="block p-0 text-center hover:bg-muted/50 transition-colors">
              <CreditCard className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">
                ดูบิล/จ่ายบิล
              </p>
            </Link>

            <Link
              href={links.products}
              className="block p-0 text-center hover:bg-muted/50 transition-colors">
              <Package className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">
                {productsLabel}
              </p>
            </Link>

            <Link
              href={links.contact}
              className="block p-0 text-center hover:bg-muted/50 transition-colors">
              <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">ติดต่อ</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
