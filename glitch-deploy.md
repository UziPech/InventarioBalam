# 🌟 Deploy en Glitch - Inventario Balam

## 📋 Pasos para Deploy del Backend

### **1. Crear proyecto en Glitch**
1. Ve a [glitch.com](https://glitch.com)
2. Haz clic en "New Project"
3. Selecciona "Import from GitHub"
4. Pega la URL de tu repositorio: `https://github.com/tu-usuario/inventarioBalam`

### **2. Configurar el proyecto**
1. Glitch importará automáticamente tu código
2. Ve a la carpeta `backend` en el editor
3. Haz clic en "Show" → "In a New Window"
4. Tu API estará disponible en: `https://tu-proyecto.glitch.me`

### **3. Configurar variables de entorno**
1. Haz clic en `.env` en el editor
2. Agrega:
```
NODE_ENV=production
PORT=3000
```

### **4. Obtener la URL**
Tu backend estará disponible en:
```
https://tu-proyecto.glitch.me
```

### **5. Actualizar el Frontend**
Actualiza `frontend/config.js`:

```javascript
const CONFIG = {
    API: {
        BASE_URL: 'https://tu-proyecto.glitch.me/api',
        // BASE_URL: 'http://localhost:3000/api', // Comentar esta línea
    }
};
```

## 🌐 URLs Finales

### **Backend (Glitch):**
- **API**: `https://tu-proyecto.glitch.me/api`
- **Documentación**: `https://tu-proyecto.glitch.me/api-docs`

### **Frontend (GitHub Pages):**
- **Aplicación**: `https://tu-usuario.github.io/inventarioBalam`

## ✅ Verificar que Funciona

### **1. Probar la API:**
```bash
curl https://tu-proyecto.glitch.me
```

### **2. Probar endpoint específico:**
```bash
curl https://tu-proyecto.glitch.me/api/productos
```

## 🔧 Configuración Adicional

### **Logs en Glitch:**
- Los logs aparecen en la consola del editor
- Monitoreo en tiempo real
- Muy fácil de debuggear

### **Base de Datos:**
- Glitch mantiene los archivos JSON
- Persistencia automática
- Backup incluido

## 💰 Costos

### **Glitch (100% Gratis):**
- ✅ **Sin límites** de tiempo
- ✅ **Sin límites** de almacenamiento
- ✅ **Sin límites** de requests
- ✅ **Siempre activo**

## 🚀 Deploy del Frontend en GitHub Pages

### **1. Subir a GitHub:**
```bash
git add .
git commit -m "Deploy ready"
git push origin main
```

### **2. Configurar GitHub Pages:**
1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: main, folder: /frontend
5. Save

### **3. URL del Frontend:**
```
https://tu-usuario.github.io/inventarioBalam
```

---

**🌟 ¡Glitch es la mejor opción gratuita y funciona perfectamente!**
