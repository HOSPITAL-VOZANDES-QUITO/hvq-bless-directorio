import packageJson from '../package.json';

export const APPVERSION = packageJson.version;

// Configuración centralizada del proyecto
export const config = {
  // URLs de la API
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://10.129.180.147:3001',
    authUrl: process.env.EXTERNAL_AUTH_URL || 'http://10.129.180.161:36560/api3/v1/Auth/login',
    baseApiUrl: process.env.EXTERNAL_API_BASE_URL || 'http://10.129.180.161:36560/api3/v1',
    timeout: 30000, // 30 segundos
  },
  
  // Configuración de base de datos Oracle
  database: {
    mode: process.env.DB_MODE || 'thin',
    user: process.env.DB_USER || 'hvq_usrpython',
    password: process.env.DB_PASSWORD || 'pyth0n2022',
    connectString: process.env.DB_CONNECT_STRING || '172.16.241.62:1521/SML',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2'),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10'),
    poolIncrement: parseInt(process.env.DB_POOL_INCREMENT || '1'),
    poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT || '300'),
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    oracleClientLibDir: process.env.ORACLE_CLIENT_LIB_DIR || 'C:\\oracle\\instantclient_23_9',
    editorCustomSchema: process.env.EDITOR_CUSTOM_SCHEMA || 'EDITOR_CUSTOM',
  },
  
  // Configuración de autenticación externa
  auth: {
    username: process.env.EXTERNAL_AUTH_USERNAME || 'middleware_dev',
    password: process.env.EXTERNAL_AUTH_PASSWORD || 'DevMH@2025!',
    url: process.env.EXTERNAL_AUTH_URL || 'http://10.129.180.161:36560/api3/v1/Auth/login',
    baseUrl: process.env.EXTERNAL_API_BASE_URL || 'http://10.129.180.161:36560/api3/v1',
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
    specialties: parseInt(process.env.CACHE_SPECIALTIES_TIMEOUT || '60000'), // 60 segundos
    api: parseInt(process.env.CACHE_API_TIMEOUT || '30000'), // 30 segundos
  },
  
  // Configuración de la aplicación
  app: {
    title: process.env.APP_TITLE || 'hvq-dir',
    description: process.env.APP_DESCRIPTION || 'Directorio Edificio Bless',
    idleTimeout: parseInt(process.env.APP_IDLE_TIMEOUT || '30000'), // 30 segundos
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
