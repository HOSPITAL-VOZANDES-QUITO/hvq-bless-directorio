import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useDataNormalization } from "./use-data-normalization"
import { useDoctorData } from "./use-doctor-data"
import { useDoctorScheduleUI } from "./use-doctor-schedule-ui"

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
 * Interfaz para información del médico
 */
interface DoctorInfo {
  id: number
  name: string
  specialty: string
  specialtyId: number
  especialidades: Array<{id: string, label: string}>
  photo?: string
}

/**
 * Hook principal para gestionar horarios de médicos
 * Orquesta hooks especializados para separar responsabilidades
 */
export function useDoctorSchedule(doctorSlug: string, specialtySlug: string) {
  // Estado separado en múltiples useState para evitar re-renders innecesarios
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null)
  const [doctorSchedules, setDoctorSchedules] = useState<Record<string, DoctorSchedule[]> | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedKind, setSelectedKind] = useState<'consulta' | 'procedimiento' | null>(null)
  const [source, setSource] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState(false)

  // Estados de carga granulares para mejor UX
  const [loadingStates, setLoadingStates] = useState({
    specialty: false,
    doctor: false,
    schedules: false,
    overall: true
  })

  // Errores específicos por operación
  const [errors, setErrors] = useState({
    specialty: null as string | null,
    doctor: null as string | null,
    schedules: null as string | null,
    general: null as string | null
  })

  const detailsRef = useRef<HTMLDivElement | null>(null)

  // Funciones helper para manejar estados de carga granulares
  const updateLoadingState = useCallback((updates: Partial<typeof loadingStates>) => {
    setLoadingStates(prev => ({ ...prev, ...updates }))
  }, [])

  const updateError = useCallback((operation: keyof typeof errors, error: string | null) => {
    setErrors(prev => ({ ...prev, [operation]: error }))
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({
      specialty: null,
      doctor: null,
      schedules: null,
      general: null
    })
  }, [])

  // Hooks especializados
  const { daysOfWeek, dayNames, slugify, normalizeDayKey, isProcedure, isConsulta, getBuildingDisplayName } = useDataNormalization()
  const { loadDoctorData } = useDoctorData()
  const { consultaDays, procedimientoDays, availableDays, isDaySelected, autoSelectDayAndType } = useDoctorScheduleUI(
    doctorSchedules,
    selectedDay,
    selectedKind,
    daysOfWeek,
    isConsulta,
    isProcedure,
    normalizeDayKey
  )

  /**
   * Carga todos los datos del médico y sus horarios con estados granulares
   */
  const loadData = useCallback(async (signal?: AbortSignal) => {
    try {
      // Iniciar carga general
      updateLoadingState({ overall: true })
      clearAllErrors()
      
      const { doctorInfo, formattedSchedules } = await loadDoctorData(
        doctorSlug,
        specialtySlug,
        slugify,
        normalizeDayKey,
        daysOfWeek,
        setSource,
        signal,
        updateLoadingState,
        updateError
      )

      // Verificar si el componente sigue montado antes de actualizar estado
      if (!signal?.aborted) {
        // Auto-seleccionar día y tipo
        autoSelectDayAndType(formattedSchedules, setSelectedDay, setSelectedKind)

        setDoctorInfo(doctorInfo)
        setDoctorSchedules(formattedSchedules)
        updateLoadingState({ overall: false })
      }
    } catch (err) {
      // Solo actualizar estado si no es un error de cancelación y el componente sigue montado
      if (!signal?.aborted && err instanceof Error && err.name !== 'AbortError') {
        updateError('general', err.message)
        updateLoadingState({ overall: false })
      } else if (!signal?.aborted) {
        updateError('general', 'Error desconocido')
        updateLoadingState({ overall: false })
      }
    }
  }, [doctorSlug, specialtySlug, slugify, normalizeDayKey, daysOfWeek, loadDoctorData, autoSelectDayAndType, updateLoadingState, updateError, clearAllErrors])

  // Cargar datos cuando cambian los parámetros
  useEffect(() => {
    if (doctorSlug && specialtySlug) {
      // Crear AbortController para cancelar requests pendientes
      const abortController = new AbortController()
      let isMounted = true
      
      const loadDataSafely = async () => {
        try {
          await loadData(abortController.signal)
        } catch (error) {
          // Solo manejar errores si el componente sigue montado
          if (isMounted && !abortController.signal.aborted) {
            console.error('Error loading doctor data:', error)
          }
        }
      }
      
      loadDataSafely()
      
      // Cleanup: cancelar requests y marcar como desmontado
      return () => {
        isMounted = false
        abortController.abort()
      }
    }
  }, [doctorSlug, specialtySlug, loadData])

  // Limpiar selección si el día seleccionado ya no está disponible
  useEffect(() => {
    if (selectedDay && !availableDays.includes(selectedDay)) {
      setSelectedDay(null)
    }
  }, [selectedDay, availableDays])

  // Scroll automático cuando se selecciona un día
  useEffect(() => {
    if (selectedDay && doctorSchedules?.[selectedDay]) {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedDay, doctorSchedules])

  // Calcular progreso total
  const progress = useMemo(() => {
    const steps = [loadingStates.specialty, loadingStates.doctor, loadingStates.schedules]
    const completedSteps = steps.filter(Boolean).length
    return Math.round((completedSteps / 3) * 100)
  }, [loadingStates])

  // Estado de carga general (para compatibilidad)
  const loading = loadingStates.overall
  const error = errors.general

  return {
    // Estados separados
    doctorInfo,
    doctorSchedules,
    selectedDay,
    selectedKind,
    source,
    // Estados de carga granulares
    loadingStates,
    errors,
    progress,
    // Estados de compatibilidad
    loading,
    error,
    // Referencias
    detailsRef,
    photoError,
    setPhotoError,
    // Datos procesados
    availableDays,
    consultaDays,
    procedimientoDays,
    dayNames,
    // Funciones de utilidad
    isDaySelected,
    getBuildingDisplayName,
    isProcedure,
    isConsulta,
    // Acciones
    setSelectedDay,
    setSelectedKind,
    reload: () => loadData()
  }
}