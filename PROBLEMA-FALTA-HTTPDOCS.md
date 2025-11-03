# 🚨 PROBLEMA IDENTIFICADO - FALTA httpdocs

## 📊 **DIAGNÓSTICO:**
- ✅ **Build compilado**: En `/frontend/build/`
- ❌ **No hay httpdocs**: Para `crm.arifamilyassets.com`
- ❌ **No hay subdomains**: En la estructura de Plesk
- ✅ **CRM tradicional**: Existe en `/crm-completo/`

## 🔍 **ESTRUCTURA ACTUAL:**
```
/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/
├── frontend/          ← Código fuente
├── backend/           ← API
├── build/             ← Build compilado ✅
├── crm-completo/      ← CRM tradicional ✅
└── (archivos config)
```

## 🚨 **FALTA CREAR:**
```
/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs/
```

---

## 🚀 **SOLUCIONES:**

### **OPCIÓN A: Crear httpdocs y copiar build**
```bash
# Crear directorio httpdocs
mkdir -p /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs

# Copiar build de Next.js
cp -r build/* /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs/

# Dar permisos
chown -R ari_admin:psacln /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs/
```

### **OPCIÓN B: Usar CRM tradicional (RECOMENDADO)**
```bash
# Crear httpdocs
mkdir -p /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs

# Copiar CRM tradicional
cp crm-completo/* /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs/

# Dar permisos
chown -R ari_admin:psacln /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs/
```

### **OPCIÓN C: Configurar Plesk para el subdominio**
```bash
# Verificar configuración en Plesk
# Necesitarías configurar el subdominio desde el panel de Plesk
```

---

## 🎯 **RECOMENDACIÓN:**

**USAR OPCIÓN B** - CRM tradicional con menú lateral como pediste:

```bash
mkdir -p /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs && \
cp crm-completo/* /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs/ && \
chown -R ari_admin:psacln /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs/
```

**¿Cuál prefieres? A (Next.js) o B (CRM tradicional)?** 🚀