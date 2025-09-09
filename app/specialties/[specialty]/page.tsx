"use client"

import { DirectorioLayout } from "@/components/directorio-layout"
import { notFound } from "next/navigation"
import { DoctorCard } from "@/components/doctor-card"
import { useState, useEffect, useMemo } from "react"
import { use } from "react"
import axios from "axios"
import { getAccessToken } from "@/lib/auth"
import { Spinner } from "@/components/ui/spinner"
import { config } from "@/lib/config"

// Normaliza textos a slug: minúsculas, sin acentos, sólo [a-z0-9-]
const slugify = (input: string): string => {
  return String(input || "")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface Especialidad {
  especialidadId: number
  descripcion: string
  tipo?: string
  icono?: string
}

interface Medico {
  id: number
  nombres: string
  retrato?: string
  especialidades: Especialidad[]
}

interface DoctorsPageProps {
  params: Promise<{
    specialty: string
  }>
}

export default function DoctorsPage({ params }: DoctorsPageProps) {
  // Desempaquetar los parámetros con React.use()
  const { specialty: specialtyId } = use(params)
  const [allDoctors, setAllDoctors] = useState<Medico[]>([])
  const [specialtyName, setSpecialtyName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolvedSpecialtyId, setResolvedSpecialtyId] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getAccessToken()

        // 1. Obtener información de la especialidad sin fallbacks cruzados
        const isId = /^\d+$/.test(String(specialtyId))
        let resolvedIdForFilter = String(specialtyId)
        if (isId) {
          const specialtyResponse = await axios.get(`${config.api.authUrl}/especialidades/${specialtyId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          })
          if (!specialtyResponse.data?.descripcion) throw new Error('Especialidad no encontrada')
          setSpecialtyName(specialtyResponse.data.descripcion)
          resolvedIdForFilter = String(specialtyResponse.data.especialidadId ?? specialtyId)
          setResolvedSpecialtyId(resolvedIdForFilter)
        } else {
          const res = await axios.get(`${config.api.authUrl}/especialidades/agenda`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          })
          const list = Array.isArray(res.data) ? res.data : []
          const match = list.find((spec: any) => slugify(String(spec.descripcion || '')) === slugify(String(specialtyId)))
          if (!match) throw new Error('Especialidad no encontrada')
          setSpecialtyName(match.descripcion)
          resolvedIdForFilter = String(match.especialidadId)
          setResolvedSpecialtyId(resolvedIdForFilter)
        }

        // 2. Obtener todos los médicos con sus detalles
        const allDoctorsResponse = await axios.get(`${config.api.authUrl}/medico/agenda2`, {
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
          // 3a. Si es array de IDs, obtener detalles de cada médico
          const successfulDoctors: Medico[] = []

          // Usar Promise.allSettled para manejar errores individuales
          const results = await Promise.allSettled(
            allDoctorsResponse.data.map(async (doctorId: number) => {
              try {
                const doctorResponse = await axios.get(`${config.api.authUrl}/medico/agenda2/${doctorId}`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                  }
                })
                return doctorResponse.data
              } catch (err) {
                // En producción, no deberíamos loggear errores de usuario
                // console.error(`Error obteniendo médico ${doctorId}:`, (err as Error).message)
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
                  (esp: Especialidad) => String(esp.especialidadId) === String(resolvedIdForFilter)
                )
              ) {
                successfulDoctors.push(doctor)
              }
            }
          })

          doctorsData = successfulDoctors
        } else {
          // 3b. Si ya son objetos completos, filtrar directamente
          doctorsData = allDoctorsResponse.data.filter((doctor: Medico) =>
            doctor.especialidades?.some(
              (esp: Especialidad) => String(esp.especialidadId) === String(resolvedIdForFilter)
            )
          )
        }

        setAllDoctors(doctorsData)
      } catch (err) {
        // En producción, no deberíamos loggear errores de usuario
        // console.error('Error fetching doctors:', err)
        setError('Error al cargar los doctores. Intente nuevamente más tarde.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [specialtyId])

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

  if (!allDoctors.length || !specialtyName) {
    return (
      <DirectorioLayout>
        <div style={{ paddingTop: '50px' }}>
          <h1 className="text-4xl font-bold text-primary mb-10 text-center">Doctores en {specialtyName || 'esta especialidad'}</h1>
          <p className="text-2xl text-accent2 col-span-full text-center">
            No se encontraron doctores para esta especialidad.
          </p>
        </div>
      </DirectorioLayout>
    )
  }

  return (
    <DirectorioLayout>
      <div style={{ paddingTop: '200px' }}>
        <h1 className="text-4xl font-bold text-primary mb-10 text-center">DOCTORES EN  {specialtyName}</h1>
        
        {/* Mostrar todos los doctores sin filtro */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
              {allDoctors.map((doctor, index) => {
                const isLastOdd = allDoctors.length % 2 === 1 && index === allDoctors.length - 1
                return (
                  <div key={doctor.id} className={`flex justify-center ${isLastOdd ? 'md:col-span-2' : ''}`}>
                    <DoctorCard
                      doctor={{
                        id: doctor.id.toString(),
                        name: doctor.nombres,
                        photo: doctor.retrato,
                      }}
                      specialtyName={specialtyName}
                      basePath={`/specialties/${resolvedSpecialtyId || specialtyId}`}
                      queryParams={{ source: 'specialty' }}
                      className=""
                      variant="compact"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </DirectorioLayout>
  )
}