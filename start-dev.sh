#!/bin/bash

echo "========================================"
echo "🍔 Inventario Balam - Iniciando Desarrollo"
echo "========================================"
echo

echo "📦 Iniciando Backend..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

echo
echo "🌐 Iniciando Frontend..."
cd frontend
python3 -m http.server 8000 &
FRONTEND_PID=$!
cd ..

echo
echo "✅ Servicios iniciados:"
echo "   Backend:  http://localhost:3000"
echo "   Frontend: http://localhost:8000"
echo "   API Docs: http://localhost:3000/api-docs"
echo
echo "🎉 ¡Sistema listo para usar!"
echo
echo "Presiona Ctrl+C para detener todos los servicios"

# Función para limpiar procesos al salir
cleanup() {
    echo
    echo "🛑 Deteniendo servicios..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servicios detenidos"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Mantener el script corriendo
wait
