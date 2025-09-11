import Link from "next/link" 
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { UserRoundIcon as UserRoundMedical, Loader2 as Loader2Icon } from 'lucide-react'
import { memo, useEffect, useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import "@/styles/doctores.css"

/**
 * Props del componente DoctorCard
 * Define las propiedades necesarias para renderizar una tarjeta de médico
 */
interface DoctorCardProps {
  /** Datos del médico a mostrar */
  doctor: {
    /** ID único del médico */
    id: string
    /** Nombre completo del médico */
    name: string
    /** URL de la foto del médico (opcional) */
    photo?: string | null
    /** Lista de especialidades del médico */
    especialidades?: Array<{id: string, label: string}>
  }
  /** Nombre de la especialidad (puede ser múltiple) */
  specialtyName: string | string[]
  /** Ruta base para los enlaces */
  basePath: string
  /** Clases CSS adicionales */
  className?: string
  /** Variante de visualización: por defecto o compacta */
  variant?: 'default' | 'compact'
  /** Parámetros de consulta para los enlaces */
  queryParams?: Record<string, string>
  /** Callback que se ejecuta al hacer clic en la tarjeta */
  onCardClick?: () => void
}

// Componente para mostrar la tarjeta de un médico con optimización de imágenes
export const DoctorCard = memo(function DoctorCard({ doctor, specialtyName, basePath, className, variant = 'default', queryParams, onCardClick }: DoctorCardProps) {
  // Estados para manejar la carga y errores de imagen
  const [hasImageError, setHasImageError] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(Boolean(doctor.photo))
  const [showIconFallback, setShowIconFallback] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  // IntersectionObserver: solo cargar imagen cuando el card esté visible en pantalla
  useEffect(() => {
    if (!cardRef.current) return
    const element = cardRef.current
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(element)
          break
        }
      }
    }, { rootMargin: '200px 0px', threshold: 0.01 })
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [])

  // Una vez que el card es visible, iniciar la carga de la imagen
  useEffect(() => {
    if (isInView && doctor.photo && !hasImageError) {
      setImgSrc(doctor.photo)
    }
  }, [isInView, doctor.photo, hasImageError])

  // Timeout de 2 segundos: si la imagen no carga, mostrar icono pero seguir precargando en background
  useEffect(() => {
    if (!imgSrc) return
    if (!isImageLoading) return
    setShowIconFallback(false)
    const id = setTimeout(() => {
      // Solo activar fallback si sigue cargando y no hubo error
      setShowIconFallback(true)
    }, 2000)
    return () => clearTimeout(id)
  }, [imgSrc, isImageLoading])

  // Resetear todos los estados cuando cambia el doctor o su foto
  useEffect(() => {
    setHasImageError(false)
    setIsImageLoading(Boolean(doctor.photo))
    setShowIconFallback(false)
    if (isInView && doctor.photo) setImgSrc(doctor.photo)
    else setImgSrc(null)
  }, [doctor.id, doctor.photo, isInView])

  // Determinar si mostrar icono en lugar de imagen
  const showIcon = !doctor.photo || hasImageError || showIconFallback
  const isCompact = variant === 'compact'
  
  // Verificar si el texto es muy largo para ajustar el tamaño de fuente
  const isLongName = doctor.name.length > 28
  const isLongSpecialty = specialtyName.length > 28
  
  // Tamaños base de fuente según la variante
  const baseNameClass = isCompact ? 'text-lg' : 'text-2xl'
  const baseSpecClass = isCompact ? 'text-sm' : 'text-lg'

  // Ajustar tipografía según la longitud del texto y variante
  const nameSize = !isCompact
    ? (isLongName ? 'text-lg' : 'text-xl')
    : (isLongName ? 'text-base' : 'text-lg')

  const specialtySize = !isCompact
    ? (isLongSpecialty ? 'text-xs' : 'text-sm')
    : (isLongSpecialty ? 'text-xs' : 'text-sm')

  return (
    <Link 
      key={doctor.id} 
      href={`${basePath}/${doctor.id}${queryParams ? `?${new URLSearchParams(queryParams).toString()}` : ''}`} 
      passHref
      onClick={onCardClick}
    >
      <Card 
        className={`bg-secondary text-accent2 hover:bg-primary hover:text-primary-foreground 
                    transition-colors duration-200 cursor-pointer rounded-2xl shadow-lg 
                    hover:shadow-xl transform hover:scale-105 flex flex-col items-center 
                    justify-center py-4 h-[18rem] w-[300px] group ${className || ''}`}
        ref={cardRef}
      >
        <CardContent className="doctor-card-content">
          {showIcon ? (
            <UserRoundMedical 
              className="w-20 h-20 mb-4 text-primary group-hover:text-primary-foreground" 
              aria-hidden="true" 
            />
          ) : (
            <div className="doctor-card-image-container">
              {isImageLoading && (
                <>
                  <Skeleton className="doctor-card-skeleton" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2Icon className="w-4 h-4 text-primary animate-spin" aria-label="Cargando" />
                  </div>
                </>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgSrc as string}
                alt={`Foto de ${doctor.name}`}
                width={80}
                height={80}
                loading="lazy"
                decoding="async"
                draggable={false}
                className={`doctor-card-image ${isImageLoading ? 'invisible' : ''}`}
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  setHasImageError(true)
                  setIsImageLoading(false)
                }}
              />
            </div>
          )}
          {/* Preload en background incluso cuando mostramos icono por timeout */}
          {showIconFallback && !hasImageError && doctor.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doctor.photo}
              alt=""
              width={1}
              height={1}
              style={{ position: 'absolute', width: 0, height: 0, opacity: 0 }}
              aria-hidden="true"
              onLoad={() => {
                setIsImageLoading(false)
                setShowIconFallback(false)
              }}
              onError={() => {
                setHasImageError(true)
                setIsImageLoading(false)
              }}
            />
          )}
          <div className="w-full">
            <CardTitle className={`doctor-card-name ${nameSize} text-center leading-tight mb-2 line-clamp-2`}>
              {doctor.name}
            </CardTitle>
            {!isCompact && (
              <div className={`doctor-card-specialty ${specialtySize} text-accent2 group-hover:text-primary-foreground text-center leading-tight`}>
                {doctor.especialidades && doctor.especialidades.length > 1 ? (
                  <div className="space-y-1">
                    {doctor.especialidades.map((esp, index) => (
                      <p key={esp.id} className="line-clamp-1">
                        {esp.label}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="line-clamp-2">
                    {specialtyName}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
})
