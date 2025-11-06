# Corrección de configuración Pydantic Settings

## Problema identificado:
Pydantic 2.x requiere el uso de `model_config = ConfigDict(extra="allow")` en lugar de la clase `Config` para permitir campos adicionales del archivo `.env`.

## Errores corregidos:
1. ✅ SQLAlchemy Decimal import: `from sqlalchemy.types import DECIMAL as Decimal`
2. ✅ JWT import: `from jose import jwt`
3. ✅ Pydantic Settings: Agregado `model_config = ConfigDict(extra="allow")` en todas las clases Settings

## Cambios realizados en src/config/settings.py:
- Importado `ConfigDict` de pydantic
- Agregado `model_config = ConfigDict(extra="allow")` a todas las clases BaseSettings
- Cambiado `class Config` por `model_config` en la clase Settings principal

## Comandos para actualizar servidor:

### 1. Subir archivo corregido
```bash
scp backend/src/config/settings.py root@185.253.25.29:/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/src/config/
```

### 2. Reconstruir contenedor
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend && docker-compose -f docker-compose.external-db.yml down && docker-compose -f docker-compose.external-db.yml build --no-cache && docker-compose -f docker-compose.external-db.yml up -d
```

### 3. Verificar logs
```bash
docker logs crm_ari_backend
```

## Estado actual:
- ✅ SQLAlchemy 2.0+ compatible
- ✅ JWT (python-jose) compatible  
- ✅ Pydantic 2.x compatible
- 🔄 Listo para iniciar sin errores de validación