// Tipos centralizados para el proyecto del directorio médico HVQ

// ===== TIPOS BÁSICOS DE LA API =====

/**
 * Interfaz que representa un médico en el sistema
 * Contiene información básica del médico y sus especialidades
 */
export interface Doctor {
  /** Identificador único del médico */
  id?: string | number
  /** Código del médico en el sistema */
  codigo?: string | number
  /** Código de prestador del médico */
  codigoPrestador?: string | number
  /** Código de prestador alternativo */
  codigo_prestador?: string | number
  /** Código de prestador en formato corto */
  cd_prestador?: string | number
  /** ID del prestador */
  prestadorId?: string | number
  /** ID del médico */
  medicoId?: string | number
  /** Nombre completo del médico */
  nombres?: string
  /** Lista de especialidades del médico */
  especialidades?: string[]
  /** Permite propiedades adicionales para flexibilidad */
  [key: string]: unknown
}

/**
 * Interfaz que representa una agenda médica
 * Contiene información sobre horarios, consultorios y médicos
 */
export interface Agenda {
  /** Identificador único de la agenda */
  id?: string | number
  /** Código del item de agendamiento */
  codigo_item_agendamiento?: string | number
  /** Código del prestador médico */
  codigo_prestador?: string | number
  /** Código del prestador alternativo */
  codigoPrestador?: string | number
  /** Código del prestador en formato corto */
  cd_prestador?: string | number
  /** ID del prestador */
  prestadorId?: string | number
  /** ID del médico */
  medicoId?: string | number
  /** Código del día de la semana */
  codigo_dia?: string | number
  /** Día de la semana */
  dia?: string | number
  /** Código del día alternativo */
  diaCodigo?: string | number
  /** Hora de inicio del turno */
  hora_inicio?: string | number
  /** Hora de inicio alternativa */
  horaInicio?: string | number
  /** Hora genérica */
  hora?: string | number
  /** Hora de fin del turno */
  hora_fin?: string | number
  /** Hora de fin alternativa */
  horaFin?: string | number
  /** Horario de fin alternativo */
  horarioFin?: string | number
  /** Tipo de consulta (C=Consulta, P=Procedimiento) */
  tipo?: string
  /** Código del consultorio */
  codigo_consultorio?: string | number
  /** Consultorio */
  consultorio?: string | number
  /** Código del consultorio alternativo */
  consultorioCodigo?: string | number
  /** Permite propiedades adicionales para flexibilidad */
  [key: string]: unknown
}

/**
 * Interfaz que representa un edificio del hospital
 * Contiene información sobre la ubicación física
 */
export interface Edificio {
  /** Identificador único del edificio */
  id?: string | number
  /** Código del edificio */
  codigo?: string | number
  /** Código del edificio alternativo */
  codigoEdificio?: string | number
  /** Código del edificio en formato de base de datos */
  CD_EDIFICIO?: string | number
  /** ID del edificio */
  edificio_id?: string | number
  /** Descripción del edificio */
  descripcion_edificio?: string
  /** Descripción alternativa */
  descripcion?: string
  /** Nombre del edificio */
  nombre?: string
  /** Descripción del edificio en formato de base de datos */
  DES_EDIFICIO?: string
  /** Nombre del edificio alternativo */
  edificioNombre?: string
  /** Nombre del edificio en formato de base de datos */
  nombre_edificio?: string
  /** Permite propiedades adicionales para flexibilidad */
  [key: string]: unknown
}

/**
 * Interfaz que representa una especialidad médica
 * Contiene información sobre la especialidad y su ubicación
 */
export interface Especialidad {
  /** ID único de la especialidad */
  especialidadId: number
  /** Descripción de la especialidad */
  descripcion: string | null
  /** Tipo de especialidad */
  tipo: string | null
  /** Icono asociado a la especialidad */
  icono: string | null
  /** Piso donde se encuentra la especialidad */
  piso?: string | null
}

// ===== TIPOS PARA CONSULTORIOS =====

/**
 * Interfaz que representa un consultorio normalizado
 * Contiene información estandarizada del consultorio y su ubicación
 */
export interface ConsultorioNormalizado {
  /** Código único del consultorio */
  codigo_consultorio: string
  /** Código del edificio donde está ubicado */
  codigo_edificio?: string
  /** Piso del consultorio */
  piso?: string | number
  /** Descripción del piso */
  des_piso?: string
  /** Descripción del consultorio */
  descripcion_consultorio?: string
  /** Datos originales sin procesar */
  __raw?: Record<string, unknown>
}

