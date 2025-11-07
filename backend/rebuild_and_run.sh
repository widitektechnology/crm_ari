#!/bin/bash

echo "🔥 Parando contenedor actual..."
docker stop crm_ari_backend 2>/dev/null || true
docker rm crm_ari_backend 2>/dev/null || true

echo "🐳 Reconstruyendo imagen con configuración corregida..."
docker build --no-cache -t backend_backend:latest .

if [ $? -eq 0 ]; then
    echo "✅ Build exitoso! Ejecutando contenedor..."
    
    # Ejecutar contenedor
    docker run -d \
      --name crm_ari_backend \
      --restart unless-stopped \
      -p 8000:8000 \
      --network bridge \
      --add-host host.docker.internal:host-gateway \
      -e ENVIRONMENT=production \
      -e DB_HOST=172.17.0.1 \
      -e DB_PORT=3306 \
      -e DB_USERNAME=crm_user \
      -e DB_PASSWORD=crm_password_secure_2025 \
      -e DB_DATABASE=crm_ari \
      -e DB_CHARSET=utf8mb4 \
      backend_backend:latest

    # Verificar que se ejecutó correctamente
    sleep 5
    if docker ps | grep -q crm_ari_backend; then
      echo "✅ Contenedor ejecutándose correctamente"
      echo "🌐 API disponible en: http://localhost:8000"
      echo "📚 Documentación en: http://localhost:8000/docs"
      echo "💓 Health check: http://localhost:8000/health"
      
      echo ""
      echo "📊 Ver logs del contenedor:"
      echo "docker logs -f crm_ari_backend"
      
      # Mostrar primeros logs
      echo ""
      echo "📝 Primeros logs:"
      docker logs crm_ari_backend | head -20
      
    else
      echo "❌ Error: El contenedor no se ejecutó correctamente"
      echo "Ver logs: docker logs crm_ari_backend"
      docker logs crm_ari_backend
    fi
else
    echo "❌ Error en el build de la imagen"
fi