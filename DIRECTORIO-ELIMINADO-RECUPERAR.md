# 🚨 DIRECTORIO FRONTEND ELIMINADO - NECESITAMOS RECREAR BACKEND

## 📊 **PROBLEMA:**
```
-bash: cd: /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/frontend: No such file or directory
```

**✅ Correcto** - eliminamos todo al recrear el subdominio limpio

## 🔍 **OPCIONES PARA RECUPERAR BACKEND:**

### **OPCIÓN A: BUSCAR BACKUP DEL PROYECTO**
```bash
# Buscar backups en el servidor
find /var/www/vhosts/arifamilyassets.com -name "*backup*" -type d
find /var/www/vhosts/arifamilyassets.com -name "docker-compose.yml"
```

### **OPCIÓN B: RECREAR DESDE GIT**
```bash
# Si el proyecto está en Git
cd /var/www/vhosts/arifamilyassets.com
git clone https://github.com/widitektechnology/crm_ari.git temp_crm
cp -r temp_crm/* crm.arifamilyassets.com/
```

### **OPCIÓN C: USAR CONTENEDORES EXISTENTES**
```bash
# Los contenedores aún existen, solo recrear configuración
mkdir -p /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/frontend
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/frontend

# Crear docker-compose.yml básico
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  erp_backend:
    image: erp_backend_fixed
    container_name: erp_backend
    ports:
      - "8000:8000"
    depends_on:
      - erp_mysql
    environment:
      - DATABASE_URL=mysql://root:your_password@erp_mysql:3306/erp_db

  erp_mysql:
    image: mysql:8.0
    container_name: erp_mysql
    ports:
      - "3307:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=your_password
      - MYSQL_DATABASE=erp_db
EOF
```

---

## ⚡ **COMANDOS PARA DIAGNÓSTICO:**

### **1️⃣ Buscar archivos del proyecto:**
```bash
find /var/www/vhosts/arifamilyassets.com -name "docker-compose.yml" 2>/dev/null
find /var/www/vhosts/arifamilyassets.com -name "*erp*" -type d 2>/dev/null | head -10
```

### **2️⃣ Ver si hay backups:**
```bash
ls -la /var/www/vhosts/arifamilyassets.com/ | grep backup
```

### **3️⃣ Los contenedores siguen existiendo:**
```bash
docker images | grep erp
```

---

## 🚀 **SOLUCIÓN RÁPIDA:**

**EJECUTAR DIAGNÓSTICO PRIMERO:**
```bash
echo "🔍 Buscando archivos del proyecto..." && \
find /var/www/vhosts/arifamilyassets.com -name "docker-compose.yml" 2>/dev/null && \
echo "" && \
echo "📁 Buscando backups:" && \
ls -la /var/www/vhosts/arifamilyassets.com/ | grep backup && \
echo "" && \
echo "🐳 Imágenes Docker disponibles:" && \
docker images | grep erp
```

**¿Ejecutas este diagnóstico para ver qué podemos recuperar?** 🚀