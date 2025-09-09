import * as React from "react"

// Punto de quiebre para determinar si es dispositivo móvil
const MOBILE_BREAKPOINT = 768

// Hook para detectar si el dispositivo es móvil basado en el ancho de pantalla
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Crear media query para detectar dispositivos móviles
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Función para actualizar el estado cuando cambia el tamaño de pantalla
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Agregar listener y establecer estado inicial
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Limpiar listener al desmontar
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
