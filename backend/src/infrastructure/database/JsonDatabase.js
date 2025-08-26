const fs = require('fs');
const path = require('path');

/**
 * Clase para manejar la base de datos JSON
 */
class JsonDatabase {
    constructor(filePath = 'inventario.json') {
        this.filePath = filePath;
        this.ensureFileExists();
    }

    /**
     * Asegura que el archivo JSON existe con datos iniciales
     */
    ensureFileExists() {
        if (!fs.existsSync(this.filePath)) {
            const datosIniciales = {
                productos: [
                    {
                        id: 1,
                        nombre: "Pan de hamburguesa",
                        cantidad: 50,
                        unidad: "piezas",
                        precio: 2.50,
                        fechaCreacion: new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString()
                    },
                    {
                        id: 2,
                        nombre: "Carne de res",
                        cantidad: 20,
                        unidad: "kg",
                        precio: 120.00,
                        fechaCreacion: new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString()
                    },
                    {
                        id: 3,
                        nombre: "Queso americano",
                        cantidad: 30,
                        unidad: "rebanadas",
                        precio: 1.50,
                        fechaCreacion: new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString()
                    },
                    {
                        id: 4,
                        nombre: "Lechuga",
                        cantidad: 5,
                        unidad: "kg",
                        precio: 15.00,
                        fechaCreacion: new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString()
                    },
                    {
                        id: 5,
                        nombre: "Tomate",
                        cantidad: 3,
                        unidad: "kg",
                        precio: 12.00,
                        fechaCreacion: new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString()
                    },
                    {
                        id: 6,
                        nombre: "Cebolla",
                        cantidad: 2,
                        unidad: "kg",
                        precio: 8.00,
                        fechaCreacion: new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString()
                    },
                    {
                        id: 7,
                        nombre: "Salsa de tomate",
                        cantidad: 10,
                        unidad: "botellas",
                        precio: 25.00,
                        fechaCreacion: new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString()
                    },
                    {
                        id: 8,
                        nombre: "Mostaza",
                        cantidad: 8,
                        unidad: "botellas",
                        precio: 20.00,
                        fechaCreacion: new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString()
                    },
                    {
                        id: 9,
                        nombre: "Mayonesa",
                        cantidad: 6,
                        unidad: "botellas",
                        precio: 22.00,
                        fechaCreacion: new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString()
                    },
                    {
                        id: 10,
                        nombre: "Papas fritas",
                        cantidad: 15,
                        unidad: "kg",
                        precio: 35.00,
                        fechaCreacion: new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString()
                    }
                ],
                productosMenu: [
                    {
                        id: 1,
                        nombre: "Hamburguesa Balam Especial",
                        precio: 65.00,
                        descripcion: "Nuestra hamburguesa estrella con salsa especial",
                        ingredientes: [
                            { productoId: 1, cantidad: 1 },    // 1 pan
                            { productoId: 2, cantidad: 0.2 },  // 200g carne
                            { productoId: 3, cantidad: 2 },    // 2 rebanadas queso
                            { productoId: 6, cantidad: 0.05 }, // 50g cebolla
                            { productoId: 7, cantidad: 0.03 }  // 30ml salsa
                        ],
                        fechaCreacion: new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString(),
                        activo: true
                    },
                    {
                        id: 2,
                        nombre: "Perro Especial",
                        precio: 35.00,
                        descripcion: "Hot dog con salchicha jumbo y toppings especiales",
                        ingredientes: [
                            { productoId: 1, cantidad: 1 },    // 1 pan hot dog
                            { productoId: 2, cantidad: 0.15 }, // 150g carne
                            { productoId: 6, cantidad: 0.03 }, // 30g cebolla
                            { productoId: 8, cantidad: 0.02 }  // 20ml mostaza
                        ],
                        fechaCreacion: new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString(),
                        activo: true
                    },
                    {
                        id: 3,
                        nombre: "Papas Balam",
                        precio: 25.00,
                        descripcion: "Papas con queso, tocino y salsa ranch",
                        ingredientes: [
                            { productoId: 10, cantidad: 0.2 }, // 200g papas
                            { productoId: 3, cantidad: 0.05 }, // 50g queso rallado
                            { productoId: 9, cantidad: 0.03 }  // 30ml mayonesa
                        ],
                        fechaCreacion: new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString(),
                        activo: true
                    }
                ],
                pedidos: []
            };
            
            this.saveData(datosIniciales);
        }
    }

    /**
     * Lee los datos del archivo JSON
     * @returns {Object} Datos del archivo
     */
    readData() {
        try {
            const data = fs.readFileSync(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error(`Error al leer el archivo: ${error.message}`);
        }
    }

    /**
     * Guarda los datos en el archivo JSON
     * @param {Object} data - Datos a guardar
     */
    saveData(data) {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            throw new Error(`Error al guardar el archivo: ${error.message}`);
        }
    }

    /**
     * Obtiene todos los productos
     * @returns {Array} Lista de productos
     */
    getProductos() {
        const data = this.readData();
        return data.productos || [];
    }

    /**
     * Obtiene todos los pedidos
     * @returns {Array} Lista de pedidos
     */
    getPedidos() {
        const data = this.readData();
        return data.pedidos || [];
    }

    /**
     * Guarda los productos
     * @param {Array} productos - Lista de productos
     */
    saveProductos(productos) {
        const data = this.readData();
        data.productos = productos;
        this.saveData(data);
    }

    /**
     * Guarda los pedidos
     * @param {Array} pedidos - Lista de pedidos
     */
    savePedidos(pedidos) {
        const data = this.readData();
        data.pedidos = pedidos;
        this.saveData(data);
    }

    /**
     * Obtiene todos los productos del menú
     * @returns {Array} Lista de productos del menú
     */
    getProductosMenu() {
        const data = this.readData();
        return data.productosMenu || [];
    }

    /**
     * Guarda los productos del menú
     * @param {Array} productosMenu - Lista de productos del menú
     */
    saveProductosMenu(productosMenu) {
        const data = this.readData();
        data.productosMenu = productosMenu;
        this.saveData(data);
    }
}

module.exports = JsonDatabase;
