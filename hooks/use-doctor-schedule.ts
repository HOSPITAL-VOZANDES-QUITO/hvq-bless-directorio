import { useState, useEffect, useMemo, useRef } from "react"
import axios from "axios"
import { getAccessToken } from "@/lib/auth"
import { apiService } from "@/lib/api-service"
import { config } from "@/lib/config"
import { extractHHmm, formatHHmmTo12h } from "@/lib/utils"

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
 * Estado del hook de horarios de médico
 */
interface UseDoctorScheduleState {
  /** Información del médico */
  doctorInfo: DoctorInfo | null
  /** Horarios del médico organizados por día */
  doctorSchedules: Record<string, DoctorSchedule[]> | null
  /** Día seleccionado */
  selectedDay: string | null
  /** Tipo de consulta seleccionado */
  selectedKind: 'consulta' | 'procedimiento' | null
  /** Estado de carga */
  loading: boolean
  /** Error si existe */
  error: string | null
  /** Origen de la navegación */
  source: string | null
}

/**
 * Hook personalizado para gestionar la lógica de negocio de horarios de médicos
 * Separa la lógica compleja de resolución, construcción de horarios y auto-selección
 */
export function useDoctorSchedule(doctorSlug: string, specialtySlug: string) {
  const [state, setState] = useState<UseDoctorScheduleState>({
    doctorInfo: null,
    doctorSchedules: null,
    selectedDay: null,
    selectedKind: null,
    loading: true,
    error: null,
    source: null
  })

  const detailsRef = useRef<HTMLDivElement | null>(null)
  const [photoError, setPhotoError] = useState(false)

  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
  const dayNames: { [key: string]: string } = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  }

  /**
   * Normaliza textos a slug: minúsculas, sin acentos, sólo [a-z0-9-]
   */
  const slugify = (input: string): string => {
    return String(input || "")
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * Determina si un tipo es procedimiento
   */
  const isProcedure = (tipo?: string) => {
    const t = (tipo || '').toLowerCase()
    return /(proced|qx|quir|cirug)/.test(t)
  }

  /**
   * Determina si un tipo es consulta
   */
  const isConsulta = (tipo?: string) => !isProcedure(tipo)

  /**
   * Normaliza nombres de días a claves estándar
   */
  const normalizeDayKey = (nameOrKey: string) => {
    const key = (nameOrKey || '').toLowerCase()
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
    return map[key] || key
  }

  /**
   * Resuelve la especialidad por ID o por slug
   */
  const resolveSpecialty = async (token: string, specialtySlug: string) => {
    const isSpecialtyId = /^\d+$/.test(specialtySlug)
    let foundSpecialty: any
    
    if (isSpecialtyId) {
      const res = await axios.get(`${config.api.authUrl}/especialidades/${specialtySlug}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      foundSpecialty = res.data
    } else {
      const res = await axios.get(`${config.api.authUrl}/especialidades/agenda`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const list = Array.isArray(res.data) ? res.data : []
      foundSpecialty = list.find((spec: any) => 
        slugify(String(spec.descripcion || '')) === slugify(String(specialtySlug))
      )
    }

    if (!foundSpecialty) {
      throw new Error('Especialidad no encontrada')
    }

    return foundSpecialty
  }

  /**
   * Resuelve el médico por ID o por slug
   */
  const resolveDoctor = async (token: string, doctorSlug: string, foundSpecialty: any) => {
    const isDoctorId = /^\d+$/.test(doctorSlug)
    let doctorData: any
    let doctorIdToUse: number
    
    if (isDoctorId) {
      const res = await axios.get(`${config.api.authUrl}/medico/agenda/${doctorSlug}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      doctorData = res.data
      doctorIdToUse = doctorData.id
    } else {
      const res = await axios.get(`${config.api.authUrl}/medico/especialidad/${foundSpecialty.especialidadId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const list = Array.isArray(res.data) ? res.data : []
      const foundDoctor = list.find((doc: any) => 
        slugify(String(doc.nombres || '')) === slugify(String(doctorSlug))
      )
      
      if (!foundDoctor) {
        throw new Error('Médico no encontrado')
      }
      
      const detail = await axios.get(`${config.api.authUrl}/medico/agenda/${foundDoctor.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      doctorData = detail.data
      doctorIdToUse = foundDoctor.id
    }

    return { doctorData, doctorIdToUse }
  }

  /**
   * Construye los horarios del médico desde los datos detallados
   */
  const buildSchedules = async (doctorData: any, doctorIdToUse: number, foundSpecialty: any) => {
    const providerId = doctorData.codigoPrestador ?? doctorData.codigo_prestador ?? doctorIdToUse
    const urlParams = new URLSearchParams(window.location.search)
    const fromSource = urlParams.get('source')
    const passSpecialtyId = fromSource === 'specialty'
    
    setState(prev => ({ ...prev, source: fromSource }))
    
    const detalladasRes = passSpecialtyId 
      ? await apiService.getAgendasDetalladasPorMedico(String(providerId), foundSpecialty.especialidadId)
      : await apiService.getAgendasDetalladasPorMedico(String(providerId))
    
    const detalladas = Array.isArray(detalladasRes.data)
      ? (detalladasRes.data as any[])
      : []

    const formattedSchedules: Record<string, DoctorSchedule[]> = {}
    
    detalladas.forEach((item: any) => {
      const dayKey = normalizeDayKey(String(item.diaNombre || ''))
      if (!daysOfWeek.includes(dayKey)) return
      
      const rawInicio = (item.horaInicioHHmm ?? item.hora_inicio ?? item.horaInicio ?? item.hora) as unknown
      const rawFin = (item.horaFinHHmm ?? item.hora_fin ?? item.horaFin ?? item.horarioFin) as unknown
      const inicio = formatHHmmTo12h(extractHHmm(rawInicio))
      const fin = formatHHmmTo12h(extractHHmm(rawFin))
      const time = fin ? `${inicio} - ${fin}` : inicio

      const entry: DoctorSchedule = {
        time,
        room: item.consultorioDescripcion || 'No especificado',
        building: item.edificioDescripcion || (item as any).buildingCode || 'No especificado',
        floor: item.piso || (item as any).pisoDescripcion || (item as any).des_piso || 'No especificado',
        tipo: item.tipoTexto || undefined,
        specialtyLabel: (item as any).especialidad || undefined,
      }
      
      if (!formattedSchedules[dayKey]) formattedSchedules[dayKey] = []
      formattedSchedules[dayKey].push(entry)
    })

    return formattedSchedules
  }

  /**
   * Auto-selecciona el día y tipo basado en disponibilidad
   */
  const autoSelectDayAndType = (formattedSchedules: Record<string, DoctorSchedule[]>) => {
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
      setState(prev => ({ ...prev, selectedDay: dayToSelect }))
      
      // Determinar el tipo automáticamente si solo hay un tipo en ese día
      const daySchedules = formattedSchedules[dayToSelect]
      const hasConsulta = daySchedules.some(sched => isConsulta(sched.tipo))
      const hasProcedimiento = daySchedules.some(sched => isProcedure(sched.tipo))
      
      if (hasConsulta && !hasProcedimiento) {
        setState(prev => ({ ...prev, selectedKind: 'consulta' }))
      } else if (hasProcedimiento && !hasConsulta) {
        setState(prev => ({ ...prev, selectedKind: 'procedimiento' }))
      }
      // Si tiene ambos tipos, no establecer selectedKind para mostrar todos
    }
  }

  /**
   * Carga todos los datos del médico y sus horarios
   */
  const loadData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const token = await getAccessToken()

      // 1. Resolver especialidad
      const foundSpecialty = await resolveSpecialty(token, specialtySlug)

      // 2. Resolver médico
      const { doctorData, doctorIdToUse } = await resolveDoctor(token, doctorSlug, foundSpecialty)

      // 3. Construir información del médico
      let especialidades: Array<{id: string, label: string}> = []
      
      if (Array.isArray(doctorData.especialidades) && doctorData.especialidades.length > 0) {
        especialidades = doctorData.especialidades.map((esp: any) => {
          if (esp && typeof esp === "object") {
            const espId = String((esp as any).especialidadId ?? (esp as any).id ?? (esp as any).codigo ?? "")
            const espLabel = String((esp as any).descripcion ?? (esp as any).nombre ?? espId)
            return { id: espId, label: espLabel }
          } else {
            const espStr = String(esp)
            return { id: espStr, label: espStr }
          }
        }).filter((esp: any) => esp.id.trim().length > 0)
      } else {
        // Fallback para médicos con especialidad individual
        const singleSpecialtyId = String(foundSpecialty.especialidadId ?? foundSpecialty.especialidad ?? "")
        const singleSpecialtyLabel = String(foundSpecialty.descripcion ?? foundSpecialty.nombre ?? singleSpecialtyId)
        if (singleSpecialtyId.trim().length > 0) {
          especialidades = [{ id: singleSpecialtyId, label: singleSpecialtyLabel }]
        }
      }

      const doctorInfo: DoctorInfo = {
        id: doctorData.id,
        name: doctorData.nombres || 'Nombre no disponible',
        specialty: foundSpecialty.descripcion || 'Especialidad no disponible',
        specialtyId: foundSpecialty.especialidadId,
        especialidades: especialidades,
        photo: doctorData.retrato
      }

      // 4. Construir horarios
      const formattedSchedules = await buildSchedules(doctorData, doctorIdToUse, foundSpecialty)

      // 5. Auto-seleccionar día y tipo
      autoSelectDayAndType(formattedSchedules)

      setState(prev => ({
        ...prev,
        doctorInfo,
        doctorSchedules: formattedSchedules,
        loading: false,
        error: null
      }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Error desconocido',
        loading: false
      }))
    }
  }

  /**
   * Días disponibles para consulta
   */
  const consultaDays = useMemo(() => {
    return daysOfWeek.filter((day) => {
      const list = (state.doctorSchedules || {})[day]
      if (!list || list.length === 0) return false
      return list.some((s) => isConsulta(s.tipo))
    })
  }, [state.doctorSchedules])

  /**
   * Días disponibles para procedimiento
   */
  const procedimientoDays = useMemo(() => {
    return daysOfWeek.filter((day) => {
      const list = (state.doctorSchedules || {})[day]
      if (!list || list.length === 0) return false
      return list.some((s) => isProcedure(s.tipo))
    })
  }, [state.doctorSchedules])

  /**
   * Días disponibles en general
   */
  const availableDays = useMemo(() => {
    return Object.keys(state.doctorSchedules || {}).filter((d) => daysOfWeek.includes(d))
  }, [state.doctorSchedules])

  /**
   * Determina si un día debe estar seleccionado visualmente
   */
  const isDaySelected = (day: string, kind: 'consulta' | 'procedimiento') => {
    if (state.selectedDay !== day) return false
    if (!state.selectedKind) return false
    return state.selectedKind === kind
  }

  /**
   * Valida y muestra el nombre del edificio según el código
   */
  const getBuildingDisplayName = (buildingCode: string | number | undefined): string => {
    if (!buildingCode) return 'No especificado'
    
    const code = String(buildingCode).trim()
    
    // Validación específica para códigos 1 y 2
    if (code === '1') return 'Principal'
    if (code === '2') return 'Torre Bless'
    
    // Para otros códigos, mantener la lógica actual
    return code
  }

  // Cargar datos cuando cambian los parámetros
  useEffect(() => {
    if (doctorSlug && specialtySlug) {
      loadData()
    }
  }, [doctorSlug, specialtySlug])

  // Limpiar selección si el día seleccionado ya no está disponible
  useEffect(() => {
    if (state.selectedDay && !availableDays.includes(state.selectedDay)) {
      setState(prev => ({ ...prev, selectedDay: null }))
    }
  }, [state.selectedDay, availableDays])

  // Scroll automático cuando se selecciona un día
  useEffect(() => {
    if (state.selectedDay && state.doctorSchedules?.[state.selectedDay]) {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [state.selectedDay, state.doctorSchedules])

  return {
    // Estados
    ...state,
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
    setSelectedDay: (day: string | null) => setState(prev => ({ ...prev, selectedDay: day })),
    setSelectedKind: (kind: 'consulta' | 'procedimiento' | null) => setState(prev => ({ ...prev, selectedKind: kind })),
    reload: loadData
  }
}
