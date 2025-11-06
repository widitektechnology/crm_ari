# Comandos para reconstruir el contenedor Docker con las correcciones

## 1. Reconstruir la imagen sin cache
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend
docker-compose -f docker-compose.external-db.yml build --no-cache
```

## 2. Iniciar el contenedor
```bash
docker-compose -f docker-compose.external-db.yml up -d
```

## 3. Verificar los logs
```bash
docker logs crm_ari_backend
```

## 4. Verificar estado del contenedor
```bash
docker ps
```

## 5. Probar la API
```bash
curl http://localhost:8000/health
curl http://localhost:8000/docs
```