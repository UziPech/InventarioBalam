# 🍔 Frontend - Inventario Balam

## 📋 Descripción

Interfaz web moderna y responsiva para el sistema de inventario del puesto de hamburguesas Balam. Desarrollada con HTML5, CSS3 y JavaScript vanilla.

## 🚀 Características

### ✨ **Diseño Moderno**
- Interfaz con gradientes y efectos glassmorphism
- Diseño completamente responsivo
- Animaciones suaves y transiciones
- Iconografía Font Awesome

### 📱 **Funcionalidades Principales**

#### **🏪 Gestión de Inventario**
- Visualización de productos en tabla
- Agregar nuevos productos al inventario
- Búsqueda y filtrado en tiempo real
- Estadísticas de stock y valor total
- Alertas de stock bajo

#### **🍽️ Gestión del Menú**
- Crear productos estrella del menú
- Definir ingredientes por producto
- Activar/desactivar productos
- Visualización en grid de tarjetas

#### **🛒 Creación de Pedidos**
- Selección de productos del menú
- Control de cantidades con botones +/-
- Cálculo automático del total
- Resumen del pedido en tiempo real
- Validación de stock disponible

#### **📊 Historial y Reportes**
- Historial completo de pedidos
- Filtrado por fechas
- Estadísticas de ventas
- Reportes de productos más vendidos

### 🎨 **Componentes de UI**

#### **Navegación**
- Tabs responsivos con iconos
- Indicador de tab activo
- Transiciones suaves

#### **Modales**
- Modales con backdrop blur
- Animaciones de entrada/salida
- Formularios validados

#### **Notificaciones**
- Toast notifications
- Diferentes tipos: success, error, warning
- Auto-dismiss después de 5 segundos

#### **Loading States**
- Overlay de carga con spinner
- Indicadores de progreso

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: 
  - Flexbox y Grid para layouts
  - Variables CSS para temas
  - Animaciones y transiciones
  - Media queries para responsividad
- **JavaScript ES6+**:
  - Async/await para API calls
  - Fetch API
  - Event delegation
  - DOM manipulation

## 📁 Estructura de Archivos

```
frontend/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
└── README.md           # Documentación
```

## 🔧 Configuración

### **Requisitos**
- Servidor web (puede ser local)
- Backend corriendo en `http://localhost:3000`
- Navegador moderno con soporte para ES6+

### **Instalación**
1. Asegúrate de que el backend esté corriendo
2. Abre `index.html` en tu navegador
3. O usa un servidor local:
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js
   npx serve .
   
   # Con PHP
   php -S localhost:8000
   ```

## 🌐 API Endpoints Utilizados

### **Productos (Inventario)**
- `GET /api/productos` - Obtener todos los productos
- `POST /api/productos` - Crear nuevo producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### **Productos del Menú**
- `GET /api/productos-menu/activos` - Obtener productos activos
- `POST /api/productos-menu` - Crear producto del menú
- `PUT /api/productos-menu/:id` - Actualizar producto del menú
- `PUT /api/productos-menu/:id/estado` - Cambiar estado

### **Pedidos**
- `GET /api/pedidos` - Obtener historial de pedidos
- `POST /api/pedidos/menu` - Crear pedido con productos del menú

## 🎯 Flujo de Usuario

### **1. Gestión de Inventario**
```
Usuario → Agregar Producto → Llenar Formulario → Guardar → Ver en Tabla
```

### **2. Creación de Menú**
```
Usuario → Agregar al Menú → Definir Producto → Seleccionar Ingredientes → Guardar
```

### **3. Procesamiento de Pedidos**
```
Usuario → Seleccionar Productos → Ajustar Cantidades → Ver Total → Crear Pedido
```

## 📱 Responsividad

### **Breakpoints**
- **Desktop**: > 768px
- **Tablet**: 768px - 480px
- **Mobile**: < 480px

### **Adaptaciones Mobile**
- Navegación con iconos únicamente
- Modales a pantalla completa
- Tablas con scroll horizontal
- Botones más grandes para touch

## 🎨 Paleta de Colores

```css
/* Colores principales */
--primary: #667eea
--secondary: #764ba2
--success: #56ab2f
--danger: #ff6b6b
--warning: #f39c12

/* Gradientes */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--gradient-success: linear-gradient(135deg, #56ab2f, #a8e6cf)
--gradient-danger: linear-gradient(135deg, #ff6b6b, #ee5a52)
```

## 🔍 Funciones Principales

### **Gestión de Estado**
- Variables globales para productos, menú y pedidos
- Actualización automática de estadísticas
- Sincronización con backend

### **Validaciones**
- Campos requeridos en formularios
- Validación de cantidades positivas
- Verificación de stock disponible

### **Manejo de Errores**
- Try-catch en todas las operaciones async
- Mensajes de error descriptivos
- Fallbacks para operaciones fallidas

## 🚀 Optimizaciones

### **Performance**
- Lazy loading de datos
- Debouncing en búsquedas
- Optimización de re-renders

### **UX**
- Feedback visual inmediato
- Estados de carga
- Confirmaciones de acciones

### **Accesibilidad**
- Contraste adecuado
- Navegación por teclado
- Textos alternativos

## 🔧 Personalización

### **Temas**
Para cambiar el tema, modifica las variables CSS en `styles.css`:

```css
:root {
  --primary: #tu-color;
  --secondary: #tu-color-secundario;
}
```

### **Configuración de API**
Para cambiar la URL del backend, modifica en `script.js`:

```javascript
const API_BASE_URL = 'http://tu-servidor:puerto/api';
```

## 📝 Notas de Desarrollo

### **Compatibilidad**
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### **Consideraciones**
- Requiere CORS habilitado en el backend
- Funciona mejor con conexión estable
- Recomendado usar HTTPS en producción

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

---

**Desarrollado con ❤️ para el puesto de hamburguesas Balam**
