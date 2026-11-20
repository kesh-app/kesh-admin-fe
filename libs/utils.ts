import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeString(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim().replace(/^['"]+|['"]+$/g, '');
}

export function formatAmountInput(value: string): string {
  if (!value) return ''
  const [whole, fraction] = value.split('.')
  const formatted = Number(whole || 0).toLocaleString('id-ID')
  return fraction === undefined ? formatted : `${formatted},${fraction}`
}

export function parseAmountInput(value: string): string {
  return value.replace(/\./g, '').replace(',', '.')
}
