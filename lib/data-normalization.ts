/**
 * Servicio de utilidad para normalización de datos
 * Contiene funciones reutilizables para estandarizar datos de la API
 */

/**
 * Normaliza textos a slug: minúsculas, sin acentos, sólo [a-z0-9-]
 * Función reutilizable para convertir nombres a slugs consistentes
 */
export function slugify(input: string): string {
  return String(input || "")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Normaliza nombres de días a claves estándar
 * Convierte nombres de días en español a claves en inglés consistentes
 */
export function normalizeDayKey(nameOrKey: string): string {
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
 * Determina si un tipo de consulta es procedimiento
 * Identifica procedimientos quirúrgicos basado en patrones de texto
 */
export function isProcedure(tipo?: string): boolean {
  const t = (tipo || '').toLowerCase()
  return /(proced|qx|quir|cirug)/.test(t)
}

/**
 * Determina si un tipo de consulta es consulta médica
 * Identifica consultas médicas regulares
 */
export function isConsulta(tipo?: string): boolean {
  return !isProcedure(tipo)
}

/**
 * Valida y muestra el nombre del edificio según el código
 * Convierte códigos de edificio a nombres legibles
 */
export function getBuildingDisplayName(buildingCode: string | number | undefined): string {
  if (!buildingCode) return 'No especificado'
  
  const code = String(buildingCode).trim()
  
  // Validación específica para códigos conocidos
  if (code === '1') return 'Principal'
  if (code === '2') return 'Torre Bless'
  
  // Para otros códigos, mantener la lógica actual
  return code
}

/**
 * Normaliza datos de agendas desde la API
 * Estandariza los campos para consistencia en la aplicación
 */
export function normalizeAgendaData(rawAgendas: Record<string, any>[]): Record<string, any>[] {
  return (rawAgendas || []).map((a: Record<string, any>) => {
    const codigoConsultorio = a.consultorio ?? a.consultorioCodigo ?? a.consultorio_id ?? a.codigo_consultorio
    const diaCodigo = a.dia ?? a.diaCodigo ?? a.dia_id ?? a.codigo_dia
    const horaInicio = a.hora ?? a.horario ?? a.horaInicio ?? a.hora_inicio
    const horaFin = a.horaFin ?? a.horaFin ?? a.hora_fin
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
 * Normaliza datos de especialidades
 * Estandariza la estructura de especialidades médicas
 */
export function normalizeSpecialtyData(especialidades: any[]): Array<{id: string, label: string}> {
  if (!Array.isArray(especialidades) || especialidades.length === 0) {
    return []
  }

  return especialidades.map((esp: any) => {
    if (esp && typeof esp === "object") {
      const espId = String((esp as any).especialidadId ?? (esp as any).id ?? (esp as any).codigo ?? "")
      const espLabel = String((esp as any).descripcion ?? (esp as any).nombre ?? espId)
      return { id: espId, label: espLabel }
    } else {
      const espStr = String(esp)
      return { id: espStr, label: espStr }
    }
  }).filter((esp: any) => esp.id.trim().length > 0)
}

/**
 * Crea un mapa de consultorios por código para búsqueda rápida
 * Optimiza la búsqueda de consultorios por código
 */
export function createConsultorioMap(consultorios: Record<string, any>[]): Record<string, Record<string, any>> {
  const map: Record<string, Record<string, any>> = {}
  consultorios.forEach((c) => {
    const codigo = String(c.codigo ?? c.id ?? "")
    if (codigo) map[codigo] = c
  })
  return map
}

/**
 * Crea un mapa de nombres de días por código
 * Optimiza la búsqueda de nombres de días por código
 */
export function createDayNameMap(dias: Record<string, any>[]): Record<string, string> {
  const map: Record<string, string> = {}
  dias.forEach((d) => {
    const codigo = String(d.codigo ?? d.id ?? "")
    const nombre = String(d.nombre ?? d.descripcion ?? d.name ?? "")
    if (codigo) map[codigo] = nombre
  })
  return map
}

/**
 * Enriquece agendas con datos de consultorios y edificios
 * Combina datos de agendas con información de consultorios para mostrar información completa
 */
export function enrichAgendasWithConsultorioData(
  agendas: Record<string, any>[],
  consultorioMap: Record<string, Record<string, any>>,
  dayNameMap: Record<string, string>
): Record<string, any>[] {
  return agendas.map((a: Record<string, any>) => {
    const codigoConsultorio = String(a.consultorio ?? a.consultorioCodigo ?? a.consultorio_id ?? a.codigo_consultorio ?? "")
    const c = consultorioMap[codigoConsultorio]
    return {
      ...a,
      consultorioCodigo: codigoConsultorio,
      consultorioNombre: c?.nombre ?? c?.descripcion ?? "",
      edificio: c?.edificio ?? "",
      piso: c?.piso ?? "",
      diaNombre: dayNameMap[String(a.dia ?? a.diaCodigo ?? a.dia_id ?? a.codigo_dia ?? "")] ?? "",
    }
  })
}

/**
 * Filtra agendas por edificio y piso
 * Aplica filtros de ubicación a las agendas
 */
export function filterAgendasByLocation(
  agendas: Record<string, any>[],
  edificioSeleccionado: string,
  pisoSeleccionado: string
): Record<string, any>[] {
  return agendas.filter((a) => {
    if (edificioSeleccionado && String(a.edificio) !== String(edificioSeleccionado)) return false
    if (pisoSeleccionado && String(a.piso) !== String(pisoSeleccionado)) return false
    return true
  })
}
