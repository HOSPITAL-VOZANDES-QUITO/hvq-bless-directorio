// Importar package.json para obtener la versión de la aplicación
import packageJson from '../package.json'

// Versión de la aplicación extraída del package.json
export const APPVERSION = packageJson.version

// Configuración centralizada del proyecto
// Todas las configuraciones se obtienen desde variables de entorno con valores por defecto
export const config = {
  // Configuración de URLs de la API
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    authUrl: process.env.NEXT_PUBLIC_AUTH_URL,
    agendaBaseUrl: process.env.BASE_URL,
    timeout: 30000, // 30 segundos de timeout para peticiones
  },
  
  // URLs de imágenes utilizadas en la aplicación
  images: {
    logo: process.env.NEXT_PUBLIC_LOGO_URL as string,
    hvqLogo: process.env.NEXT_PUBLIC_HVQ_LOGO_URL as string,
    aplicativoLogo: process.env.NEXT_PUBLIC_APLICATIVO_LOGO_URL as string,
    homeline: process.env.NEXT_PUBLIC_HOMELINE_URL as string,
    banner: process.env.NEXT_PUBLIC_BANNER_URL as string,
    banner2: process.env.NEXT_PUBLIC_BANNER2_URL as string,
    banner3: process.env.NEXT_PUBLIC_BANNER3_URL as string,
  },
  

  videos: {
    video_agendas: process.env.NEXT_PUBLIC_HVQ_VIDEO_CUMBRE_URL,
    logo_animado: process.env.NEXT_PUBLIC_HVQ_LOGO_ANIMADO_URL
  },
  
  // Configuración de caché para optimizar rendimiento
  cache: {
    specialties: 60000, // 60 segundos de caché para especialidades
    api: 30000, // 30 segundos de caché para peticiones API
  },
  
  // Configuración general de la aplicación
  app: {
    title: 'hvq-dir',
    description: 'Directorio Edificio Bless',
    idleTimeout: 30000, // 30 segundos de timeout de inactividad
    version: APPVERSION,
  },
  
  // Headers por defecto para peticiones HTTP
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} as const

/**
 * Tipo para la configuración de la aplicación
 * Se deriva automáticamente del objeto config para mantener consistencia
 */
export type Config = typeof config