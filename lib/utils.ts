import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { REGEX_PATTERNS } from "./constants"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Extrae "HH:MM" de distintas representaciones de fecha/hora en texto, sin usar Date
export function extractHHmm(value: unknown): string {
  if (value == null) return ''
  const raw = String(value).trim()
  if (!raw) return ''
  
  // YYYY-MM-DD HH:MM -> HH:MM
  const ymdHm = raw.match(REGEX_PATTERNS.DATE_ISO)
  if (ymdHm) return ymdHm[1]
  
  // ISO con segundos/TZ -> HH:MM
  const iso = raw.match(REGEX_PATTERNS.DATE_ISO_FULL)
  if (iso) return iso[1]
  
  // HH:MM:SS -> HH:MM
  const hms = raw.match(REGEX_PATTERNS.TIME_HHMMSS)
  if (hms) return hms[1]
  
  // HH:MM
  if (REGEX_PATTERNS.TIME_HHMM.test(raw)) return raw
  
  // 830 -> 08:30, 1330 -> 13:30
  if (REGEX_PATTERNS.TIME_NUMERIC.test(raw)) {
    const padded = raw.padStart(4, '0')
    return `${padded.slice(0, 2)}:${padded.slice(2)}`
  }
  
  const any = raw.match(/\b\d{2}:\d{2}\b/)
  if (any) return any[0]
  return raw
}

// Serializa HH:MM para backend en formato "1900-01-01 HH:MM" sin TZ
export function serializeTimeForBackend(hhmm: string): string {
  const t = extractHHmm(hhmm)
  return t ? `1900-01-01 ${t}` : ''
}

// Convierte "HH:MM" a formato 12h "hh:mm AM/PM" sin usar Date
export function formatHHmmTo12h(hhmm: string): string {
  const t = extractHHmm(hhmm)
  const m = t.match(/^(\d{2}):(\d{2})$/)
  if (!m) return t
  const hours24 = parseInt(m[1], 10)
  const minutes = m[2]
  const period = hours24 >= 12 ? 'PM' : 'AM'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  const hh = hours12.toString().padStart(2, '0')
  return `${hh}:${minutes} ${period}`
}