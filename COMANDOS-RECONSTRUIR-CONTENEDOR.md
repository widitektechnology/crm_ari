# 🔧 Comandos para Reconstruir Contenedor - Servidor de Producción

## 📝 Comandos Completos para Ejecutar en el Servidor

### 1. Conectarse al Servidor
```bash
ssh root@185.253.25.29
```

### 2. Ir al Directorio del Proyecto
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend
```

### 3. Detener Contenedores Existentes
```bash
docker-compose -f docker-compose.external-db.yml down
```

### 4. Limpiar Imágenes Antiguas (Opcional pero Recomendado)
```bash
# Eliminar imagen específica del backend
docker rmi backend_backend:latest

# O limpiar todas las imágenes no utilizadas
docker image prune -f
```

### 5. Reconstruir Imagen Sin Cache
```bash
docker-compose -f docker-compose.external-db.yml build --no-cache
```

### 6. Levantar Contenedores
```bash
docker-compose -f docker-compose.external-db.yml up -d
```

### 7. Verificar Estado de Contenedores
```bash
docker ps
```

### 8. Verificar Logs del Backend
```bash
docker logs crm_ari_backend
```

### 9. Verificar Health Check
```bash
curl http://localhost:8000/health
```

## 🚀 Comando Todo-en-Uno (Opción Rápida)

Si quieres ejecutar todo de una vez:

```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend && \
docker-compose -f docker-compose.external-db.yml down && \
docker rmi backend_backend:latest 2>/dev/null || true && \
docker-compose -f docker-compose.external-db.yml build --no-cache && \
docker-compose -f docker-compose.external-db.yml up -d && \
sleep 10 && \
docker logs crm_ari_backend
```

## 🔍 Verificaciones Post-Despliegue

### Verificar que el Contenedor Está Ejecutándose
```bash
docker ps | grep crm_ari_backend
```

### Verificar Logs en Tiempo Real
```bash
docker logs -f crm_ari_backend
```

### Probar Endpoint de Health
```bash
curl -v http://localhost:8000/health
```

### Probar Login de Admin
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}'
```

### Verificar Documentación de API
```bash
# Acceder desde navegador (requiere autenticación)
# Usuario: admin
# Contraseña: crm2025@docs
curl -u admin:crm2025@docs http://localhost:8000/docs
```

## ⚠️ Solución de Problemas

### Si el Contenedor No Inicia
```bash
# Ver logs detallados
docker logs crm_ari_backend

# Verificar configuración de red
docker network ls | grep crm_network

# Reiniciar Docker (último recurso)
systemctl restart docker
```

### Si Hay Errores de Base de Datos
```bash
# Verificar conectividad a MySQL
mysql -h localhost -u crm_user -p crm_ari -e "SELECT 1;"

# Verificar que la base de datos existe
mysql -h localhost -u crm_user -p -e "SHOW DATABASES LIKE 'crm_ari';"
```

### Si Hay Errores de Puerto
```bash
# Verificar que el puerto 8000 está libre
netstat -tulpn | grep :8000

# Si hay conflicto, detener el proceso que usa el puerto
sudo fuser -k 8000/tcp
```

## 📊 Estados Esperados

### Contenedor Saludable
```bash
docker ps
# Debería mostrar: crm_ari_backend   Up   healthy
```

### Logs Sin Errores
```bash
docker logs crm_ari_backend | tail -20
# Debería mostrar: "✅ CRM ARI API started successfully"
```

### Health Check Exitoso
```bash
curl http://localhost:8000/health
# Respuesta esperada:
# {
#   "status": "ok",
#   "service": "CRM ARI API",
#   "version": "2.0.0",
#   "database": "ok",
#   "timestamp": "2025-11-06T14:00:00Z"
# }
```

## 🎯 Archivos Corregidos Incluidos

Los siguientes archivos han sido corregidos y están listos:

1. **src/config/settings.py** - Configuración Pydantic con `ConfigDict(extra="allow")`
2. **src/services/auth.py** - Import JWT corregido (`from jose import jwt`)
3. **src/api/routers/auth.py** - Import y uso de `get_current_user` corregido
4. **src/database/models.py** - Import SQLAlchemy corregido

## 🔐 Credenciales de Prueba

### Usuario Admin
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Documentación API
- **Usuario**: `admin`
- **Contraseña**: `crm2025@docs`
- **URL**: `http://crm.arifamilyassets.com:8000/docs`

## ✅ Checklist Final

- [ ] Contenedor iniciado sin errores
- [ ] Health check responde correctamente
- [ ] Login de admin funciona
- [ ] Documentación API accesible
- [ ] Frontend conecta correctamente
- [ ] Base de datos responde

## 📞 Contacto de Soporte

Si encuentras problemas durante el despliegue, revisa:

1. Los logs del contenedor Docker
2. La conectividad de la base de datos
3. Los puertos disponibles
4. Los permisos de archivos

¡Todos los errores de compatibilidad han sido resueltos! 🎉