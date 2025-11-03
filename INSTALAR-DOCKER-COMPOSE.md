# ✅ ARCHIVOS RESTAURADOS - INSTALAR DOCKER-COMPOSE

## 📊 **ESTADO ACTUAL:**
- ✅ **Repositorio clonado** exitosamente (423 objetos)
- ✅ **Archivos restaurados** en crm.arifamilyassets.com/
- ✅ **MySQL funcionando** (puerto 3307)
- ❌ **docker-compose** no instalado
- ❌ **Backend parado** (necesita docker-compose)

---

## 🚀 **INSTALAR DOCKER-COMPOSE:**

### **OPCIÓN A: Instalar vía apt (recomendado)**
```bash
apt update && apt install -y docker-compose
```

### **OPCIÓN B: Usar docker directamente**
```bash
# Sin docker-compose, usar comandos docker individuales
docker start erp_backend
```

---

## ⚡ **COMANDO COMPLETO:**
```bash
echo "📦 Instalando docker-compose..." && \
apt update && \
apt install -y docker-compose && \
echo "🚀 Levantando backend..." && \
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/frontend && \
docker-compose up -d erp_backend && \
sleep 10 && \
echo "🔍 Verificando estado:" && \
docker ps | grep erp_backend && \
echo "🌐 Probando API:" && \
curl -I http://localhost:8000/health 2>/dev/null || echo "⚠️ API no responde aún"
```

---

## 🔧 **ALTERNATIVA SIN INSTALAR DOCKER-COMPOSE:**

### **Usar comandos docker directos:**
```bash
# Intentar arrancar el contenedor existente
docker start erp_backend

# Verificar estado
docker ps | grep erp_backend

# Probar API
curl http://localhost:8000/health
```

---

## 📋 **VERIFICAR ESTRUCTURA RESTAURADA:**
```bash
ls -la /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/
```

---

## 🎯 **PLAN DE ACCIÓN:**

### **1️⃣ Instalar docker-compose:**
```bash
apt update && apt install -y docker-compose
```

### **2️⃣ Levantar backend:**
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/frontend
docker-compose up -d erp_backend
```

### **3️⃣ Verificar funcionamiento:**
```bash
curl http://localhost:8000/health
curl http://localhost:8000/docs
```

---

**🔥 ¿INSTALAS DOCKER-COMPOSE O USAS COMANDOS DOCKER DIRECTOS?**

**OPCIÓN RÁPIDA:**
```bash
apt update && apt install -y docker-compose
```

**¿Cuál prefieres?** 🚀