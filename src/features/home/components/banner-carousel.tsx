'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'

import { Card } from '@src/shared/ui/card'

const banners = [
  {
    id: 1,
    title: 'สินเชื่อดอกเบียพิเศษ 2.99%',
    subtitle: 'สำหรับลูกค้าใหม่ เดือนแรก',
    image: '/images/finx-banner.png',
    bgColor: 'bg-gradient-to-r from-primary/20 to-primary/10',
  },
  {
    id: 2,
    title: 'อนุมัติเร็ว ใน 24 ชั่วโมง',
    subtitle: 'เอกสารครบ รับเงินทันที',
    image: '/images/finx-banner.png',
    bgColor: 'bg-gradient-to-r from-success/20 to-success/10',
  },
  {
    id: 3,
    title: 'ไม่มีค่าธรรมเนียมแรกเข้า',
    subtitle: 'ประหยัดได้มากกว่า 10,000 บาท',
    image: '/images/finx-banner.png',
    bgColor: 'bg-gradient-to-r from-warning/20 to-warning/10',
  },
]

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
          {banners.map((banner) => (
            <Card
              key={banner.id}
              className="min-w-full border-0 overflow-hidden py-0">
              <div className="relative h-48">
                <Image
                  src={banner.image || '/placeholder.svg'}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority={banner.id === 1}
                />
                {/* Optional overlay for better text readability */}
                <div className="absolute inset-0 bg-black/10" />

                {/* Text overlay */}
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-lg font-bold mb-1 drop-shadow-lg">
                    {banner.title}
                  </h3>
                  <p className="text-sm drop-shadow-lg">{banner.subtitle}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
