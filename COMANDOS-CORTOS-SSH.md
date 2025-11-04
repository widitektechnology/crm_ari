# 🔥 COMANDOS CORTOS PARA SSH - NO SE REINICIA

## ⚡ **PASO 1 - PREPARAR:**
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com
cp index.html index.html.backup 2>/dev/null
```

## ⚡ **PASO 2 - LOGIN SIMPLE:**
```bash
cat > index.html << 'LOGINEND'
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>CRM ARI</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial;background:#667eea;min-height:100vh;display:flex;align-items:center;justify-content:center}.login{background:white;padding:30px;border-radius:10px;width:350px}.logo{text-align:center;margin-bottom:20px}.logo h1{color:#333;font-size:2em}input{width:100%;padding:10px;margin:10px 0;border:1px solid #ddd;border-radius:5px}button{width:100%;padding:12px;background:#667eea;color:white;border:none;border-radius:5px;cursor:pointer}#msg{margin-top:10px;padding:8px;border-radius:5px;text-align:center}.error{background:#f8d7da;color:#721c24}.success{background:#d4edda;color:#155724}</style>
</head><body>
<div class="login"><div class="logo"><h1>CRM ARI</h1></div>
<input type="text" id="user" placeholder="Usuario">
<input type="password" id="pass" placeholder="Contraseña">
<button onclick="login()">Iniciar Sesión</button>
<div id="msg"></div></div>
<script>
function login(){const u=document.getElementById('user').value;const p=document.getElementById('pass').value;
if(!u||!p){show('Complete todos los campos','error');return}
show('Conectando...','');
fetch('http://localhost:8000/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})})
.then(r=>r.json()).then(d=>{localStorage.setItem('token',d.access_token||'ok');localStorage.setItem('user',u);show('Login exitoso!','success');setTimeout(()=>location.href='dashboard.html',1000)})
.catch(e=>{show('Error de conexión','error')})}
function show(t,c){document.getElementById('msg').innerHTML='<div class="'+c+'">'+t+'</div>'}
</script></body></html>
LOGINEND
```

## ⚡ **PASO 3 - CONFIGURAR API:**
```bash
cat > api-config.js << 'APIEND'
const API_URL='http://localhost:8000';
function api(url,opt={}){
const token=localStorage.getItem('token');
const headers={'Content-Type':'application/json'};
if(token)headers.Authorization='Bearer '+token;
return fetch(API_URL+url,{headers,...opt})
.then(r=>r.ok?r.json():Promise.reject(r))}
window.API={
auth:{login:(u,p)=>api('/auth/login',{method:'POST',body:JSON.stringify({username:u,password:p})})},
companies:{list:()=>api('/api/companies'),create:(d)=>api('/api/companies',{method:'POST',body:JSON.stringify(d)})},
employees:{list:()=>api('/api/employees'),create:(d)=>api('/api/employees',{method:'POST',body:JSON.stringify(d)})}
};
APIEND
```

## ⚡ **PASO 4 - VERIFICAR:**
```bash
ls -la index.html api-config.js
curl -s http://localhost:8000/health
chown -R ari_admin:psacln .
```

## ⚡ **PASO 5 - PROBAR:**
```bash
echo "✅ Login: https://crm.arifamilyassets.com/"
echo "✅ Backend: http://localhost:8000"
```

---

## 🚀 **EJECUTAR TODO DE UNA VEZ:**
```bash
cd /var/www/vhosts/arifamilyassets.com/crm.arifamilyassets.com && cp index.html index.bak 2>/dev/null && echo 'LOGIN SIMPLE CREADO' && echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CRM</title><style>*{margin:0;padding:0}body{font-family:Arial;background:#667eea;min-height:100vh;display:flex;align-items:center;justify-content:center}.login{background:white;padding:30px;border-radius:10px;width:350px}input{width:100%;padding:10px;margin:10px 0;border:1px solid #ddd;border-radius:5px}button{width:100%;padding:12px;background:#667eea;color:white;border:none;border-radius:5px}</style></head><body><div class="login"><h1>CRM ARI</h1><input type="text" id="u" placeholder="Usuario"><input type="password" id="p" placeholder="Contraseña"><button onclick="login()">Login</button><div id="m"></div></div><script>function login(){const user=document.getElementById("u").value,pass=document.getElementById("p").value;user&&pass?fetch("http://localhost:8000/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:user,password:pass})}).then(r=>r.json()).then(d=>{localStorage.setItem("token",d.access_token||"ok"),localStorage.setItem("user",user),document.getElementById("m").innerHTML="✅ Login OK",setTimeout(()=>location.href="dashboard.html",1000)}).catch(e=>{document.getElementById("m").innerHTML="❌ Error"}):document.getElementById("m").innerHTML="❌ Complete campos"}</script></body></html>' > index.html && echo '✅ LISTO!'
```

**¿Probamos con estos comandos cortos?** ⚡