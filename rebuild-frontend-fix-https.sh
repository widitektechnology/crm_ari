#!/bin/bash
# 🚀 REBUILD FRONTEND CON CORRECCIONES HTTPS

echo "🔧 RECONSTRUYENDO FRONTEND CON CORRECCIONES HTTPS..."

cd frontend

echo ""
echo "📋 1. Instalando dependencias..."
npm install

echo ""
echo "⚙️ 2. Construyendo para producción con HTTPS..."
VITE_API_BASE_URL=https://crm.arifamilyassets.com npm run build

echo ""
echo "📦 3. Verificando build..."
if [ -d "dist" ]; then
    echo "✅ Build creado en frontend/dist/"
    echo "📁 Contenido:"
    ls -la dist/
else
    echo "❌ Error: No se pudo crear el build"
    exit 1
fi

echo ""
echo "🗜️ 4. Comprimiendo build para deploy..."
cd dist
zip -r ../crm-build-https-fix.zip *
cd ..

echo ""
echo "📊 5. Información del archivo:"
ls -lh crm-build-https-fix.zip

echo ""
echo "✅ FRONTEND REBUILDEADO CON CORRECCIONES HTTPS"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo "1. Subir crm-build-https-fix.zip al servidor"
echo "2. Extraer en /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/"
echo "3. Verificar que las URLs usen HTTPS"
echo ""
echo "🌐 Comando de deploy sugerido:"
echo 'scp frontend/crm-build-https-fix.zip root@57.129.144.154:/tmp/'
echo 'ssh root@57.129.144.154 "cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/ && rm -rf * && unzip /tmp/crm-build-https-fix.zip && chown -R psaadm:psaadm . && chmod -R 755 ."'