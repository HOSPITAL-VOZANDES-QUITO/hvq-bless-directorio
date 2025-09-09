//importar package json para obtener la version
import packageJson from '../package.json'
// Configuración centralizada del proyecto
export const APPVERSION = packageJson.version
export const config = {
  // URLs de la API
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://10.129.180.147:3001',
    authUrl: process.env.NEXT_PUBLIC_AUTH_URL || 'http://10.129.180.166:36560/api3/v1',
    timeout: 30000, // 30 segundos
  },
  
  // URLs de imágenes
  images: {
    logo: process.env.NEXT_PUBLIC_LOGO_URL || 'http://horizon-html:35480/public/img_directorio/logo.svg',
    aplicativoLogo: process.env.NEXT_PUBLIC_APLICATIVO_LOGO_URL || 'http://horizon-html:35480/public/img_directorio/aplicativo_logo.svg',
    homeline: process.env.NEXT_PUBLIC_HOMELINE_URL || 'http://prd-hvq-desarrollos:8001/media/inicio_dir.jpg',
    banner: process.env.NEXT_PUBLIC_BANNER_URL || 'http://horizon-html:35480/public/img_directorio/banner.png',
    hvqLogo: process.env.NEXT_PUBLIC_HVQ_LOGO_URL || '/images/hvq_2025_1.png',
  },
  
  // Configuración de caché
  cache: {
    specialties: 60000, // 60 segundos
    api: 30000, // 30 segundos
  },
  
  // Configuración de la aplicación
  app: {
    title: 'hvq-dir',
    description: 'Directorio Edificio Bless',
    idleTimeout: 30000, // 30 segundos
    version: APPVERSION,
  },
  
  // Headers por defecto
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
} as const

// Tipos para la configuración
export type Config = typeof config