# Instrucciones para actualizar backend de producción

## ARCHIVOS A SUBIR AL SERVIDOR:

### 1. main.py
DESDE: C:\Users\edu\Documents\GitHub\crm_ari\backend\src\api\main.py
HACIA: /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/src/api/main.py

### 2. mail.py  
DESDE: C:\Users\edu\Documents\GitHub\crm_ari\backend\src\api\routers\mail.py
HACIA: /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/src/api/routers/mail.py

### 3. __init__.py
DESDE: C:\Users\edu\Documents\GitHub\crm_ari\backend\src\api\routers\__init__.py  
HACIA: /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/src/api/routers/__init__.py

## COMANDOS SCP PARA SUBIR:

```bash
scp backend/src/api/main.py root@ns31792975:/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/src/api/

scp backend/src/api/routers/mail.py root@ns31792975:/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/src/api/routers/

scp backend/src/api/routers/__init__.py root@ns31792975:/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend/src/api/routers/
```

## EJECUTAR EN EL SERVIDOR:

```bash
ssh root@ns31792975
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/backend
./update-backend.sh
```

## VERIFICAR DESPUÉS:

- https://crm.arifamilyassets.com/api/health (debe seguir funcionando)
- https://crm.arifamilyassets.com/api/mail/health (debe responder con status OK)
- https://crm.arifamilyassets.com/api/mail/test-connection (debe aceptar POST requests)