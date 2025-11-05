# Script de verificación post-despliegue CRM ARI (PowerShell)

Write-Host "🚀 VERIFICANDO ESTADO DEL SISTEMA CRM ARI" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Función para probar endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Name
    )
    
    Write-Host "Probando $Name... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ OK" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ FALLO ($($response.StatusCode))" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ ERROR ($($_.Exception.Message))" -ForegroundColor Red
        return $false
    }
}

# Probar endpoints principales
Write-Host ""
Write-Host "📡 PROBANDO ENDPOINTS DEL BACKEND:" -ForegroundColor Yellow

$healthOk = Test-Endpoint "https://crm.arifamilyassets.com/api/health" "Health Check"
$companiesOk = Test-Endpoint "https://crm.arifamilyassets.com/api/companies" "Companies"
$employeesOk = Test-Endpoint "https://crm.arifamilyassets.com/api/employees" "Employees"
$mailOk = Test-Endpoint "https://crm.arifamilyassets.com/api/mail/health" "Mail Health"

Write-Host ""
Write-Host "🌐 PROBANDO FRONTEND:" -ForegroundColor Yellow

$frontendOk = Test-Endpoint "https://crm.arifamilyassets.com" "Frontend Principal"
$dashboardOk = Test-Endpoint "https://crm.arifamilyassets.com/dashboard" "Dashboard"

# Resumen
Write-Host ""
Write-Host "📊 RESUMEN:" -ForegroundColor Cyan
$totalOk = @($healthOk, $companiesOk, $employeesOk, $mailOk, $frontendOk, $dashboardOk) | Where-Object { $_ -eq $true }
Write-Host "   Endpoints funcionando: $($totalOk.Count)/6" -ForegroundColor $(if($totalOk.Count -eq 6) { "Green" } else { "Yellow" })

if ($totalOk.Count -eq 6) {
    Write-Host "🎉 ¡Sistema completamente funcional!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Algunos endpoints necesitan atención" -ForegroundColor Yellow
    Write-Host "   - Revisa los archivos subidos" -ForegroundColor Yellow
    Write-Host "   - Reinicia los servicios del backend" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔗 URLs importantes:" -ForegroundColor Blue
Write-Host "   Frontend: https://crm.arifamilyassets.com" -ForegroundColor Blue
Write-Host "   API Docs: https://crm.arifamilyassets.com/docs (si está habilitado)" -ForegroundColor Blue
Write-Host "   Mail API: https://crm.arifamilyassets.com/api/mail/health" -ForegroundColor Blue