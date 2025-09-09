import { useState, useRef } from "react"

/**
 * Estado del hook de video interactivo
 */
interface UseInteractiveVideoState {
  /** Estado de silencio del video */
  isMuted: boolean
  /** Referencia al elemento de video */
  videoRef: React.RefObject<HTMLVideoElement>
}

/**
 * Hook personalizado para gestionar la lógica de negocio del video interactivo
 * Separa la lógica de control de video de la presentación
 */
export function useInteractiveVideo() {
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  /**
   * Alterna el estado de silencio del video
   */
  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted
      videoRef.current.muted = newMutedState
      setIsMuted(newMutedState)
    }
  }

  /**
   * Establece el estado de silencio del video
   */
  const setMuted = (muted: boolean) => {
    if (videoRef.current) {
      videoRef.current.muted = muted
      setIsMuted(muted)
    }
  }

  /**
   * Obtiene el estado actual de silencio del video
   */
  const getMutedState = () => {
    return videoRef.current?.muted ?? isMuted
  }

  /**
   * Reproduce el video
   */
  const play = () => {
    if (videoRef.current) {
      videoRef.current.play()
    }
  }

  /**
   * Pausa el video
   */
  const pause = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  /**
   * Reinicia el video al inicio
   */
  const restart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }

  return {
    // Estados
    isMuted,
    videoRef,
    // Acciones
    toggleMute,
    setMuted,
    getMutedState,
    play,
    pause,
    restart
  }
}
