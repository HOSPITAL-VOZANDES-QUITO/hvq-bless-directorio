# Directorio Médico - Hospital Vozandes Quito

Sistema de directorio médico para el Hospital Vozandes Quito, desarrollado con Next.js 15 y TypeScript. Versión optimizada con mejoras de rendimiento, gestión de estado granular y experiencia de usuario mejorada.

## 🚀 Características

- **Interfaz moderna y responsiva** con Tailwind CSS
- **Sistema de autenticación** integrado con manejo de tokens
- **Búsqueda de especialidades y médicos** con teclado virtual mejorado
- **Gestión de agendas médicas** en tiempo real
- **Caché inteligente** para mejorar el rendimiento
- **Validación y normalización de datos** centralizada
- **Tipado completo** con TypeScript
- **Estados de carga granulares** para mejor UX
- **Gestión de memoria optimizada** con AbortController
- **Separación de responsabilidades** en hooks especializados
- **Configuración centralizada** con variables de entorno

## 🛠️ Tecnologías

- **Framework**: Next.js 15.2.4
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 3.4.17
- **Componentes**: Radix UI
- **Iconos**: Lucide React
- **Gestión de estado**: React Hooks
- **HTTP Client**: Axios
- **Teclado virtual**: React Simple Keyboard

## 📁 Estructura del Proyecto

```
├── app/                    # Páginas de la aplicación (App Router)
│   ├── specialties/        # Páginas de especialidades
│   ├── doctors/           # Páginas de médicos
│   ├── selection/         # Página de selección
│   └── agendas/           # Páginas de agendas
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de UI base
│   ├── virtual-keyboard.tsx # Teclado virtual mejorado
│   ├── doctor-card.tsx   # Tarjeta de médico optimizada
│   └── directorio-layout.tsx # Layout principal
├── hooks/                # Hooks personalizados especializados
│   ├── use-doctor-schedule.ts # Hook principal (orquestador)
│   ├── use-data-normalization.ts # Normalización de datos
│   ├── use-doctor-data.ts # Fetching de datos de médicos
│   ├── use-doctor-schedule-ui.ts # Lógica de UI
│   ├── use-specialty-doctors.ts # Médicos por especialidad
│   ├── use-doctors-cache.ts # Caché de médicos
│   └── use-agendas.ts    # Gestión de agendas
├── lib/                  # Utilidades y servicios
│   ├── config.ts         # Configuración centralizada
│   ├── types.ts          # Tipos TypeScript
│   ├── auth.ts           # Servicio de autenticación
│   ├── api-service.ts    # Servicio de API
│   └── utils.ts          # Utilidades generales
├── styles/               # Archivos CSS
└── public/               # Archivos estáticos
```

## 🔧 Configuración

### Variables de Entorno

Crear un archivo `.env.local` con las siguientes variables. **Nota**: Los valores mostrados son ejemplos genéricos, reemplazar con las URLs y credenciales reales de tu entorno:

```env
# =========================
# Configuración Oracle
# =========================
DB_MODE=thick
DB_USER=tu_usuario_db
DB_PASSWORD=tu_password_db
DB_CONNECT_STRING=tu_servidor:1521/tu_instancia
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_INCREMENT=1
DB_POOL_TIMEOUT=300
DB_SYNCHRONIZE=false
DB_LOGGING=false
ORACLE_CLIENT_LIB_DIR=/opt/oracle
EDITOR_CUSTOM_SCHEMA=EDITOR_CUSTOM

# =========================
# Middleware (Privadas)
# =========================
EXTERNAL_AUTH_URL=http://tu-servidor:puerto/api3/v1/Auth/login
EXTERNAL_API_BASE_URL=http://tu-servidor:puerto/api3/v1

# =========================
# Next.js (Públicas para cliente)
# =========================
NEXT_PUBLIC_API_URL=http://tu-servidor:puerto/api3/v1
NEXT_PUBLIC_AUTH_URL=http://tu-servidor:puerto/api3/v1/Auth/login
NEXT_PUBLIC_AUTH_USERNAME=tu_usuario_middleware
NEXT_PUBLIC_AUTH_PASSWORD=tu_password_middleware
BASE_URL=http://tu-servidor-agendas:puerto

# URLs de imágenes
NEXT_PUBLIC_LOGO_URL=http://tu-servidor-imagenes:puerto/public/img_directorio/logo.svg
NEXT_PUBLIC_APLICATIVO_LOGO_URL=http://tu-servidor-imagenes:puerto/public/img_directorio/aplicativo_logo.svg
NEXT_PUBLIC_HOMELINE_URL=http://tu-servidor-media:puerto/media/inicio_dir.jpg
NEXT_PUBLIC_BANNER_URL=http://tu-servidor-imagenes:puerto/public/img_directorio/Banner_Kiosco_actual.png
NEXT_PUBLIC_BANNER2_URL=http://tu-servidor-imagenes:puerto/public/img_directorio/banner_2.png
NEXT_PUBLIC_BANNER3_URL=http://tu-servidor-imagenes:puerto/public/img_directorio/banner_3.png
NEXT_PUBLIC_HVQ_LOGO_ANIMADO_URL=http://tu-servidor-imagenes:puerto/public/img_directorio/QR_Bless_Animado.mp4
NEXT_PUBLIC_HVQ_VIDEO_CUMBRE_URL=http://tu-servidor-media:puerto/videos/video_cumbre.mp4
NEXT_PUBLIC_HVQ_LOGO_URL=/images/hvq_2025_1.png
```

