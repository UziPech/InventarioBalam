# 🚀 Guía de Deploy - Inventario Balam

## 📋 Opciones de Deploy

### **1. Render (Recomendado - Gratis)**

#### **Ventajas:**
- ✅ **Completamente gratis** para proyectos pequeños
- ✅ **Deploy automático** desde GitHub
- ✅ **SSL incluido** (HTTPS automático)
- ✅ **Muy fácil** de configurar
- ✅ **Base de datos persistente**

#### **Pasos para Deploy en Render:**

1. **Crear cuenta en Render:**
   - Ve a [render.com](https://render.com)
   - Regístrate con tu cuenta de GitHub

2. **Conectar repositorio:**
   - Haz clic en "New +"
   - Selecciona "Web Service"
   - Conecta tu repositorio de GitHub

3. **Configurar el servicio:**
   ```
   Name: inventario-balam-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Variables de entorno (opcional):**
   ```
   NODE_ENV=production
   CORS_ORIGIN=https://tu-frontend.com
   ```

5. **Deploy:**
   - Haz clic en "Create Web Service"
   - Render hará el deploy automáticamente

#### **URL del Backend:**
```
https://inventario-balam-backend.onrender.com
```

### **2. Railway (Alternativa Gratis)**

#### **Pasos:**
1. Ve a [railway.app](https://railway.app)
2. Conecta tu repositorio
3. Configura como servicio Node.js
4. Deploy automático

### **3. Heroku (Pago - $5/mes mínimo)**

#### **Pasos:**
1. Instala Heroku CLI
2. `heroku create inventario-balam`
3. `git push heroku main`

## 🔧 Configuración Post-Deploy

### **1. Actualizar Frontend**

Una vez que tengas la URL del backend, actualiza `frontend/config.js`:

```javascript
const CONFIG = {
    API: {
        BASE_URL: 'https://tu-backend-url.com/api',
        // BASE_URL: 'http://localhost:3000/api', // Comentar esta línea
    }
};
```

### **2. Deploy del Frontend**

#### **Opción A: GitHub Pages (Gratis)**
1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: main, folder: /frontend

#### **Opción B: Netlify (Gratis)**
1. Ve a [netlify.com](https://netlify.com)
2. Drag & drop la carpeta `frontend`
3. URL automática generada

#### **Opción C: Vercel (Gratis)**
1. Ve a [vercel.com](https://vercel.com)
2. Importa tu repositorio
3. Deploy automático

## 🌐 URLs Finales

### **Desarrollo:**
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:8000`

### **Producción:**
- Backend: `https://inventario-balam-backend.onrender.com`
- Frontend: `https://tu-frontend-url.com`
- API Docs: `https://inventario-balam-backend.onrender.com/api-docs`

## 📱 Para el Cliente

### **Instalación Local (Desarrollo):**
```bash
# Clonar repositorio
git clone <url-del-repositorio>
cd inventarioBalam

# Instalar dependencias
cd backend
npm install

# Arrancar backend
npm start

# En otra terminal, arrancar frontend
cd frontend
npx http-server -p 8000
```

### **Uso en Producción:**
- **Solo abrir el navegador** y ir a la URL del frontend
- **No necesita instalar nada**
- **Funciona en cualquier dispositivo**

## 🔒 Consideraciones de Seguridad

### **Para Producción:**
1. **CORS configurado** para dominios específicos
2. **Validación de datos** en backend
3. **Rate limiting** (opcional)
4. **Logs de acceso** (incluido en Render)

### **Para el Cliente:**
1. **HTTPS automático** (Render/Netlify)
2. **Backup automático** de base de datos
3. **Monitoreo** de uptime

## 💰 Costos

### **Gratis (Recomendado):**
- **Backend**: Render (gratis)
- **Frontend**: GitHub Pages/Netlify/Vercel (gratis)
- **Total**: $0/mes

### **Pago (Opcional):**
- **Heroku**: $5-7/mes
- **Base de datos**: $5-20/mes (si necesitas más capacidad)

## 🎯 Beneficios del Deploy

### **Para el Cliente:**
- ✅ **No necesita instalar nada**
- ✅ **Acceso desde cualquier dispositivo**
- ✅ **Siempre disponible** (24/7)
- ✅ **Actualizaciones automáticas**
- ✅ **Backup automático**

### **Para el Vendedor:**
- ✅ **Demo en vivo** para clientes
- ✅ **No necesita configurar** en cada venta
- ✅ **Mantenimiento centralizado**
- ✅ **Escalabilidad** automática

## 🚀 Comandos Útiles

### **Verificar Deploy:**
```bash
# Verificar que el backend responde
curl https://inventario-balam-backend.onrender.com

# Verificar API
curl https://inventario-balam-backend.onrender.com/api/productos
```

### **Logs del Servidor:**
- Render: Dashboard → Logs
- Railway: Deployments → Logs
- Heroku: `heroku logs --tail`

---

**🍔 ¡Con esto tendrás un sistema completamente funcional y listo para vender!**
