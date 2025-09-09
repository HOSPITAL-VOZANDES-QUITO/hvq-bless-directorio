import axios from "axios"
import { config } from "./config"
import type { AuthTokens, AuthError } from "./types"

// Variables de estado global para almacenar los tokens de autenticación
let accessToken = ''
let refreshToken = ''

// Función para obtener credenciales desde variables de entorno
// Usa valores por defecto si no están configuradas las variables
const getCredentials = (): { username: string; password: string } => {
  const username = process.env.NEXT_PUBLIC_AUTH_USERNAME || 'middleware_prod'
  const password = process.env.NEXT_PUBLIC_AUTH_PASSWORD || 'MH@2025!Api'
  
  if (!username || !password) {
    throw new Error('Credenciales de autenticación no configuradas')
  }
  
  return { username, password }
}

// Función para manejar y normalizar errores de autenticación
const handleAuthError = (error: unknown): AuthError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message || 'Error de autenticación',
      code: error.response?.status?.toString()
    }
  }
  
  if (error instanceof Error) {
    return { message: error.message }
  }
  
  return { message: 'Error desconocido de autenticación' }
}

// Función para realizar login y obtener tokens de autenticación
const login = async (): Promise<AuthTokens> => {
  try {
    const { username, password } = getCredentials()
    
    // Realizar petición de login al endpoint de autenticación
    const response = await axios.post(
      `${config.api.authUrl}/Auth/login`,
      new URLSearchParams({ username, password }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: config.api.timeout
      }
    )
    
    const { access_token, refresh_token } = response.data
    
    if (!access_token || !refresh_token) {
      throw new Error('Respuesta de autenticación inválida')
    }
    
    return { accessToken: access_token, refreshToken: refresh_token }
  } catch (error) {
    const authError = handleAuthError(error)
    // En producción, no deberíamos loggear errores de autenticación
    // console.error('Error de login:', authError.message)
    throw new Error(authError.message)
  }
}

// Función para refrescar el token de acceso usando el refresh token
const refreshAuthToken = async (): Promise<AuthTokens> => {
  try {
    if (!refreshToken) {
      throw new Error('No hay token de refresh disponible')
    }
    
    // Realizar petición de refresh al endpoint de autenticación
    const response = await axios.post(
      `${config.api.authUrl}/Auth/refresh`,
      new URLSearchParams({ refreshToken }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: config.api.timeout
      }
    )
    
    const { access_token, refresh_token } = response.data
    
    if (!access_token || !refresh_token) {
      throw new Error('Respuesta de refresh inválida')
    }
    
    return { accessToken: access_token, refreshToken: refresh_token }
  } catch (error) {
    const authError = handleAuthError(error)
    // En producción, no deberíamos loggear errores de autenticación
    // console.error('Error de refresh:', authError.message)
    throw new Error(authError.message)
  }
}

// Función principal para obtener el token de acceso
// Si no hay token, realiza login automáticamente
export const getAccessToken = async (): Promise<string> => {
  if (!accessToken) {
    const tokens = await login()
    accessToken = tokens.accessToken
    refreshToken = tokens.refreshToken
  }
  return accessToken
}

// Función para refrescar el token de autenticación
// Si falla el refresh, intenta hacer login nuevamente
export const refreshAuthTokenPublic = async (): Promise<void> => {
  try {
    const tokens = await refreshAuthToken()
    accessToken = tokens.accessToken
    refreshToken = tokens.refreshToken
  } catch (error) {
    // Si falla el refresh, intentar login nuevamente
    const tokens = await login()
    accessToken = tokens.accessToken
    refreshToken = tokens.refreshToken
  }
}

// Función para limpiar los tokens almacenados (útil para logout)
export const clearAuthTokens = (): void => {
  accessToken = ''
  refreshToken = ''
}

// Función para verificar si hay un token válido almacenado
export const hasValidToken = (): boolean => {
  return Boolean(accessToken)
}