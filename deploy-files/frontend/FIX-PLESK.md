# 🚨 PROBLEMA IDENTIFICADO: Backend en lugar de Frontend

## ❌ **Lo que está pasando:**
- `https://crm.arifamilyassets.com/` muestra el backend Python (FastAPI)
- Debería mostrar el frontend React (login del CRM)

## ✅ **SOLUCIÓN - Configurar Plesk correctamente:**

### 1. **Verificar estructura de archivos en el servidor**

Asegúrate de que la estructura sea así:
```
/httpdocs/
├── frontend/                    ← Carpeta que subiste
│   └── build/                   ← Archivos del CRM React
│       ├── index.html           ← Login del CRM
│       ├── .htaccess
│       ├── test-simple.html
│       └── _next/
└── (otros archivos del backend Python)
```

### 2. **CONFIGURAR DOCUMENT ROOT EN PLESK**

1. **Ir a Plesk Panel**
2. **Seleccionar dominio:** `crm.arifamilyassets.com`
3. **Ir a: Hosting Settings**
4. **Cambiar Document Root:**
   
   **DESDE:** `/httpdocs` (actual - sirve backend)
   **HACIA:** `/httpdocs/frontend/build` (debe servir CRM)

5. **Guardar cambios**

### 3. **VERIFICAR INMEDIATAMENTE:**

Después del cambio, estas URLs deben funcionar:

✅ `https://crm.arifamilyassets.com/` → Login del CRM
✅ `https://crm.arifamilyassets.com/test-simple.html` → Página de prueba
✅ `https://crm.arifamilyassets.com/dashboard/` → Dashboard del CRM

### 4. **Si el backend sigue apareciendo:**

**Opción A - Verificar configuración:**
- El Document Root debe ser EXACTAMENTE: `/httpdocs/frontend/build`
- NO debe ser: `/httpdocs/` ni `/httpdocs/frontend/`

**Opción B - Verificar archivos:**
- Asegúrate de que `index.html` esté en `/httpdocs/frontend/build/index.html`
- Debe contener el código del CRM, no del backend

**Opción C - Limpiar cache:**
- En Plesk > Tools & Settings > Apache & nginx Settings
- Reiniciar servicios web

### 5. **CONFIGURACIÓN ALTERNATIVA (si Document Root no funciona):**

Si no puedes cambiar Document Root, puedes:

1. **Mover archivos del CRM al root:**
   ```bash
   cp -r /httpdocs/frontend/build/* /httpdocs/
   ```

2. **O configurar subdirectorio:**
   - Document Root: `/httpdocs`
   - CRM en: `https://crm.arifamilyassets.com/crm/`

## 🎯 **Resultado esperado:**

Después de la configuración, `https://crm.arifamilyassets.com/` debe mostrar:
```
🚀 Iniciar Sesión
CRM System - ARI Family Assets

[Campo Email]
[Campo Contraseña]
[Botón: Iniciar Sesión]

Credenciales de prueba:
Email: admin@crm.com | Contraseña: admin123
```

## 📞 **Si necesitas ayuda con Plesk:**

1. **Acceder a Plesk:**
   - URL: `https://tu-servidor:8443` o similar
   - Panel de control del hosting

2. **Buscar:** "Hosting Settings" o "Website Settings"
3. **Cambiar:** "Document Root" o "Web Root"

---
**IMPORTANTE:** El cambio de Document Root es lo único que necesitas hacer. Los archivos del CRM están listos.