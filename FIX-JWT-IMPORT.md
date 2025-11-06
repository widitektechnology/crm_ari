# Comandos para corregir el import JWT y reconstruir

## 1. Detener contenedor actual
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend
docker-compose -f docker-compose.external-db.yml down
```

## 2. Limpiar contenedores e imágenes
```bash
docker container prune -f
docker image prune -f
```

## 3. Reconstruir imagen con correcciones
```bash
docker-compose -f docker-compose.external-db.yml build --no-cache
```

## 4. Iniciar contenedor
```bash
docker-compose -f docker-compose.external-db.yml up -d
```

## 5. Verificar logs
```bash
docker logs crm_ari_backend
```

## Error corregido:
- ✅ SQLAlchemy Decimal import: `from sqlalchemy.types import DECIMAL as Decimal`
- ✅ JWT import: `from jose import jwt` (en lugar de `import jwt`)

## Dependencias verificadas en requirements.txt:
- python-jose[cryptography]>=3.3.0 ✅
- SQLAlchemy>=2.0.23 ✅