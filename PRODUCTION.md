# 🏭 Guía de Producción - Directorio Médico

## ⚠️ Consideraciones Críticas para Producción

### 1. **Seguridad - PRIORIDAD MÁXIMA**

#### Credenciales y Variables de Entorno
```bash
# ❌ NUNCA hacer esto en producción
EXTERNAL_AUTH_USERNAME=middleware_dev
EXTERNAL_AUTH_PASSWORD=DevMH@2025!
DB_USER=hvq_usrpython
DB_PASSWORD=pyth0n2022

# ✅ Hacer esto en producción
EXTERNAL_AUTH_USERNAME=usuario_produccion_seguro
EXTERNAL_AUTH_PASSWORD=password_complejo_y_seguro_2025!
DB_USER=usuario_db_produccion
DB_PASSWORD=password_db_seguro_2025!
```

#### URLs de Producción
```bash
# ❌ URLs de desarrollo
NEXT_PUBLIC_API_URL=http://10.129.180.151:3001
EXTERNAL_AUTH_URL=http://10.129.180.161:36560/api3/v1/Auth/login
EXTERNAL_API_BASE_URL=http://10.129.180.161:36560/api3/v1
DB_CONNECT_STRING=172.16.241.62:1521/SML

# ✅ URLs de producción (con HTTPS)
NEXT_PUBLIC_API_URL=https://api.hospital-vozandes.com
EXTERNAL_AUTH_URL=https://auth.hospital-vozandes.com/api3/v1/Auth/login
EXTERNAL_API_BASE_URL=https://auth.hospital-vozandes.com/api3/v1
DB_CONNECT_STRING=servidor-prod:1521/PROD
```

### 2. **Configuración de Servidor**

#### Variables de Entorno en el Servidor
```bash
# Crear archivo .env.production en el servidor
sudo nano /var/www/directorio-medico/.env.production

# Contenido del archivo:
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.hospital-vozandes.com
EXTERNAL_AUTH_URL=https://auth.hospital-vozandes.com/api3/v1/Auth/login
EXTERNAL_API_BASE_URL=https://auth.hospital-vozandes.com/api3/v1
EXTERNAL_AUTH_USERNAME=usuario_produccion
EXTERNAL_AUTH_PASSWORD=password_seguro_produccion
DB_MODE=thin
DB_USER=usuario_db_produccion
DB_PASSWORD=password_db_seguro_2025!
DB_CONNECT_STRING=servidor-prod:1521/PROD
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_INCREMENT=1
DB_POOL_TIMEOUT=300
DB_SYNCHRONIZE=false
DB_LOGGING=false
EDITOR_CUSTOM_SCHEMA=EDITOR_CUSTOM
CACHE_SPECIALTIES_TIMEOUT=60000
CACHE_API_TIMEOUT=30000
APP_TITLE=hvq-dir
APP_DESCRIPTION=Directorio Edificio Bless
APP_IDLE_TIMEOUT=30000
NEXT_PUBLIC_LOGO_URL=https://cdn.hospital-vozandes.com/img_directorio/logo.svg
NEXT_PUBLIC_APLICATIVO_LOGO_URL=https://cdn.hospital-vozandes.com/img_directorio/aplicativo_logo.svg
NEXT_PUBLIC_HOMELINE_URL=https://cdn.hospital-vozandes.com/img_directorio/homeline.png
NEXT_PUBLIC_BANNER_URL=https://cdn.hospital-vozandes.com/img_directorio/banner.png
NEXT_PUBLIC_HVQ_LOGO_URL=/images/hvq_2025_1.png
```

#### Configuración de Nginx
```nginx
# /etc/nginx/sites-available/directorio-medico
server {
    listen 80;
    server_name directorio.hospital-vozandes.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name directorio.hospital-vozandes.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/directorio.hospital-vozandes.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/directorio.hospital-vozandes.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # Root directory
    root /var/www/directorio-medico;
    
    # Static files
    location /_next/static/ {
        alias /var/www/directorio-medico/.next/static/;
        expires 365d;
        access_log off;
    }
    
    location /images/ {
        alias /var/www/directorio-medico/public/images/;
        expires 30d;
        access_log off;
    }
    
    # Main application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 3. **Gestión de Procesos con PM2**

#### Instalación y Configuración
```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Crear archivo de configuración PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'directorio-medico',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/directorio-medico',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/directorio-medico-error.log',
    out_file: '/var/log/pm2/directorio-medico-out.log',
    log_file: '/var/log/pm2/directorio-medico-combined.log',
    time: true,
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF

# Crear directorio de logs
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Iniciar aplicación
pm2 start ecosystem.config.js --env production

# Configurar inicio automático
pm2 startup
pm2 save
```

### 4. **Monitoreo y Logs**

#### Configuración de Logs
```bash
# Configurar rotación de logs
sudo nano /etc/logrotate.d/directorio-medico

# Contenido:
/var/log/pm2/directorio-medico-*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### Monitoreo con PM2
```bash
# Ver estado de la aplicación
pm2 status

# Ver logs en tiempo real
pm2 logs directorio-medico

# Ver métricas
pm2 monit

# Reiniciar aplicación
pm2 restart directorio-medico

# Recargar aplicación (sin downtime)
pm2 reload directorio-medico
```

### 5. **Backup y Recuperación**

