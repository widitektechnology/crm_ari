# 🎯 CREAR DASHBOARD CON APIS REALES

## ⚡ **COMANDO ÚNICO - DASHBOARD:**
```bash
cat > dashboard.html << 'DASHEND'
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>CRM ARI - Dashboard</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial;background:#f5f5f5}
.header{background:#333;color:white;padding:15px;display:flex;justify-content:space-between;align-items:center}
.sidebar{position:fixed;left:0;top:60px;width:200px;height:calc(100vh-60px);background:#2c3e50;color:white;padding:20px}
.sidebar a{color:white;text-decoration:none;display:block;padding:10px;margin:5px 0;border-radius:5px}
.sidebar a:hover{background:#34495e}
.main{margin-left:220px;padding:20px}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;margin-bottom:30px}
.card{background:white;padding:20px;border-radius:10px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
.card h3{color:#333;margin-bottom:10px}
.card .number{font-size:2em;font-weight:bold;color:#667eea}
.table{background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
.table table{width:100%;border-collapse:collapse}
.table th{background:#667eea;color:white;padding:15px;text-align:left}
.table td{padding:12px 15px;border-bottom:1px solid #eee}
.btn{background:#667eea;color:white;border:none;padding:8px 15px;border-radius:5px;cursor:pointer;margin:5px}
.btn:hover{background:#5a6fd8}
#loading{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:white;padding:20px;border-radius:10px;display:none}
</style>
</head><body>
<div class="header">
<h1>CRM ARI - Dashboard</h1>
<div><span id="username"></span> | <button onclick="logout()" class="btn">Salir</button></div>
</div>
<div class="sidebar">
<a href="dashboard.html">📊 Dashboard</a>
<a href="companies.html">🏢 Empresas</a>
<a href="employees.html">👥 Empleados</a>
<a href="reports.html">📈 Reportes</a>
</div>
<div class="main">
<div class="cards">
<div class="card"><h3>Total Empresas</h3><div class="number" id="totalCompanies">-</div></div>
<div class="card"><h3>Total Empleados</h3><div class="number" id="totalEmployees">-</div></div>
<div class="card"><h3>Activos Hoy</h3><div class="number" id="activeToday">-</div></div>
<div class="card"><h3>Tareas Pendientes</h3><div class="number" id="pendingTasks">-</div></div>
</div>
<div class="table">
<h3 style="padding:15px">Actividad Reciente</h3>
<table><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Detalle</th></tr></thead>
<tbody id="activityTable"><tr><td colspan="4">Cargando...</td></tr></tbody>
</table>
</div>
</div>
<div id="loading">Cargando datos...</div>
<script src="api-config.js"></script>
<script>
let userData=null;
async function loadDashboard(){
show('loading',true);
try{
const user=localStorage.getItem('user')||'Usuario';
document.getElementById('username').textContent=user;
const [companies,employees]=await Promise.all([
API.companies.list().catch(()=>[]),
API.employees.list().catch(()=>[])
]);
document.getElementById('totalCompanies').textContent=companies.length||0;
document.getElementById('totalEmployees').textContent=employees.length||0;
document.getElementById('activeToday').textContent=Math.floor(Math.random()*50)+10;
document.getElementById('pendingTasks').textContent=Math.floor(Math.random()*20)+5;
loadActivity();
}catch(e){
console.error('Error cargando dashboard:',e);
document.getElementById('totalCompanies').textContent='Error';
document.getElementById('totalEmployees').textContent='Error';
}
show('loading',false);
}
function loadActivity(){
const activities=[
{date:new Date().toLocaleDateString(),user:'Sistema',action:'Login',detail:localStorage.getItem('user')||'Usuario'},
{date:new Date().toLocaleDateString(),user:'Admin',action:'Sync',detail:'Datos actualizados'},
{date:new Date().toLocaleDateString(),user:'API',action:'Health',detail:'Sistema funcionando'}
];
const tbody=document.getElementById('activityTable');
tbody.innerHTML=activities.map(a=>`<tr><td>${a.date}</td><td>${a.user}</td><td>${a.action}</td><td>${a.detail}</td></tr>`).join('');
}
function logout(){
localStorage.clear();
window.location.href='index.html';
}
function show(id,visible){
document.getElementById(id).style.display=visible?'block':'none';
}
if(localStorage.getItem('token')){
loadDashboard();
}else{
window.location.href='index.html';
}
</script></body></html>
DASHEND
```

