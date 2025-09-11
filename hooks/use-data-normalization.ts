import { useCallback, useMemo } from "react"

/**
 * Hook especializado en normalización de datos
 * Responsabilidad: Convertir y normalizar datos para uso consistente
 */
export function useDataNormalization() {
  // Memoizar constantes para evitar recreación en cada render
  const daysOfWeek = useMemo(() => ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], [])
  
  const dayNames = useMemo(() => ({
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  }), [])

  /**
   * Normaliza textos a slug: minúsculas, sin acentos, sólo [a-z0-9-]
   */
  const slugify = useCallback((input: string): string => {
    return String(input)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }, [])

  /**
   * Normaliza nombres de días a claves estándar
   */
  const normalizeDayKey = useCallback((nameOrKey: string) => {
    const key = nameOrKey.toLowerCase()
    const map: Record<string, string> = {
      lunes: 'monday',
      martes: 'tuesday',
      miércoles: 'wednesday',
      miercoles: 'wednesday',
      jueves: 'thursday',
      viernes: 'friday',
      sábado: 'saturday',
      sabado: 'saturday',
      domingo: 'sunday',
    }
    return map[key] ?? key
  }, [])

  /**
   * Determina si un tipo es procedimiento
   */
  const isProcedure = useCallback((tipo?: string) => {
    const t = (tipo || '').toLowerCase()
    return /(proced|qx|quir|cirug)/.test(t)
  }, [])

  /**
   * Determina si un tipo es consulta
   */
  const isConsulta = useCallback((tipo?: string) => {
    const t = (tipo || '').toLowerCase()
    return /(consulta|cons|medicina)/.test(t)
  }, [])

  /**
   * Valida y muestra el nombre del edificio según el código
   */
  const getBuildingDisplayName = useCallback((buildingCode: string | number | undefined): string => {
    if (!buildingCode) return 'No especificado'
    
    const code = String(buildingCode).trim()
    
    // Validación específica para códigos 1 y 2
    if (code === '1') return 'Principal'
    if (code === '2') return 'Torre Bless'
    
    // Para otros códigos, mantener la lógica actual
    return code
  }, [])

  return {
    // Constantes
    daysOfWeek,
    dayNames,
    // Funciones de normalización
    slugify,
    normalizeDayKey,
    isProcedure,
    isConsulta,
    getBuildingDisplayName,
  }
}
