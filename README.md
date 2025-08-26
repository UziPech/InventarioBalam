# 🍔 Inventario Balam - Sistema Completo

## 📋 Descripción

Sistema completo de gestión de inventario para el puesto de hamburguesas Balam. Incluye backend con arquitectura limpia y frontend moderno con interfaz responsiva.

## 🏗️ Estructura del Proyecto

```
inventarioBalam/
├── backend/                 # Servidor API con Node.js
│   ├── src/
│   │   ├── application/     # Casos de uso (Clean Architecture)
│   │   ├── domain/         # Entidades y reglas de negocio
│   │   ├── infrastructure/ # Base de datos y repositorios
│   │   └── interfaces/     # Controladores y rutas
│   ├── server.js           # Servidor principal
│   ├── package.json        # Dependencias del backend
│   └── inventario.json     # Base de datos JSON
├── frontend/               # Interfaz web
│   ├── index.html          # Página principal
│   ├── styles.css          # Estilos CSS
│   ├── script.js           # Lógica JavaScript
│   ├── config.js           # Configuración del frontend
│   └── README.md           # Documentación del frontend
└── README.md               # Documentación principal
```

## 🚀 Características del Sistema

### **Backend (Node.js + Express)**
- ✅ **Arquitectura Limpia**: Separación clara de responsabilidades
- ✅ **API RESTful**: Endpoints bien estructurados
- ✅ **Documentación Swagger**: API documentada automáticamente
- ✅ **Base de Datos JSON**: Almacenamiento simple y eficiente
- ✅ **Validaciones**: Verificación de datos de entrada
- ✅ **Manejo de Errores**: Respuestas consistentes

### **Frontend (HTML5 + CSS3 + JavaScript)**
- ✅ **Interfaz Moderna**: Diseño glassmorphism con gradientes
- ✅ **Responsivo**: Funciona en desktop, tablet y móvil
- ✅ **Navegación por Tabs**: Interfaz intuitiva
- ✅ **Modales**: Formularios elegantes
- ✅ **Notificaciones**: Toast messages informativos
- ✅ **Estados de Carga**: Feedback visual inmediato

## 🔧 Instalación y Configuración

### **Requisitos Previos**
- Node.js (versión 14 o superior)
- Navegador web moderno
- Git

### **Paso 1: Clonar el Proyecto**
```bash
git clone <url-del-repositorio>
cd inventarioBalam
```

### **Paso 2: Configurar el Backend**
```bash
cd backend
npm install
npm start
```

El backend estará disponible en: `http://localhost:3000`
- API: `http://localhost:3000/api`
- Documentación: `http://localhost:3000/api-docs`

### **Paso 3: Configurar el Frontend**
```bash
cd frontend
# Opción 1: Abrir directamente
# Abrir index.html en el navegador

# Opción 2: Servidor local
python -m http.server 8000
# Luego ir a http://localhost:8000
```

## 🌐 Endpoints de la API

### **Productos (Inventario)**
- `GET /api/productos` - Obtener todos los productos
- `POST /api/productos` - Crear nuevo producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### **Productos del Menú**
- `GET /api/productos-menu` - Obtener todos los productos del menú
- `GET /api/productos-menu/activos` - Obtener productos activos
- `POST /api/productos-menu` - Crear producto del menú
- `PUT /api/productos-menu/:id` - Actualizar producto del menú
- `PUT /api/productos-menu/:id/estado` - Cambiar estado

### **Pedidos**
- `GET /api/pedidos` - Obtener historial de pedidos
- `POST /api/pedidos` - Crear pedido directo
- `POST /api/pedidos/menu` - Crear pedido con productos del menú
- `PUT /api/pedidos/:id/estado` - Cambiar estado del pedido

## 🎯 Flujo de Trabajo

### **1. Configuración Inicial**
```
Backend → npm install → npm start → Puerto 3000
Frontend → Abrir index.html → Conectar a API
```

### **2. Gestión de Inventario**
```
Usuario → Frontend → Agregar Productos → Backend → Base de Datos
```

### **3. Creación de Menú**
```
Usuario → Frontend → Crear Producto Menú → Seleccionar Ingredientes → Backend
```

### **4. Procesamiento de Pedidos**
```
Usuario → Frontend → Seleccionar Productos → Crear Pedido → Backend → Actualizar Stock
```

## 🔗 Conexión Backend-Frontend

