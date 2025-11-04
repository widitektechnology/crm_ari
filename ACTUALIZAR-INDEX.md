# 🔄 ACTUALIZAR INDEX.HTML PARA USAR /api/

## 📋 **COMANDO COMPLETO PARA COPIAR:**

```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com && cp index.html index.html.backup3 && cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎯 CRM ARI - Sistema de Gestión</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; color: #333; }
        .login-container { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1); width: 100%; max-width: 400px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.2); }
        .logo { font-size: 2.5rem; margin-bottom: 10px; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: bold; }
        .subtitle { color: #666; margin-bottom: 30px; font-size: 1.1rem; }
        .form-group { margin-bottom: 20px; text-align: left; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; color: #555; font-size: 1rem; }
        .form-group input { width: 100%; padding: 15px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 1rem; transition: all 0.3s ease; background: rgba(255, 255, 255, 0.9); }
        .form-group input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); transform: translateY(-2px); }
        .login-btn { width: 100%; padding: 15px; background: linear-gradient(45deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; margin-top: 10px; }
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3); }
        .status-panel { margin-top: 30px; padding: 20px; background: rgba(255, 255, 255, 0.7); border-radius: 10px; border-left: 4px solid #667eea; }
        .status-item { display: flex; justify-content: space-between; align-items: center; margin: 8px 0; font-size: 0.9rem; }
        .status-connected { color: #27ae60; font-weight: bold; }
        .status-disconnected { color: #e74c3c; font-weight: bold; }
        .error-message { background: rgba(231, 76, 60, 0.1); color: #e74c3c; padding: 10px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #e74c3c; text-align: left; font-size: 0.9rem; }
        .loading { opacity: 0.7; pointer-events: none; }
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
            <div class="status-item"><span>🔗 Backend:</span><span>/api/ (proxy)</span></div>
            <div class="status-item"><span>💾 Base de datos:</span><span>MySQL</span></div>
            <div class="status-item"><span>⚡ Estado:</span><span id="connectionStatus" class="status-disconnected">❌ Verificando...</span></div>
        </div>
        <div id="errorMessage" class="error-message" style="display: none;"></div>
    </div>
    <script>
        const API_BASE_URL = '/api';
        async function apiRequest(endpoint, options = {}) {
            const url = API_BASE_URL + endpoint;
            const defaultOptions = { headers: { 'Content-Type': 'application/json' } };
            const token = localStorage.getItem('authToken');
            if (token) defaultOptions.headers['Authorization'] = 'Bearer ' + token;
            const finalOptions = { ...defaultOptions, ...options, headers: { ...defaultOptions.headers, ...options.headers } };
            try {
                console.log('🔄 Petición: ' + url);
                const response = await fetch(url, finalOptions);
                if (!response.ok) throw new Error('HTTP ' + response.status + ': ' + response.statusText);
                const data = await response.json();
                console.log('✅ Respuesta: ' + url, data);
                return data;
            } catch (error) {
                console.error('❌ Error: ' + url, error);
                throw error;
            }
        }
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
                errorElement.innerHTML = '<strong>Error:</strong><br>' + error.message;
                return false;
            }
        }
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
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
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ username: username, password: password, grant_type: 'password' })
                });
                localStorage.setItem('authToken', response.access_token);
                localStorage.setItem('tokenType', response.token_type);
                localStorage.setItem('username', username);
                window.location.href = 'dashboard.html';
            } catch (error) {
                errorElement.style.display = 'block';
                errorElement.innerHTML = '<strong>Error de autenticación:</strong><br>' + error.message;
            } finally {
                container.classList.remove('loading');
            }
        });
        document.addEventListener('DOMContentLoaded', function() {
            checkBackendStatus();
            setInterval(checkBackendStatus, 30000);
        });
        if (localStorage.getItem('authToken')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenType');
            localStorage.removeItem('username');
        }
    </script>
</body>
</html>
EOF
```

## ✅ **VERIFICAR:**
```bash
echo "✅ Index.html actualizado para usar /api/ - Ahora debería conectar correctamente"
```

## 🎯 **PROBAR CONEXIÓN:**
```bash
curl -s https://crm.arifamilyassets.com/api/health | jq .
```

---

## 📋 **RESUMEN DE CAMBIOS:**
- ✅ **API_BASE_URL** cambiado de IP directa a `/api`
- ✅ **Status panel** muestra `/api/ (proxy)` en lugar de IP
- ✅ **JavaScript optimizado** para mejor rendimiento
- ✅ **CORS solucionado** usando proxy nginx

**Ahora el frontend debería mostrar "✅ Conectado" en lugar de "❌ Sin conexión"**