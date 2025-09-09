"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import "@/styles/pages.css"
import { DirectorioLayout } from "@/components/directorio-layout"
import { VirtualKeyboard } from "@/components/virtual-keyboard"
import { SearchIcon } from "lucide-react"
import { DoctorCard } from "@/components/doctor-card"
import { Spinner } from "@/components/ui/spinner"
import { useDoctorsCache } from "@/hooks/use-doctors-cache"

type DoctorItem = {
  id: string
  name: string
  specialtyId: string
  specialtyLabel: string
  photo?: string | null
  norm: string
}

const PAGE_SIZE = 12

export default function DoctorSearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [isPaginationDisabled, setIsPaginationDisabled] = useState(false)

  // Usar el hook de caché para obtener los datos de médicos
  const { doctors, loading, error } = useDoctorsCache()

  // Normalizador y lista base normalizada una sola vez por cambio de doctors
  const normalizedDoctors: DoctorItem[] = useMemo(() => {
    const normalize = (s: string) =>
      String(s || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
  // Traer todas las especialidades que tenga cada médico
    return doctors
      .map((d: any) => {
        const id = String(d.id ?? d.codigo ?? d.codigo_prestador ?? d.codigoPrestador ?? "")
        const name = String(d.nombres ?? d.nombre ?? "")
        
        // Extraer todas las especialidades
        let especialidades: Array<{id: string, label: string}> = []
        
        if (Array.isArray(d.especialidades) && d.especialidades.length > 0) {
          especialidades = d.especialidades.map((esp: any) => {
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
          const singleSpecialtyId = String(d.especialidadId ?? d.especialidad ?? "")
          if (singleSpecialtyId.trim().length > 0) {
            especialidades = [{ id: singleSpecialtyId, label: singleSpecialtyId }]
          }
        }
        
        // Para compatibilidad con el componente actual, usar la primera especialidad como principal
        const specialtyId = especialidades.length > 0 ? especialidades[0].id : ""
        const specialtyLabel = especialidades.length > 0 ? especialidades[0].label : ""
        
        const photo = d.retrato ?? d.foto ?? null
        return {
          id,
          name,
          specialtyId, // Especialidad principal (primera)
          specialtyLabel, // Etiqueta de especialidad principal
          especialidades, // Todas las especialidades
          photo,
          norm: normalize(name),
        }
      })
      .filter(d => d.name.trim().length > 0)
  }, [doctors])

  // Resetear página al cambiar lista o el término de búsqueda
  useEffect(() => {
    setPage(0)
  }, [searchTerm, normalizedDoctors.length])

  // Filtrado y/o paginación
  const filteredDoctors: DoctorItem[] = useMemo(() => {
    const collator = new Intl.Collator("es", { sensitivity: "base" })
    const trimmed = searchTerm.trim()

    if (trimmed) {
      const q = trimmed
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()

      return normalizedDoctors
        .filter(
          d =>
            d.norm.includes(q) ||
            String(d.specialtyLabel || "").toLowerCase().includes(q)
        )
        .sort((a, b) => collator.compare(a.name, b.name))
    }

    // Modo SIN búsqueda: paginar en bloques de 21, orden alfabético por nombre
    const sorted = [...normalizedDoctors].sort((a, b) => {
      const collator = new Intl.Collator("es", { sensitivity: "base" })
      return collator.compare(a.name, b.name)
    })

    const start = page * PAGE_SIZE
    const end = start + PAGE_SIZE
    return sorted.slice(start, end)
  }, [normalizedDoctors, searchTerm, page])

  // Total de páginas solo para modo sin búsqueda
  const totalPages = useMemo(() => {
    if (searchTerm.trim()) return 1
    return Math.max(1, Math.ceil(normalizedDoctors.length / PAGE_SIZE))
  }, [normalizedDoctors.length, searchTerm])

  const handleEnter = () => {
    setIsKeyboardOpen(false)
  }

  // Función para manejar navegación con timeout
  const handlePageNavigation = (newPage: number) => {
    if (isPaginationDisabled) return
    
    setIsPaginationDisabled(true)
    setPage(newPage)
    
    // Rehabilitar botones después de 2 segundos
    setTimeout(() => {
      setIsPaginationDisabled(false)
    }, 2000)
  }

  // Funciones específicas para cada botón
  const goToFirstPage = () => handlePageNavigation(0)
  const goToPreviousPage = () => handlePageNavigation(Math.max(0, page - 1))
  const goToNextPage = () => handlePageNavigation(Math.min(totalPages - 1, page + 1))
  const goToLastPage = () => handlePageNavigation(totalPages - 1)

  const getSpecialtySlug = (nameOrId: string) => {
    const v = String(nameOrId || "")
    if (/^\d+$/.test(v)) return v
    return v
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  }

  if (loading) {
    return (
      <DirectorioLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" />
        </div>
      </DirectorioLayout>
    )
  }

  if (error) {
    return (
      <DirectorioLayout>
        <p className="doctor-search-empty">{error}</p>
      </DirectorioLayout>
    )
  }

  return (
    <DirectorioLayout>
      <div style={{ paddingTop: "50px" }}>
        <div className="sticky top-24 z-30 w-full bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
          <div className="w-full px-4">
            <h1 className="doctor-search-title">Buscar Doctor por Nombre</h1>
            <div className="doctor-search-input-container" style={{ maxWidth: "100%" }}>
              <div className="doctor-search-input-wrapper" style={{ width: "100%" }}>
                <Input
                  type="text"
                  placeholder="Escribe el nombre del doctor..."
                  value={searchTerm}
                  onFocus={() => setIsKeyboardOpen(true)}
                  readOnly
                  aria-haspopup="dialog"
                  aria-controls="virtual-kb"
                  className="doctor-search-input"
                />
                <SearchIcon className="doctor-search-icon" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="w-full">
            {filteredDoctors.length > 0 ? (
              <>
                <div className="doctor-search-three-columns-layout">
                  {filteredDoctors.map((doctor) => {
                    const specSlug = getSpecialtySlug(String(doctor.specialtyId || ""))
                    const specLabel = String(doctor.specialtyLabel || doctor.specialtyId || "")
                    return (
                      <div key={doctor.id} className="doctor-search-column">
                        <DoctorCard
                          doctor={doctor}
                          specialtyName={specLabel}
                          basePath={`/specialties/${specSlug}`}
                          queryParams={{ source: 'doctor' }}
                        />
                      </div>
                    )
                  })}
                </div>

                {/* Controles de paginación: solo visibles en modo sin búsqueda y si hay más de una página */}
                {!searchTerm.trim() && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8 mb-4">
                    {/* Botón Ir al inicio */}
                    <button
                      type="button"
                      className="px-6 py-3 bg-gradient-to-r from-[#5A0A2F] to-[#6B0F35] hover:from-[#6B0F35] hover:to-[#5A0A2F] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg min-w-[100px] text-sm"
                      onClick={goToFirstPage}
                      disabled={page === 0 || isPaginationDisabled}
                      aria-label="Ir al inicio"
                    >
                      ⏮ Inicio
                    </button>
                    
                    {/* Botón Página anterior */}
                    <button
                      type="button"
                      className="px-8 py-4 bg-gradient-to-r from-[#7F0C43] to-[#8C1843] hover:from-[#8C1843] hover:to-[#7F0C43] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg min-w-[120px] text-lg"
                      onClick={goToPreviousPage}
                      disabled={page === 0 || isPaginationDisabled}
                      aria-label="Página anterior"
                    >
                      ← Anterior
                    </button>
                    
                    {/* Indicador de página actual */}
                    <div className="px-6 py-3 bg-gradient-to-r from-[#F9F4F6] to-[#E5E5E5] rounded-xl shadow-md border border-[#E5E5E5]">
                      <span className="text-lg font-semibold text-[#7F0C43]">
                        Página {page + 1} de {totalPages}
                      </span>
                    </div>
                    
                    {/* Botón Página siguiente */}
                    <button
                      type="button"
                      className="px-8 py-4 bg-gradient-to-r from-[#7F0C43] to-[#8C1843] hover:from-[#8C1843] hover:to-[#7F0C43] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg min-w-[120px] text-lg"
                      onClick={goToNextPage}
                      disabled={page >= totalPages - 1 || isPaginationDisabled}
                      aria-label="Página siguiente"
                    >
                      Siguiente →
                    </button>
                    
                    {/* Botón Ir al final */}
                    <button
                      type="button"
                      className="px-6 py-3 bg-gradient-to-r from-[#5A0A2F] to-[#6B0F35] hover:from-[#6B0F35] hover:to-[#5A0A2F] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg min-w-[100px] text-sm"
                      onClick={goToLastPage}
                      disabled={page >= totalPages - 1 || isPaginationDisabled}
                      aria-label="Ir al final"
                    >
                      Final ⏭
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="doctor-search-empty">
                {searchTerm
                  ? "No se encontraron doctores con ese nombre."
                  : "No hay doctores para mostrar."}
              </p>
            )}
          </div>
        </div>

        {isKeyboardOpen && (
          <VirtualKeyboard
            value={searchTerm}
            onChange={setSearchTerm}
            onClose={() => setIsKeyboardOpen(false)}
            placeholder="Buscar por nombre del doctor"
            onEnter={handleEnter}
          />
        )}
      </div>
    </DirectorioLayout>
  )
}