### Variables de Entorno para Producción
Para producción, crear un archivo `.env.production` con las URLs y credenciales reales. **Nota**: Los valores mostrados son ejemplos genéricos, reemplazar con las URLs y credenciales reales de tu entorno de producción:

```env
# =========================
# Configuración Oracle
# =========================
DB_MODE=thick
DB_USER=tu_usuario_db_produccion
DB_PASSWORD=tu_password_db_produccion
DB_CONNECT_STRING=tu_servidor_produccion:1521/tu_instancia_produccion
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_INCREMENT=1
DB_POOL_TIMEOUT=300
DB_SYNCHRONIZE=false
DB_LOGGING=false
ORACLE_CLIENT_LIB_DIR=/opt/oracle
EDITOR_CUSTOM_SCHEMA=EDITOR_CUSTOM

# =========================
# Middleware (Privadas)
# =========================
EXTERNAL_AUTH_URL=http://tu-servidor-produccion:puerto/api3/v1/Auth/login
EXTERNAL_API_BASE_URL=http://tu-servidor-produccion:puerto/api3/v1

# =========================
# Next.js (Públicas para cliente)
# =========================
NEXT_PUBLIC_API_URL=http://tu-servidor-produccion:puerto/api3/v1
NEXT_PUBLIC_AUTH_URL=http://tu-servidor-produccion:puerto/api3/v1/Auth/login
NEXT_PUBLIC_AUTH_USERNAME=tu_usuario_middleware_produccion
NEXT_PUBLIC_AUTH_PASSWORD=tu_password_middleware_produccion
BASE_URL=http://tu-servidor-agendas-produccion:puerto

# URLs de imágenes de producción
NEXT_PUBLIC_LOGO_URL=http://tu-servidor-imagenes-produccion:puerto/public/img_directorio/logo.svg
NEXT_PUBLIC_APLICATIVO_LOGO_URL=http://tu-servidor-imagenes-produccion:puerto/public/img_directorio/aplicativo_logo.svg
NEXT_PUBLIC_HOMELINE_URL=http://tu-servidor-media-produccion:puerto/media/inicio_dir.jpg
NEXT_PUBLIC_BANNER_URL=http://tu-servidor-imagenes-produccion:puerto/public/img_directorio/Banner_Kiosco_actual.png
NEXT_PUBLIC_BANNER2_URL=http://tu-servidor-imagenes-produccion:puerto/public/img_directorio/banner_2.png
NEXT_PUBLIC_BANNER3_URL=http://tu-servidor-imagenes-produccion:puerto/public/img_directorio/banner_3.png
NEXT_PUBLIC_HVQ_LOGO_ANIMADO_URL=http://tu-servidor-imagenes-produccion:puerto/public/img_directorio/QR_Bless_Animado.mp4
NEXT_PUBLIC_HVQ_VIDEO_CUMBRE_URL=http://tu-servidor-media-produccion:puerto/videos/video_cumbre.mp4
NEXT_PUBLIC_HVQ_LOGO_URL=/images/hvq_2025_1.png
```

