# Directorio Médico - Hospital Vozandes Quito

Sistema de directorio médico para el Hospital Vozandes Quito, desarrollado con Next.js 15 y TypeScript.

## 🚀 Características

- **Interfaz moderna y responsiva** con Tailwind CSS
- **Sistema de autenticación** integrado
- **Búsqueda de especialidades y médicos** con teclado virtual
- **Gestión de agendas médicas** en tiempo real
- **Caché inteligente** para mejorar el rendimiento
- **Validación y normalización de datos** centralizada
- **Tipado completo** con TypeScript

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
│   └── ...               # Componentes específicos
├── lib/                  # Utilidades y servicios
│   ├── config.ts         # Configuración centralizada
│   ├── types.ts          # Tipos TypeScript
│   ├── auth.ts           # Servicio de autenticación
│   ├── api-service.ts    # Servicio de API
│   ├── utils.ts          # Utilidades generales
│   ├── constants.ts      # Constantes del proyecto
│   ├── data-normalization.ts # Normalización de datos
│   └── data-validation.ts    # Validación de datos
├── styles/               # Archivos CSS
└── public/               # Archivos estáticos
```

## 🔧 Configuración

### Variables de Entorno

Crear un archivo `.env.local` con las siguientes variables:

```env
# Configuración de la API
NEXT_PUBLIC_API_URL= api
NEXT_PUBLIC_AUTH_URL=api

# Credenciales de autenticación
NEXT_PUBLIC_AUTH_USERNAME=user
NEXT_PUBLIC_AUTH_PASSWORD= password

# URLs de imágenes (opcionales)
NEXT_PUBLIC_LOGO_URL=logo
NEXT_PUBLIC_APLICATIVO_LOGO_URL=  logo app
NEXT_PUBLIC_HOMELINE_URL=
NEXT_PUBLIC_BANNER_URL=banners
NEXT_PUBLIC_HVQ_LOGO_URL=
```

### Variables de Entorno para Producción
Para producción, crear un archivo `.env.production` con las URLs y credenciales reales:

```env

NEXT_PUBLIC_API_URL= api url 
NEXT_PUBLIC_AUTH_URL= api url

# Credenciales de producción (reemplazar con credenciales reales)
NEXT_PUBLIC_AUTH_USERNAME=usuario_produccion
NEXT_PUBLIC_AUTH_PASSWORD=password_seguro_produccion

# URLs de imágenes de producción
NEXT_PUBLIC_LOGO_URL=logo
NEXT_PUBLIC_APLICATIVO_LOGO_URL=  logo app
NEXT_PUBLIC_HOMELINE_URL=
NEXT_PUBLIC_BANNER_URL=banners
NEXT_PUBLIC_HVQ_LOGO_URL=
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
- URLs de APIs
- URLs de imágenes
- Configuración de caché
- Headers por defecto

### Tipos TypeScript

Todos los tipos están centralizados en `lib/types.ts` para:
- Interfaces de datos
- Tipos de componentes
- Tipos de errores
- Tipos de caché

### Manejo de Errores

Sistema robusto de manejo de errores en `lib/error-handler.ts`:
- Errores de red
- Errores de API
- Validación de datos
- Formateo de mensajes

### Sistema de Caché

Múltiples niveles de caché en `lib/cache.ts`:
- Caché en memoria
- SessionStorage
- LocalStorage
- Fallbacks automáticos

## 🔒 Seguridad

- **Credenciales**: Las credenciales se manejan a través de variables de entorno
- **Validación**: Validación de datos en el cliente y servidor
- **Sanitización**: Sanitización de strings y URLs
- **Timeouts**: Timeouts configurados para todas las peticiones HTTP

## 📱 Características de UX

- **Teclado virtual**: Para dispositivos táctiles
- **Navegación intuitiva**: Con botones de volver e inicio
- **Carga progresiva**: Con spinners y estados de carga
- **Manejo de errores**: Mensajes amigables para el usuario
- **Responsive**: Diseño adaptativo para diferentes dispositivos

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

## 📝 Notas de Desarrollo

- **Estilos**: Los estilos se mantienen como estaban originalmente
- **Versiones**: Las versiones de las tecnologías se mantienen sin cambios
- **Docker**: No se modificaron los archivos Dockerfile y .dockerignore
- **Pruebas**: No se crearon scripts de pruebas adicionales

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece al Hospital Vozandes Quito.
