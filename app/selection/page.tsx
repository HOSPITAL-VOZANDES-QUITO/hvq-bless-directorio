import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import "@/styles/pages.css"
import { DirectorioLayout } from "@/components/directorio-layout"
import { StethoscopeIcon, UserSearchIcon, FileTextIcon } from 'lucide-react'

// Página de selección de método de búsqueda
export default function SelectionPage() {
  return (
    <DirectorioLayout>
      <div style={{ paddingTop: '20px' }}>
        {/* Contenedor principal */}
        <div className="selection-main-container" style={{ 
          borderTopLeftRadius: '2rem', 
          borderTopRightRadius: '2rem',
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'justify content'
        }}>
          {/* Contenedor de opciones de búsqueda */}
          <div className="buttons-container" style={{ padding: '40px'}}>
            <h1 className="selection-title" style={{ padding: '20px', marginBottom: '70px', fontSize: '3rem' }}>¿Cómo deseas buscar?</h1>
            
            {/* Botones de selección */}
            <div className="flex flex-row justify-center gap-10" style={{ paddingBottom: '2rem' }}>
              {/* Opción 1: Buscar por especialidad médica */}
              <Link href="/specialties" passHref>
                <Card className="selection-card" style={{ height: '28rem', width: '25rem' }}>
                  <CardContent className="selection-card-content" style={{ height: '100%', padding: '3rem 2rem' }}>
                    <StethoscopeIcon className="selection-card-icon" style={{ width: '8rem', height: '8rem' }} />
                    <CardTitle className="selection-card-title">Buscar por Especialidad</CardTitle>
                  </CardContent>
                </Card>
              </Link>
              
              {/* Opción 2: Buscar por nombre de médico */}
              <Link href="/doctors/search" passHref>
                <Card className="selection-card" style={{ height: '28rem', width: '25rem' }}>
                  <CardContent className="selection-card-content" style={{ height: '100%', padding: '3rem 2rem' }}>
                    <UserSearchIcon className="selection-card-icon" style={{ width: '8rem', height: '8rem' }} />
                    <CardTitle className="selection-card-title">Buscar por Médico</CardTitle>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Contenedor del QR animado */}
          <div className="video-container" style={{ padding: '20px', marginTop: '40px' }}>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="rounded-2xl"
              style={{ 
                maxWidth: '100%', 
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            >
              <source src="http://horizon-html:35480/public/img_directorio/QR_Bless_Animado.mp4" type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        </div>
      </div>
    </DirectorioLayout>
  )
}
  

