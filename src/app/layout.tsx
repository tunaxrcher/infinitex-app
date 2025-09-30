import type React from 'react'

import type { Metadata } from 'next'
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
  viewport:
    'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#955be8',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'InfiniteX',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`font-sans ${kanit.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
