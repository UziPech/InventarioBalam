@echo off
echo ========================================
echo 🍔 Inventario Balam - Iniciando Desarrollo
echo ========================================
echo.

echo 📦 Iniciando Backend...
cd backend
start "Backend - Inventario Balam" cmd /k "npm start"
cd ..

echo.
echo 🌐 Iniciando Frontend...
cd frontend
start "Frontend - Inventario Balam" cmd /k "python -m http.server 8000"
cd ..

echo.
echo ✅ Servicios iniciados:
echo    Backend:  http://localhost:3000
echo    Frontend: http://localhost:8000
echo    API Docs: http://localhost:3000/api-docs
echo.
echo 🎉 ¡Sistema listo para usar!
echo.
pause
