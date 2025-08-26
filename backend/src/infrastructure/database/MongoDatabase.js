const { MongoClient } = require('mongodb');

/**
 * Clase para manejar la base de datos MongoDB
 */
class MongoDatabase {
    constructor() {
        this.client = null;
        this.db = null;
        this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        this.dbName = 'inventario-balam';
    }

    /**
     * Conecta a MongoDB
     */
    async connect() {
        try {
            this.client = new MongoClient(this.uri);
            await this.client.connect();
            this.db = this.client.db(this.dbName);
            console.log('✅ Conectado a MongoDB');
            
            // Inicializar datos si las colecciones están vacías
            await this.initializeData();
        } catch (error) {
            console.error('❌ Error conectando a MongoDB:', error);
            throw error;
        }
    }

    /**
     * Inicializa datos si las colecciones están vacías
     */
    async initializeData() {
        const productosCount = await this.db.collection('productos').countDocuments();
        const productosMenuCount = await this.db.collection('productosMenu').countDocuments();
        
        if (productosCount === 0) {
            await this.db.collection('productos').insertMany([
                {
                    id: 1,
                    nombre: "Pan de hamburguesa",
                    cantidad: 50,
                    unidad: "piezas",
                    precio: 2.50,
                    fechaCreacion: new Date(),
                    fechaActualizacion: new Date()
                },
                {
                    id: 2,
                    nombre: "Carne de res",
                    cantidad: 20,
                    unidad: "kg",
                    precio: 120.00,
                    fechaCreacion: new Date(),
                    fechaActualizacion: new Date()
                },
                {
                    id: 3,
                    nombre: "Queso americano",
                    cantidad: 30,
                    unidad: "rebanadas",
                    precio: 1.50,
                    fechaCreacion: new Date(),
                    fechaActualizacion: new Date()
                },
                {
                    id: 4,
                    nombre: "Lechuga",
                    cantidad: 5,
                    unidad: "kg",
                    precio: 15.00,
                    fechaCreacion: new Date(),
                    fechaActualizacion: new Date()
                },
                {
                    id: 5,
                    nombre: "Tomate",
                    cantidad: 3,
                    unidad: "kg",
                    precio: 12.00,
                    fechaCreacion: new Date(),
                    fechaActualizacion: new Date()
                },
                {
                    id: 6,
                    nombre: "Cebolla",
                    cantidad: 2,
                    unidad: "kg",
                    precio: 8.00,
                    fechaCreacion: new Date(),
                    fechaActualizacion: new Date()
                },
                {
                    id: 7,
                    nombre: "Salsa de tomate",
                    cantidad: 10,
                    unidad: "botellas",
                    precio: 25.00,
                    fechaCreacion: new Date(),
                    fechaActualizacion: new Date()
                },
                {
                    id: 8,
                    nombre: "Mostaza",
                    cantidad: 8,
                    unidad: "botellas",
                    precio: 20.00,
                    fechaCreacion: new Date(),
                    fechaActualizacion: new Date()
                },
                {
                    id: 9,
                    nombre: "Mayonesa",
                    cantidad: 6,
                    unidad: "botellas",
                    precio: 22.00,
                    fechaCreacion: new Date(),
                    fechaActualizacion: new Date()
                },
                {
                    id: 10,
                    nombre: "Papas fritas",
                    cantidad: 15,
                    unidad: "kg",
                    precio: 35.00,
                    fechaCreacion: new Date(),
                    fechaActualizacion: new Date()
                }
            ]);
            console.log('✅ Productos inicializados');
        }

        if (productosMenuCount === 0) {
            await this.db.collection('productosMenu').insertMany([
                {
                    id: 1,
                    nombre: "Hamburguesa Balam Especial",
                    precio: 65.00,
                    descripcion: "Nuestra hamburguesa estrella con salsa especial",
                    ingredientes: [
                        { productoId: 1, cantidad: 1 },
                        { productoId: 2, cantidad: 0.2 },
                        { productoId: 3, cantidad: 2 },
                        { productoId: 6, cantidad: 0.05 },
                        { productoId: 7, cantidad: 0.03 }
                    ],
                    fechaCreacion: new Date(),
                    fechaActualizacion: new Date(),
                    activo: true
                },
                {
                    id: 2,
                    nombre: "Perro Especial",
                    precio: 35.00,
                    descripcion: "Hot dog con salchicha jumbo y toppings especiales",
                    ingredientes: [
                        { productoId: 1, cantidad: 1 },
                        { productoId: 2, cantidad: 0.15 },
                        { productoId: 6, cantidad: 0.03 },
                        { productoId: 8, cantidad: 0.02 }
                    ],
                    fechaCreacion: new Date(),
                    fechaActualizacion: new Date(),
                    activo: true
                },
                {
                    id: 3,
                    nombre: "Papas Balam",
                    precio: 25.00,
                    descripcion: "Papas con queso, tocino y salsa ranch",
                    ingredientes: [
                        { productoId: 10, cantidad: 0.2 },
                        { productoId: 3, cantidad: 0.05 },
                        { productoId: 9, cantidad: 0.03 }
                    ],
                    fechaCreacion: new Date(),
                    fechaActualizacion: new Date(),
                    activo: true
                }
            ]);
            console.log('✅ Productos del menú inicializados');
        }
    }

    /**
     * Obtiene todos los productos
     */
    async getProductos() {
        return await this.db.collection('productos').find({}).toArray();
    }

    /**
     * Guarda los productos
     */
    async saveProductos(productos) {
        await this.db.collection('productos').deleteMany({});
        if (productos.length > 0) {
            await this.db.collection('productos').insertMany(productos);
        }
    }

    /**
     * Obtiene todos los pedidos
     */
    async getPedidos() {
        return await this.db.collection('pedidos').find({}).toArray();
    }

    /**
     * Guarda los pedidos
     */
    async savePedidos(pedidos) {
        await this.db.collection('pedidos').deleteMany({});
        if (pedidos.length > 0) {
            await this.db.collection('pedidos').insertMany(pedidos);
        }
    }

    /**
     * Obtiene todos los productos del menú
     */
    async getProductosMenu() {
        return await this.db.collection('productosMenu').find({}).toArray();
    }

    /**
     * Guarda los productos del menú
     */
    async saveProductosMenu(productosMenu) {
        await this.db.collection('productosMenu').deleteMany({});
        if (productosMenu.length > 0) {
            await this.db.collection('productosMenu').insertMany(productosMenu);
        }
    }

    /**
     * Cierra la conexión
     */
    async close() {
        if (this.client) {
            await this.client.close();
        }
    }
}

module.exports = MongoDatabase;
