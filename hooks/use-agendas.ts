import { useState, useEffect, useMemo } from "react"

/**
 * Tipos para los datos de agendas
 */
type JsonRecord = Record<string, any>

/**
 * Estado del hook de agendas
 */
interface UseAgendasState {
  /** Lista de agendas cargadas */
  agendas: JsonRecord[]
  /** Lista de consultorios */
  consultorios: JsonRecord[]
  /** Lista de días de la semana */
  dias: JsonRecord[]
  /** Lista de edificios */
  edificios: JsonRecord[]
  /** Lista de pisos del edificio seleccionado */
  pisos: JsonRecord[]
  /** Estado de carga */
  loading: boolean
  /** Error si existe */
  error: string | null
}

/**
 * Filtros para las agendas
 */
interface AgendaFilters {
  /** Edificio seleccionado */
  edificioSeleccionado: string
  /** Piso seleccionado */
  pisoSeleccionado: string
}

/**
 * Hook personalizado para gestionar la lógica de negocio de las agendas
 * Separa la lógica de carga, normalización y filtrado de la presentación
 */
export function useAgendas() {
  // Estados principales
  const [state, setState] = useState<UseAgendasState>({
    agendas: [],
    consultorios: [],
    dias: [],
    edificios: [],
    pisos: [],
    loading: true,
    error: null
  })

  // Estados de filtros
  const [filters, setFilters] = useState<AgendaFilters>({
    edificioSeleccionado: "",
    pisoSeleccionado: ""
  })

  /**
   * Normaliza los datos de agendas desde la API
   * Estandariza los campos para consistencia en la aplicación
   */
  const normalizeAgendas = (rawAgendas: JsonRecord[]): JsonRecord[] => {
    return (rawAgendas || []).map((a: JsonRecord) => {
      const codigoConsultorio = a.consultorio ?? a.consultorioCodigo ?? a.consultorio_id ?? a.codigo_consultorio
      const diaCodigo = a.dia ?? a.diaCodigo ?? a.dia_id ?? a.codigo_dia
      const horaInicio = a.hora ?? a.horario ?? a.horaInicio ?? a.hora_inicio
      const horaFin = a.horaFin ?? a.horarioFin ?? a.hora_fin
      const tipo = a.tipo ?? a.type
      
      return {
        ...a,
        id: a.id ?? a.codigo_agenda ?? a.codigo ?? undefined,
        consultorio: codigoConsultorio,
        consultorioCodigo: String(codigoConsultorio ?? ''),
        dia: diaCodigo,
        diaCodigo: String(diaCodigo ?? ''),
        hora: horaInicio,
        horaInicio: horaInicio,
        horaFin: horaFin,
        tipo
      }
    })
  }

  /**
   * Carga inicial de todos los catálogos y agendas
   */
  const loadInitialData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      // Cargar todos los datos en paralelo
      const [agRes, consRes, diasRes, edifRes] = await Promise.all([
        fetch(`/api/agnd-agenda`, { cache: "no-store" }),
        fetch(`/api/catalogos/consultorios`, { cache: "no-store" }),
        fetch(`/api/catalogos/dias`, { cache: "no-store" }),
        fetch(`/api/catalogos/edificios`, { cache: "no-store" }),
      ])

      if (!agRes.ok || !consRes.ok || !diasRes.ok || !edifRes.ok) {
        throw new Error("Error al cargar datos de agendas o catálogos")
      }

      const [agData, consData, diasData, edifData] = await Promise.all([
        agRes.json(),
        consRes.json(),
        diasRes.json(),
        edifRes.json(),
      ])
      
      // Normalizar agendas
      const rawAgendas: JsonRecord[] = Array.isArray(agData)
        ? agData as JsonRecord[]
        : (Array.isArray((agData as any)?.data) ? (agData as any).data as JsonRecord[] : [])
      
      const normalizedAgendas = normalizeAgendas(rawAgendas)

      setState(prev => ({
        ...prev,
        agendas: normalizedAgendas,
        consultorios: Array.isArray(consData?.data) ? consData.data : consData,
        dias: Array.isArray(diasData?.data) ? diasData.data : diasData,
        edificios: Array.isArray(edifData?.data) ? edifData.data : edifData,
        loading: false,
        error: null
      }))
    } catch (e) {
      setState(prev => ({
        ...prev,
        error: e instanceof Error ? e.message : "Error desconocido",
        loading: false
      }))
    }
  }

  /**
   * Carga los pisos de un edificio específico
   */
  const loadFloors = async (edificioId: string) => {
    try {
      if (!edificioId) {
        setState(prev => ({ ...prev, pisos: [] }))
        setFilters(prev => ({ ...prev, pisoSeleccionado: "" }))
        return
      }
      
      const res = await fetch(`/api/catalogos/edificios/${edificioId}/pisos`, { cache: "no-store" })

      if (!res.ok) throw new Error("Error al cargar pisos del edificio")   
      
      const data = await res.json()
      const pisosList = Array.isArray(data?.data) ? data.data : data
      
      setState(prev => ({ ...prev, pisos: pisosList }))
      setFilters(prev => ({ ...prev, pisoSeleccionado: "" }))
    } catch (e) {
      setState(prev => ({
        ...prev,
        error: e instanceof Error ? e.message : "Error cargando pisos"
      }))
    }
  }

  /**
   * Mapa de consultorios por código para búsqueda rápida
   */
  const consultorioPorCodigo = useMemo(() => {
    const map: Record<string, JsonRecord> = {}
    state.consultorios.forEach((c) => {
      const codigo = String(c.codigo ?? c.id ?? "")
      if (codigo) map[codigo] = c
    })
    return map
  }, [state.consultorios])

  /**
   * Mapa de nombres de días por código
   */
  const nombreDiaPorCodigo = useMemo(() => {
    const map: Record<string, string> = {}
    state.dias.forEach((d) => {
      const codigo = String(d.codigo ?? d.id ?? "")
      const nombre = String(d.nombre ?? d.descripcion ?? d.name ?? "")
      if (codigo) map[codigo] = nombre
    })
    return map
  }, [state.dias])

  /**
   * Agendas filtradas y enriquecidas con datos de consultorios y edificios
   */
  const agendasFiltradas = useMemo(() => {
    // Enriquecer agendas con datos de consultorio, edificio, piso y día
    const enriquecidas: JsonRecord[] = state.agendas.map((a: JsonRecord) => {
      const codigoConsultorio = String(a.consultorio ?? a.consultorioCodigo ?? a.consultorio_id ?? a.codigo_consultorio ?? "")
      const c = consultorioPorCodigo[codigoConsultorio]
      return {
        ...a,
        consultorioCodigo: codigoConsultorio,
        consultorioNombre: c?.nombre ?? c?.descripcion ?? "",
        edificio: c?.edificio ?? "",
        piso: c?.piso ?? "",
        diaNombre: nombreDiaPorCodigo[String(a.dia ?? a.diaCodigo ?? a.dia_id ?? a.codigo_dia ?? "")] ?? "",
      }
    })

    // Aplicar filtros
    return enriquecidas.filter((a) => {
      if (filters.edificioSeleccionado && String(a.edificio) !== String(filters.edificioSeleccionado)) return false
      if (filters.pisoSeleccionado && String(a.piso) !== String(filters.pisoSeleccionado)) return false
      return true
    })
  }, [state.agendas, consultorioPorCodigo, nombreDiaPorCodigo, filters])

  /**
   * Actualiza el filtro de edificio y carga sus pisos
   */
  const setEdificioSeleccionado = (edificioId: string) => {
    setFilters(prev => ({ ...prev, edificioSeleccionado: edificioId }))
    loadFloors(edificioId)
  }

  /**
   * Actualiza el filtro de piso
   */
  const setPisoSeleccionado = (pisoId: string) => {
    setFilters(prev => ({ ...prev, pisoSeleccionado: pisoId }))
  }

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    loadInitialData()
  }, [])

  // Cargar pisos cuando cambia el edificio seleccionado
  useEffect(() => {
    loadFloors(filters.edificioSeleccionado)
  }, [filters.edificioSeleccionado])

  return {
    // Estados
    ...state,
    // Filtros
    filters,
    // Datos procesados
    agendasFiltradas,
    consultorioPorCodigo,
    nombreDiaPorCodigo,
    // Acciones
    setEdificioSeleccionado,
    setPisoSeleccionado,
    // Funciones de utilidad
    reload: loadInitialData
  }
}
