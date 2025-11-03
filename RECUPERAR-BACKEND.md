# 🔧 RECUPERAR BACKEND - VERIFICAR Y LEVANTAR

## 🔍 **VERIFICAR ESTADO ACTUAL DEL BACKEND:**

### **1️⃣ Ver contenedores Docker:**
```bash
docker ps -a | grep erp
```

### **2️⃣ Ver puertos ocupados:**
```bash
netstat -tlnp | grep -E ":8000|:3307"
```

### **3️⃣ Verificar si el backend responde:**
```bash
curl -I http://localhost:8000/health 2>/dev/null || echo "❌ Backend no responde"
```

---

## 🚀 **COMANDOS PARA RECUPERAR BACKEND:**

### **OPCIÓN A: Levantar contenedores existentes**
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/frontend
docker-compose up -d erp_backend erp_mysql
```

### **OPCIÓN B: Si hay problemas, rebuilding**
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/frontend
docker-compose down
docker-compose up --build -d erp_backend erp_mysql
```

### **OPCIÓN C: Solo backend si MySQL ya está corriendo**
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/frontend
docker-compose up -d erp_backend
```

---

## ⚡ **COMANDO DE DIAGNÓSTICO COMPLETO:**
```bash
echo "🔍 ESTADO ACTUAL:" && \
echo "1. Contenedores Docker:" && \
docker ps -a | grep erp && \
echo "" && \
echo "2. Puertos ocupados:" && \
netstat -tlnp | grep -E ":8000|:3307" && \
echo "" && \
echo "3. Test backend:" && \
curl -I http://localhost:8000/health 2>/dev/null || echo "❌ Backend no responde" && \
echo "" && \
echo "4. Test MySQL:" && \
curl -I http://localhost:3307 2>/dev/null || echo "ℹ️  MySQL no responde HTTP (normal)"
```

---

## 🎯 **DESPUÉS DE VERIFICAR:**

### **Si están parados:**
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/frontend
docker-compose up -d
```

### **Si hay errores:**
```bash
docker-compose logs erp_backend
docker-compose logs erp_mysql
```

---

**🔥 EJECUTA PRIMERO EL DIAGNÓSTICO:**

```bash
echo "🔍 ESTADO ACTUAL:" && docker ps -a | grep erp && echo "" && netstat -tlnp | grep -E ":8000|:3307"
```

**¿Qué te devuelve este comando?** Así sabemos exactamente qué necesita el backend. 🚀