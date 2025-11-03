#!/bin/bash
# Script de inicio para el CRM System en producción

echo "🚀 Iniciando CRM System..."
echo "📅 Fecha: $(date)"
echo "🌐 Puerto: ${PORT:-3000}"
echo "🔗 API Backend: $NEXT_PUBLIC_API_URL"

# Verificar que existe Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js no está instalado"
    exit 1
fi

# Verificar dependencias
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install --production
fi

# Iniciar servidor
echo "✅ Iniciando servidor Next.js..."
node server.js