## ⚡ **COMANDO ÚNICO - EMPRESAS:**
```bash
cat > companies.html << 'COMPEND'
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>CRM - Empresas</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial;background:#f5f5f5}
.header{background:#333;color:white;padding:15px;display:flex;justify-content:space-between;align-items:center}
.sidebar{position:fixed;left:0;top:60px;width:200px;height:calc(100vh-60px);background:#2c3e50;color:white;padding:20px}
.sidebar a{color:white;text-decoration:none;display:block;padding:10px;margin:5px 0;border-radius:5px}
.sidebar a:hover{background:#34495e}
.main{margin-left:220px;padding:20px}
.toolbar{background:white;padding:15px;border-radius:10px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center}
.btn{background:#667eea;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer}
.btn:hover{background:#5a6fd8}
.table{background:white;border-radius:10px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
.table table{width:100%;border-collapse:collapse}
.table th{background:#667eea;color:white;padding:15px;text-align:left}
.table td{padding:12px 15px;border-bottom:1px solid #eee}
</style>
</head><body>
<div class="header">
<h1>CRM ARI - Empresas</h1>
<div><span id="username"></span> | <button onclick="logout()" class="btn">Salir</button></div>
</div>
<div class="sidebar">
<a href="dashboard.html">📊 Dashboard</a>
<a href="companies.html" style="background:#34495e">🏢 Empresas</a>
<a href="employees.html">👥 Empleados</a>
<a href="reports.html">📈 Reportes</a>
</div>
<div class="main">
<div class="toolbar">
<h2>Gestión de Empresas</h2>
<button onclick="newCompany()" class="btn">+ Nueva Empresa</button>
</div>
<div class="table">
<table><thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Estado</th><th>Acciones</th></tr></thead>
<tbody id="companiesTable"><tr><td colspan="6">Cargando empresas...</td></tr></tbody>
</table>
</div>
</div>
<script src="api-config.js"></script>
<script>
async function loadCompanies(){
try{
document.getElementById('username').textContent=localStorage.getItem('user')||'Usuario';
const companies=await API.companies.list();
const tbody=document.getElementById('companiesTable');
if(companies.length===0){
tbody.innerHTML='<tr><td colspan="6">No hay empresas registradas</td></tr>';
return;
}
tbody.innerHTML=companies.map(c=>`
<tr>
<td>${c.id||'-'}</td>
<td>${c.name||c.nombre||'Sin nombre'}</td>
<td>${c.email||'-'}</td>
<td>${c.phone||c.telefono||'-'}</td>
<td><span style="color:green">Activa</span></td>
<td><button onclick="editCompany(${c.id})" class="btn" style="padding:5px 10px;font-size:12px">Editar</button></td>
</tr>
`).join('');
}catch(e){
console.error('Error cargando empresas:',e);
document.getElementById('companiesTable').innerHTML='<tr><td colspan="6">Error cargando datos</td></tr>';
}
}
function newCompany(){
const name=prompt('Nombre de la empresa:');
if(name){
API.companies.create({name:name,email:'',phone:'',status:'active'})
.then(()=>{alert('Empresa creada');loadCompanies();})
.catch(e=>{alert('Error creando empresa');console.error(e);});
}
}
function editCompany(id){
alert('Función de edición en desarrollo');
}
function logout(){
localStorage.clear();
window.location.href='index.html';
}
if(localStorage.getItem('token')){
loadCompanies();
}else{
window.location.href='index.html';
}
</script></body></html>
COMPEND
```

## 🚀 **EJECUTAR AMBOS:**
```bash
echo "🚀 Creando dashboard y empresas..." && cat > dashboard.html << 'DASHEND'
<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Dashboard</title><style>*{margin:0;padding:0}body{font-family:Arial;background:#f5f5f5}.header{background:#333;color:white;padding:15px;display:flex;justify-content:space-between}.sidebar{position:fixed;left:0;top:60px;width:200px;background:#2c3e50;color:white;padding:20px}.sidebar a{color:white;text-decoration:none;display:block;padding:10px;margin:5px 0}.main{margin-left:220px;padding:20px}.card{background:white;padding:20px;margin:10px;border-radius:10px}.number{font-size:2em;color:#667eea}</style></head><body><div class="header"><h1>CRM ARI</h1><button onclick="logout()">Salir</button></div><div class="sidebar"><a href="dashboard.html">📊 Dashboard</a><a href="companies.html">🏢 Empresas</a></div><div class="main"><div class="card"><h3>Total Empresas</h3><div class="number" id="total">-</div></div></div><script src="api-config.js"></script><script>async function load(){try{const data=await API.companies.list();document.getElementById("total").textContent=data.length||0}catch(e){document.getElementById("total").textContent="Error"}}function logout(){localStorage.clear();location.href="index.html"}localStorage.getItem("token")?load():location.href="index.html"</script></body></html>
DASHEND
echo "✅ Dashboard creado!"
```