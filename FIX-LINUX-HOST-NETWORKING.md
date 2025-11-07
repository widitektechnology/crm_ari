# 🔧 Fix Linux: host.docker.internal No Existe

## 🎯 Problema Identificado

```
❌ MySQL error: 2005 (HY000): Unknown MySQL server host 'host.docker.internal' (-2)
```

**En Linux, `host.docker.internal` no existe.** Este hostname solo funciona en Docker Desktop (Windows/Mac).

## 🚀 Soluciones para Linux

### Opción 1: Usar IP del Gateway Docker (Recomendado)

```bash
# Obtener IP del gateway Docker
echo "=== OBTENIENDO IP DEL HOST ===" && \
docker exec crm_ari_backend cat /etc/resolv.conf | grep nameserver | awk '{print $2}' && \

# Verificar conectividad con la IP real
DOCKER_HOST_IP=$(docker exec crm_ari_backend cat /etc/resolv.conf | grep nameserver | awk '{print $2}') && \
echo "Docker Host IP detectada: $DOCKER_HOST_IP" && \

# Probar conexión MySQL con IP real
docker exec crm_ari_backend python3 -c "
import mysql.connector
try:
    conn = mysql.connector.connect(
        host='$DOCKER_HOST_IP',
        port=3306,
        user='crm_user',
        password='crm_password_secure_2025',
        database='crm_ari'
    )
    print('✅ MySQL con IP real: ÉXITO')
    conn.close()
except Exception as e:
    print(f'❌ MySQL con IP real: {e}')
"
```

### Opción 2: Fix Automático Docker-Compose

```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend && \
docker-compose -f docker-compose.external-db.yml down && \

# Obtener IP del host automáticamente
HOST_IP=$(docker network inspect bridge | grep "Gateway" | awk '{print $2}' | tr -d '"' | tr -d ',') && \
echo "Host IP detectada: $HOST_IP" && \

# Actualizar docker-compose con IP real
cat > docker-compose.external-db.yml << EOF
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: crm_ari_backend
    ports:
      - "8000:8000"
    environment:
      # Variables de Base de Datos (IP REAL del host)
      - DB_HOST=${HOST_IP}
      - DB_PORT=3306
      - DB_USERNAME=crm_user
      - DB_PASSWORD=crm_password_secure_2025
      - DB_DATABASE=crm_ari
      - DB_CHARSET=utf8mb4
      
      # Variables JWT
      - JWT_SECRET_KEY=crm_super_secret_key_2025_secure
      - JWT_ALGORITHM=HS256
      - JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
      
      # Variables de Aplicación
      - APP_NAME=CRM ARI Family Assets
      - APP_VERSION=2.0.0
      - APP_ENVIRONMENT=production
    networks:
      - crm_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python3", "-c", "import requests; requests.get('http://localhost:8000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  crm_network:
    driver: bridge
EOF

echo "✅ Docker-compose actualizado con IP real: $HOST_IP" && \
docker-compose -f docker-compose.external-db.yml up -d && \
sleep 5 && \
echo "📋 Verificando nueva conexión..." && \
docker-compose -f docker-compose.external-db.yml logs --tail=20
```

### Opción 3: Networking Mode Host (Alternativa)

```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend && \
docker-compose -f docker-compose.external-db.yml down && \

# Configurar network mode host
cat > docker-compose.external-db.yml << 'EOF'
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: crm_ari_backend
    network_mode: host
    environment:
      # Variables de Base de Datos (localhost directo)
      - DB_HOST=127.0.0.1
      - DB_PORT=3306
      - DB_USERNAME=crm_user
      - DB_PASSWORD=crm_password_secure_2025
      - DB_DATABASE=crm_ari
      - DB_CHARSET=utf8mb4
      
      # Variables JWT
      - JWT_SECRET_KEY=crm_super_secret_key_2025_secure
      - JWT_ALGORITHM=HS256
      - JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
      
      # Variables de Aplicación
      - APP_NAME=CRM ARI Family Assets
      - APP_VERSION=2.0.0
      - APP_ENVIRONMENT=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python3", "-c", "import requests; requests.get('http://localhost:8000/health')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
EOF

echo "✅ Configurado network mode host" && \
docker-compose -f docker-compose.external-db.yml up -d && \
sleep 5 && \
docker-compose -f docker-compose.external-db.yml logs --tail=20
```

## 📋 Todo-en-Uno: Fix Completo

```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend && \
echo "🔍 Diagnosticando networking Docker..." && \

# Método 1: Detectar IP automáticamente
echo "=== MÉTODO 1: DETECTAR IP AUTOMÁTICA ===" && \
DOCKER_HOST_IP=$(docker exec crm_ari_backend cat /etc/resolv.conf | grep nameserver | awk '{print $2}' 2>/dev/null || echo "172.17.0.1") && \
echo "IP del host detectada: $DOCKER_HOST_IP" && \

# Probar conectividad directa
echo "🧪 Probando conectividad MySQL..." && \
docker exec crm_ari_backend python3 -c "
import mysql.connector
import socket

# Verificar conectividad de puerto
def check_port(host, port):
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except:
        return False

# IPs a probar
test_ips = ['$DOCKER_HOST_IP', '172.17.0.1', '172.18.0.1', '127.0.0.1']

for ip in test_ips:
    if check_port(ip, 3306):
        print(f'✅ Puerto 3306 abierto en {ip}')
        try:
            conn = mysql.connector.connect(
                host=ip, port=3306, user='crm_user', 
                password='crm_password_secure_2025', database='crm_ari'
            )
            print(f'🎯 CONEXIÓN MYSQL EXITOSA CON IP: {ip}')
            conn.close()
            break
        except Exception as e:
            print(f'❌ MySQL falló en {ip}: {e}')
    else:
        print(f'❌ Puerto 3306 cerrado en {ip}')
" && \

echo -e "\n🚀 Aplicando fix con IP que funcione..." && \
# Aquí aplicaremos el fix basado en el resultado
echo "Ejecuta el fix específico según el resultado anterior"
```

## ✅ Comandos de Verificación Post-Fix

```bash
# Verificar variables actualizadas
echo "=== VERIFICANDO IP ACTUALIZADA ===" && \
docker exec crm_ari_backend env | grep DB_HOST && \

# Test final de conexión
echo -e "\n=== TEST FINAL CONEXIÓN ===" && \
docker exec crm_ari_backend python3 -c "
from src.database.connection import test_connection
result = test_connection()
print(f'🎯 RESULTADO FINAL: {\"✅ ÉXITO\" if result else \"❌ FALLÓ\"}')
"
```

## 🎯 Próximos Pasos

1. **Ejecutar diagnóstico completo**
2. **Identificar IP correcta que funciona**  
3. **Aplicar fix con esa IP específica**
4. **Verificar conexión exitosa**
5. **Probar API endpoints**