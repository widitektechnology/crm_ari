# ====================================================
# 📦 PREPARAR ARCHIVOS PARA PLESK FILE MANAGER
# ====================================================

Write-Host "🐧 PREPARANDO ARCHIVOS PARA LINUX/PLESK..." -ForegroundColor Green
Write-Host ""

# Crear carpeta temporal para deployment
$deployDir = "plesk-deploy"
$frontendDir = "frontend"

# Limpiar carpeta anterior si existe
if (Test-Path $deployDir) {
    Write-Host "🧹 Limpiando carpeta anterior..." -ForegroundColor Yellow
    Remove-Item -Path $deployDir -Recurse -Force
}

# Crear nueva carpeta
New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
Write-Host "📁 Creada carpeta: $deployDir" -ForegroundColor Green

# Copiar archivos de prueba
Write-Host ""
Write-Host "📋 COPIANDO ARCHIVOS DE PRUEBA..." -ForegroundColor Yellow

$testFiles = @(
    "$frontendDir/test-simple.html",
    "$frontendDir/connection-test.html"
)

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Copy-Item -Path $file -Destination "$deployDir/$fileName" -Force
        Write-Host "  ✅ Copiado: $fileName" -ForegroundColor Green
    } else {
        Write-Host "  ❌ No encontrado: $file" -ForegroundColor Red
    }
}

# Copiar archivos de configuración
Write-Host ""
Write-Host "⚙️ COPIANDO CONFIGURACIÓN..." -ForegroundColor Yellow

$configFiles = @(
    "$frontendDir/.htaccess",
    "$frontendDir/.htaccess-simple"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        $fileName = Split-Path $file -Leaf
        Copy-Item -Path $file -Destination "$deployDir/$fileName" -Force
        Write-Host "  ✅ Copiado: $fileName" -ForegroundColor Green
    }
}

# Copiar CRM completo
Write-Host ""
Write-Host "🏗️ COPIANDO CRM COMPILADO..." -ForegroundColor Yellow

$buildDir = "$frontendDir/build"
if (Test-Path $buildDir) {
    # Crear subcarpeta crm-build
    New-Item -ItemType Directory -Path "$deployDir/crm-build" -Force | Out-Null
    
    # Copiar todo el contenido
    Copy-Item -Path "$buildDir/*" -Destination "$deployDir/crm-build/" -Recurse -Force
    
    $fileCount = (Get-ChildItem -Path "$deployDir/crm-build" -Recurse -File).Count
    Write-Host "  ✅ CRM copiado: $fileCount archivos" -ForegroundColor Green
} else {
    Write-Host "  ❌ No encontrado: $buildDir" -ForegroundColor Red
}

# Crear archivo de instrucciones
Write-Host ""
Write-Host "📝 CREANDO INSTRUCCIONES..." -ForegroundColor Yellow

$instructions = @"
# 🚀 INSTRUCCIONES PARA PLESK FILE MANAGER

## 📋 Archivos Preparados en esta Carpeta:

### 1. ARCHIVOS DE PRUEBA (subir primero):
- test-simple.html      → Subir a /httpdocs/
- connection-test.html  → Subir a /httpdocs/

### 2. CONFIGURACIÓN APACHE:
- .htaccess            → Subir a /httpdocs/ (para SPA routing)
- .htaccess-simple     → Alternativa más simple

### 3. CRM COMPLETO:
- crm-build/           → Todo el contenido subir a /httpdocs/

---

## 🎯 PASOS EN PLESK:

### Paso 1: Probar Conectividad
1. Panel Plesk → Files → httpdocs
2. Upload: test-simple.html
3. Probar: https://crm.arifamilyassets.com/test-simple.html

### Paso 2: Si funciona, subir CRM
1. Upload: todo el contenido de crm-build/
2. Upload: .htaccess
3. Probar: https://crm.arifamilyassets.com/

### Paso 3: Verificar Permisos (si es necesario)
En SSH:
```bash
chmod 644 /var/www/vhosts/arifamilyassets.com/httpdocs/*.html
chmod 755 /var/www/vhosts/arifamilyassets.com/httpdocs/
```

---

## 🔧 Document Root Options:

### Opción A: CRM en raíz del dominio
- Subir contenido de crm-build/ directamente a httpdocs/
- URL: https://crm.arifamilyassets.com/

### Opción B: CRM en subcarpeta
- Crear carpeta httpdocs/crm/
- Subir contenido de crm-build/ a httpdocs/crm/
- URL: https://crm.arifamilyassets.com/crm/

---

## ⚠️ IMPORTANTE:
- Mantener estructura de carpetas _next/
- No olvidar subir .htaccess para routing de React
- Verificar permisos después de subir

## 📞 Si hay problemas:
- Revisar logs: Panel Plesk → Logs
- Verificar Document Root: Panel Plesk → Hosting Settings
"@

$instructions | Out-File -FilePath "$deployDir/INSTRUCCIONES-PLESK.txt" -Encoding UTF8
Write-Host "  ✅ Creado: INSTRUCCIONES-PLESK.txt" -ForegroundColor Green

# Crear archivo ZIP para fácil subida
Write-Host ""
Write-Host "📦 CREANDO ARCHIVO ZIP..." -ForegroundColor Yellow

$zipPath = "crm-plesk-deploy.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

try {
    Compress-Archive -Path "$deployDir/*" -DestinationPath $zipPath -Force
    Write-Host "  ✅ Creado: $zipPath" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️ No se pudo crear ZIP (no es crítico)" -ForegroundColor Yellow
}

# Mostrar resumen
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "🎯 ARCHIVOS PREPARADOS PARA PLESK" -ForegroundColor White
Write-Host "=====================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "📁 Carpeta preparada: $deployDir" -ForegroundColor Green
Write-Host "📦 Archivo ZIP: $zipPath" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Abrir Panel Plesk → Files → httpdocs" -ForegroundColor White
Write-Host "2. Subir test-simple.html primero" -ForegroundColor White
Write-Host "3. Probar: https://crm.arifamilyassets.com/test-simple.html" -ForegroundColor White
Write-Host "4. Si funciona, subir todo crm-build/" -ForegroundColor White

Write-Host ""
Write-Host "📋 Ver instrucciones completas en:" -ForegroundColor Cyan
Write-Host "   $deployDir/INSTRUCCIONES-PLESK.txt" -ForegroundColor White

Write-Host ""
"@

$instructions | Out-File -FilePath "$deployDir/INSTRUCCIONES-PLESK.txt" -Encoding UTF8
Write-Host "  ✅ Creado: INSTRUCCIONES-PLESK.txt" -ForegroundColor Green