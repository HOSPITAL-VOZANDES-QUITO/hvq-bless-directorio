// Tipos centralizados para el proyecto

// Tipos básicos de la API
export interface Doctor {
  id?: string | number
  codigo?: string | number
  codigoPrestador?: string | number
  codigo_prestador?: string | number
  cd_prestador?: string | number
  prestadorId?: string | number
  medicoId?: string | number
  nombres?: string
  especialidades?: string[]
  [key: string]: unknown
}

export interface Agenda {
  id?: string | number
  codigo_item_agendamiento?: string | number
  codigo_prestador?: string | number
  codigoPrestador?: string | number
  cd_prestador?: string | number
  prestadorId?: string | number
  medicoId?: string | number
  codigo_dia?: string | number
  dia?: string | number
  diaCodigo?: string | number
  hora_inicio?: string | number
  horaInicio?: string | number
  hora?: string | number
  hora_fin?: string | number
  horaFin?: string | number
  horarioFin?: string | number
  tipo?: string
  codigo_consultorio?: string | number
  consultorio?: string | number
  consultorioCodigo?: string | number
  [key: string]: unknown
}

export interface Edificio {
  id?: string | number
  codigo?: string | number
  codigoEdificio?: string | number
  CD_EDIFICIO?: string | number
  edificio_id?: string | number
  descripcion_edificio?: string
  descripcion?: string
  nombre?: string
  DES_EDIFICIO?: string
  edificioNombre?: string
  nombre_edificio?: string
  [key: string]: unknown
}

export interface Especialidad {
  especialidadId: number
  descripcion: string | null
  tipo: string | null
  icono: string | null
  piso?: string | null // Nuevo campo que trae la API externa
}

// Tipos para consultorios
export interface ConsultorioNormalizado {
  codigo_consultorio: string
  codigo_edificio?: string
  piso?: string | number
  des_piso?: string
  descripcion_consultorio?: string
  __raw?: Record<string, unknown>
}

// Tipos para agendas detalladas
export interface AgendaDetallada {
  // Origen directo de AGND_AGENDA
  codigo_item_agendamiento?: string | number
  codigo_prestador?: string | number
  codigo_dia?: string | number
  hora_inicio?: string | number
  hora_fin?: string | number
  tipo?: string
  codigo_consultorio?: string | number
  especialidadId?: string | number | (string | number)[]

  // Derivados / decodificados
  especialidad?: string
  medico?: string
  diaNombre?: string
  horaInicioHHmm?: string
  horaFinHHmm?: string
  consultorioDescripcion?: string
  consultorioCodigo?: string
  edificioDescripcion?: string
  tipoTexto?: string

  // Extras útiles para UI
  piso?: string | number
  pisoDescripcion?: string
  buildingCode?: string
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// Tipos para autenticación
export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthError {
  message: string
  code?: string
}

// Tipos para componentes
export interface CurrentTimeProps {
  variant?: 'full' | 'compact'
}

export interface DirectorioLayoutProps {
  children: React.ReactNode
  showBackButton?: boolean
}

export interface VirtualKeyboardProps {
  value: string
  onChange: (value: string) => void
  onClose: () => void
  placeholder?: string
  onEnter?: () => void
}

// Tipos para errores
export interface AppError {
  message: string
  code?: string
  details?: unknown
}

// Tipos para caché
export interface CacheEntry<T> {
  ts: number
  data: T
}
