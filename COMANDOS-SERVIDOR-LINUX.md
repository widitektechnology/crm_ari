# 🚀 COMANDOS DIRECTOS PARA SERVIDOR LINUX - FRONTEND CON APIS REALES

## 📋 **EJECUTAR ESTOS COMANDOS UNO POR UNO EN EL SERVIDOR:**

### **1️⃣ VARIABLES Y PREPARACIÓN:**
```bash
# Establecer variables
CRM_DIR="/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com"
echo "🔧 Trabajando en: $CRM_DIR"

# Ir al directorio
cd $CRM_DIR
```

### **2️⃣ BACKUP DEL INDEX ACTUAL:**
```bash
# Crear backup con timestamp
cp index.html index.html.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "No hay index.html previo"
echo "✅ Backup creado"
```

### **3️⃣ CREAR LOGIN CON API REAL:**
```bash
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM ARI - Login Real</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .login-container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1); width: 100%; max-width: 400px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #333; font-size: 2.5em; font-weight: bold; }
        .logo p { color: #666; margin-top: 5px; }
        .form-group { margin-bottom: 20px; }
        .form-group input { width: 100%; padding: 12px; border: 2px solid #e1e1e1; border-radius: 5px; font-size: 16px; transition: border-color 0.3s; }
        .form-group input:focus { outline: none; border-color: #667eea; }
        .btn-login { width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; transition: transform 0.2s; }
        .btn-login:hover { transform: translateY(-2px); }
        .btn-login:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .message { margin-top: 15px; padding: 10px; border-radius: 5px; text-align: center; font-size: 14px; }
        .error-message { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .success-message { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .loading-message { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .api-info { margin-top: 20px; padding: 10px; background-color: #f8f9fa; border-radius: 5px; font-size: 12px; color: #6c757d; text-align: center; }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo"><h1>CRM ARI</h1><p>Sistema de Gestión Empresarial</p></div>
        <form id="loginForm">
            <div class="form-group"><input type="text" id="username" placeholder="Usuario" required></div>
            <div class="form-group"><input type="password" id="password" placeholder="Contraseña" required></div>
            <button type="submit" class="btn-login" id="loginBtn">Iniciar Sesión</button>
        </form>
        <div id="message"></div>
        <div class="api-info">🔗 Conectado a API: localhost:8000<br>💾 Backend: MySQL + Redis<br>⚡ Frontend: Estático híbrido</div>
    </div>
    <script>
        const API_BASE = 'http://localhost:8000';
        const loginForm = document.getElementById('loginForm');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const loginBtn = document.getElementById('loginBtn');
        const messageDiv = document.getElementById('message');
        
        function showMessage(text, type = 'error') {
            messageDiv.innerHTML = `<div class="${type}-message">${text}</div>`;
        }
        
        async function loginReal(username, password) {
            try {
                console.log('🔄 Intentando login con API:', API_BASE);
                const response = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ username: username.trim(), password: password })
                });
                
                console.log('📡 Respuesta del servidor:', response.status);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('✅ Login exitoso:', data);
                    localStorage.setItem('authToken', data.access_token || data.token || 'temp_token');
                    localStorage.setItem('crmUser', username);
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('loginTime', new Date().toISOString());
                    showMessage('✅ Login exitoso! Redirigiendo al dashboard...', 'success');
                    setTimeout(() => { window.location.href = 'dashboard.html'; }, 2000);
                    return { success: true, data: data };
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.detail || errorData.message || `Error ${response.status}`;
                    console.error('❌ Error de login:', errorMessage);
                    showMessage(`❌ ${errorMessage}`, 'error');
                    return { success: false, error: errorMessage };
                }
            } catch (error) {
                console.error('🚨 Error de conexión:', error);
                showMessage('🚨 Error de conexión al servidor. Verifique que el backend esté funcionando.', 'error');
                return { success: false, error: 'Network error' };
            }
        }
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            if (!username || !password) {
                showMessage('❌ Por favor, complete todos los campos', 'error');
                return;
            }
            
            loginBtn.disabled = true;
            loginBtn.textContent = 'Iniciando sesión...';
            showMessage('🔄 Conectando al servidor...', 'loading');
            
            try {
                await loginReal(username, password);
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Iniciar Sesión';
            }
        });
        
        if (localStorage.getItem('isLoggedIn') === 'true') {
            showMessage('ℹ️ Ya hay una sesión activa. Redirigiendo...', 'loading');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
        }
        
        fetch(`${API_BASE}/health`).then(response => response.json()).then(data => {
            console.log('🩺 Estado del backend:', data);
        }).catch(error => {
            console.warn('⚠️ Backend no responde:', error);
        });
    </script>
</body>
</html>
EOF

echo "✅ Login con API real creado"
```

