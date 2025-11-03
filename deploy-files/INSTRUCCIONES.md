# 📦 ARCHIVOS LISTOS PARA DESPLIEGUE

## ✅ Estado: Problemas Git solucionados, CRM listo

---

## 📁 ARCHIVOS EN `deploy-files/`:

```
deploy-files/
├── test-simple.html         ← SUBIR A /httpdocs/
├── redirect-index.html      ← SUBIR A /httpdocs/ y RENOMBRAR a index.html
└── frontend/               ← SUBIR TODA LA CARPETA A /httpdocs/
    └── build/              ← CRM compilado listo
        ├── index.html      ← Login del CRM
        ├── .htaccess       ← Configuración automática
        └── (todo el CRM)
```

---

## 🚀 INSTRUCCIONES DE DESPLIEGUE:

### 1️⃣ PRIMER PASO - Test de conectividad
- **Subir:** `test-simple.html` → `/httpdocs/test-simple.html`
- **Probar:** https://crm.arifamilyassets.com/test-simple.html
- **✅ Debe mostrar:** Página con enlaces de prueba

### 2️⃣ SEGUNDO PASO - Subir CRM
- **Subir:** Carpeta `frontend/` completa → `/httpdocs/frontend/`
- **Probar:** https://crm.arifamilyassets.com/frontend/build/
- **✅ Debe mostrar:** Login del CRM con campos email/contraseña

### 3️⃣ TERCER PASO - Configurar redirección
- **Subir:** `redirect-index.html` → `/httpdocs/redirect-index.html`
- **Renombrar:** `redirect-index.html` → `index.html` (reemplazar el del backend)
- **Probar:** https://crm.arifamilyassets.com/
- **✅ Debe mostrar:** Redirección automática al CRM

---

## 🧪 SECUENCIA DE PRUEBAS:

1. **Test básico:** https://crm.arifamilyassets.com/test-simple.html
2. **CRM directo:** https://crm.arifamilyassets.com/frontend/build/
3. **Redirección:** https://crm.arifamilyassets.com/

---

## 🎯 CREDENCIALES DEL CRM:
- **Usuario:** admin@crm.com
- **Contraseña:** admin123

---

## ❓ Si algo falla:

- **404 en test-simple.html:** Archivos no subidos correctamente
- **404 en frontend/build/:** Carpeta frontend mal ubicada
- **Sigue mostrando ERP backend:** index.html no reemplazado

---

**TODOS LOS ARCHIVOS ESTÁN EN LA CARPETA `deploy-files/` LISTOS PARA SUBIR** 📦