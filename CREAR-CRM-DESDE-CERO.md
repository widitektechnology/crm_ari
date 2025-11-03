# ✅ DIRECTORIO LIMPIO CREADO - AHORA CREAR CRM

## 📊 **ESTADO ACTUAL:**
```
✅ SUBDOMINIO RECREADO LIMPIO
drwxr-xr-x  2 ari_admin psacln 4096 Nov  3 19:24 .
drwxr-xr-x 20 ari_admin psacln 4096 Nov  3 19:24 ..
```

**✅ Directorio completamente limpio - Sin archivos problemáticos**

---

## 🚀 **CREAR CRM TRADICIONAL COMPLETO:**

### **1️⃣ LOGIN (index.html):**
```bash
cat > /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com/index.html << 'EOF'
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CRM ARI - Login</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .login-container {
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }
        .logo { text-align: center; margin-bottom: 30px; }
        .logo h1 { color: #333; font-size: 2.5em; font-weight: bold; }
        .logo p { color: #666; margin-top: 5px; }
        .form-group { margin-bottom: 20px; }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            color: #333;
            font-weight: 500;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e1e1;
            border-radius: 5px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        .form-group input:focus { outline: none; border-color: #667eea; }
        .btn-login {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .btn-login:hover { transform: translateY(-2px); }
        .login-footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <h1>CRM ARI</h1>
            <p>Sistema de Gestión Empresarial</p>
        </div>
        <form id="loginForm">
            <div class="form-group">
                <label for="username">Usuario</label>
                <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
                <label for="password">Contraseña</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="btn-login">Iniciar Sesión</button>
        </form>
        <div class="login-footer">
            <p>CRM ARI © 2025 - Todos los derechos reservados</p>
        </div>
    </div>
    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (username && password) {
                localStorage.setItem('crmUser', username);
                localStorage.setItem('isLoggedIn', 'true');
                window.location.href = 'dashboard.html';
            } else {
                alert('Por favor, complete todos los campos');
            }
        });
    </script>
</body>
</html>
EOF
```

---

**🔥 EJECUTA ESTE COMANDO PARA CREAR EL LOGIN:**

```bash
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
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo"><h1>CRM ARI</h1><p>Sistema de Gestión Empresarial</p></div>
        <form id="loginForm">
            <div class="form-group"><input type="text" id="username" placeholder="Usuario" required></div>
            <div class="form-group"><input type="password" id="password" placeholder="Contraseña" required></div>
            <button type="submit" class="btn-login">Iniciar Sesión</button>
        </form>
    </div>
    <script>
        document.getElementById('loginForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            if (username && password) {
                localStorage.setItem('crmUser', username);
                localStorage.setItem('isLoggedIn', 'true');
                alert('¡Login exitoso! Redirigiendo...');
                window.location.href = 'dashboard.html';
            } else {
                alert('Por favor, complete todos los campos');
            }
        });
    </script>
</body>
</html>
EOF
echo "✅ LOGIN CREADO - Prueba https://crm.arifamilyassets.com/"
```

**¡EJECUTA EL COMANDO Y PRUEBA EL LOGIN!** 🚀