### Instalación

```bash
# Instalar dependencias
pnpm install

# Ejecutar en desarrollo
pnpm dev

# Construir para producción
pnpm build

# Ejecutar en producción
pnpm start
```

## 🏗️ Arquitectura

### Configuración Centralizada

El proyecto utiliza un sistema de configuración centralizada en `lib/config.ts` que maneja:
- URLs de APIs (baseUrl, authUrl, agendaBaseUrl)
- URLs de imágenes y videos
- Configuración de caché
- Headers por defecto
- Configuración de base de datos Oracle
- Configuración de autenticación externa

### Separación de Responsabilidades

El proyecto implementa una arquitectura modular con hooks especializados:

#### **Hook Principal (Orquestador)**
- `use-doctor-schedule.ts`: Coordina todos los hooks especializados

#### **Hooks Especializados**
- `use-data-normalization.ts`: Normalización y transformación de datos
- `use-doctor-data.ts`: Fetching y procesamiento de datos de médicos
- `use-doctor-schedule-ui.ts`: Lógica específica de UI y estados
- `use-specialty-doctors.ts`: Gestión de médicos por especialidad
- `use-doctors-cache.ts`: Sistema de caché para médicos
- `use-agendas.ts`: Gestión de agendas médicas

### Gestión de Estado Optimizada

#### **Estados Granulares**
- Estados separados en múltiples `useState` para evitar re-renders innecesarios
- Estados de carga específicos por operación (specialty, doctor, schedules)
- Errores específicos por tipo de operación

#### **Memorización Inteligente**
- `useMemo` para cálculos costosos y datos procesados
- `useCallback` para funciones que se pasan como props
- Dependencias optimizadas para evitar recálculos innecesarios

### Gestión de Memoria

#### **AbortController**
- Cancelación de requests HTTP cuando el componente se desmonta
- Prevención de memory leaks en operaciones asíncronas
- Manejo de race conditions

#### **Cleanup Patterns**
- `isMounted` pattern para verificar si el componente sigue montado
- Cleanup automático de event listeners
- Cancelación de timeouts y intervals

### Tipos TypeScript

Todos los tipos están centralizados en `lib/types.ts` para:
- Interfaces de datos médicos y especialidades
- Tipos de componentes (VirtualKeyboard, DoctorCard)
- Tipos de errores y estados de carga
- Tipos de caché y configuración

### Sistema de Caché

Múltiples niveles de caché implementados:
- Caché en memoria con Map
- SessionStorage para datos de sesión
- LocalStorage para persistencia
- Fallbacks automáticos y validación de expiración

## 🔒 Seguridad

- **Credenciales**: Las credenciales se manejan a través de variables de entorno
- **Validación**: Validación de datos en el cliente y servidor
- **Sanitización**: Sanitización de strings y URLs
- **Timeouts**: Timeouts configurados para todas las peticiones HTTP

## 📱 Características de UX

### Teclado Virtual Mejorado
- **Teclado arrastrable**: Se puede mover por la pantalla
- **Controles de posición**: Botones para subir/bajar el teclado
- **Navegación directa**: Un solo clic para seleccionar tarjetas sin cerrar el teclado
- **Cierre automático**: El teclado se cierra automáticamente al navegar
- **Diseño optimizado**: Tamaños y espaciado mejorados para mejor usabilidad

### Estados de Carga Granulares
- **Feedback específico**: Estados de carga por operación (especialidad, médico, horarios)
- **Progreso visual**: Indicador de progreso con porcentaje
- **Errores específicos**: Mensajes de error detallados por tipo de operación
- **Estados de compatibilidad**: Mantiene compatibilidad con código existente

### Navegación Optimizada
- **Navegación intuitiva**: Con botones de volver e inicio
- **Carga progresiva**: Con spinners y estados de carga específicos
- **Manejo de errores**: Mensajes amigables y específicos para el usuario
- **Responsive**: Diseño adaptativo para diferentes dispositivos

### Experiencia de Usuario Mejorada
- **Un solo clic**: Para navegar desde el teclado a las tarjetas
- **Feedback inmediato**: Estados de carga granulares y específicos
- **Gestión de memoria**: Sin memory leaks ni race conditions
- **Rendimiento optimizado**: Re-renders minimizados y memorización inteligente

## 🚀 Despliegue

