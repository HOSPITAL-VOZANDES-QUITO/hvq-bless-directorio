// API Service for Hospital Vozandes Quito Medical Scheduling System
import { config } from './config'
import type { 
  Doctor, 
  Agenda, 
  Edificio, 
  ConsultorioNormalizado, 
  AgendaDetallada, 
  ApiResponse 
} from './types'

// Configuración para conectar con el backend real
const API_CONFIG = {
  BASE_URL: config.api.baseUrl,
  TIMEOUT: config.api.timeout,
  DEFAULT_HEADERS: config.headers
}

class ApiService {
  private baseURL: string
  private inMemoryCache: Map<string, { ts: number; data: any }>

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.inMemoryCache = new Map()
  }

  // Método helper para hacer requests al backend real
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const config: RequestInit = {
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers
      },
      ...options
    }

    try {
      // Cache GET simples por 30s
      const isGet = !config.method || config.method.toUpperCase() === 'GET'
      const cacheKey = `${config.method || 'GET'}:${url}`
      if (isGet) {
        const cached = this.inMemoryCache.get(cacheKey)
        if (cached && Date.now() - cached.ts < 30000) {
          return { data: cached.data as T, success: true }
        }
      }

      // Combinar señal externa (si existe) con timeout local
      const controller = new AbortController()
      const externalSignal = options.signal
      const onExternalAbort = () => {
        try { controller.abort((externalSignal as any)?.reason) } catch {}
      }
      if (externalSignal) {
        if (externalSignal.aborted) {
          onExternalAbort()
        } else {
          externalSignal.addEventListener('abort', onExternalAbort)
        }
      }
      const timeoutId = setTimeout(() => controller.abort(new DOMException('timeout','AbortError')), API_CONFIG.TIMEOUT)

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      if (externalSignal) externalSignal.removeEventListener('abort', onExternalAbort)

      if (!response.ok) {
        // No lanzar excepción: devolver un objeto de error controlado
        const errorData = await response
          .json()
          .catch(async () => ({ message: await response.text().catch(() => '') }))

        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: null as any as T,
          success: false,
          message: (errorData as any)?.message || `HTTP error ${response.status}`,
        }
      }

      // Intentar parsear JSON; si falla, devolver texto como data
      let data: unknown
      try {
        data = await response.json()
      } catch {
        data = await response.text().catch(() => null)
      }
      
      const ok: ApiResponse<T> = { data: data as T, success: true }
      if (isGet) {
        this.inMemoryCache.set(cacheKey, { ts: Date.now(), data })
      }
      return ok
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data: null as any as T,
          success: false,
          message: 'Request timeout'
        }
      }

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: null as any as T,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // ===== ENDPOINTS DE INFORMACIÓN =====
  async getApiInfo(): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/')
  }

  async getHealth(): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/health')
  }

  // ===== ENDPOINTS DE MÉDICOS =====
  async getDoctores(options?: { signal?: AbortSignal }): Promise<ApiResponse<Doctor[]>> {
    return this.request<Doctor[]>('/api/medicos', { signal: options?.signal })
  }

  async getEspecialidadesAgenda(): Promise<ApiResponse<string[]>> {
    return this.request<string[]>('/api/medicos/especialidades')
  }

  async getDoctoresPorEspecialidad(especialidadId: string | number): Promise<ApiResponse<Doctor[]>> {
    return this.request<Doctor[]>(`/api/medicos/especialidad/${encodeURIComponent(especialidadId)}`)
  }

  async getDoctorById(id: string | number): Promise<ApiResponse<Doctor>> {
    return this.request<Doctor>(`/api/medicos/item/${encodeURIComponent(id)}`)
  }

  async getDoctorByName(nombre: string): Promise<ApiResponse<Doctor[]>> {
    return this.request<Doctor[]>(`/api/medicos/nombre/${encodeURIComponent(nombre)}`)
  }

  async getDoctorStats(): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/api/medicos/estadisticas')
  }

  // ===== ENDPOINTS DE AGENDAS =====
  async getAgendas(): Promise<ApiResponse<Agenda[]>> {
    return this.request<Agenda[]>('/api/agnd-agenda')
  }

  async getAgendaById(id: number): Promise<ApiResponse<Agenda>> {
    return this.request<Agenda>(`/api/agnd-agenda/${id}`)
  }

  async getAgendasPorMedico(codigoPrestador: string): Promise<ApiResponse<Agenda[]>> {
    // Intentar con ambos nombres de parámetro para máxima compatibilidad
    const first = await this.request<Agenda[]>(`/api/agnd-agenda?codigo_prestador=${encodeURIComponent(codigoPrestador)}`)
    const listFirst: Record<string, unknown>[] = Array.isArray(first.data)
      ? (first.data as Record<string, unknown>[]) 
      : (Array.isArray((first.data as any)?.data) ? ((first.data as any).data as Record<string, unknown>[]) : [])
    if (first.success && listFirst.length > 0) return first

    const second = await this.request<Agenda[]>(`/api/agnd-agenda?cd_prestador=${encodeURIComponent(codigoPrestador)}`)
    const listSecond: Record<string, unknown>[] = Array.isArray(second.data)
      ? (second.data as Record<string, unknown>[])
      : (Array.isArray((second.data as any)?.data) ? ((second.data as any).data as Record<string, unknown>[]) : [])
    if (listSecond.length > 0) return second

    // Si ambos fallan, devolver el primero para mantener mensaje/estado
    return first.success ? first : second
  }

  async getAgendaStats(): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/api/agnd-agenda/estadisticas')
  }

  // ===== ENDPOINTS DE CATÁLOGOS =====
  async getConsultorios(): Promise<ApiResponse<unknown[]>> {
    return this.request<unknown[]>('/api/catalogos/consultorios')
  }

  async getDias(): Promise<ApiResponse<unknown[]>> {
    return this.request<unknown[]>('/api/catalogos/dias')
  }

  async getEdificios(): Promise<ApiResponse<Edificio[]>> {
    return this.request<Edificio[]>('/api/catalogos/edificios')
  }

  async getPisosEdificio(codigoEdificio: string): Promise<ApiResponse<string[]>> {
    return this.request<string[]>(`/api/catalogos/edificios/${encodeURIComponent(codigoEdificio)}/pisos`)
  }

  // ===== ENDPOINTS DE AGENDA PERSONALIZADA =====
  async getAgendasCustom(): Promise<ApiResponse<Agenda[]>> {
    return this.request<Agenda[]>('/api/agnd-agenda')
  }

  // ===== ORQUESTACIÓN: AGENDAS DETALLADAS POR MÉDICO =====
  async getAgendasDetalladasPorMedico(codigoPrestador: string | number): Promise<ApiResponse<AgendaDetallada[]>> {
    // Cargar en paralelo
    const inputCodigo = String(codigoPrestador)
    const [agendasRes, medicosRes, consultoriosRes, edificiosRes, diasRes] = await Promise.all([
      this.getAgendasPorMedico(inputCodigo),
      this.getDoctores(),
      this.getConsultorios(),
      this.getEdificios(),
      this.getDias()
    ])

    // Normalizar listas de data ya que el backend puede envolver en { data }
    let agendasFromProv: Record<string, unknown>[] = Array.isArray(agendasRes.data)
      ? (agendasRes.data as Record<string, unknown>[])
      : (Array.isArray((agendasRes.data as any)?.data) ? ((agendasRes.data as any).data as Record<string, unknown>[]) : [])

    const medicos: Record<string, unknown>[] = Array.isArray(medicosRes.data)
      ? (medicosRes.data as Record<string, unknown>[])
      : (Array.isArray((medicosRes.data as any)?.data) ? ((medicosRes.data as any).data as Record<string, unknown>[]) : [])

    // Usar el código de prestador proporcionado sin reasignar
    const providerCodeToUse = inputCodigo

    // Si la primera llamada no trajo resultados, volver a intentar explícitamente (ya maneja ambos parámetros)
    if (!agendasFromProv || agendasFromProv.length === 0) {
      const retry = await this.getAgendasPorMedico(providerCodeToUse)
      agendasFromProv = Array.isArray(retry.data)
        ? (retry.data as Record<string, unknown>[])
        : (Array.isArray((retry.data as any)?.data) ? ((retry.data as any).data as Record<string, unknown>[]) : [])
    }

    const consultoriosRaw: Record<string, unknown>[] = Array.isArray(consultoriosRes.data)
      ? (consultoriosRes.data as Record<string, unknown>[])
      : (Array.isArray((consultoriosRes.data as any)?.data) ? ((consultoriosRes.data as any).data as Record<string, unknown>[]) : [])

    const edificios: Record<string, unknown>[] = Array.isArray(edificiosRes.data)
      ? (edificiosRes.data as Record<string, unknown>[])
      : (Array.isArray((edificiosRes.data as any)?.data) ? ((edificiosRes.data as any).data as Record<string, unknown>[]) : [])



    const diasCatalogo: Record<string, unknown>[] = Array.isArray(diasRes.data)
      ? (diasRes.data as Record<string, unknown>[])
      : (Array.isArray((diasRes.data as any)?.data) ? ((diasRes.data as any).data as Record<string, unknown>[]) : [])

    // Normalizar consultorios desde API (acepta CD_CONSULTORIO/CD_EDIFICIO/CD_PISO/DES_CONSULTORIO)
    const normalizarConsultorio = (c: Record<string, unknown>): ConsultorioNormalizado => {
      
      const codigo = String(
        (c as any).codigo ?? (c as any).id ?? (c as any).codigo_consultorio ?? (c as any).CD_CONSULTORIO ?? (c as any).consultorio_id ?? ''
      )
      const edificio = String(
        (c as any).codigo_edificio ?? (c as any).edificio ?? (c as any).CD_EDIFICIO ?? (c as any).codigoEdificio ?? (c as any).edificio_id ?? (c as any).edificioId ?? ''
      )
      const piso = (c as any).piso ?? (c as any).CD_PISO ?? (c as any).codigoPiso ?? (c as any).piso_id ?? (c as any).pisoId
      const des_piso = (c as any).des_piso ?? (c as any).DES_PISO ?? (c as any).descripcion_piso ?? (c as any).DESCRIPCION_PISO ?? (c as any).descripcionPiso ?? (c as any).piso_descripcion
      // Priorizar campo de descripción del consultorio en diferentes variantes
      const descripcion = (c as any).des_consultorio
        ?? (c as any).DES_CONSULTORIO
        ?? (c as any).descripcion_consultorio
        ?? (c as any).DESCRIPCION_CONSULTORIO
        ?? (c as any).descripcion
        ?? (c as any).nombre
        ?? (c as any).consultorio
        ?? (c as any).consultorio_nombre
      
      const result = {
        codigo_consultorio: codigo,
        codigo_edificio: edificio || undefined,
        piso: piso as any,
        des_piso: des_piso ? String(des_piso) : undefined,
        descripcion_consultorio: descripcion ? String(descripcion) : undefined,
        __raw: c
      }
      
      return result
    }

    const consultorioPorCodigo = new Map<string, ConsultorioNormalizado>()
    consultoriosRaw.forEach((c) => {
      const norm = normalizarConsultorio(c)
      if (norm.codigo_consultorio) {
        consultorioPorCodigo.set(norm.codigo_consultorio, norm)
      }
    })
    


    const edificioPorCodigo = new Map<string, Record<string, unknown>>()
    edificios.forEach((e) => {
      const codigo = String((e as any).codigo ?? (e as any).id ?? (e as any).codigoEdificio ?? (e as any).CD_EDIFICIO ?? (e as any).edificio_id ?? '')
      if (codigo) {
        edificioPorCodigo.set(codigo, e)
      }
    })

    

    const pisosPorEdificio = new Map<string, Map<string, string>>()
    
    // Obtener pisos para todos los edificios únicos encontrados en los consultorios
    const edificiosUnicos = new Set<string>()
    consultoriosRaw.forEach((c) => {
      const edificio = String(
        (c as any).codigo_edificio ?? (c as any).edificio ?? (c as any).CD_EDIFICIO ?? (c as any).codigoEdificio ?? (c as any).edificio_id ?? (c as any).edificioId ?? ''
      )
      if (edificio) edificiosUnicos.add(edificio)
    })
    
    // Cargar pisos para cada edificio único
    const pisosPromises = Array.from(edificiosUnicos).map(async (edificioCodigo) => {
      const pisosRes = await this.getPisosEdificio(edificioCodigo)
      
      if (pisosRes.success && pisosRes.data) {
        // La estructura real es pisosRes.data.data, no pisosRes.data directamente
        const pisosArray = Array.isArray(pisosRes.data) 
          ? pisosRes.data 
          : Array.isArray((pisosRes.data as any)?.data) 
            ? (pisosRes.data as any).data 
            : []
        
        if (pisosArray.length > 0) {
          const mapPisos = new Map<string, string>()
          pisosArray.forEach((p: any) => {
            const codigoPiso = String(p.codigo_piso ?? p.codigo ?? p.id ?? '')
            const desc = String(p.descripcion_piso ?? p.descripcion ?? p.nombre ?? p.descripcionPiso ?? '')
            if (codigoPiso) mapPisos.set(codigoPiso, desc)
          })
          pisosPorEdificio.set(edificioCodigo, mapPisos)
        }
      }
    })
    
    await Promise.all(pisosPromises)


    const diaNombrePorCodigo = new Map<string, string>()
    diasCatalogo.forEach((d) => {
      const codigo = String((d as any).codigo ?? (d as any).id ?? '')
      const nombre = String((d as any).nombre ?? (d as any).descripcion ?? (d as any).name ?? '')
      if (codigo) diaNombrePorCodigo.set(codigo, nombre)
    })

    const decodeDiaNombre = (codigoDia: unknown): string => {
      const code = String(codigoDia ?? '').trim()
      if (!code) return ''
      const fromCatalog = diaNombrePorCodigo.get(code)
      if (fromCatalog) return String(fromCatalog)
      const upper = code.toUpperCase()
      const numberMap: Record<string, string> = {
        '1': 'Lunes', '2': 'Martes', '3': 'Miércoles', '4': 'Jueves', '5': 'Viernes', '6': 'Sábado', '7': 'Domingo'
      }
      if (numberMap[upper]) return numberMap[upper]
      const letterMap: Record<string, string> = {
        'L': 'Lunes', 'M': 'Martes', 'X': 'Miércoles', 'J': 'Jueves', 'V': 'Viernes', 'S': 'Sábado', 'D': 'Domingo'
      }
      if (letterMap[upper]) return letterMap[upper]
      const fullEsMap: Record<string, string> = {
        'LUNES': 'Lunes', 'MARTES': 'Martes', 'MIERCOLES': 'Miércoles', 'MIÉRCOLES': 'Miércoles',
        'JUEVES': 'Jueves', 'VIERNES': 'Viernes', 'SABADO': 'Sábado', 'SÁBADO': 'Sábado', 'DOMINGO': 'Domingo'
      }
      if (fullEsMap[upper]) return fullEsMap[upper]
      return code
    }

    const medicoPorId = new Map<string, Record<string, unknown>>()
    medicos.forEach((m) => {
      const candidates = [
        (m as any).id,
        (m as any).codigo,
        (m as any).codigoPrestador,
        (m as any).codigo_prestador,
        (m as any).cd_prestador,
        (m as any).prestadorId,
        (m as any).medicoId,
      ]
      candidates
        .map((v) => String(v ?? ''))
        .filter((v) => Boolean(v))
        .forEach((key) => {
          if (!medicoPorId.has(key)) medicoPorId.set(key, m)
        })
    })

    const toHHmm = (value: unknown): string => {
      if (value == null) return ''
      const str = String(value).trim()
      if (!str) return ''
      // HH:mm
      if (/^\d{2}:\d{2}$/.test(str)) return str
      // HH:mm:ss -> HH:mm
      if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str.slice(0, 5)
      // 830 -> 08:30, 1330 -> 13:30
      if (/^\d{3,4}$/.test(str)) {
        const padded = str.padStart(4, '0')
        return `${padded.slice(0, 2)}:${padded.slice(2)}`
      }
      // 8.3 or 8,3 etc -> fallback
      const onlyDigits = str.replace(/[^0-9]/g, '')
      if (onlyDigits.length >= 3 && onlyDigits.length <= 4) {
        const padded = onlyDigits.padStart(4, '0')
        return `${padded.slice(0, 2)}:${padded.slice(2)}`
      }
      return str
    }

    const decodeTipo = (t: unknown): string => {
      const v = String(t ?? '').toUpperCase()
      if (v === 'C') return 'Consulta'
      if (v === 'P') return 'Procedimiento'
      return v || ''
    }

    // IMPORTANTE: Solo usar las agendas específicas del médico - ELIMINAR FALLBACK COMPLETAMENTE
    let agendas: Record<string, unknown>[] = agendasFromProv
    
    // Si no hay agendas específicas, mantener array vacío (no mostrar datos de otros médicos)
    if (!agendas || agendas.length === 0) {
      agendas = []
    }

    const detalladas: AgendaDetallada[] = agendas.map((a) => {
      // Verificación adicional: asegurar que la agenda pertenece al médico correcto
      const prestadorId = String(
        (a as any).codigo_prestador ?? (a as any).codigoPrestador ?? (a as any).cd_prestador ?? (a as any).prestadorId ?? (a as any).medicoId ?? ''
      )
      
      // Doble verificación: solo procesar si coincide con el médico solicitado
      if (prestadorId !== providerCodeToUse) {
        return null as any
      }
             const codigoConsultorio = String(
         (a as any).codigo_consultorio ?? (a as any).consultorio ?? (a as any).consultorioCodigo ?? ''
       )
       
       const consultorio = consultorioPorCodigo.get(codigoConsultorio)
      
                    // FLUJO CORRECTO: Agenda -> Consultorio -> Edificio -> Piso
       
       // 1. Obtener código del edificio desde el consultorio
       const buildingCode = String(consultorio?.codigo_edificio ?? '')
       
       // 2. Buscar el edificio por su código
       const edificioRaw = buildingCode ? edificioPorCodigo.get(buildingCode) : undefined
       
       // 3. Obtener descripción del edificio del catálogo de edificios
       let edificioDescripcion = ''
       if (edificioRaw) {
         edificioDescripcion = String(
           (edificioRaw as any)?.descripcion_edificio ?? 
           (edificioRaw as any)?.descripcion ?? 
           (edificioRaw as any)?.nombre ?? 
           (edificioRaw as any)?.DES_EDIFICIO ??
           (edificioRaw as any)?.edificioNombre ??
           (edificioRaw as any)?.nombre_edificio ?? ''
         )
       }
       
       // 4. Si no encuentra el edificio, no usar fallback artificial; dejar vacío
       
       // 5. Obtener código del piso desde el consultorio
       const pisoCodigo = consultorio?.piso ?? (consultorio?.__raw as any)?.CD_PISO ?? (consultorio?.__raw as any)?.codigo_piso
       
       let pisoFormateado = ''
       let pisoDescripcion = ''
       
       // Prioridad 1: Buscar en el catálogo de pisos del edificio específico
       if (buildingCode && pisoCodigo != null) {
         const mapPisos = pisosPorEdificio.get(buildingCode)
         if (mapPisos) {
           const descripcionDelCatalogo = mapPisos.get(String(pisoCodigo))
           if (descripcionDelCatalogo) {
             pisoFormateado = descripcionDelCatalogo
             pisoDescripcion = descripcionDelCatalogo
           }
         }
       }
       
       // Prioridad 2: Usar descripción del consultorio si no se encontró en el catálogo
       if (!pisoFormateado && consultorio?.des_piso) {
         pisoFormateado = String(consultorio.des_piso)
         pisoDescripcion = String(consultorio.des_piso)
       }
       
       // Prioridad 3: Usar descripción del raw data del consultorio
       if (!pisoFormateado && consultorio?.__raw) {
         const rawPisoDesc = (consultorio.__raw as any)?.DES_PISO ?? (consultorio.__raw as any)?.descripcion_piso
         if (rawPisoDesc) {
           pisoFormateado = String(rawPisoDesc)
           pisoDescripcion = String(rawPisoDesc)
         }
       }
       
       // Fallback: mostrar código del piso si no hay descripción
       if (!pisoFormateado && pisoCodigo != null) {
         pisoFormateado = `Piso ${pisoCodigo}`
         pisoDescripcion = `Piso ${pisoCodigo}`
       }

      const medicoRaw = medicoPorId.get(prestadorId)
      const medicoNombre = String((medicoRaw as any)?.nombres ?? '')
      const especialidad = Array.isArray((medicoRaw as any)?.especialidades) && (medicoRaw as any).especialidades.length > 0
        ? String((medicoRaw as any).especialidades[0])
        : undefined

      const diaCodigo = String(
        (a as any).codigo_dia ?? (a as any).dia ?? (a as any).diaCodigo ?? ''
      )
      const diaNombre = decodeDiaNombre(diaCodigo)

      const horaInicio = toHHmm((a as any).hora_inicio ?? (a as any).horaInicio ?? (a as any).hora)
      const horaFin = toHHmm((a as any).hora_fin ?? (a as any).horaFin ?? (a as any).horarioFin)

      return {
        codigo_item_agendamiento: (a as any).codigo_item_agendamiento ?? (a as any).id ?? (a as any).codigo,
        codigo_prestador: (a as any).codigo_prestador,
        codigo_dia: (a as any).codigo_dia,
        hora_inicio: (a as any).hora_inicio,
        hora_fin: (a as any).hora_fin,
        tipo: (a as any).tipo,
        codigo_consultorio: (a as any).codigo_consultorio ?? codigoConsultorio,

        especialidad,
        medico: medicoNombre,
        diaNombre,
        horaInicioHHmm: horaInicio,
        horaFinHHmm: horaFin,
        consultorioDescripcion: consultorio?.descripcion_consultorio
          ? String(consultorio.descripcion_consultorio)
          : (consultorio?.__raw ? String((consultorio.__raw as any)?.DES_CONSULTORIO || '') : ''),
        consultorioCodigo: consultorio?.codigo_consultorio,
        edificioDescripcion,
        tipoTexto: decodeTipo((a as any).tipo),

        piso: pisoFormateado,
        pisoDescripcion,
        buildingCode
      }
    }).filter(Boolean) // Filtrar nulls

    return {
      data: detalladas,
      success: agendasRes.success && medicosRes.success && consultoriosRes.success && edificiosRes.success && diasRes.success,
      message: [agendasRes, medicosRes, consultoriosRes, edificiosRes, diasRes].find((r) => !r.success)?.message
    }
  }

  // ===== ENDPOINTS DE SERVICIOS EXTERNOS =====
  async getExternalDoctors(): Promise<ApiResponse<Doctor[]>> {
    return this.request<Doctor[]>('/api/external/medicos')
  }

  async getAuthStatus(): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/api/external/auth/status')
  }

  async getExternalConfig(): Promise<ApiResponse<unknown>> {
    return this.request<unknown>('/api/external/config')
  }

  // ===== NUEVOS MÉTODOS PARA COMPATIBILIDAD =====
  async getEspecialidadById(id: number): Promise<ApiResponse<{ especialidadId: number; descripcion: string }>> {
    const res = await this.getEspecialidadesAgenda()
    const list: any[] = Array.isArray(res.data) ? (res.data as any[]) : []
    const especialidad = list.find((spec: any) => spec && spec.especialidadId === id)
    const data = especialidad && typeof especialidad === 'object'
      ? { especialidadId: Number(especialidad.especialidadId), descripcion: String(especialidad.descripcion || `Especialidad ${id}`) }
      : { especialidadId: id, descripcion: `Especialidad ${id}` }
    return {
      data,
      success: res.success,
      message: res.message
    }
  }
}

export const apiService = new ApiService()