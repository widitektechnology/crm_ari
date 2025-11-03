# 🚀 CAMBIANDO A CRM TRADICIONAL - OPCIÓN 2

## ⚡ **COMANDO COMPLETO A EJECUTAR:**

```bash
# Hacer backup del Next.js (por si acaso)
mv /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs-nextjs-backup && \

# Crear nuevo httpdocs
mkdir -p /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs && \

# Copiar CRM tradicional
cp ../crm-completo/* /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs/ && \

# Dar permisos correctos
chown -R ari_admin:psacln /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/httpdocs/ && \

# Confirmación
echo "✅ CRM TRADICIONAL DESPLEGADO - Menú lateral listo!"
```

## 🎯 **LO QUE HACE ESTE COMANDO:**

1. **🔄 Backup**: Guarda Next.js como `httpdocs-nextjs-backup`
2. **📁 Crear**: Nuevo directorio `httpdocs/`
3. **📂 Copiar**: CRM tradicional con menú lateral
4. **🔐 Permisos**: Asignar propietario correcto
5. **✅ Confirmar**: Mensaje de éxito

---

## 🌟 **CARACTERÍSTICAS DEL CRM TRADICIONAL:**

- ✅ **Login profesional** con validación
- ✅ **Menú lateral fijo** (como los de toda la vida)
- ✅ **Dashboard completo** con KPIs
- ✅ **Gestión de empresas** con CRUD
- ✅ **Gestión de empleados** con tarjetas
- ✅ **Diseño responsive** para móvil
- ✅ **Sin dependencias** - HTML/CSS/JS puro
- ✅ **Funciona inmediatamente**

---

## 🔥 **EJECUTA EL COMANDO Y DESPUÉS:**

1. **Refresca** `https://crm.arifamilyassets.com/`
2. **¡Verás el CRM funcionando!**
3. **Login** con cualquier usuario/contraseña
4. **Navega** por el menú lateral

**¡EJECUTA EL COMANDO AHORA!** 🚀