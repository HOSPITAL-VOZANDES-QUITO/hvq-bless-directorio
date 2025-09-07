"use client"

import { useRouter, usePathname } from "next/navigation"
import React from "react"
import { Button } from "@/components/ui/button"
import { HomeIcon, ArrowLeftIcon, ChevronUpIcon } from 'lucide-react'
import { CurrentTime } from "@/components/current-time"
import { Footer } from "@/components/footer"
import type { ReactNode } from "react"
import Image from "next/image"
import { config } from "@/lib/config"
import type { DirectorioLayoutProps } from "@/lib/types"

export function DirectorioLayout({ children, showBackButton = true }: DirectorioLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showScrollTop, setShowScrollTop] = React.useState(false)

  const handleGoBack = () => {
    router.back()
  }

  const handleGoHome = () => {
    router.push("/")
  }

  React.useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 200)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const displayBackButton = showBackButton && pathname !== "/"
  const isHomePage = pathname === "/"

  return (
    <div className="relative flex flex-col min-h-screen bg-transparent text-accent2">
      {/* Header según la página */}
      {isHomePage ? (
        // Header original para la página de inicio
        <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
          <div className="mx-auto w-full max-w-6xl px-4 md:px-8 lg:px-12 h-40 pt-4 flex items-center justify-between gap-3">
{/* Logo y nombre del hospital */}
            <div className="flex items-center gap-4">
              {displayBackButton && (
                <Button onClick={handleGoBack} className="bg-primary text-primary-foreground hover:bg-accent1 px-5 md:px-6 py-3 md:py-4 text-2xl md:text-3xl rounded-full shadow-md flex items-center gap-3">
                  <ArrowLeftIcon className="w-6 h-6" />
                  Volver
                </Button>
              )}
              <div className="flex items-center gap-3">
                <Image
                  src={config.images.logo}
                  alt="Hospital Vozandes Quito"
                  width={450}
                  height={450}
                  className="w-15 h-15"
                />
              </div>
            </div>
            
            {/* Hora y fecha centrada */}
            <div className="flex items-center justify-center ">
              <CurrentTime />
            </div>
            
            {/* Botón de inicio */}
            <div className="flex items-center gap-2">
              {pathname !== "/" && (
                <Button onClick={handleGoHome} className="bg-primary text-primary-foreground hover:bg-accent1 px-5 md:px-6 py-3 md:py-4 text-2xl md:text-3xl rounded-full shadow-md flex items-center gap-3">
                  <HomeIcon className="w-6 h-6" />
                  Inicio
                </Button>
              )}
            </div>
          </div>
        </header>
      ) : (
        // Header nuevo para otras páginas
        <>
          <header className="sticky top-0 z-40 w-full bg-[#7F0C43] text-white rounded-b-2xl shadow-lg">
            <div className="mx-auto w-full max-w-6xl px-4 md:px-8 lg:px-12 h-24 flex items-center justify-between gap-3">
              {/* Logo y nombre del hospital */}
              <div className="flex items-center gap-3 cursor-pointer" onClick={handleGoHome}>
                <Image
                  src={config.images.hvqLogo}
                  alt="Hospital Vozandes Quito"
                  width={200}
                  height={200}
                  className="w-15 h-15"
                />
              </div>
              
              {/* Hora y fecha centrada (sin duplicar la hora en la segunda línea) */}
              <div className="flex items-center justify-center gap-2">
                <CurrentTime variant="compact" />
              </div>
              
              {/* Mensaje de bienvenida (sin icono) */}
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-semibold">Bienvenido</span>
                </div>
              </div>
            </div>
          </header>
        </>
      )}

      {/* Barra fija de navegación bajo el header (oculta solo en inicio) */}
      <div className={`sticky ${isHomePage ? 'top-32' : 'top-24'} z-40 w-full bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b ${isHomePage ? 'hidden' : ''}`}>
        <div className="mx-auto w-full max-w-6xl px-4 md:px-8 lg:px-12 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {displayBackButton && (
              <Button onClick={handleGoBack} className="bg-primary text-primary-foreground hover:bg-accent1 px-5 md:px-6 py-3 md:py-4 text-2xl md:text-3xl rounded-full shadow-md flex items-center gap-3">
                <ArrowLeftIcon className="w-6 h-6" />
                Volver
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {pathname !== "/" && (
              <Button onClick={handleGoHome} className="bg-primary text-primary-foreground hover:bg-accent1 px-5 md:px-6 py-3 md:py-4 text-2xl md:text-3xl rounded-full shadow-md flex items-center gap-3">
                <HomeIcon className="w-6 h-6" />
                Inicio
              </Button>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center w-full max-w-6xl mx-auto px-4 md:px-8 lg:px-12 py-8 bg-transparent">
        {children}
      </main>

      {/* Botón flotante Volver Arriba (centrado abajo sobre el footer) */}
      {showScrollTop && (
        <div className="fixed bottom-12 inset-x-0 flex justify-center z-50">
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Volver Arriba"
            className="bg-primary text-primary-foreground hover:bg-accent1 p-12 rounded-full shadow-2xl"
          >
            <ChevronUpIcon className="w-40 h-40" />
          </Button>
        </div>
      )}

      <Footer />
    </div>
  )
}
