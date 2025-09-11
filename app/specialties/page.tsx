"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import "@/styles/pages.css"
import "@/styles/especialidades.css"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { DirectorioLayout } from "@/components/directorio-layout"
import { VirtualKeyboard } from "@/components/virtual-keyboard"
import { SearchIcon } from 'lucide-react'
import axios from "axios"
import { getAccessToken } from "../../lib/auth"
import { Spinner } from "@/components/ui/spinner"
import { config } from "@/lib/config"
import type { Especialidad } from "@/lib/types"
// import { apiService } from "@/lib/api-service" // Ya no necesario para obtener ubicaciones

export default function SpecialtiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [specialties, setSpecialties] = useState<Especialidad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        // Cacheado simple en sessionStorage (v5: piso viene directo de API externa)
        const cacheKey = 'specialties_agenda_cache_v5'
        const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null
        
        if (cached) {
          const parsed = JSON.parse(cached)
          const cacheAge = Date.now() - parsed.ts
          
          if (parsed?.ts && cacheAge < config.cache.specialties && Array.isArray(parsed.data)) {
            setSpecialties(parsed.data)
            return
          }
        }
        
        const token = await getAccessToken()
        
        const response = await axios.get(`${config.api.baseUrl}/especialidades/agenda`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          },
          timeout: config.api.timeout
        })

        // Traer TODAS las especialidades válidas (ahora ya incluyen el piso), ordenadas alfabéticamente
        const finalList = (response.data as Especialidad[])
          .filter((esp: Especialidad) => Boolean(esp.descripcion))
          .sort((a: Especialidad, b: Especialidad) => (a.descripcion || '').localeCompare(b.descripcion || ''))
        
        // ¡Ya no necesitamos consultas adicionales! El piso viene directamente de la API externa
        setSpecialties(finalList)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: finalList }))
        }
      } catch (err) {
        setError('Error al cargar las especialidades. Intente nuevamente más tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchSpecialties()
  }, [])

  // Filtrar especialidades según el término de búsqueda
  const filteredSpecialties = useMemo(() => {
    return searchTerm
      ? specialties.filter(s =>
        s.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()))
      : specialties
  }, [searchTerm, specialties])

  const handleEnter = () => {
    setIsKeyboardOpen(false)
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
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </DirectorioLayout>
    )
  }

  return (
    <DirectorioLayout>
      <div className="specialties-container" style={{ paddingTop: '10px' }}>
        <div className="sticky top-24 z-30 w-full bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
          <div className="w-full px-4">
            <h1 className="specialties-title">Especialidades Médicas</h1>
            <div className="doctor-search-input-container" style={{ maxWidth: '100%' }}>
              <div className="doctor-search-input-wrapper" style={{ width: '100%' }}>
                <Input
                  type="text"
                  placeholder="Buscar especialidad..."
                  value={searchTerm}
                  onFocus={() => setIsKeyboardOpen(true)}
                  readOnly
                  className="doctor-search-input"
                />
                <SearchIcon className="doctor-search-icon" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="w-full">
            {filteredSpecialties.length > 0 ? (
              <div className="doctor-search-three-columns-layout" style={{ marginTop: '2rem' }}>
                {filteredSpecialties.map((specialty) => (
                  <div key={specialty.especialidadId} className="doctor-search-column">
                    <Link
                      href={`/specialties/${specialty.especialidadId}`}
                      passHref
                      onClick={() => setIsKeyboardOpen(false)}
                    >
                      <Card className="specialties-card group">
                        <CardContent className="specialties-card-content">
                          {specialty.icono ? (
                            <div className="specialties-icon-container">
                              <img
                                src={specialty.icono}
                                alt={`Icono de ${specialty.descripcion}`}
                                className="specialties-card-icon"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                }}
                              />
                            </div>
                          ) : (
                            <div className="specialties-default-icon">
                              <span className="text-2xl">🏥</span>
                            </div>
                          )}
                          <CardTitle className="specialties-card-title">
                            {specialty.descripcion}
                          </CardTitle>
                          {specialty.piso && (
                            <p className="font-semibold" style={{ fontFamily: "Arial, sans-serif", fontSize: '1rem', fontWeight: 'bold' }}>
                              {specialty.piso}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="specialties-empty">
                {searchTerm ? "No se encontraron especialidades." : "Empieza a escribir para buscar una especialidad."}
              </p>
            )}
          </div>
        </div>
      </div>

      {isKeyboardOpen && (
        <VirtualKeyboard
          value={searchTerm}
          onChange={setSearchTerm}
          onClose={() => setIsKeyboardOpen(false)}
          onEnter={handleEnter}
        />
      )}
    </DirectorioLayout>
  )
}