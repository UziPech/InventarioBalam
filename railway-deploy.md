# 🚂 Deploy en Railway - Inventario Balam

## 📋 Pasos para Deploy del Backend

### **1. Crear cuenta en Railway**
1. Ve a [railway.app](https://railway.app)
2. Regístrate con tu cuenta de GitHub
3. Haz clic en "New Project"

### **2. Conectar repositorio**
1. Selecciona "Deploy from GitHub repo"
2. Busca y selecciona tu repositorio `inventarioBalam`
3. Haz clic en "Deploy Now"

### **3. Configurar el servicio**
Railway detectará automáticamente que es un proyecto Node.js, pero puedes verificar:

**Variables de entorno (opcional):**
```
NODE_ENV=production
PORT=3000
```

### **4. Obtener la URL**
Una vez desplegado, Railway te dará una URL como:
```
https://inventario-balam-production.up.railway.app
```

### **5. Actualizar el Frontend**
Actualiza `frontend/config.js` con la nueva URL:

```javascript
const CONFIG = {
    API: {
        BASE_URL: 'https://inventario-balam-production.up.railway.app/api',
        // BASE_URL: 'http://localhost:3000/api', // Comentar esta línea
    }
};
```

## 🌐 URLs Finales

### **Backend (Railway):**
- **API**: `https://inventario-balam-production.up.railway.app/api`
- **Documentación**: `https://inventario-balam-production.up.railway.app/api-docs`

### **Frontend (Vercel):**
- **Aplicación**: `https://inventario-balam.vercel.app`

## ✅ Verificar que Funciona

### **1. Probar la API:**
```bash
curl https://inventario-balam-production.up.railway.app
```

### **2. Probar endpoint específico:**
```bash
curl https://inventario-balam-production.up.railway.app/api/productos
```

## 🔧 Configuración Adicional

### **Variables de Entorno en Railway:**
1. Ve a tu proyecto en Railway
2. Haz clic en "Variables"
3. Agrega:
   ```
   NODE_ENV=production
   PORT=3000
   ```

### **Logs y Monitoreo:**
- Railway proporciona logs en tiempo real
- Monitoreo de uptime incluido
- Métricas de rendimiento

## 💰 Costos

### **Railway (Gratis):**
- **500 horas/mes** gratis
- **512MB RAM** por servicio
- **1GB almacenamiento**
- **Perfecto para proyectos pequeños**

### **Si necesitas más:**
- **$5/mes** para más recursos
- **$20/mes** para proyectos grandes

---

**🚂 ¡Railway es mucho más fácil que Render y funciona perfectamente!**
