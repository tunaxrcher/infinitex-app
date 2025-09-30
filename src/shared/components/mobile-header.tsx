'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@src/shared/ui/button'
import { ArrowLeft } from 'lucide-react'

interface MobileHeaderProps {
  title: string
  showBackButton?: boolean
}

export function MobileHeader({
  title,
  showBackButton = true,
}: MobileHeaderProps) {
  const router = useRouter()

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border pt-2">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="w-10">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
        </div>

        <h1 className="text-lg font-semibold text-foreground text-center flex-1">
          {title}
        </h1>

        <div className="w-10"></div>
      </div>
    </header>
  )
}
