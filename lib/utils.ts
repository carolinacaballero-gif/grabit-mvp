import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Shadcn/ui helper (requerido por todos los componentes)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatea un número como moneda
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(amount)
}

// Formatea una fecha en español
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Formatea una fecha con hora
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Acorta un UUID para mostrarlo (ej: "a1b2c3d4")
export function shortId(uuid: string): string {
  return uuid.slice(0, 8).toUpperCase()
}

// Calcula días hasta que vence una fecha
export function daysUntil(dateString: string): number {
  const target = new Date(dateString)
  const today  = new Date()
  const diff   = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
