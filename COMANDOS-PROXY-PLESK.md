# 🔧 COMANDOS PARA ARREGLAR PROXY PLESK

## 🎯 **PASO 1 - ACTUALIZAR FRONTEND PARA /api/:**

```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com
```

```bash
cp index.html index.html.backup2
```

```bash
cat > index.html << 'HTMLFIN'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎯 CRM ARI - Sistema de Gestión</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
        }
        
        .login-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .logo {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: bold;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1rem;
        }
        
        .form-group {
            margin-bottom: 20px;
            text-align: left;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
            font-size: 1rem;
        }
        
        .form-group input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background: rgba(255, 255, 255, 0.9);
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            transform: translateY(-2px);
        }
        
        .login-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 10px;
        }
        
        .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        
        .login-btn:active {
            transform: translateY(0);
        }
        
        .status-panel {
            margin-top: 30px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.7);
            border-radius: 10px;
            border-left: 4px solid #667eea;
        }
        
        .status-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 8px 0;
            font-size: 0.9rem;
        }
        
        .status-connected {
            color: #27ae60;
            font-weight: bold;
        }
        
        .status-disconnected {
            color: #e74c3c;
            font-weight: bold;
        }
        
        .error-message {
            background: rgba(231, 76, 60, 0.1);
            color: #e74c3c;
            padding: 10px;
            border-radius: 8px;
            margin-top: 15px;
            border-left: 4px solid #e74c3c;
            text-align: left;
            font-size: 0.9rem;
        }
        
        .loading {
            opacity: 0.7;
            pointer-events: none;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .loading .login-btn {
            animation: pulse 1.5s infinite;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">🎯 CRM ARI</div>
        <div class="subtitle">Sistema de Gestión Empresarial</div>
        
        <form id="loginForm">
            <div class="form-group">
                <label for="username">👤 Usuario</label>
                <input type="text" id="username" name="username" required>
            </div>
            
            <div class="form-group">
                <label for="password">🔑 Contraseña</label>
                <input type="password" id="password" name="password" required>
            </div>
            
            <button type="submit" class="login-btn">🚀 Iniciar Sesión</button>
        </form>
        
        <div class="status-panel">
            <div class="status-item">
                <span>🔗 Backend:</span>
                <span>/api/ (proxy)</span>
            </div>
            <div class="status-item">
                <span>💾 Base de datos:</span>
                <span>MySQL</span>
            </div>
            <div class="status-item">
                <span>⚡ Estado:</span>
                <span id="connectionStatus" class="status-disconnected">❌ Verificando...</span>
            </div>
        </div>
        
        <div id="errorMessage" class="error-message" style="display: none;"></div>
    </div>

    <script>
        // Configuración de la API usando proxy
        const API_BASE_URL = '/api';
        
        // Función para hacer peticiones a la API
        async function apiRequest(endpoint, options = {}) {
            const url = `${API_BASE_URL}${endpoint}`;
            
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };
            
            // Agregar token si existe
            const token = localStorage.getItem('authToken');
            if (token) {
                defaultOptions.headers['Authorization'] = `Bearer ${token}`;
            }
            
            const finalOptions = {
                ...defaultOptions,
                ...options,
                headers: {
                    ...defaultOptions.headers,
                    ...options.headers,
                },
            };
            
            try {
                console.log(`🔄 Realizando petición: ${url}`, finalOptions);
                const response = await fetch(url, finalOptions);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const data = await response.json();
                console.log(`✅ Respuesta exitosa de ${url}:`, data);
                return data;
            } catch (error) {
                console.error(`❌ Error en petición ${url}:`, error);
                throw error;
            }
        }
        
        // Verificar estado del backend
        async function checkBackendStatus() {
            const statusElement = document.getElementById('connectionStatus');
            const errorElement = document.getElementById('errorMessage');
            
            try {
                statusElement.textContent = '🔄 Conectando...';
                statusElement.className = 'status-disconnected';
                
                const response = await apiRequest('/health');
                
                if (response.status === 'healthy') {
                    statusElement.textContent = '✅ Conectado';
                    statusElement.className = 'status-connected';
                    errorElement.style.display = 'none';
                    return true;
                } else {
                    throw new Error('Backend no saludable');
                }
            } catch (error) {
                statusElement.textContent = '❌ Sin conexión';
                statusElement.className = 'status-disconnected';
                errorElement.style.display = 'block';
                errorElement.innerHTML = `
                    <strong>Error de conexión:</strong><br>
                    ${error.message}<br>
                    <small>Verifica que el proxy nginx esté configurado correctamente</small>
                `;
                return false;
            }
        }
        
        // Manejar el login
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const container = document.querySelector('.login-container');
            const errorElement = document.getElementById('errorMessage');
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            container.classList.add('loading');
            errorElement.style.display = 'none';
            
            try {
                const response = await apiRequest('/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        username: username,
                        password: password,
                        grant_type: 'password'
                    }),
                });
                
                // Guardar token
                localStorage.setItem('authToken', response.access_token);
                localStorage.setItem('tokenType', response.token_type);
                localStorage.setItem('username', username);
                
                // Redireccionar al dashboard
                window.location.href = 'dashboard.html';
                
            } catch (error) {
                errorElement.style.display = 'block';
                errorElement.innerHTML = `
                    <strong>Error de autenticación:</strong><br>
                    ${error.message}<br>
                    <small>Verifica tus credenciales y la conexión del backend</small>
                `;
            } finally {
                container.classList.remove('loading');
            }
        });
        
        // Verificar conexión al cargar la página
        document.addEventListener('DOMContentLoaded', () => {
            checkBackendStatus();
            
            // Verificar cada 30 segundos
            setInterval(checkBackendStatus, 30000);
        });
        
        // Limpiar token si existe (para testing)
        if (localStorage.getItem('authToken')) {
            console.log('🔑 Token existente encontrado, limpiando para login fresco...');
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenType');
            localStorage.removeItem('username');
        }
    </script>
</body>
</html>
HTMLFIN
```

```bash
echo "✅ Frontend actualizado para usar /api/"
```

## 🎯 **PASO 2 - VERIFICAR CONFIGURACIÓN NGINX:**

```bash
nginx -t
```

```bash
systemctl reload nginx
```

## 🎯 **PASO 3 - VERIFICAR PROXY FUNCIONA:**

```bash
curl -v http://crm.arifamilyassets.com/api/health
```

```bash
curl -v https://crm.arifamilyassets.com/api/health
```

## 🎯 **PASO 4 - VER LOGS SI NO FUNCIONA:**

```bash
tail -f /var/log/nginx/error.log
```

```bash
docker logs erp_backend
```

## 🎯 **PASO 5 - CONFIGURACIÓN ALTERNATIVA PLESK:**

Si la configuración anterior no funciona, prueba con esta configuración más simple en Plesk:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    
    add_header Access-Control-Allow-Origin $http_origin always;
    add_header Access-Control-Allow-Credentials true always;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS' always;
    add_header Access-Control-Allow-Headers 'Content-Type, Authorization' always;
    
    if ($request_method = OPTIONS) {
        return 204;
    }
}
```

## 📋 **COMANDOS RÁPIDOS PARA COPIAR:**

**1. Actualizar frontend:**
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com && cp index.html index.html.backup2
```

**2. Verificar proxy:**
```bash
curl -v https://crm.arifamilyassets.com/api/health
```

**3. Ver logs:**
```bash
tail -f /var/log/nginx/error.log | head -20
```