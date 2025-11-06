#!/bin/bash

# Verificación rápida del estado del sistema
echo "🔍 ESTADO ACTUAL DEL SISTEMA CRM ARI"
echo "=================================="

# Ubicación
echo "📍 Directorio: $(pwd)"

# Archivos principales
echo ""
echo "📁 Archivos principales:"
[ -f "main.py" ] && echo "✅ main.py" || echo "❌ main.py"
[ -f "requirements.txt" ] && echo "✅ requirements.txt" || echo "❌ requirements.txt"
[ -f ".env" ] && echo "✅ .env" || echo "❌ .env"
[ -d "venv" ] && echo "✅ venv/" || echo "❌ venv/"
[ -d "src" ] && echo "✅ src/" || echo "❌ src/"

# Python
echo ""
echo "🐍 Python:"
if command -v python3 &> /dev/null; then
    echo "✅ $(python3 --version)"
else
    echo "❌ Python3 no encontrado"
fi

# MySQL
echo ""
echo "🗄️ MySQL:"
if command -v mysql &> /dev/null; then
    echo "✅ MySQL client disponible"
    if mysql -u root -p -e "SELECT 1;" 2>/dev/null; then
        echo "✅ Conexión MySQL exitosa"
    else
        echo "⚠️ No se puede conectar a MySQL (verifica credenciales)"
    fi
else
    echo "❌ MySQL client no encontrado"
fi

# Dependencias Python (si venv existe)
if [ -d "venv" ]; then
    echo ""
    echo "📦 Dependencias Python:"
    source venv/bin/activate
    if python -c "import fastapi, sqlalchemy, mysql.connector" 2>/dev/null; then
        echo "✅ Dependencias principales instaladas"
    else
        echo "❌ Dependencias faltantes"
    fi
fi

echo ""
echo "=================================="