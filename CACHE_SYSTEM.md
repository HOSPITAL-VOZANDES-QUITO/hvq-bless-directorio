# Sistema de Caché para Datos de Médicos

## Descripción

Se ha implementado un sistema de caché inteligente que almacena los datos de médicos en el navegador para mejorar la experiencia del usuario y reducir las llamadas a la API.

## Características

### 🚀 Carga Inicial
- Al hacer clic en "Buscar por Médico" por primera vez, se cargan los datos desde la API
- Los datos se almacenan automáticamente en `localStorage` del navegador
- Se muestra un indicador visual cuando los datos provienen del caché

### 💾 Persistencia del Caché
- Los datos se mantienen en memoria durante toda la sesión
- El caché se limpia automáticamente cuando:
  - Se cierra la pestaña/ventana del navegador
  - Se navega fuera de la página
  - Se recarga la página completamente

### ⏱️ Duración del Caché
- Los datos en caché son válidos por 24 horas
- Después de este tiempo, se cargan automáticamente datos frescos desde la API

### 🔄 Actualización Manual
- Los usuarios pueden forzar una actualización de datos usando el botón "Actualizar"
- Esto limpia el caché y recarga los datos desde la API

## Archivos Modificados

### 1. `hooks/use-doctors-cache.ts`
Hook personalizado que maneja toda la lógica del caché:
- Carga inicial desde API o caché
- Almacenamiento en localStorage
- Limpieza automática del caché
- Gestión de estados de carga y error

### 2. `app/doctors/search/page.tsx`
Página de búsqueda de médicos actualizada:
- Usa el hook de caché en lugar de llamadas directas a la API
- Muestra indicadores visuales del estado del caché
- Integra el componente de estado del caché

### 3. `components/cache-status.tsx`
Componente que muestra el estado del caché:
- Indicador visual cuando los datos vienen del caché
- Botón para forzar actualización
- Tooltip con información adicional

## Flujo de Funcionamiento

1. **Primera visita**: Usuario hace clic en "Buscar por Médico"
   - Se cargan datos desde la API
   - Se almacenan en localStorage
   - Se muestran los médicos

2. **Visitas posteriores**: Usuario regresa a la página
   - Se cargan datos desde el caché (instantáneo)
   - Se muestra indicador "Datos en caché"
   - No se hace llamada a la API

3. **Cierre de página**: Usuario cierra la pestaña
   - Se limpia automáticamente el caché
   - En la próxima visita se cargarán datos frescos

## Beneficios

- ⚡ **Rendimiento**: Carga instantánea de datos en visitas posteriores
- 🌐 **Reducción de tráfico**: Menos llamadas a la API
- 💡 **Experiencia de usuario**: Indicadores claros del estado de los datos
- 🔄 **Flexibilidad**: Opción de actualizar datos manualmente
- 🧹 **Limpieza automática**: No acumula datos innecesarios

## Configuración Técnica

- **Clave del caché**: `hvq_doctors_cache`
- **Duración**: 24 horas (86400000 ms)
- **Almacenamiento**: localStorage del navegador
- **Limpieza**: Automática al cerrar la página

## Compatibilidad

- ✅ Funciona en todos los navegadores modernos
- ✅ Manejo de errores si localStorage no está disponible
- ✅ Fallback a carga desde API si el caché falla
- ✅ Soporte para cancelación de requests
