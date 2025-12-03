import type React from 'react'

import type { Metadata, Viewport } from 'next'
import { Kanit } from 'next/font/google'

import ClientLayout from './client-layout'
import './globals.css'

const kanit = Kanit({
  subsets: ['latin', 'thai'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-kanit',
})

export const metadata: Metadata = {
  title: 'InfiniteX - สินเชื่อจำนองบ้านและโฉนดที่ดิน',
  description: 'แอปพลิเคชันสินเชื่อจำนองบ้านและโฉนดที่ดิน ใช้งานง่าย ปลอดภัย',
  generator: 'InfiniteX',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'InfiniteX',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#955be8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`font-sans ${kanit.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