### **4️⃣ CREAR CONFIGURACIÓN DE APIS:**
```bash
cat > api-config.js << 'EOF'
const API_CONFIG = { BASE_URL: 'http://localhost:8000', TIMEOUT: 10000, RETRY_ATTEMPTS: 3 };

async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const defaultHeaders = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
    if (token) { defaultHeaders['Authorization'] = `Bearer ${token}`; }
    
    const config = { method: 'GET', headers: { ...defaultHeaders, ...options.headers }, ...options };
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    try {
        const response = await fetch(url, config);
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('isLoggedIn');
            window.location.href = '/';
            return;
        }
        if (!response.ok) { throw new Error(`HTTP ${response.status}: ${response.statusText}`); }
        return await response.json();
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

const API = {
    auth: {
        login: (username, password) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
        logout: () => apiRequest('/auth/logout', { method: 'POST' }),
        me: () => apiRequest('/auth/me')
    },
    companies: {
        list: () => apiRequest('/api/companies'),
        get: (id) => apiRequest(`/api/companies/${id}`),
        create: (data) => apiRequest('/api/companies', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => apiRequest(`/api/companies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => apiRequest(`/api/companies/${id}`, { method: 'DELETE' })
    },
    employees: {
        list: () => apiRequest('/api/employees'),
        get: (id) => apiRequest(`/api/employees/${id}`),
        create: (data) => apiRequest('/api/employees', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => apiRequest(`/api/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id) => apiRequest(`/api/employees/${id}`, { method: 'DELETE' })
    },
    system: { health: () => apiRequest('/health') }
};

window.API = API;
window.apiRequest = apiRequest;
EOF

echo "✅ Configuración de APIs creada"
```

### **5️⃣ VERIFICAR IMPLEMENTACIÓN:**
```bash
# Verificar archivos creados
echo "📁 Archivos creados:"
ls -la index.html api-config.js

# Verificar backend
echo "🩺 Estado del backend:"
curl -s http://localhost:8000/health || echo "⚠️ Backend no responde"

# Dar permisos correctos
chown -R ari_admin:psacln .
echo "✅ Permisos asignados"
```

### **6️⃣ RESULTADO FINAL:**
```bash
echo ""
echo "🎉 IMPLEMENTACIÓN COMPLETADA"
echo "✅ Login con API real: https://crm.arifamilyassets.com/"
echo "✅ Backend funcionando: http://localhost:8000"
echo "✅ Configuración APIs disponible"
echo ""
echo "🔍 Próximos pasos:"
echo "   1. Probar login en navegador"
echo "   2. Crear dashboard.html con APIs"
echo "   3. Implementar módulos restantes"
```

---

## ⚡ **EJECUCIÓN RÁPIDA - COPIAR Y PEGAR:**

```bash
CRM_DIR="/var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com" && cd $CRM_DIR && cp index.html index.html.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null && echo "🚀 Implementando login con API real..."
```

**¿Ejecutas los comandos paso a paso o prefieres que simplifique más?** 🚀