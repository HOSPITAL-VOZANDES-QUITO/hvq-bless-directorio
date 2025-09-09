"use client"

import { DirectorioLayout } from "@/components/directorio-layout"
import { notFound } from "next/navigation"
import { DoctorCard } from "@/components/doctor-card"
import { use } from "react"
import { Spinner } from "@/components/ui/spinner"
import { useSpecialtyDoctors } from "@/hooks/use-specialty-doctors"

/**
 * Props para la página de médicos por especialidad
 */
interface DoctorsPageProps {
  params: Promise<{
    specialty: string
  }>
}

/**
 * Página de médicos por especialidad
 * Utiliza el hook useSpecialtyDoctors para separar la lógica de negocio de la presentación
 */
export default function DoctorsPage({ params }: DoctorsPageProps) {
  // Desempaquetar los parámetros con React.use()
  const { specialty: specialtyId } = use(params)
  
  // Usar el hook personalizado para gestionar toda la lógica de negocio
  const {
    doctors,
    specialtyName,
    resolvedSpecialtyId,
    loading,
    error,
    reload
  } = useSpecialtyDoctors(specialtyId)

  // Estado de carga
  if (loading) {
    return (
      <DirectorioLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" />
        </div>
      </DirectorioLayout>
    )
  }

  // Estado de error
  if (error) {
    return (
      <DirectorioLayout>
        <div className="error-container">
          <h2>Error</h2>
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={reload}
          >
            Reintentar
          </button>
        </div>
      </DirectorioLayout>
    )
  }

  // Sin médicos encontrados
  if (!doctors.length || !specialtyName) {
    return (
      <DirectorioLayout>
        <div style={{ paddingTop: '50px' }}>
          <h1 className="text-4xl font-bold text-primary mb-10 text-center">
            Doctores en {specialtyName || 'esta especialidad'}
          </h1>
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
        <h1 className="text-4xl font-bold text-primary mb-10 text-center">
          DOCTORES EN {specialtyName}
        </h1>
        
        {/* Mostrar todos los doctores sin filtro */}
        <div className="w-full flex justify-center">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
              {doctors.map((doctor, index) => {
                const isLastOdd = doctors.length % 2 === 1 && index === doctors.length - 1
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