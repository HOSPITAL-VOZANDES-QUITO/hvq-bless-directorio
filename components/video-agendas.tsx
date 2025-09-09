"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Volume2, VolumeX } from 'lucide-react'
import { useInteractiveVideo } from "@/hooks/use-interactive-video"

/**
 * Props del componente VideoAgendas
 */
interface VideoAgendasProps {
  /** Consultorio del médico */
  consultorio: string
  /** Edificio donde está ubicado */
  building: string
  /** Piso del consultorio (opcional) */
  floor?: string
}

/**
 * Componente de video de agendas con información del hospital
 * Utiliza el hook useInteractiveVideo para separar la lógica de control de video de la presentación
 */
export function VideoAgendas({ consultorio, building, floor }: VideoAgendasProps) {
  // Usar el hook personalizado para gestionar la lógica de control de video
  const { isMuted, videoRef, toggleMute } = useInteractiveVideo()

  return (
    <Card className="w-full bg-white text-accent2 rounded-xl shadow-2xl p-6 mt-8">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-3xl font-bold text-primary text-center">Conoce el Hospital</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col items-center justify-center">
        <div className="relative w-full h-64 md:h-96 bg-black rounded-lg overflow-hidden flex items-center justify-center border-2 border-primary">
          {/* Video en bucle infinito */}
          <div className="absolute inset-0 overflow-hidden">
            <video
              ref={videoRef}
              className="absolute left-1/2 top-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 pointer-events-none object-cover"
              src="http://prd-hvq-desarrollos:8001/videos/video_cumbre.mp4"
              title="Video de agendas del hospital"
              autoPlay
              muted={isMuted}
              loop
              playsInline
              disablePictureInPicture
              disableRemotePlayback
            />
          </div>
          
          {/* Botón de mutear/desmutear */}
          <button
            onClick={toggleMute}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-3 transition-all duration-200 hover:scale-110 z-10"
            style={{
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            aria-label={isMuted ? "Activar sonido" : "Silenciar"}
          >
            {isMuted ? (
              <VolumeX className="w-7 h-7" />
            ) : (
              <Volume2 className="w-7 h-7" />
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
