import { useState, useEffect } from "react"
import axios from "axios"
import { getAccessToken } from "@/lib/auth"
import { config } from "@/lib/config"

/**
 * Interfaz para especialidades
 */
interface Especialidad {
  especialidadId: number
  descripcion: string
  tipo?: string
  icono?: string
}

/**
 * Interfaz para médicos
 */
interface Medico {
  id: number
  nombres: string
  retrato?: string
  especialidades: Especialidad[]
}

/**
 * Estado del hook de médicos por especialidad
 */
interface UseSpecialtyDoctorsState {
  /** Lista de médicos de la especialidad */
  doctors: Medico[]
  /** Nombre de la especialidad */
  specialtyName: string
  /** ID resuelto de la especialidad */
  resolvedSpecialtyId: string | null
  /** Estado de carga */
  loading: boolean
  /** Error si existe */
  error: string | null
}

/**
 * Hook personalizado para gestionar la lógica de negocio de médicos por especialidad
 * Separa la lógica de resolución de especialidades y carga de médicos de la presentación
 */
export function useSpecialtyDoctors(specialtyId: string) {
  const [state, setState] = useState<UseSpecialtyDoctorsState>({
    doctors: [],
    specialtyName: "",
    resolvedSpecialtyId: null,
    loading: true,
    error: null
  })

  /**
   * Normaliza textos a slug: minúsculas, sin acentos, sólo [a-z0-9-]
   */
  const slugify = (input: string): string => {
    return String(input)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  /**
   * Resuelve la especialidad por ID o por slug
   */
  const resolveSpecialty = async (token: string, specialtyId: string) => {
    const isId = /^\d+$/.test(String(specialtyId))
    
    if (isId) {
      // Es un ID numérico, obtener directamente
      const specialtyResponse = await axios.get(`${config.api.baseUrl}/especialidades/${specialtyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (!specialtyResponse.data?.descripcion) {
        throw new Error('Especialidad no encontrada')
      }
      
      return {
        name: specialtyResponse.data.descripcion,
        resolvedId: String(specialtyResponse.data.especialidadId ?? specialtyId)
      }
    } else {
      // Es un slug, buscar en la lista de especialidades
      const res = await axios.get(`${config.api.baseUrl}/especialidades/agenda`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      const list = Array.isArray(res.data) ? res.data : []
      const match = list.find((spec: any) => 
        slugify(String(spec.descripcion)) === slugify(String(specialtyId))
      )
      
      if (!match) {
        throw new Error('Especialidad no encontrada')
      }
      
      return {
        name: match.descripcion,
        resolvedId: String(match.especialidadId)
      }
    }
  }

  /**
   * Carga todos los médicos y los filtra por especialidad
   */
  const loadDoctorsBySpecialty = async (token: string, resolvedSpecialtyId: string) => {
    // Obtener todos los médicos con sus detalles
    const allDoctorsResponse = await axios.get(`${config.api.baseUrl}/medico/agenda`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    // Verificar si la respuesta es un array de IDs o de objetos completos
    const isArrayOfIds = Array.isArray(allDoctorsResponse.data) &&
      allDoctorsResponse.data.every((item: any) => typeof item === 'number')

    let doctorsData: Medico[] = []

    if (isArrayOfIds) {
      // Si es array de IDs, obtener detalles de cada médico
      const successfulDoctors: Medico[] = []

      // Usar Promise.allSettled para manejar errores individuales
      const results = await Promise.allSettled(
        allDoctorsResponse.data.map(async (doctorId: number) => {
          try {
            const doctorResponse = await axios.get(`${config.api.baseUrl}/medico/agenda/${doctorId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            })
            return doctorResponse.data
          } catch (err) {
            // En producción, no deberíamos loggear errores de usuario
            return null
          }
        })
      )

      // Filtrar médicos válidos y que pertenecen a la especialidad
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          const doctor = result.value
          if (
            doctor.especialidades?.some(
              (esp: Especialidad) => String(esp.especialidadId) === String(resolvedSpecialtyId)
            )
          ) {
            successfulDoctors.push(doctor)
          }
        }
      })

      doctorsData = successfulDoctors
    } else {
      // Si ya son objetos completos, filtrar directamente
      doctorsData = allDoctorsResponse.data.filter((doctor: Medico) =>
        doctor.especialidades?.some(
          (esp: Especialidad) => String(esp.especialidadId) === String(resolvedSpecialtyId)
        )
      )
    }

    return doctorsData
  }

  /**
   * Carga los datos de médicos para la especialidad
   */
  const loadData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      const token = await getAccessToken()

      // 1. Resolver la especialidad
      const specialtyInfo = await resolveSpecialty(token, specialtyId)
      
      // 2. Cargar médicos de la especialidad
      const doctors = await loadDoctorsBySpecialty(token, specialtyInfo.resolvedId)

      setState(prev => ({
        ...prev,
        doctors,
        specialtyName: specialtyInfo.name,
        resolvedSpecialtyId: specialtyInfo.resolvedId,
        loading: false,
        error: null
      }))
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Error al cargar los doctores. Intente nuevamente más tarde.',
        loading: false
      }))
    }
  }

  // Cargar datos cuando cambia el specialtyId
  useEffect(() => {
    if (specialtyId) {
      loadData()
    }
  }, [specialtyId])

  return {
    // Estados
    ...state,
    // Acciones
    reload: loadData
  }
}
