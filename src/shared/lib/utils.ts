import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number with Thai locale and comma separators
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted number string
 * @example formatThaiNumber(465000) => "465,000.00"
 * @example formatThaiNumber(465000, { minimumFractionDigits: 0 }) => "465,000"
 */
export function formatThaiNumber(
  value: number | string,
  options: Intl.NumberFormatOptions = { minimumFractionDigits: 2 }
): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return '0'
  }

  return numValue.toLocaleString('th-TH', options)
}

/**
 * Format currency with Thai locale
 * @param value - The number to format
 * @param showDecimals - Whether to show decimal places (default: true)
 * @returns Formatted currency string with "บาท" suffix
 * @example formatThaiCurrency(465000) => "465,000.00 บาท"
 * @example formatThaiCurrency(465000, false) => "465,000 บาท"
 */
export function formatThaiCurrency(
  value: number | string,
  showDecimals: boolean = true
): string {
  const formatted = formatThaiNumber(value, {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  })

  return `${formatted} บาท`
}
