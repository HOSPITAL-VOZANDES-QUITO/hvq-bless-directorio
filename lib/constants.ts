// Constantes centralizadas del proyecto

// Patrones de regex utilizados en el proyecto
export const REGEX_PATTERNS = {
  TIME_HHMM: /^(\d{2}):(\d{2})$/,
  TIME_HHMMSS: /^(\d{2}):(\d{2}):(\d{2})$/,
  TIME_NUMERIC: /^\d{3,4}$/,
  DOCTOR_ID: /^\d+$/,
  DATE_ISO: /\b\d{4}-\d{2}-\d{2}[ T](\d{2}:\d{2})\b/,
  DATE_ISO_FULL: /\b\d{4}-\d{2}-\d{2}T(\d{2}:\d{2})(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?\b/
} as const
