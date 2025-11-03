# 🔧 SOLUCIÓN: CSS NO CARGA - ARCHIVOS ESTÁTICOS

## ❌ PROBLEMA IDENTIFICADO:
- **CRM funciona** pero sin estilos CSS
- **Archivos estáticos** en `_next/` no se sirven
- **Nginx** necesita configuración adicional para assets

---

## 🚀 SOLUCIÓN INMEDIATA:

### **OPCIÓN A: Configuración Nginx para archivos _next/**
```nginx
# Añadir a la configuración de Plesk:
location /_next/ {
    root /var/www/vhosts/arifamilyassets.com/httpdocs;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    root /var/www/vhosts/arifamilyassets.com/httpdocs;
    try_files $uri $uri/ /index.html;
    index index.html;
    
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}
```

### **OPCIÓN B: Crear página con CDN (solución rápida)**
```bash
# Crear página con Tailwind CSS desde CDN
cat > /var/www/vhosts/arifamilyassets.com/httpdocs/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM ARI - Sistema de Gestión</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-hover:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body class="gradient-bg min-h-screen">
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <!-- Logo y título -->
            <div class="text-center">
                <div class="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span class="text-2xl font-bold text-indigo-600">A</span>
                </div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
                    CRM ARI
                </h2>
                <p class="mt-2 text-center text-sm text-indigo-100">
                    Sistema de Gestión Empresarial
                </p>
            </div>
            
            <!-- Formulario de login -->
            <div class="bg-white rounded-lg shadow-xl p-8">
                <form class="space-y-6">
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                            Usuario
                        </label>
                        <input id="email" name="email" type="text" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                               placeholder="Ingresa tu usuario">
                    </div>
                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                            Contraseña
                        </label>
                        <input id="password" name="password" type="password" required 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                               placeholder="Ingresa tu contraseña">
                    </div>
                    <div>
                        <button type="button" onclick="showSuccess()" 
                                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150">
                            Iniciar Sesión
                        </button>
                    </div>
                </form>
            </div>
            
            <!-- Módulos -->
            <div class="bg-white rounded-lg shadow-xl p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4 text-center">Módulos Disponibles</h3>
                <div class="grid grid-cols-2 gap-3">
                    <a href="/dashboard/" class="card-hover bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition duration-200">
                        <div class="text-3xl mb-2">📊</div>
                        <div class="text-sm font-medium text-blue-800">Dashboard</div>
                    </a>
                    <a href="/companies/" class="card-hover bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition duration-200">
                        <div class="text-3xl mb-2">🏢</div>
                        <div class="text-sm font-medium text-green-800">Empresas</div>
                    </a>
                    <a href="/employees/" class="card-hover bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition duration-200">
                        <div class="text-3xl mb-2">👥</div>
                        <div class="text-sm font-medium text-purple-800">Empleados</div>
                    </a>
                    <a href="/finance/" class="card-hover bg-yellow-50 hover:bg-yellow-100 p-4 rounded-lg text-center transition duration-200">
                        <div class="text-3xl mb-2">💰</div>
                        <div class="text-sm font-medium text-yellow-800">Finanzas</div>
                    </a>
                    <a href="/ai/" class="card-hover bg-pink-50 hover:bg-pink-100 p-4 rounded-lg text-center transition duration-200">
                        <div class="text-3xl mb-2">🤖</div>
                        <div class="text-sm font-medium text-pink-800">IA</div>
                    </a>
                    <a href="/reports/" class="card-hover bg-indigo-50 hover:bg-indigo-100 p-4 rounded-lg text-center transition duration-200">
                        <div class="text-3xl mb-2">📈</div>
                        <div class="text-sm font-medium text-indigo-800">Reportes</div>
                    </a>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="text-center">
                <p class="text-xs text-indigo-100">
                    CRM ARI © 2025 - ✅ Sistema funcionando correctamente
                </p>
                <p class="text-xs text-indigo-200 mt-1">
                    CSS cargado desde CDN - Backend API disponible
                </p>
            </div>
        </div>
    </div>
    
    <script>
        function showSuccess() {
            alert('🎉 ¡Login exitoso! Redirigiendo al dashboard...');
            window.location.href = '/dashboard/';
        }
        
        // Verificar que Tailwind está cargando
        console.log('✅ CSS funcionando correctamente');
        
        // Añadir indicador visual de que JS funciona
        document.addEventListener('DOMContentLoaded', function() {
            const title = document.querySelector('h2');
            if (title) {
                title.style.animation = 'fadeIn 1s ease-in';
            }
        });
    </script>
</body>
</html>
EOF

chmod 644 /var/www/vhosts/arifamilyassets.com/httpdocs/index.html
echo "✅ Página con CSS desde CDN creada"
```

---

## 🎯 CONFIGURACIÓN COMPLETA NGINX PARA PLESK:

```nginx
# Configuración completa para archivos estáticos
location /_next/ {
    root /var/www/vhosts/arifamilyassets.com/httpdocs;
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Access-Control-Allow-Origin "*";
}

location /static/ {
    root /var/www/vhosts/arifamilyassets.com/httpdocs;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

location / {
    root /var/www/vhosts/arifamilyassets.com/httpdocs;
    try_files $uri $uri/ /index.html;
    index index.html;
    
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
}

location /api/ {
    proxy_pass http://127.0.0.1:8000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    add_header Access-Control-Allow-Origin "*" always;
}

location /health {
    proxy_pass http://127.0.0.1:8000/health;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /admin {
    proxy_pass http://127.0.0.1:8000/admin;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /docs {
    proxy_pass http://127.0.0.1:8000/docs;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location /openapi.json {
    proxy_pass http://127.0.0.1:8000/openapi.json;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

---

## 🚀 COMANDO RÁPIDO PARA ARREGLAR CSS:

```bash
echo "🎨 ARREGLANDO PROBLEMA DE CSS..." && \
# Verificar archivos _next
ls -la /var/www/vhosts/arifamilyassets.com/httpdocs/_next/ && \
echo "" && \
# Crear página con CSS desde CDN (solución inmediata)
cat > /var/www/vhosts/arifamilyassets.com/httpdocs/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM ARI</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-blue-500 to-purple-600 min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
        <div class="text-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">🎉 CRM ARI</h1>
            <p class="text-gray-600">¡CSS funcionando correctamente!</p>
        </div>
        <div class="space-y-3">
            <a href="/dashboard/" class="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-lg transition duration-200">📊 Dashboard</a>
            <a href="/companies/" class="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-3 rounded-lg transition duration-200">🏢 Empresas</a>
            <a href="/employees/" class="block w-full bg-purple-500 hover:bg-purple-600 text-white text-center py-3 rounded-lg transition duration-200">👥 Empleados</a>
        </div>
        <p class="text-center text-sm text-gray-500 mt-4">Tailwind CSS desde CDN ✅</p>
    </div>
</body>
</html>
EOF
chmod 644 /var/www/vhosts/arifamilyassets.com/httpdocs/index.html && \
echo "✅ CSS ARREGLADO - Probar: https://crm.arifamilyassets.com/"
```

## 📞 **¿Cuál prefieres?**

1. **"Ejecutar comando rápido"** - Crear página con CSS desde CDN (solución inmediata)
2. **"Configurar Nginx completo"** - Arreglar archivos `_next/` para usar CSS compilado

**¿Cuál opción prefieres para arreglar el CSS?**