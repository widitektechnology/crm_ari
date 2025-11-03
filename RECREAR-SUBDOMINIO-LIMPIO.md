# 🚀 RECREANDO SUBDOMINIO DESDE CERO - OPCIÓN 3

## ⚡ **COMANDO COMPLETO PARA RECREAR:**

```bash
echo "🗑️  Eliminando directorio problemático..." && \
rm -rf /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com && \
echo "📁 Creando directorio limpio..." && \
mkdir -p /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com && \
echo "📋 Copiando CRM tradicional..." && \
cp /var/www/vhosts/arifamilyassets.com/crm-completo/* /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/ 2>/dev/null || \
cp /var/www/vhosts/arifamilyassets.com/httpdocs-erp-backup-20251103_174546/crm-completo/* /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/ 2>/dev/null || \
echo "⚠️  Necesitamos recrear los archivos del CRM" && \
echo "🔐 Asignando permisos correctos..." && \
chown -R ari_admin:psacln /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/ && \
echo "✅ SUBDOMINIO RECREADO LIMPIO"
```

## 📊 **LO QUE HACE ESTE COMANDO:**

1. **🗑️  ELIMINA** todo el directorio problemático
2. **📁 CREA** directorio completamente limpio
3. **📋 COPIA** CRM tradicional (desde backup si es necesario)
4. **🔐 ASIGNA** permisos correctos
5. **✅ CONFIRMA** que está listo

---

## 🎯 **DESPUÉS DE EJECUTAR:**

### **1️⃣ Verificar archivos:**
```bash
ls -la /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/
```

### **2️⃣ Configurar en Plesk:**
- **Directorio raíz**: `crm.arifamilyassets.com`
- **Archivo índice**: `index.html`
- **Tipo**: Archivos estáticos (NO proxy)

### **3️⃣ Probar el sitio:**
- **URL**: `https://crm.arifamilyassets.com/`
- **Limpiar caché**: Ctrl+F5

---

## 🚨 **SI NO ENCUENTRA LOS ARCHIVOS DEL CRM:**

Necesitaremos recrear el CRM tradicional:

```bash
# Crear login básico
cat > /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM ARI - Login</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .login-container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); max-width: 400px; width: 100%; }
        .logo h1 { text-align: center; color: #333; font-size: 2.5em; margin-bottom: 30px; }
        .form-group { margin-bottom: 20px; }
        .form-group input { width: 100%; padding: 12px; border: 2px solid #e1e1e1; border-radius: 5px; font-size: 16px; }
        .btn-login { width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo"><h1>CRM ARI</h1></div>
        <form><div class="form-group"><input type="text" placeholder="Usuario" required></div><div class="form-group"><input type="password" placeholder="Contraseña" required></div><button type="submit" class="btn-login">Iniciar Sesión</button></form>
    </div>
</body>
</html>
EOF
```

---

**🔥 EJECUTA EL COMANDO DE RECREACIÓN Y ME DICES CÓMO VA!** 🚀