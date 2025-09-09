"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DirectorioLayout } from "@/components/directorio-layout"
import { ArrowRight} from 'lucide-react'
import { config } from "@/lib/config"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [currentBanner, setCurrentBanner] = useState(0)
  
  const banners = [
    "http://horizon-html:35480/public/img_directorio/Banner_Kiosco_actual.png",
    "http://horizon-html:35480/public/img_directorio/banner_2.png",
    "http://horizon-html:35480/public/img_directorio/banner_3.png"
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length)
    }, 5000) // Cambia cada 5 segundos

    return () => clearInterval(interval)
  }, [banners.length])

  return (
    <DirectorioLayout showBackButton={false}>
      <div className="flex flex-col items-center justify-center h-full w-full text-center">
        {/* Card de bienvenida */}
        <div className="w-full max-w-8xl bg-primary border border-gray-200 rounded-3xl shadow-xl relative overflow-hidden mb-0" style={{ aspectRatio: '14/18' }}>
          {/* Imagen del edificio como fondo */}
          <Image
            src={config.images.homeline}
            alt="Edificio Médico"
            fill
            className="object-cover opacity-80"
          />
          
          {/* Contenido superpuesto */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 md:px-14 pb-20">
            {/* Logo HTQ en la parte superior */}
            <Image src={config.images.aplicativoLogo} alt="Logo HTQ" width={200} height={200} className="mb-10" />

            {/* Contenedor vacío en el medio */}
            <div className="flex-1 flex items-center justify-center">
              {/* Espacio vacío para separar logo y botón */}
            </div>

            {/* Botón principal - lleva a la pantalla de selección */}
            <Link href="/selection" passHref>
              <Button className="bg-primary text-primary-foreground hover:bg-accent1 text-5xl px-20 py-14 rounded-full shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 inline-flex items-center gap-5 border-2 border-white/30">
                ¡ Aquí !
                <ArrowRight className="w-18 h-12" style={{width: '3.5rem', height: 'auto' }} />
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Carrusel de banners simple */}
        <div className="mt-6 w-full px-4">
          <div className="mx-auto w-full max-w-6xl">
            <div className="relative w-full rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden" style={{ aspectRatio: '2048 / 737' }}>
              {banners.map((banner, index) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </DirectorioLayout>
  )
}
