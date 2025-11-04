# 🚀 PLAN: BACKEND PRIMERO + FRONTEND DESPUÉS

## 🎯 **ESTRATEGIA CORRECTA:**
1. **Eliminar subdominio problemático** ✅
2. **Backend Docker funcionando** 🐳
3. **Verificar APIs** 📡
4. **Frontend limpio después** 🎨

---

## 🐳 **PASO 1: VERIFICAR BACKEND ACTUAL**

### **Verificar si Docker ya está funcionando:**
```bash
docker ps | grep backend
curl -s http://localhost:8000/health
```

### **Si no funciona, reconstruir:**
```bash
cd /var/www/vhosts/arifamilyassets.com/httpdocs
docker-compose down
docker-compose build backend
docker-compose up -d
```

---

## 📡 **PASO 2: PROBAR TODAS LAS APIS**

### **Health Check:**
```bash
curl -s http://localhost:8000/health | jq
```

### **Ver documentación Swagger:**
```bash
echo "📖 Swagger: http://localhost:8000/docs"
curl -s http://localhost:8000/docs
```

### **Probar endpoints principales:**
```bash
# Ver usuarios/auth
curl -s http://localhost:8000/auth/users

# Ver empresas
curl -s http://localhost:8000/api/companies

# Ver empleados  
curl -s http://localhost:8000/api/employees
```

---

## 🗄️ **PASO 3: VERIFICAR BASE DE DATOS**

### **Conectar a MySQL:**
```bash
docker exec -it crmarifamilyassetscom_mysql_1 mysql -u root -p
```

### **Ver tablas:**
```sql
SHOW DATABASES;
USE crm_db;
SHOW TABLES;
SELECT * FROM companies LIMIT 5;
SELECT * FROM employees LIMIT 5;
```

---

## 🔧 **PASO 4: DEBUGGING SI FALLA**

### **Ver logs del backend:**
```bash
docker logs crmarifamilyassetscom_backend_1 --tail=50
```

### **Ver logs de MySQL:**
```bash
docker logs crmarifamilyassetscom_mysql_1 --tail=50
```

### **Verificar red Docker:**
```bash
docker network ls
docker inspect crmarifamilyassetscom_default
```

---

## ✅ **RESULTADO ESPERADO:**
- ✅ Backend en `http://localhost:8000`
- ✅ MySQL en puerto `3307` 
- ✅ APIs funcionando
- ✅ Swagger accesible
- ✅ Base de datos con datos

---

## 🎨 **DESPUÉS: FRONTEND SIMPLE**

Una vez que el backend esté 100% funcional, haremos:
1. **Frontend estático simple** (sin subdominios)
2. **Login directo a localhost:8000**
3. **Dashboard con datos reales**
4. **Sin Docker para frontend** (solo archivos HTML/JS)

---

**¿Empezamos verificando el estado actual del backend?** 🚀