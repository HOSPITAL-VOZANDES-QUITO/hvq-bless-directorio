"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DirectorioLayout } from "@/components/directorio-layout"
import { ArrowRight} from 'lucide-react'
import { config } from "@/lib/config"
import { useEffect, useState } from "react"

// Página principal del directorio médico
export default function HomePage() {
  // Estado para controlar el banner actual del carrusel
  const [currentBanner, setCurrentBanner] = useState(0)
  
  // Array de URLs de banners para el carrusel
  const banners = [
    config.images.banner,
    config.images.banner2,
    config.images.banner3
  ].filter(Boolean) // Filtrar valores undefined/null

  // Efecto para rotar automáticamente los banners cada 5 segundos
  useEffect(() => {
    if (banners.length === 0) return // No hacer nada si no hay banners
    
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 5000) // Cambia cada 5 segundos

    return () => clearInterval(interval)
  }, [banners.length])

  return (
    <DirectorioLayout showBackButton={false}>
      <div className="flex flex-col items-center justify-center h-full w-full text-center">
        {/* Card principal de bienvenida con imagen de fondo */}
        <div className="w-full max-w-8xl bg-primary border border-gray-200 rounded-3xl shadow-xl relative overflow-hidden mb-0" style={{ aspectRatio: '14/18' }}>
          {/* Imagen del edificio médico como fondo */}
          {config.images.homeline && (
            <Image
              src={config.images.homeline}
              alt="Edificio Médico"
              fill
              className="object-cover opacity-80"
            />
          )}
          
          {/* Contenido superpuesto sobre la imagen de fondo */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 md:px-14 pb-20">
            {/* Logo del hospital en la parte superior */}
            {config.images.aplicativoLogo && (
              <Image 
                src={config.images.aplicativoLogo} 
                alt="Logo HTQ" 
                width={200} 
                height={200} 
                className="mb-10" 
              />
            )}

            {/* Contenedor vacío en el medio para espaciado */}
            <div className="flex-1 flex items-center justify-center">
              {/* Espacio vacío para separar logo y botón */}
            </div>

            {/* Botón principal que lleva a la pantalla de selección */}
            <Link href="/selection" passHref>
              <Button className="bg-primary text-primary-foreground hover:bg-accent1 text-5xl px-20 py-14 rounded-full shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 inline-flex items-center gap-5 border-2 border-white/30">
                ¡Aquí!
                <ArrowRight className="w-18 h-12" style={{width: '3.5rem', height: 'auto' }} />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Carrusel de banners promocionales - Solo se muestra si hay banners */}
        {banners.length > 0 && (
          <div className="mt-6 w-full px-4">
            <div className="mx-auto w-full max-w-6xl">
              <div className="relative w-full rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden" style={{ aspectRatio: '2048 / 737' }}>
                {/* Renderizar todos los banners con transición de opacidad */}
                {banners.map((banner, index) => (
                  banner && (
                    <Image
                      key={banner}
                      src={banner}
                      alt="Encuentra a tu especialista en nuestro Directorio Médico"
                      fill
                      className={`object-contain transition-opacity duration-1000 ${
                        index === currentBanner ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                      priority={index === 0}
                    />
                  )
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DirectorioLayout>
  )
}
