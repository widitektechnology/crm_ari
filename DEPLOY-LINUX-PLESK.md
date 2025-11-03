# 🐧 DESPLIEGUE EN LINUX DEDICADO CON PLESK

## 🎯 Configuración Específica para tu Servidor

### 📋 Información del Entorno
- **Servidor**: Linux dedicado
- **Panel**: Plesk
- **Dominio**: crm.arifamilyassets.com
- **Problema actual**: 404 en archivos subidos

---

## 🔧 Rutas en Servidor Linux con Plesk

### 📁 Estructura Típica de Plesk
```bash
/var/www/vhosts/arifamilyassets.com/
├── httpdocs/          # ← Document Root (público)
├── httpsdocs/         # ← SSL Document Root
├── private/
├── logs/
└── tmp/
```

### 🎯 Ruta Correcta para Archivos
- **Document Root**: `/var/www/vhosts/arifamilyassets.com/httpdocs/`
- **URL resultante**: https://crm.arifamilyassets.com/

---

## 🚀 Plan de Despliegue Paso a Paso

### Paso 1: **Verificar Configuración de Plesk**
1. **Panel Plesk** → **Dominios** → **crm.arifamilyassets.com**
2. **Hosting Settings** → Verificar:
   - Document Root: `/httpdocs/`
   - PHP version: No importa (archivos estáticos)
   - SSL/TLS: Habilitado

### Paso 2: **Acceso por SSH al Servidor**
```bash
# Conectar por SSH
ssh usuario@crm.arifamilyassets.com

# Navegar a la carpeta correcta
cd /var/www/vhosts/arifamilyassets.com/httpdocs/

# Verificar contenido actual
ls -la
```

### Paso 3: **Subir Archivos de Prueba**
```bash
# Método 1: SCP desde tu Windows
scp frontend/test-simple.html usuario@crm.arifamilyassets.com:/var/www/vhosts/arifamilyassets.com/httpdocs/

# Método 2: Usar File Manager de Plesk
# Panel Plesk → Files → httpdocs/ → Upload
```

### Paso 4: **Verificar Permisos Linux**
```bash
# En el servidor, establecer permisos correctos
cd /var/www/vhosts/arifamilyassets.com/httpdocs/

# Permisos para archivos HTML
chmod 644 *.html

# Permisos para carpetas
chmod 755 .

# Verificar propietario
chown -R psaadm:psacln *
```

---

## 🔍 Diagnóstico del Problema 404

### A. **Verificar si Archivos Existen**
```bash
# SSH al servidor
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/test-simple.html

# Si no existe:
echo "❌ Archivo no subido correctamente"

# Si existe:
echo "✅ Archivo existe, problema de configuración"
```

### B. **Verificar Logs de Apache**
```bash
# Ver logs de error
tail -f /var/www/vhosts/system/arifamilyassets.com/logs/error_log

# Ver logs de acceso
tail -f /var/www/vhosts/system/arifamilyassets.com/logs/access_log
```

### C. **Verificar Virtual Host**
```bash
# Ver configuración Apache
cat /var/www/vhosts/system/arifamilyassets.com/conf/httpd.conf
```

---

## 🛠️ Soluciones Específicas Linux/Plesk

### 1. **Problema: Git no funciona**
```bash
# En servidor, clonar directamente
cd /var/www/vhosts/arifamilyassets.com/httpdocs/
git clone https://github.com/widitektechnology/crm_ari.git temp
cp temp/frontend/build/* .
rm -rf temp
```

### 2. **Problema: Permisos**
```bash
# Arreglar permisos después de subir
find /var/www/vhosts/arifamilyassets.com/httpdocs/ -type f -exec chmod 644 {} \;
find /var/www/vhosts/arifamilyassets.com/httpdocs/ -type d -exec chmod 755 {} \;
chown -R psaadm:psacln /var/www/vhosts/arifamilyassets.com/httpdocs/
```

### 3. **Problema: .htaccess**
```bash
# Verificar que Apache permite .htaccess
# En configuración de Plesk debe estar:
# AllowOverride All
```

---

## 📦 Métodos de Subida Recomendados

### 1. **File Manager de Plesk** (Más Fácil)
- Panel Plesk → Files → httpdocs
- Upload → Seleccionar archivos
- Descomprimir si subes ZIP

### 2. **FTP/SFTP** (Recomendado)
```
Host: crm.arifamilyassets.com
Usuario: [tu usuario Plesk]
Password: [tu password]
Puerto: 22 (SFTP) ó 21 (FTP)
Directorio: /httpdocs/
```

### 3. **SCP desde Windows**
```powershell
# Desde PowerShell en Windows
scp -r frontend/build/* usuario@crm.arifamilyassets.com:/var/www/vhosts/arifamilyassets.com/httpdocs/
```

---

## 🎯 Próximos Pasos Inmediatos

### ✅ **Paso 1**: Subir test-simple.html
1. Usar File Manager de Plesk
2. Subir a `/httpdocs/test-simple.html`
3. Probar: https://crm.arifamilyassets.com/test-simple.html

### ✅ **Paso 2**: Si funciona, subir CRM completo
1. Subir toda la carpeta `frontend/build/`
2. Verificar permisos
3. Probar: https://crm.arifamilyassets.com/

### ✅ **Paso 3**: Configurar Document Root final
Si necesitas que el CRM esté en la raíz del dominio, configurar Document Root a apuntar a `/httpdocs/build/` en lugar de `/httpdocs/`.

---

## 📞 ¿Cuál prefieres probar primero?

1. **File Manager de Plesk** (más visual)
2. **SFTP con FileZilla** (más control)
3. **SSH directo** (más técnico)

**¿Tienes acceso SSH al servidor o prefieres usar el panel de Plesk?**