/**
 * Servicio de utilidad para validación de datos
 * Contiene funciones reutilizables para validar datos de la API y formularios
 */

/**
 * Valida si una cadena es un ID numérico
 * Verifica si un string representa un número válido
 */
export function isValidNumericId(value: string): boolean {
  return /^\d+$/.test(String(value))
}

/**
 * Valida si una cadena es un slug válido
 * Verifica si un string tiene el formato de slug correcto
 */
export function isValidSlug(value: string): boolean {
  return /^[a-z0-9-]+$/.test(String(value))
}

/**
 * Valida si un objeto tiene la estructura mínima de médico
 * Verifica que un objeto contenga los campos esenciales de un médico
 */
export function isValidDoctor(doctor: any): boolean {
  return (
    doctor &&
    typeof doctor === 'object' &&
    (doctor.id || doctor.codigo || doctor.medicoId) &&
    (doctor.nombres || doctor.name)
  )
}

/**
 * Valida si un objeto tiene la estructura mínima de especialidad
 * Verifica que un objeto contenga los campos esenciales de una especialidad
 */
export function isValidSpecialty(specialty: any): boolean {
  return (
    specialty &&
    typeof specialty === 'object' &&
    (specialty.especialidadId || specialty.id) &&
    (specialty.descripcion || specialty.nombre)
  )
}

/**
 * Valida si un objeto tiene la estructura mínima de agenda
 * Verifica que un objeto contenga los campos esenciales de una agenda
 */
export function isValidAgenda(agenda: any): boolean {
  return (
    agenda &&
    typeof agenda === 'object' &&
    (agenda.codigo_item_agendamiento || agenda.id) &&
    (agenda.codigo_prestador || agenda.prestadorId)
  )
}

/**
 * Valida si un array contiene solo IDs numéricos
 * Verifica si un array contiene únicamente números
 */
export function isArrayOfNumericIds(data: any[]): boolean {
  return Array.isArray(data) && data.every((item: any) => typeof item === 'number')
}

/**
 * Valida si una respuesta de API tiene la estructura esperada
 * Verifica que una respuesta contenga los campos mínimos requeridos
 */
export function isValidApiResponse(response: any): boolean {
  return (
    response &&
    typeof response === 'object' &&
    (response.data !== undefined || Array.isArray(response))
  )
}

/**
 * Valida si un token de autenticación tiene el formato correcto
 * Verifica que un token tenga la estructura básica de JWT
 */
export function isValidAuthToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false
  // JWT tiene 3 partes separadas por puntos
  const parts = token.split('.')
  return parts.length === 3
}

/**
 * Valida si una URL tiene el formato correcto
 * Verifica que una URL sea válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Valida si un email tiene el formato correcto
 * Verifica que un email tenga la estructura básica válida
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida si un teléfono tiene el formato correcto
 * Verifica que un teléfono tenga la estructura básica válida
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

/**
 * Valida si una fecha tiene el formato correcto
 * Verifica que una fecha sea válida
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Valida si una hora tiene el formato correcto (HH:MM)
 * Verifica que una hora tenga el formato de 24 horas
 */
export function isValidTime(timeString: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(timeString)
}

/**
 * Valida si un objeto tiene todas las propiedades requeridas
 * Verifica que un objeto contenga todas las claves especificadas
 */
export function hasRequiredProperties(obj: any, requiredProps: string[]): boolean {
  if (!obj || typeof obj !== 'object') return false
  return requiredProps.every(prop => prop in obj)
}

/**
 * Valida si un array no está vacío y contiene elementos válidos
 * Verifica que un array tenga contenido y que los elementos pasen una validación
 */
export function isValidNonEmptyArray(arr: any[], validator?: (item: any) => boolean): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false
  if (validator) {
    return arr.every(validator)
  }
  return true
}

/**
 * Sanitiza un string removiendo caracteres peligrosos
 * Limpia un string de caracteres que podrían causar problemas de seguridad
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[<>\"'&]/g, '') // Remover caracteres HTML peligrosos
    .trim()
    .substring(0, 1000) // Limitar longitud
}

/**
 * Valida y sanitiza un input de usuario
 * Combina validación y sanitización para inputs de usuario
 */
export function validateAndSanitizeInput(input: any, type: 'string' | 'email' | 'phone' | 'url' = 'string'): {
  isValid: boolean
  sanitized: string
  error?: string
} {
  if (typeof input !== 'string') {
    return { isValid: false, sanitized: '', error: 'Input must be a string' }
  }

  const sanitized = sanitizeString(input)
  
  if (sanitized.length === 0) {
    return { isValid: false, sanitized: '', error: 'Input cannot be empty' }
  }

  switch (type) {
    case 'email':
      if (!isValidEmail(sanitized)) {
        return { isValid: false, sanitized: '', error: 'Invalid email format' }
      }
      break
    case 'phone':
      if (!isValidPhone(sanitized)) {
        return { isValid: false, sanitized: '', error: 'Invalid phone format' }
      }
      break
    case 'url':
      if (!isValidUrl(sanitized)) {
        return { isValid: false, sanitized: '', error: 'Invalid URL format' }
      }
      break
  }

  return { isValid: true, sanitized, error: undefined }
}
