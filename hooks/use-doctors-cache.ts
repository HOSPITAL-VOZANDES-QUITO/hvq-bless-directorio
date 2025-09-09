import { useState, useEffect, useCallback } from 'react'
import { apiService } from '@/lib/api-service'

/**
 * Interfaz para los datos del caché de médicos
 * Define la estructura de los datos almacenados en localStorage
 */
interface DoctorCacheData {
  /** Lista de médicos almacenados */
  doctors: any[]
  /** Timestamp de cuando se creó el caché */
  timestamp: number
  /** ID único de la sesión actual */
  sessionId: string
}

// Configuración del caché
const CACHE_KEY = 'hvq_doctors_cache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 horas en milisegundos

// Función para generar un ID único para la sesión actual
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Hook personalizado para manejar el caché de médicos con localStorage
export function useDoctorsCache() {
  // Estados para manejar los datos, carga y errores
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)

  // Función para limpiar el caché del localStorage
  const clearCache = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY)
    }
  }, [])

  // Función principal para cargar datos desde caché o API
  const loadDoctors = useCallback(async (signal?: AbortSignal) => {
    // Verificar si estamos en el cliente
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Verificar si hay datos en caché
      const cachedData = localStorage.getItem(CACHE_KEY)
      const currentSessionId = generateSessionId()

      if (cachedData) {
        try {
          const parsedCache: DoctorCacheData = JSON.parse(cachedData)
          const now = Date.now()
          
          // Verificar si el caché es válido (no expirado)
          if (parsedCache.timestamp && (now - parsedCache.timestamp) < CACHE_DURATION) {
            setDoctors(parsedCache.doctors)
            setIsFromCache(true)
            setLoading(false)
            return
          }
        } catch (parseError) {
          console.warn('Error al parsear caché de médicos:', parseError)
          // Si hay error al parsear, continuar con la carga desde API
        }
      }

      // Si no hay caché válido, cargar desde API
      const res = await apiService.getDoctores({ signal })
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray((res.data as any)?.data)
        ? (res.data as any).data
        : []

      if (!signal?.aborted) {
        setDoctors(list)
        setIsFromCache(false)
        
        // Guardar los nuevos datos en caché
        const cacheData: DoctorCacheData = {
          doctors: list,
          timestamp: Date.now(),
          sessionId: currentSessionId
        }
        
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
        } catch (storageError) {
          console.warn('Error al guardar en caché:', storageError)
        }
      }
    } catch (e) {
      if (!signal?.aborted) {
        setError(e instanceof Error ? e.message : "Error cargando médicos")
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false)
      }
    }
  }, [])

  // Función para forzar recarga desde API ignorando el caché
  const refreshDoctors = useCallback(async (signal?: AbortSignal) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY)
    }
    await loadDoctors(signal)
  }, [loadDoctors])

  // Efecto para cargar datos al montar el componente y limpiar caché al desmontar
  useEffect(() => {
    const controller = new AbortController()
    loadDoctors(controller.signal)

    // Limpiar caché cuando se cierra la página o se navega fuera
    const handleBeforeUnload = () => {
      clearCache()
    }

    const handlePageHide = () => {
      clearCache()
    }

    // Agregar listeners para limpiar caché al cerrar la pestaña/ventana
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('pagehide', handlePageHide)

    return () => {
      controller.abort()
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('pagehide', handlePageHide)
    }
  }, [loadDoctors, clearCache])

  return {
    doctors,
    loading,
    error,
    isFromCache,
    refreshDoctors,
    clearCache
  }
}
