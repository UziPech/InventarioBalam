# 🍔 Inventario Balam - Backend API

Sistema de gestión de inventario para puesto de hamburguesas construido con arquitectura Onion (Clean Architecture) y Node.js.

## 🏗️ Arquitectura

El proyecto sigue la arquitectura Onion (Clean Architecture) con las siguientes capas:

```
src/
├── domain/           # Capa de dominio (entidades y reglas de negocio)
│   ├── entities/     # Entidades del dominio
│   └── repositories/ # Interfaces de repositorios
├── application/      # Capa de aplicación (casos de uso)
│   ├── services/     # Servicios de aplicación
│   └── useCases/     # Casos de uso
├── infrastructure/   # Capa de infraestructura (implementaciones)
│   ├── database/     # Acceso a datos
│   └── repositories/ # Implementaciones de repositorios
└── interfaces/       # Capa de interfaces (controladores y rutas)
    ├── controllers/  # Controladores
    └── routes/       # Definición de rutas
```

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd inventarioBalam/backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar el servidor**
```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📚 Documentación API

La documentación completa de la API está disponible en Swagger UI:
- **URL**: `http://localhost:3000/api-docs`
- **Formato**: OpenAPI 3.0.0

## 🛠️ Tecnologías Utilizadas

- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **Swagger** - Documentación de API
- **Arquitectura Onion** - Patrón de arquitectura limpia
- **JSON** - Base de datos (archivo local)

## 📋 Endpoints Principales

### Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Obtener todos los productos |
| GET | `/api/productos/:id` | Obtener producto por ID |
| POST | `/api/productos` | Crear nuevo producto |
| PUT | `/api/productos/:id` | Actualizar producto |
| DELETE | `/api/productos/:id` | Eliminar producto |
| GET | `/api/productos/buscar?nombre=...` | Buscar productos por nombre |
| GET | `/api/productos/stock-bajo?limite=10` | Productos con stock bajo |

### Pedidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/pedidos` | Obtener todos los pedidos |
| GET | `/api/pedidos/:id` | Obtener pedido por ID |
| POST | `/api/pedidos` | Crear nuevo pedido |
| PUT | `/api/pedidos/:id` | Actualizar pedido |
| DELETE | `/api/pedidos/:id` | Eliminar pedido |

## 🏪 Entidades del Sistema

### Producto
- **id**: Identificador único
- **nombre**: Nombre del producto
- **cantidad**: Stock disponible
- **unidad**: Unidad de medida (piezas, kg, etc.)
- **precio**: Precio unitario
- **fechaCreacion**: Fecha de creación
- **fechaActualizacion**: Fecha de última actualización

### Pedido
- **id**: Identificador único
- **cliente**: Nombre del cliente
- **items**: Array de productos en el pedido
- **total**: Total del pedido
- **fecha**: Fecha del pedido
- **estado**: Estado del pedido (pendiente, procesado, cancelado)

## 🔄 Casos de Uso

### Crear Producto
1. Validar datos de entrada
2. Crear entidad Producto
3. Guardar en repositorio
4. Retornar producto creado

### Procesar Pedido
1. Validar datos del pedido
2. Verificar stock disponible
3. Crear entidad Pedido
4. Actualizar stock de productos
5. Guardar pedido
6. Retornar pedido procesado

## 📊 Base de Datos

El sistema utiliza un archivo JSON (`inventario.json`) como base de datos que se crea automáticamente con datos iniciales:

- 10 productos predefinidos (pan, carne, queso, etc.)
- Estructura para almacenar productos y pedidos
- Persistencia automática de cambios

## 🧪 Pruebas de la API

### Ejemplo: Crear un producto
```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Pan de hamburguesa",
    "cantidad": 50,
    "unidad": "piezas",
    "precio": 2.50
  }'
```

### Ejemplo: Procesar un pedido
```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "Juan Pérez",
    "items": [
      {
        "productoId": 1,
        "nombre": "Pan de hamburguesa",
        "cantidad": 3,
        "precio": 2.50
      }
    ],
    "total": 7.50
  }'
```

## 🔧 Configuración

### Variables de Entorno
- `PORT`: Puerto del servidor (default: 3000)

### Archivos de Configuración
- `package.json`: Dependencias y scripts
- `inventario.json`: Base de datos (se crea automáticamente)

## 📝 Scripts Disponibles

- `npm start`: Ejecutar en producción
- `npm run dev`: Ejecutar en desarrollo con nodemon
- `npm test`: Ejecutar pruebas (pendiente)

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Uziel Pech**
- Email: uzielisaac28@gmail.com
- Proyecto: Inventario Balamkin

---

🍔 **¡Disfruta gestionando tu inventario de hamburguesas!**
