import { useCallback } from "react"
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
 * Hook especializado en fetching de datos de médicos
 * Responsabilidad: Obtener y procesar datos del backend
 */
export function useDoctorData() {
  /**
   * Resuelve la especialidad por ID o por slug
   */
  const resolveSpecialty = useCallback(async (
    token: string, 
    specialtySlug: string, 
    slugify: (input: string) => string, 
    signal?: AbortSignal,
    updateLoadingState?: (updates: any) => void,
    updateError?: (operation: 'specialty' | 'doctor' | 'schedules' | 'general', error: string | null) => void
  ) => {
    try {
      updateLoadingState?.({ specialty: true })
      updateError?.('specialty', null)
      
      const isSpecialtyId = /^\d+$/.test(specialtySlug)
      let foundSpecialty: any
      
      if (isSpecialtyId) {
      const res = await axios.get(`${config.api.baseUrl}/especialidades/${specialtySlug}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal
      })
      foundSpecialty = res.data
    } else {
      const res = await axios.get(`${config.api.baseUrl}/especialidades/agenda`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal
      })
      const list = Array.isArray(res.data) ? res.data : []
      foundSpecialty = list.find((spec: any) => 
        slugify(String(spec.descripcion)) === slugify(String(specialtySlug))
      )
    }

      if (!foundSpecialty) {
        throw new Error('Especialidad no encontrada')
      }

      updateLoadingState?.({ specialty: false })
      return foundSpecialty
    } catch (error) {
      updateLoadingState?.({ specialty: false })
      updateError?.('specialty', error instanceof Error ? error.message : 'Error al cargar especialidad')
      throw error
    }
  }, [])

  /**
   * Resuelve el médico por ID o por slug
   */
  const resolveDoctor = useCallback(async (
    token: string, 
    doctorSlug: string, 
    foundSpecialty: any, 
    slugify: (input: string) => string, 
    signal?: AbortSignal,
    updateLoadingState?: (updates: any) => void,
    updateError?: (operation: 'specialty' | 'doctor' | 'schedules' | 'general', error: string | null) => void
  ) => {
    try {
      updateLoadingState?.({ doctor: true })
      updateError?.('doctor', null)
      
      const isDoctorId = /^\d+$/.test(doctorSlug)
      let doctorData: any
      let doctorIdToUse: number
      
      if (isDoctorId) {
      const res = await axios.get(`${config.api.baseUrl}/medico/agenda/${doctorSlug}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal
      })
      doctorData = res.data
      doctorIdToUse = doctorData.id
    } else {
      const res = await axios.get(`${config.api.baseUrl}/medico/especialidad/${foundSpecialty.especialidadId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal
      })
      const list = Array.isArray(res.data) ? res.data : []
      const foundDoctor = list.find((doc: any) => 
        slugify(String(doc.nombres)) === slugify(String(doctorSlug))
      )
      
      if (!foundDoctor) {
        throw new Error('Médico no encontrado')
      }

      const detail = await axios.get(`${config.api.baseUrl}/medico/agenda/${foundDoctor.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        signal
      })
      doctorData = detail.data
      doctorIdToUse = foundDoctor.id
    }

      updateLoadingState?.({ doctor: false })
      return { doctorData, doctorIdToUse }
    } catch (error) {
      updateLoadingState?.({ doctor: false })
      updateError?.('doctor', error instanceof Error ? error.message : 'Error al cargar médico')
      throw error
    }
  }, [])

  /**
   * Construye los horarios del médico desde los datos detallados
   */
  const buildSchedules = useCallback(async (
    doctorData: any, 
    doctorIdToUse: number, 
    foundSpecialty: any,
    normalizeDayKey: (nameOrKey: string) => string,
    daysOfWeek: string[],
    setSource: (source: string | null) => void,
    signal?: AbortSignal,
    updateLoadingState?: (updates: any) => void,
    updateError?: (operation: 'specialty' | 'doctor' | 'schedules' | 'general', error: string | null) => void
  ) => {
    try {
      updateLoadingState?.({ schedules: true })
      updateError?.('schedules', null)
      
      const providerId = doctorData.codigoPrestador ?? doctorData.codigo_prestador ?? doctorIdToUse
      const urlParams = new URLSearchParams(window.location.search)
      const fromSource = urlParams.get('source')
      const passSpecialtyId = fromSource === 'specialty'
      
      setSource(fromSource)
    
    const detalladasRes = passSpecialtyId 
      ? await apiService.getAgendasDetalladasPorMedico(String(providerId), foundSpecialty.especialidadId)
      : await apiService.getAgendasDetalladasPorMedico(String(providerId))
    
    const detalladas = Array.isArray(detalladasRes.data)
      ? (detalladasRes.data as any[])
      : []

    const formattedSchedules: Record<string, DoctorSchedule[]> = {}
    
    detalladas.forEach((item: any) => {
      const dayKey = normalizeDayKey(String(item.diaNombre))
      if (!daysOfWeek.includes(dayKey)) return
      
      const rawInicio = (item.horaInicioHHmm ?? item.hora_inicio ?? item.horaInicio ?? item.hora) as unknown
      const rawFin = (item.horaFinHHmm ?? item.hora_fin ?? item.horaFin ?? item.horarioFin) as unknown
      const inicio = formatHHmmTo12h(extractHHmm(rawInicio))
      const fin = formatHHmmTo12h(extractHHmm(rawFin))
      const time = fin ? `${inicio} - ${fin}` : inicio

      const entry: DoctorSchedule = {
        time,
        room: item.consultorioDescripcion,
        building: item.edificioDescripcion || (item as any).buildingCode,
        floor: item.piso || (item as any).pisoDescripcion || (item as any).des_piso,
        tipo: item.tipoTexto || undefined,
        specialtyLabel: (item as any).especialidad || undefined,
      }
      
      if (!formattedSchedules[dayKey]) formattedSchedules[dayKey] = []
      formattedSchedules[dayKey].push(entry)
    })

      updateLoadingState?.({ schedules: false })
      return formattedSchedules
    } catch (error) {
      updateLoadingState?.({ schedules: false })
      updateError?.('schedules', error instanceof Error ? error.message : 'Error al cargar horarios')
      throw error
    }
  }, [])

  /**
   * Carga todos los datos del médico y sus horarios
   */
  const loadDoctorData = useCallback(async (
    doctorSlug: string,
    specialtySlug: string,
    slugify: (input: string) => string,
    normalizeDayKey: (nameOrKey: string) => string,
    daysOfWeek: string[],
    setSource: (source: string | null) => void,
    signal?: AbortSignal,
    updateLoadingState?: (updates: any) => void,
    updateError?: (operation: 'specialty' | 'doctor' | 'schedules' | 'general', error: string | null) => void
  ) => {
    const token = await getAccessToken()

    // 1. Resolver especialidad
    const foundSpecialty = await resolveSpecialty(token, specialtySlug, slugify, signal, updateLoadingState, updateError)

    // 2. Resolver médico
    const { doctorData, doctorIdToUse } = await resolveDoctor(token, doctorSlug, foundSpecialty, slugify, signal, updateLoadingState, updateError)

    // 3. Construir información del médico
    let especialidades: Array<{id: string, label: string}> = []
    
    if (Array.isArray(doctorData.especialidades) && doctorData.especialidades.length > 0) {
      especialidades = doctorData.especialidades.map((esp: any) => {
        if (esp && typeof esp === "object") {
          const espId = String((esp as any).especialidadId ?? (esp as any).id ?? (esp as any).codigo ?? "")
          const espLabel = String((esp as any).descripcion ?? (esp as any).nombre ?? espId)
          return { id: espId, label: espLabel }
        }
        return { id: String(esp), label: String(esp) }
      })
    } else {
      // Si no hay especialidades en el médico, usar la especialidad encontrada
      const singleSpecialtyId = String(foundSpecialty.especialidadId ?? foundSpecialty.especialidad ?? "")
      const singleSpecialtyLabel = String(foundSpecialty.descripcion ?? foundSpecialty.nombre ?? singleSpecialtyId)
      especialidades = [{ id: singleSpecialtyId, label: singleSpecialtyLabel }]
    }

    const doctorInfo: DoctorInfo = {
      id: doctorData.id,
      name: doctorData.nombres,
      specialty: foundSpecialty.descripcion,
      specialtyId: foundSpecialty.especialidadId,
      especialidades: especialidades,
      photo: doctorData.retrato
    }

    // 4. Construir horarios
    const formattedSchedules = await buildSchedules(doctorData, doctorIdToUse, foundSpecialty, normalizeDayKey, daysOfWeek, setSource, signal, updateLoadingState, updateError)

    return { doctorInfo, formattedSchedules }
  }, [resolveSpecialty, resolveDoctor, buildSchedules])

  return {
    loadDoctorData,
  }
}
