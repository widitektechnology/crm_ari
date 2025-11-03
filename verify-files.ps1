# ====================================================
# 🔍 VERIFICACIÓN DE ARCHIVOS - CRM ARI 
# ====================================================
# Este script verifica que todos los archivos estén listos para despliegue

Write-Host "🚀 VERIFICANDO ARCHIVOS DEL CRM..." -ForegroundColor Green
Write-Host ""

# Directorio base
$baseDir = "frontend"

# Verificar archivos de prueba
Write-Host "📋 ARCHIVOS DE PRUEBA:" -ForegroundColor Yellow
$testFiles = @(
    "$baseDir/test-simple.html",
    "$baseDir/connection-test.html"
)

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "  ✅ $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (NO EXISTE)" -ForegroundColor Red
    }
}

Write-Host ""

# Verificar archivos de configuración
Write-Host "⚙️ ARCHIVOS DE CONFIGURACIÓN:" -ForegroundColor Yellow
$configFiles = @(
    "$baseDir/.htaccess",
    "$baseDir/.htaccess-simple"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Write-Host "  ✅ $file ($size bytes)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (NO EXISTE)" -ForegroundColor Red
    }
}

Write-Host ""

# Verificar carpeta build del CRM
Write-Host "🏗️ CRM COMPILADO:" -ForegroundColor Yellow
$buildDir = "$baseDir/build"

if (Test-Path $buildDir) {
    $fileCount = (Get-ChildItem -Path $buildDir -Recurse -File).Count
    $totalSize = (Get-ChildItem -Path $buildDir -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $sizeInMB = [math]::Round($totalSize / 1MB, 2)
    
    Write-Host "  ✅ $buildDir ($fileCount archivos, $sizeInMB MB)" -ForegroundColor Green
    
    # Verificar archivos principales
    $mainFiles = @(
        "$buildDir/index.html",
        "$buildDir/dashboard.html", 
        "$buildDir/companies.html",
        "$buildDir/employees.html",
        "$buildDir/.htaccess"
    )
    
    Write-Host ""
    Write-Host "📄 PÁGINAS PRINCIPALES:" -ForegroundColor Cyan
    foreach ($file in $mainFiles) {
        if (Test-Path $file) {
            Write-Host "    ✅ $(Split-Path $file -Leaf)" -ForegroundColor Green
        } else {
            Write-Host "    ❌ $(Split-Path $file -Leaf)" -ForegroundColor Red
        }
    }
    
} else {
    Write-Host "  ❌ $buildDir (NO EXISTE)" -ForegroundColor Red
}

Write-Host ""

# Verificar assets
Write-Host "🎨 ASSETS ESTÁTICOS:" -ForegroundColor Yellow
$assetsDir = "$buildDir/_next"

if (Test-Path $assetsDir) {
    $assetCount = (Get-ChildItem -Path $assetsDir -Recurse -File).Count
    Write-Host "  ✅ Assets (_next): $assetCount archivos" -ForegroundColor Green
} else {
    Write-Host "  ❌ Assets (_next): NO EXISTE" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "🎯 RESUMEN DE ESTADO" -ForegroundColor White
Write-Host "=====================================================" -ForegroundColor Cyan

if (Test-Path "$baseDir/test-simple.html") {
    Write-Host "✅ Archivos de prueba listos para subir" -ForegroundColor Green
} else {
    Write-Host "❌ Faltan archivos de prueba" -ForegroundColor Red
}

if (Test-Path "$buildDir/index.html") {
    Write-Host "✅ CRM compilado y listo para producción" -ForegroundColor Green
} else {
    Write-Host "❌ CRM no compilado correctamente" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 PRÓXIMO PASO:" -ForegroundColor Yellow
Write-Host "1. Subir test-simple.html al servidor" -ForegroundColor White
Write-Host "2. Probar: https://crm.arifamilyassets.com/test-simple.html" -ForegroundColor White
Write-Host "3. Si funciona, subir toda la carpeta frontend/build/" -ForegroundColor White

Write-Host ""