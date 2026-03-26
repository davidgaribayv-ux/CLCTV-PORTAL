import { format, parseISO, isValid } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import { es } from 'date-fns/locale'

// Timezones relevantes para Implant
export const TZ_BARCELONA = 'Europe/Madrid'   // +1 CET / +2 CEST
export const TZ_LIMA = 'America/Lima'          // -5 PET (sin horario de verano)

/**
 * Formatea una fecha ISO en la zona horaria de Barcelona.
 * Ejemplo: "lun 14 abr · 10:00 (Barcelona)"
 */
export function formatDateBarcelona(dateStr: string): string {
  if (!dateStr) return '—'

  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return dateStr

    const zonedDate = toZonedTime(date, TZ_BARCELONA)
    return format(zonedDate, "EEE d MMM · HH:mm", { locale: es })
  } catch {
    return dateStr
  }
}

/**
 * Devuelve la fecha en Lima para mostrar como referencia interna.
 */
export function formatDateLima(dateStr: string): string {
  if (!dateStr) return '—'

  try {
    const date = parseISO(dateStr)
    if (!isValid(date)) return dateStr

    const zonedDate = toZonedTime(date, TZ_LIMA)
    return format(zonedDate, "HH:mm", { locale: es })
  } catch {
    return dateStr
  }
}

/**
 * Si la fecha solo tiene día (sin hora), formatea solo la parte de fecha.
 * Airtable a veces envía "2025-04-15" sin hora.
 */
export function isDateOnly(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
}

export function formatScheduledDate(dateStr: string): { barcelona: string; lima: string } {
  if (!dateStr) return { barcelona: '—', lima: '—' }

  // Si Airtable solo envía fecha sin hora, tratar como medianoche UTC
  const normalized = isDateOnly(dateStr) ? `${dateStr}T00:00:00.000Z` : dateStr

  return {
    barcelona: formatDateBarcelona(normalized),
    lima: formatDateLima(normalized),
  }
}

/**
 * Capitaliza la primera letra de un string.
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Genera las iniciales de un nombre para el avatar.
 * "maymanta" → "MA"
 */
export function getInitials(name: string): string {
  return name
    .replace(/-/g, ' ')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Detecta si una URL es un video.
 */
export function isVideoUrl(url: string): boolean {
  return /\.(mp4|mov|webm|ogg|avi)(\?.*)?$/i.test(url)
}