### **Configuración del Frontend**
El frontend se conecta al backend a través del archivo `config.js`:

```javascript
const CONFIG = {
    API: {
        BASE_URL: 'http://localhost:3000/api',
        TIMEOUT: 10000
    }
};
```

### **Funciones de API**
El frontend usa la función `apiRequest()` para todas las comunicaciones:

```javascript
// Ejemplo de uso
const productos = await apiRequest('/productos');
const nuevoProducto = await apiRequest('/productos', {
    method: 'POST',
    body: JSON.stringify(productoData)
});
```

## 📱 Funcionalidades Principales

### **🏪 Gestión de Inventario**
- Agregar productos con nombre, cantidad, unidad y precio
- Visualizar stock en tiempo real
- Alertas de stock bajo
- Búsqueda y filtrado

### **🍽️ Gestión del Menú**
- Crear productos estrella del menú
- Definir ingredientes por producto
- Activar/desactivar productos
- Visualización en grid

### **🛒 Procesamiento de Pedidos**
- Selección de productos del menú
- Cálculo automático de totales
- Descuento automático de inventario
- Historial de pedidos

### **📊 Reportes y Estadísticas**
- Estadísticas de ventas
- Productos más vendidos
- Stock crítico
- Valor total del inventario

## 🛠️ Tecnologías Utilizadas

### **Backend**
- **Node.js**: Runtime de JavaScript
- **Express**: Framework web
- **CORS**: Middleware para CORS
- **Swagger**: Documentación de API
- **Arquitectura Limpia**: Patrón de diseño

### **Frontend**
- **HTML5**: Estructura semántica
- **CSS3**: Estilos modernos con Flexbox/Grid
- **JavaScript ES6+**: Lógica de la aplicación
- **Font Awesome**: Iconografía
- **Fetch API**: Comunicación con backend

## 🔍 Características Técnicas

### **Arquitectura del Backend**
```
┌─────────────────┐
│   Interfaces    │ ← Controladores y Rutas
├─────────────────┤
│  Application    │ ← Casos de Uso
├─────────────────┤
│     Domain      │ ← Entidades y Reglas
├─────────────────┤
│ Infrastructure  │ ← Base de Datos
└─────────────────┘
```

### **Estructura del Frontend**
```
┌─────────────────┐
│   index.html    │ ← Página principal
├─────────────────┤
│   styles.css    │ ← Estilos y diseño
├─────────────────┤
│   script.js     │ ← Lógica de la app
├─────────────────┤
│   config.js     │ ← Configuración
└─────────────────┘
```

## 🚀 Optimizaciones Implementadas

### **Backend**
- ✅ **Validación de datos**: Verificación de entrada
- ✅ **Manejo de errores**: Respuestas consistentes
- ✅ **Documentación automática**: Swagger UI
- ✅ **Arquitectura escalable**: Clean Architecture

### **Frontend**
- ✅ **Carga asíncrona**: No bloquea la interfaz
- ✅ **Validaciones en tiempo real**: Feedback inmediato
- ✅ **Estados de carga**: Indicadores visuales
- ✅ **Responsive design**: Adaptable a cualquier dispositivo

## 🔧 Configuración Avanzada

### **Cambiar Puerto del Backend**
```javascript
// En backend/server.js
const PORT = process.env.PORT || 3000;
```

### **Cambiar URL del Backend en Frontend**
```javascript
// En frontend/config.js
const CONFIG = {
    API: {
        BASE_URL: 'http://tu-servidor:puerto/api'
    }
};
```

### **Personalizar Estilos**
```css
/* En frontend/styles.css */
:root {
    --primary: #tu-color;
    --secondary: #tu-color-secundario;
}
```

## 📝 Notas de Desarrollo

### **Compatibilidad**
- **Backend**: Node.js 14+
- **Frontend**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+

### **Consideraciones de Seguridad**
- CORS habilitado para desarrollo
- Validación de datos en backend
- Sanitización de entrada
- Recomendado usar HTTPS en producción

### **Rendimiento**
- Base de datos JSON para desarrollo
- Carga asíncrona en frontend
- Optimización de imágenes
- Minificación recomendada para producción

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Uziel Pech**
- Desarrollado para el puesto de hamburguesas Balam
- Arquitectura limpia y frontend moderno
- Sistema completo de gestión de inventario

---

**🍔 Desarrollado con ❤️ para hacer más eficiente el negocio de hamburguesas**
