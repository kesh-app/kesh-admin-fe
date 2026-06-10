import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sanitizeString(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val).trim().replace(/^['"]+|['"]+$/g, '');
}
