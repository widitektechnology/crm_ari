# 🚀 CONECTANDO FRONTEND ESTÁTICO A APIS REALES - OPCIÓN A

## ✅ **PERFECTO - APIs DETECTADAS:**
El backend tiene una API completa con 49KB de especificaciones OpenAPI

## 🔗 **ESTRATEGIA: FRONTEND HÍBRIDO**
- ✅ **Frontend**: Rápido (HTML/CSS/JS estático)
- ✅ **Backend**: Robusto (APIs + MySQL)
- ✅ **Conexión**: JavaScript fetch() a localhost:8000

---

## 🚀 **MODIFICAR FRONTEND PARA USAR APIS REALES:**

### **1️⃣ ACTUALIZAR LOGIN CON API REAL:**
```bash
cat > /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/login-real.js << 'EOF'
// API Configuration
const API_BASE = 'http://localhost:8000';

// Login real function
async function loginReal(username, password) {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('authToken', data.access_token);
            localStorage.setItem('crmUser', username);
            localStorage.setItem('isLoggedIn', 'true');
            return { success: true, data: data };
        } else {
            const error = await response.json();
            return { success: false, error: error.detail || 'Login failed' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Network error' };
    }
}

// Companies API
async function getCompanies() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/api/companies`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}

// Employees API
async function getEmployees() {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE}/api/employees`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}
EOF
```

### **2️⃣ ACTUALIZAR INDEX.HTML CON LOGIN REAL:**
```bash
# Backup del index actual
cp /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/index.html /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/index.html.backup

# Crear nuevo index con APIs reales
cat > /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM ARI - Login</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .login-container { background: white; padding: 40px; border-radius: 10px; box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1); width: 100%; max-width: 400px; }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #333; font-size: 2.5em; font-weight: bold; }
        .logo p { color: #666; margin-top: 5px; }
        .form-group { margin-bottom: 20px; }
        .form-group input { width: 100%; padding: 12px; border: 2px solid #e1e1e1; border-radius: 5px; font-size: 16px; }
        .btn-login { width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
        .btn-login:disabled { opacity: 0.7; cursor: not-allowed; }
        .error-message { color: #dc3545; margin-top: 10px; font-size: 14px; text-align: center; }
        .success-message { color: #28a745; margin-top: 10px; font-size: 14px; text-align: center; }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo"><h1>CRM ARI</h1><p>Sistema de Gestión Empresarial</p></div>
        <form id="loginForm">
            <div class="form-group"><input type="text" id="username" placeholder="Usuario" required></div>
            <div class="form-group"><input type="password" id="password" placeholder="Contraseña" required></div>
            <button type="submit" class="btn-login" id="loginBtn">Iniciar Sesión</button>
            <div id="message"></div>
        </form>
    </div>
    <script>
        const API_BASE = 'http://localhost:8000';
        
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const loginBtn = document.getElementById('loginBtn');
            const message = document.getElementById('message');
            
            loginBtn.disabled = true;
            loginBtn.textContent = 'Iniciando...';
            message.innerHTML = '';
            
            try {
                const response = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('authToken', data.access_token);
                    localStorage.setItem('crmUser', username);
                    localStorage.setItem('isLoggedIn', 'true');
                    message.innerHTML = '<div class="success-message">✅ Login exitoso! Redirigiendo...</div>';
                    setTimeout(() => window.location.href = 'dashboard.html', 1500);
                } else {
                    const error = await response.json();
                    message.innerHTML = `<div class="error-message">❌ ${error.detail || 'Error de login'}</div>`;
                }
            } catch (error) {
                console.error('Login error:', error);
                message.innerHTML = '<div class="error-message">❌ Error de conexión al servidor</div>';
            }
            
            loginBtn.disabled = false;
            loginBtn.textContent = 'Iniciar Sesión';
        });
    </script>
</body>
</html>
EOF
```

---

## ⚡ **COMANDO PARA IMPLEMENTAR:**
```bash
echo "🔗 Creando frontend con APIs reales..." && \
cp /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/index.html /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/index.html.backup && \
echo "✅ Backup creado, implementando login con API real..."
```

**¿Ejecuto este comando para implementar el login real?** 🚀