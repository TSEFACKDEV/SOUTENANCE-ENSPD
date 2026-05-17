import { ServiceType, UrgencyLevel, PRICING } from '@/types'

export function calculatePrice(
  serviceType: ServiceType,
  urgencyLevel: UrgencyLevel,
  options?: { pageCount?: number; slideCount?: number }
): number {
  if (serviceType === 'FLYER') {
    return PRICING.FLYER[urgencyLevel]
  }

  if (serviceType === 'DOCUMENT_LAYOUT') {
    const pages = Math.max(options?.pageCount || 0, PRICING.DOCUMENT_LAYOUT.MIN_PAGES)
    const base = pages * PRICING.DOCUMENT_LAYOUT.BASE
    if (urgencyLevel === 'EXPRESS') return Math.round(base * PRICING.DOCUMENT_LAYOUT.EXPRESS_MULTIPLIER)
    if (urgencyLevel === 'IMMEDIATE') return Math.round(base * PRICING.DOCUMENT_LAYOUT.IMMEDIATE_MULTIPLIER)
    return base
  }

  if (serviceType === 'POWERPOINT') {
    const slides = Math.max(options?.slideCount || 0, PRICING.POWERPOINT.MIN_SLIDES)
    const base = slides * PRICING.POWERPOINT.PER_SLIDE
    if (urgencyLevel === 'EXPRESS') return Math.round(base * PRICING.POWERPOINT.EXPRESS_MULTIPLIER)
    if (urgencyLevel === 'IMMEDIATE') return Math.round(base * PRICING.POWERPOINT.IMMEDIATE_MULTIPLIER)
    return base
  }

  return 0
}

export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function daysUntil(date: Date | string): number {
  const now = new Date()
  const target = new Date(date)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getUrgencyFromDate(defenseDate: Date | string): UrgencyLevel {
  const days = daysUntil(defenseDate)
  if (days <= 1) return 'IMMEDIATE'
  if (days <= 3) return 'EXPRESS'
  return 'STANDARD'
}