El proyecto está configurado para despliegue con Docker:

```bash
# Construir imagen
docker build -t directorio-medico .

# Ejecutar contenedor
docker run -p 3000:3000 directorio-medico
```

## 🏭 Preparación para Producción

### Checklist de Producción

#### 1. **Configuración de Entorno**
- [ ] Crear archivo `.env.production` con URLs reales
- [ ] Cambiar credenciales de desarrollo por las de producción
- [ ] Verificar que todas las URLs usen HTTPS
- [ ] Configurar variables de entorno en el servidor de producción

#### 2. **Seguridad**
- [ ] Revisar que no haya credenciales hardcodeadas en el código
- [ ] Verificar que los timeouts estén configurados apropiadamente
- [ ] Asegurar que las URLs de API usen HTTPS
- [ ] Configurar headers de seguridad (CORS, CSP, etc.)

#### 3. **Rendimiento**
- [ ] Ejecutar `pnpm build` y verificar que no hay errores
- [ ] Optimizar imágenes para producción
- [ ] Verificar que el caché esté configurado correctamente
- [ ] Revisar el tamaño del bundle con `pnpm build`

#### 4. **Monitoreo y Logs**
- [ ] Configurar logging para producción
- [ ] Habilitar monitoreo de errores
- [ ] Configurar métricas de rendimiento
- [ ] Establecer alertas para errores críticos

#### 5. **Backup y Recuperación**
- [ ] Configurar backup de la base de datos
- [ ] Documentar proceso de recuperación
- [ ] Probar proceso de rollback
- [ ] Configurar respaldos automáticos

#### 6. **Testing**
- [ ] Probar todas las funcionalidades en entorno de staging
- [ ] Verificar que la autenticación funcione correctamente
- [ ] Probar el sistema de caché
- [ ] Verificar la responsividad en diferentes dispositivos

#### 7. **Documentación**
- [ ] Actualizar documentación de despliegue
- [ ] Documentar configuración de producción
- [ ] Crear guía de troubleshooting
- [ ] Documentar procesos de mantenimiento

### Comandos para Producción

```bash
# Construir para producción
NODE_ENV=production pnpm build

# Verificar el build
pnpm start

# Ejecutar tests de producción (si existen)
pnpm test:prod

# Analizar el bundle
pnpm analyze
```

### Configuración de Servidor

#### Nginx (Recomendado)
```nginx
server {
    listen 80;
    server_name tu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### PM2 (Gestión de procesos)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start npm --name "directorio-medico" -- start

# Configurar inicio automático
pm2 startup
pm2 save
```

## 🚀 Mejoras Implementadas

### Optimización de Rendimiento
- **Gestión de estado granular**: Separación de estados para minimizar re-renders
- **Memorización inteligente**: useMemo y useCallback optimizados
- **Gestión de memoria**: AbortController para prevenir memory leaks
- **Estados de carga granulares**: Feedback específico por operación

### Separación de Responsabilidades
- **Hook orquestador**: `use-doctor-schedule.ts` coordina hooks especializados
- **Hooks especializados**: Cada hook tiene una responsabilidad específica
- **Modularidad**: Código más mantenible y testeable
- **Reutilización**: Hooks especializados pueden reutilizarse

### Experiencia de Usuario
- **Teclado virtual mejorado**: Navegación directa con un solo clic
- **Estados de carga específicos**: Feedback detallado del progreso
- **Gestión de errores granular**: Errores específicos por operación
- **Diseño optimizado**: Tamaños y espaciado mejorados

### Configuración y Mantenimiento
- **Variables de entorno**: Configuración centralizada y flexible
- **Eliminación de hardcoded values**: Todo configurable via env vars
- **Logs de debug**: Sistema de logging para troubleshooting
- **Compatibilidad**: Mantiene compatibilidad con código existente

## 📝 Notas de Desarrollo

- **Estilos**: Los estilos se mantienen como estaban originalmente
- **Versiones**: Las versiones de las tecnologías se mantienen sin cambios
- **Docker**: No se modificaron los archivos Dockerfile y .dockerignore
- **Pruebas**: No se crearon scripts de pruebas adicionales
- **Mejoras**: Implementadas optimizaciones de rendimiento y UX sin cambios breaking

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece al Hospital Vozandes Quito.