// ===== TIPOS PARA AGENDAS DETALLADAS =====

/**
 * Interfaz que representa una agenda médica detallada
 * Combina datos de la base de datos con información procesada para la UI
 */
export interface AgendaDetallada {
  // === Datos originales de AGND_AGENDA ===
  /** Código del item de agendamiento */
  codigo_item_agendamiento?: string | number
  /** Código del prestador médico */
  codigo_prestador?: string | number
  /** Código del día de la semana */
  codigo_dia?: string | number
  /** Hora de inicio del turno */
  hora_inicio?: string | number
  /** Hora de fin del turno */
  hora_fin?: string | number
  /** Tipo de consulta */
  tipo?: string
  /** Código del consultorio */
  codigo_consultorio?: string | number
  /** ID de la especialidad (puede ser múltiple) */
  especialidadId?: string | number | (string | number)[]

  // === Datos procesados y decodificados ===
  /** Nombre de la especialidad */
  especialidad?: string
  /** Nombre del médico */
  medico?: string
  /** Nombre del día de la semana */
  diaNombre?: string
  /** Hora de inicio en formato HH:mm */
  horaInicioHHmm?: string
  /** Hora de fin en formato HH:mm */
  horaFinHHmm?: string
  /** Descripción del consultorio */
  consultorioDescripcion?: string
  /** Código del consultorio */
  consultorioCodigo?: string
  /** Descripción del edificio */
  edificioDescripcion?: string
  /** Tipo de consulta en texto legible */
  tipoTexto?: string

  // === Información adicional para la UI ===
  /** Piso del consultorio */
  piso?: string | number
  /** Descripción del piso */
  pisoDescripcion?: string
  /** Código del edificio */
  buildingCode?: string
}

// ===== TIPOS PARA RESPUESTAS DE API =====

/**
 * Interfaz genérica para respuestas de la API
 * Estructura estándar para todas las respuestas del backend
 */
export interface ApiResponse<T> {
  /** Datos de la respuesta */
  data: T
  /** Indica si la operación fue exitosa */
  success: boolean
  /** Mensaje de error o información adicional */
  message?: string
}

// ===== TIPOS PARA AUTENTICACIÓN =====

/**
 * Interfaz que representa los tokens de autenticación
 * Contiene los tokens necesarios para acceder a la API
 */
export interface AuthTokens {
  /** Token de acceso para las peticiones */
  accessToken: string
  /** Token para renovar el acceso */
  refreshToken: string
}

/**
 * Interfaz que representa un error de autenticación
 * Contiene información sobre errores en el proceso de autenticación
 */
export interface AuthError {
  /** Mensaje descriptivo del error */
  message: string
  /** Código de error opcional */
  code?: string
}

// ===== TIPOS PARA COMPONENTES =====

/**
 * Props para el componente CurrentTime
 * Define las variantes de visualización del tiempo
 */
export interface CurrentTimeProps {
  /** Variante de visualización: completa o compacta */
  variant?: 'full' | 'compact'
}

/**
 * Props para el componente DirectorioLayout
 * Define la estructura del layout principal de la aplicación
 */
export interface DirectorioLayoutProps {
  /** Contenido hijo del layout */
  children: React.ReactNode
  /** Indica si mostrar el botón de retroceso */
  showBackButton?: boolean
}

/**
 * Props para el componente VirtualKeyboard
 * Define la funcionalidad del teclado virtual
 */
export interface VirtualKeyboardProps {
  /** Valor actual del input */
  value: string
  /** Función para manejar cambios en el valor */
  onChange: (value: string) => void
  /** Función para cerrar el teclado */
  onClose: () => void
  /** Texto placeholder del input */
  placeholder?: string
  /** Función para manejar la tecla Enter */
  onEnter?: () => void
}

// ===== TIPOS PARA ERRORES =====

/**
 * Interfaz que representa un error de la aplicación
 * Contiene información detallada sobre errores que pueden ocurrir
 */
export interface AppError {
  /** Mensaje descriptivo del error */
  message: string
  /** Código de error opcional */
  code?: string
  /** Detalles adicionales del error */
  details?: unknown
}

// ===== TIPOS PARA CACHÉ =====

/**
 * Interfaz que representa una entrada en el caché
 * Contiene los datos y timestamp para control de expiración
 */
export interface CacheEntry<T> {
  /** Timestamp de cuando se creó la entrada */
  ts: number
  /** Datos almacenados en el caché */
  data: T
}
