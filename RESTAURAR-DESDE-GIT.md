# 🚀 RESTAURAR DESDE GIT - LA MEJOR OPCIÓN

## 📊 **VENTAJAS DE RESTAURAR DESDE GIT:**
- ✅ **Código completo** y actualizado
- ✅ **Backend funcional** con todas las APIs
- ✅ **Frontend original** (si lo necesitamos)
- ✅ **Configuración Docker** completa
- ✅ **Base de datos** y migraciones

---

## 🔧 **COMANDOS PARA RESTAURAR:**

### **1️⃣ CLONAR REPOSITORIO:**
```bash
cd /var/www/vhosts/arifamilyassets.com
git clone https://github.com/widitektechnology/crm_ari.git temp_crm_restore
```

### **2️⃣ MOVER ARCHIVOS AL DIRECTORIO CORRECTO:**
```bash
# Copiar todo el contenido
cp -r temp_crm_restore/* crm.arifamilyassets.com/

# Dar permisos correctos
chown -R ari_admin:psacln crm.arifamilyassets.com/

# Limpiar directorio temporal
rm -rf temp_crm_restore
```

### **3️⃣ LEVANTAR BACKEND:**
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/frontend
docker-compose up -d erp_backend
```

---

## ⚡ **COMANDO COMPLETO:**
```bash
echo "📥 Clonando desde Git..." && \
cd /var/www/vhosts/arifamilyassets.com && \
git clone https://github.com/widitektechnology/crm_ari.git temp_crm_restore && \
echo "📁 Moviendo archivos..." && \
cp -r temp_crm_restore/* crm.arifamilyassets.com/ && \
chown -R ari_admin:psacln crm.arifamilyassets.com/ && \
rm -rf temp_crm_restore && \
echo "🐳 Levantando backend..." && \
cd crm.arifamilyassets.com/frontend && \
docker-compose up -d erp_backend && \
echo "✅ RESTAURACIÓN COMPLETA"
```

---

## 🎯 **DESPUÉS DE LA RESTAURACIÓN:**

### **VERIFICAR BACKEND:**
```bash
docker ps | grep erp_backend
curl http://localhost:8000/health
```

### **VERIFICAR ESTRUCTURA:**
```bash
ls -la /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/
```

### **APIS DISPONIBLES:**
```bash
curl http://localhost:8000/docs
```

---

## 🔄 **LUEGO PODEMOS:**
1. **Mantener backend** funcionando
2. **Usar frontend estático** en la raíz (como ya creamos)
3. **Conectar frontend estático** a las APIs del backend

---

## 🚨 **SI HAY PROBLEMAS DE AUTENTICACIÓN:**
```bash
# Configurar Git si es necesario
git config --global user.email "you@example.com"
git config --global user.name "Your Name"

# O usar HTTPS público
git clone https://github.com/widitektechnology/crm_ari.git temp_crm_restore
```

---

**🔥 EJECUTA EL COMANDO COMPLETO:**

```bash
echo "📥 Clonando desde Git..." && cd /var/www/vhosts/arifamilyassets.com && git clone https://github.com/widitektechnology/crm_ari.git temp_crm_restore && echo "📁 Moviendo archivos..." && cp -r temp_crm_restore/* crm.arifamilyassets.com/ && chown -R ari_admin:psacln crm.arifamilyassets.com/ && rm -rf temp_crm_restore && echo "✅ ARCHIVOS RESTAURADOS"
```

**¿Ejecutas la restauración desde Git?** 🚀