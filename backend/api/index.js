const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Importar repositorios
const MongoDatabase = require('../src/infrastructure/database/MongoDatabase');
const ProductoRepository = require('../src/infrastructure/repositories/ProductoRepository');
const PedidoRepository = require('../src/infrastructure/repositories/PedidoRepository');
const ProductoMenuRepository = require('../src/infrastructure/repositories/ProductoMenuRepository');

// Importar casos de uso
const CrearProductoUseCase = require('../src/application/useCases/CrearProductoUseCase');
const ProcesarPedidoUseCase = require('../src/application/useCases/ProcesarPedidoUseCase');
const CrearProductoMenuUseCase = require('../src/application/useCases/CrearProductoMenuUseCase');
const ProcesarPedidoMenuUseCase = require('../src/application/useCases/ProcesarPedidoMenuUseCase');

// Importar controladores
const ProductoController = require('../src/interfaces/controllers/ProductoController');
const PedidoController = require('../src/interfaces/controllers/PedidoController');
const ProductoMenuController = require('../src/interfaces/controllers/ProductoMenuController');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de Swagger
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Inventario Balam',
            version: '1.0.0',
            description: 'API para gestión de inventario de puesto de hamburguesas',
            contact: {
                name: 'Uziel Pech',
                email: 'uziel@example.com'
            }
        },
        servers: [
            {
                url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
                description: 'Servidor de producción'
            }
        ],
        components: {
            schemas: {
                Producto: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        nombre: { type: 'string' },
                        cantidad: { type: 'number' },
                        unidad: { type: 'string' },
                        precio: { type: 'number' },
                        fechaCreacion: { type: 'string', format: 'date-time' },
                        fechaActualizacion: { type: 'string', format: 'date-time' }
                    }
                },
                Pedido: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer' },
                        cliente: { type: 'string' },
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    productoId: { type: 'integer' },
                                    nombre: { type: 'string' },
                                    cantidad: { type: 'number' },
                                    precio: { type: 'number' },
                                    subtotal: { type: 'number' }
                                }
                            }
                        },
                        total: { type: 'number' },
                        fecha: { type: 'string', format: 'date-time' },
                        estado: { type: 'string', enum: ['pendiente', 'procesado', 'cancelado'] }
                    }
                }
            }
        }
    },
    apis: ['./src/interfaces/routes/*.js']
};

const specs = swaggerJsdoc(swaggerOptions);

// Configurar Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Inicializar dependencias
const database = new MongoDatabase();

// Conectar a MongoDB antes de inicializar repositorios
app.use(async (req, res, next) => {
    if (!database.db) {
        try {
            await database.connect();
        } catch (error) {
            console.error('Error conectando a MongoDB:', error);
            return res.status(500).json({
                success: false,
                message: 'Error de conexión a la base de datos'
            });
        }
    }
    next();
});

const productoRepository = new ProductoRepository(database);
const pedidoRepository = new PedidoRepository(database);
const productoMenuRepository = new ProductoMenuRepository(database);

// Inicializar casos de uso
const crearProductoUseCase = new CrearProductoUseCase(productoRepository);
const procesarPedidoUseCase = new ProcesarPedidoUseCase(pedidoRepository, productoRepository);
const crearProductoMenuUseCase = new CrearProductoMenuUseCase(productoMenuRepository, productoRepository);
const procesarPedidoMenuUseCase = new ProcesarPedidoMenuUseCase(pedidoRepository, productoRepository, productoMenuRepository);

// Inicializar controladores
const productoController = new ProductoController(productoRepository, crearProductoUseCase);
const pedidoController = new PedidoController(pedidoRepository, procesarPedidoUseCase, procesarPedidoMenuUseCase);
const productoMenuController = new ProductoMenuController(productoMenuRepository, crearProductoMenuUseCase);

// Configurar rutas
app.use('/api/productos', require('../src/interfaces/routes/productoRoutes')(productoController));
app.use('/api/pedidos', require('../src/interfaces/routes/pedidoRoutes')(pedidoController));
app.use('/api/productos-menu', require('../src/interfaces/routes/productoMenuRoutes')(productoMenuController));

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({
        message: 'API de Inventario Balam funcionando correctamente',
        version: '1.0.0',
        documentation: `/api-docs`
    });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
    });
});

// Exportar para Vercel
module.exports = app;
