// Importar package.json para obtener la versión de la aplicación
import packageJson from '../package.json'

// Versión de la aplicación extraída del package.json
export const APPVERSION = packageJson.version

// Configuración centralizada del proyecto
// Todas las configuraciones se obtienen desde variables de entorno con valores por defecto
export const config = {
  // Configuración de URLs de la API
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://10.129.180.147:3001',
    authUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'http://10.129.180.166:36560/api3/v1',
    timeout: 30000, // 30 segundos de timeout para peticiones
  },
  
  // URLs de imágenes utilizadas en la aplicación
  images: {
    logo: process.env.NEXT_PUBLIC_LOGO_URL || 'http://horizon-html:35480/public/img_directorio/logo.svg',
    aplicativoLogo: process.env.NEXT_PUBLIC_APLICATIVO_LOGO_URL || 'http://horizon-html:35480/public/img_directorio/aplicativo_logo.svg',
    homeline: process.env.NEXT_PUBLIC_HOMELINE_URL || 'http://prd-hvq-desarrollos:8001/media/inicio_dir.jpg',
    banner: process.env.NEXT_PUBLIC_BANNER_URL || 'http://horizon-html:35480/public/img_directorio/banner.png',
    hvqLogo: process.env.NEXT_PUBLIC_HVQ_LOGO_URL || '/images/hvq_2025_1.png',
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