# 🚨 CONFLICTO DE CONTENEDORES - MYSQL YA EXISTE

## 📊 **PROBLEMA:**
```
ERROR: The container name "/erp_mysql" is already in use
```

**✅ Buenas noticias**: MySQL ya está corriendo desde antes (7+ horas)

---

## 🚀 **SOLUCIONES:**

### **OPCIÓN A: Usar contenedores existentes**
```bash
# Arrancar solo el backend (MySQL ya funciona)
docker start erp_backend

# Verificar estado
docker ps | grep -E "backend|mysql"
```

### **OPCIÓN B: Limpiar y recrear**
```bash
# Parar contenedores conflictivos
docker stop erp_mysql erp_backend 2>/dev/null

# Eliminarlos
docker rm erp_mysql erp_backend 2>/dev/null

# Levantar con docker-compose
docker-compose up -d backend mysql redis
```

### **OPCIÓN C: Solo arrancar backend (RECOMENDADO)**
```bash
# MySQL ya funciona, solo necesitamos backend
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/frontend
docker-compose up -d backend redis
```

---

## ⚡ **COMANDO RECOMENDADO:**
```bash
echo "🔧 Usando MySQL existente, levantando backend y redis..." && \
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/frontend && \
docker-compose up -d backend redis && \
sleep 15 && \
echo "🔍 Estado de todos los servicios:" && \
docker ps | grep -E "backend|mysql|redis" && \
echo "" && \
echo "🌐 Probando API:" && \
curl -I http://localhost:8000/health 2>/dev/null || echo "⚠️ Esperando que arranque..." && \
echo "" && \
echo "📋 Servicios finales:" && \
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "backend|mysql|redis"
```

---

## 🎯 **ESTADO IDEAL:**
```
erp_backend    Up    0.0.0.0:8000->8000/tcp
erp_mysql      Up    0.0.0.0:3307->3306/tcp  (ya funcionaba)
erp_redis      Up    0.0.0.0:6379->6379/tcp
```

---

## 🔍 **SI SIGUE FALLANDO:**
```bash
# Ver logs del backend
docker logs backend

# Verificar que MySQL responde
docker exec erp_mysql mysql -u root -p -e "SHOW DATABASES;"
```

---

**🔥 EJECUTA EL COMANDO RECOMENDADO:**

```bash
echo "🔧 Levantando backend y redis (MySQL ya funciona)..." && cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/frontend && docker-compose up -d backend redis && sleep 15 && echo "🔍 Estado:" && docker ps | grep -E "backend|mysql|redis"
```

**¡Debería funcionar perfectamente!** 🚀