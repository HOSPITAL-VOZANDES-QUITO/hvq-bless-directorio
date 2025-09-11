import { useCallback, useMemo } from "react"

/**
 * Interfaz para horarios de médicos
 */
interface DoctorSchedule {
  time: string
  room: string
  building: string
  floor?: string
  tipo?: string
  specialtyLabel?: string
}

/**
 * Hook especializado en lógica de UI para horarios de médicos
 * Responsabilidad: Manejar la lógica de interfaz de usuario
 */
export function useDoctorScheduleUI(
  doctorSchedules: Record<string, DoctorSchedule[]> | null,
  selectedDay: string | null,
  selectedKind: 'consulta' | 'procedimiento' | null,
  daysOfWeek: string[],
  isConsulta: (tipo?: string) => boolean,
  isProcedure: (tipo?: string) => boolean,
  normalizeDayKey: (nameOrKey: string) => string
) {
  /**
   * Días disponibles para consulta
   */
  const consultaDays = useMemo(() => {
    return daysOfWeek.filter((day) => {
      const list = (doctorSchedules || {})[day]
      if (!list || list.length === 0) return false
      return list.some((s) => isConsulta(s.tipo))
    })
  }, [doctorSchedules, daysOfWeek, isConsulta])

  /**
   * Días disponibles para procedimiento
   */
  const procedimientoDays = useMemo(() => {
    return daysOfWeek.filter((day) => {
      const list = (doctorSchedules || {})[day]
      if (!list || list.length === 0) return false
      return list.some((s) => isProcedure(s.tipo))
    })
  }, [doctorSchedules, daysOfWeek, isProcedure])

  /**
   * Días disponibles en general
   */
  const availableDays = useMemo(() => {
    return Object.keys(doctorSchedules || {}).filter((d) => daysOfWeek.includes(d))
  }, [doctorSchedules, daysOfWeek])

  /**
   * Determina si un día debe estar seleccionado visualmente
   */
  const isDaySelected = useCallback((day: string, kind: 'consulta' | 'procedimiento') => {
    if (selectedDay !== day) return false
    if (!selectedKind) return false
    return selectedKind === kind
  }, [selectedDay, selectedKind])

  /**
   * Auto-selecciona el día y tipo basado en disponibilidad
   */
  const autoSelectDayAndType = useCallback((
    formattedSchedules: Record<string, DoctorSchedule[]>,
    setSelectedDay: (day: string | null) => void,
    setSelectedKind: (kind: 'consulta' | 'procedimiento' | null) => void
  ) => {
    const availableDays = Object.keys(formattedSchedules).filter((d) => daysOfWeek.includes(d))
    
    // Obtener el día actual
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase()
    const todayKey = normalizeDayKey(today)
    
    let dayToSelect: string | null = null
    
    // Prioridad 1: Si el día actual está disponible, seleccionarlo
    if (availableDays.includes(todayKey)) {
      dayToSelect = todayKey
    }
    // Prioridad 2: Si solo hay un día disponible, seleccionarlo
    else if (availableDays.length === 1) {
      dayToSelect = availableDays[0]
    }
    
    if (dayToSelect) {
      setSelectedDay(dayToSelect)
      
      // Determinar el tipo automáticamente si solo hay un tipo en ese día
      const daySchedules = formattedSchedules[dayToSelect]
      const hasConsulta = daySchedules.some(sched => isConsulta(sched.tipo))
      const hasProcedimiento = daySchedules.some(sched => isProcedure(sched.tipo))
      
      if (hasConsulta && !hasProcedimiento) {
        setSelectedKind('consulta')
      } else if (hasProcedimiento && !hasConsulta) {
        setSelectedKind('procedimiento')
      }
      // Si tiene ambos tipos, no establecer selectedKind para mostrar todos
    }
  }, [daysOfWeek, normalizeDayKey, isConsulta, isProcedure])

  return {
    // Datos procesados
    consultaDays,
    procedimientoDays,
    availableDays,
    // Funciones de UI
    isDaySelected,
    autoSelectDayAndType,
  }
}