#### Script de Backup
```bash
#!/bin/bash
# /var/scripts/backup-directorio.sh

BACKUP_DIR="/var/backups/directorio-medico"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/directorio-medico"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Backup del código
tar -czf $BACKUP_DIR/code_$DATE.tar.gz -C $APP_DIR .

# Backup de logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz -C /var/log/pm2 .

# Backup de configuración
cp $APP_DIR/.env.production $BACKUP_DIR/env_$DATE

# Limpiar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "env_*" -mtime +7 -delete

echo "Backup completado: $DATE"
```

#### Configurar Backup Automático
```bash
# Agregar al crontab
crontab -e

# Ejecutar backup diario a las 2 AM
0 2 * * * /var/scripts/backup-directorio.sh
```

### 6. **SSL/TLS con Let's Encrypt**

#### Instalación de Certbot
```bash
# Instalar Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d directorio.hospital-vozandes.com

# Configurar renovación automática
sudo crontab -e

# Renovar certificados automáticamente
0 12 * * * /usr/bin/certbot renew --quiet
```

### 7. **Optimización de Rendimiento**

#### Configuración de Next.js para Producción
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración existente...
  
  // Optimizaciones para producción
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Configuración de imágenes
  images: {
    unoptimized: true,
    domains: ['cdn.hospital-vozandes.com'],
  },
}

export default nextConfig
```

### 8. **Testing de Producción**

#### Script de Testing
```bash
#!/bin/bash
# /var/scripts/test-production.sh

echo "🧪 Iniciando tests de producción..."

# Test de conectividad
echo "1. Test de conectividad a APIs..."
curl -f https://api.hospital-vozandes.com/health || echo "❌ Error: API no responde"

# Test de autenticación
echo "2. Test de autenticación..."
curl -f -X POST https://auth.hospital-vozandes.com/api3/v1/Auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$NEXT_PUBLIC_AUTH_USERNAME&password=$NEXT_PUBLIC_AUTH_PASSWORD" || echo "❌ Error: Autenticación falló"

# Test de la aplicación
echo "3. Test de la aplicación..."
curl -f https://directorio.hospital-vozandes.com/health || echo "❌ Error: Aplicación no responde"

# Test de SSL
echo "4. Test de SSL..."
openssl s_client -connect directorio.hospital-vozandes.com:443 -servername directorio.hospital-vozandes.com < /dev/null 2>/dev/null | openssl x509 -noout -dates || echo "❌ Error: SSL no válido"

echo "✅ Tests completados"
```

### 9. **Comandos Útiles para Producción**

```bash
# Verificar estado del sistema
pm2 status
systemctl status nginx
systemctl status certbot.timer

# Ver logs
pm2 logs directorio-medico --lines 100
sudo tail -f /var/log/nginx/error.log

# Reiniciar servicios
pm2 restart directorio-medico
sudo systemctl restart nginx

# Verificar espacio en disco
df -h
du -sh /var/www/directorio-medico

# Verificar memoria
free -h
pm2 monit

# Backup manual
/var/scripts/backup-directorio.sh

# Test de producción
/var/scripts/test-production.sh
```

### 10. **Alertas y Monitoreo**

#### Configurar Alertas por Email
```bash
# Instalar mailutils
sudo apt install mailutils

# Configurar email
sudo nano /etc/postfix/main.cf

# Script de alerta
cat > /var/scripts/alert.sh << 'EOF'
#!/bin/bash
ALERT_EMAIL="admin@hospital-vozandes.com"

# Verificar si la aplicación está corriendo
if ! pm2 list | grep -q "directorio-medico.*online"; then
    echo "ALERTA: La aplicación directorio-medico no está corriendo" | mail -s "Alerta de Producción" $ALERT_EMAIL
fi

# Verificar espacio en disco
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "ALERTA: Espacio en disco crítico: ${DISK_USAGE}%" | mail -s "Alerta de Producción" $ALERT_EMAIL
fi
EOF

chmod +x /var/scripts/alert.sh

# Agregar al crontab para ejecutar cada 5 minutos
*/5 * * * * /var/scripts/alert.sh
```

## 🚨 Checklist Final de Producción

- [ ] **Seguridad**: Credenciales cambiadas y URLs con HTTPS
- [ ] **SSL**: Certificado SSL instalado y configurado
- [ ] **Nginx**: Configurado con headers de seguridad
- [ ] **PM2**: Aplicación corriendo con PM2
- [ ] **Logs**: Sistema de logs configurado
- [ ] **Backup**: Script de backup configurado
- [ ] **Monitoreo**: Alertas configuradas
- [ ] **Testing**: Scripts de testing ejecutados
- [ ] **Documentación**: Procesos documentados
- [ ] **Equipo**: Equipo notificado de la puesta en producción

## 📞 Contacto de Emergencias

En caso de problemas en producción:

1. **Revisar logs**: `pm2 logs directorio-medico`
2. **Verificar estado**: `pm2 status`
3. **Reiniciar aplicación**: `pm2 restart directorio-medico`
4. **Contactar al equipo de desarrollo**
5. **Ejecutar rollback si es necesario**

---

**⚠️ IMPORTANTE**: Esta guía debe ser revisada y adaptada según las políticas específicas del Hospital Vozandes Quito antes de implementar en producción.
