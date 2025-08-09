import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: 'BRL' | 'USD'): string {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  })
  
  return formatter.format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function generateAddress(): string {
  return Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

export function generateHash(): string {
  return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

export function truncateAddress(address: string, chars = 6): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}